#!/usr/bin/env node
/**
 * Verify that a *served* copy of the site is the Vite build, not the repository
 * source, and that every local asset it references is actually reachable.
 *
 * The failure mode this exists to catch: GitHub Pages configured with
 * "Deploy from a branch" publishes the raw repository, where index.html links
 * /src/styles.css (a 404 under /zazie-media-holdings/) and where the Tailwind
 * entry point is served uncompiled. The site then renders unstyled with its
 * loading overlay stuck on screen.
 *
 * Usage:
 *   node scripts/verify-pages.mjs [baseUrl] [--wait]
 *
 *   baseUrl   defaults to https://zazieproductions.github.io/zazie-media-holdings/
 *   --wait    retry for a few minutes until the checks pass (use right after a
 *             deploy, while the Pages CDN is still catching up)
 */
import { setTimeout as delay } from 'node:timers/promises';

const PAGES = ['index.html', 'repo.html', 'prototypes.html'];
const REMOTE = /^(?:[a-z]+:)?\/\//i;

const args = process.argv.slice(2);
const wait = args.includes('--wait');
const baseArg = args.find((arg) => !arg.startsWith('--'));
const BASE = withTrailingSlash(baseArg || 'https://zazieproductions.github.io/zazie-media-holdings/');
const ATTEMPTS = wait ? 20 : 1;
const RETRY_MS = 15_000;

function withTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

function resolve(reference) {
  // Site-root references ("/assets/...") are resolved against the deployed base,
  // so the checks work both at the domain root and under a repository subpath.
  if (reference.startsWith('/') && !reference.startsWith('//')) {
    return new URL(reference.slice(1), new URL(BASE)).href;
  }
  return new URL(reference, new URL(BASE)).href;
}

function localReferences(html) {
  const found = [];
  for (const match of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)) {
    const tag = match[0];
    if (/rel="[^"]*stylesheet/i.test(tag) && !REMOTE.test(match[1])) {
      found.push({ url: match[1], kind: 'css' });
    }
  }
  for (const match of html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/gi)) {
    if (!REMOTE.test(match[1])) found.push({ url: match[1], kind: 'js' });
  }
  return found;
}

async function head(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const type = (response.headers.get('content-type') || '').toLowerCase();
    return { ok: response.ok, status: response.status, type };
  } catch (error) {
    return { ok: false, status: 0, type: '', error: error.message };
  }
}

function expectedType(kind) {
  return kind === 'css' ? /css/ : /javascript|ecmascript/;
}

async function verify() {
  const failures = [];
  const notes = [];
  const fail = (message) => failures.push(message);

  for (const page of PAGES) {
    const pageUrl = new URL(page, new URL(BASE)).href;
    const response = await fetch(pageUrl, { redirect: 'follow' });
    if (!response.ok) {
      fail(`${page} → HTTP ${response.status}`);
      continue;
    }
    const type = (response.headers.get('content-type') || '').toLowerCase();
    if (!type.includes('html')) fail(`${page} served with content-type "${type}" (expected text/html)`);
    const html = await response.text();

    // 1. The served page must be the build output, never the raw source.
    if (/href="\/(?!\/)src\/styles\.css"/.test(html)) {
      fail(`${page} links /src/styles.css, a root-absolute path that misses the repository subpath`);
    }
    if (/src="\/(?!\/)src\//.test(html)) {
      fail(`${page} loads a module from a root-absolute /src/ path, which misses the repository subpath`);
    }
    if (/@tailwind\s+base/.test(html)) fail(`${page} appears to be raw Tailwind source`);

    // 2. Every page must carry the compiled stylesheet.
    const refs = localReferences(html);
    const css = refs.filter((ref) => ref.kind === 'css');
    if (!css.length) {
      fail(`${page} references no local stylesheet — the page would render unstyled`);
    } else if (!css.some((ref) => /assets\/.*\.css$/.test(ref.url))) {
      fail(`${page} references ${css.map((r) => r.url).join(', ')} instead of the compiled assets/*.css`);
    }

    // 3. Every local asset the page references must resolve.
    for (const ref of refs) {
      const asset = await head(resolve(ref.url));
      if (!asset.ok) {
        fail(`${page} → ${ref.url} returned HTTP ${asset.status}${asset.error ? ` (${asset.error})` : ''}`);
      } else if (!expectedType(ref.kind).test(asset.type)) {
        fail(`${page} → ${ref.url} served as "${asset.type}" (expected ${ref.kind})`);
      }
    }
    notes.push(`${page}: ${css.length} stylesheet(s), ${refs.length - css.length} local script(s)`);
  }

  // 4. The classic script that powers the inline handlers must be published.
  const app = await head(new URL('src/app.js', new URL(BASE)).href);
  if (!app.ok) fail(`src/app.js returned HTTP ${app.status} — inline handlers (openPalette, launchBayLoad…) would break`);
  else if (!/javascript|ecmascript/.test(app.type)) fail(`src/app.js served as "${app.type}"`);

  // 5. Prototype + repository data.
  for (const data of ['data/prototypes.json', 'data/repos.json']) {
    const result = await head(new URL(data, new URL(BASE)).href);
    if (!result.ok) fail(`${data} returned HTTP ${result.status}`);
    else if (!/json/.test(result.type)) fail(`${data} served as "${result.type}" (expected application/json)`);
  }

  // 6. Embedded repository builds referenced by the snapshot.
  const snapshot = await fetch(new URL('data/repos.json', new URL(BASE)).href);
  if (snapshot.ok) {
    const payload = await snapshot.json();
    const embeds = (payload.repositories || [])
      .map((repo) => repo.embed && repo.embed.url)
      .filter(Boolean);
    if (!embeds.length) {
      fail('data/repos.json lists no embedded builds');
    }
    for (const url of embeds) {
      if (/^\/embeds\//.test(url)) fail(`embed url "${url}" is root-absolute and misses the repository subpath`);
      const result = await head(resolve(url));
      if (!result.ok) fail(`embedded build ${url} returned HTTP ${result.status}`);
      else if (!result.type.includes('html')) fail(`embedded build ${url} served as "${result.type}"`);
    }
    notes.push(`${embeds.length} embedded repository build(s)`);
  }

  return { failures, notes };
}

let last = { failures: [], notes: [] };
for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  last = await verify();
  if (!last.failures.length || attempt === ATTEMPTS) break;
  console.log(`attempt ${attempt}/${ATTEMPTS}: ${last.failures.length} problem(s) — retrying in ${RETRY_MS / 1000}s`);
  await delay(RETRY_MS);
}

for (const note of last.notes) console.log(`  · ${note}`);

if (last.failures.length) {
  console.error(`\n✗ ${BASE} is NOT serving a working build:`);
  for (const failure of last.failures) console.error(`  - ${failure}`);
  console.error(
    [
      '',
      'If every failure above names /src/… or /public/… paths, GitHub Pages is publishing',
      'the repository source instead of the build artifact. Fix it in the repository UI:',
      '  Settings → Pages → Build and deployment → Source → "GitHub Actions".',
      'Then re-run this workflow (Actions → Deploy GitHub Pages → Run workflow).',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`\n✓ ${BASE} serves the Vite build: compiled CSS, bundled modules, data and embeds all resolve.`);
