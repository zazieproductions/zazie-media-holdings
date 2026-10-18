#!/usr/bin/env node
/**
 * Sync the curated repository catalog with the real GitHub repositories.
 *
 * Produces:
 *   public/data/repos.json          — metadata, README markdown, file trees,
 *                                    recent commits, languages and vendored build info
 *   public/embeds/<id>/index.html   — first-party, zero-build apps copied verbatim
 *                                    from the repository default branch
 *   public/embeds/<id>/PROVENANCE.txt
 *
 * Usage:
 *   npm run repos:sync
 *   GITHUB_TOKEN=… npm run repos:sync
 *
 * If no token is supplied the script tries `gh auth token`, then falls back to
 * unauthenticated requests (60/hour, which is not enough for a full sync).
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'data', 'repos.manifest.json');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const EMBED_DIR = path.join(ROOT, 'public', 'embeds');
const GALLERY_DIR = path.join(ROOT, 'public', 'art', 'repos');
const OUTPUT_PATH = path.join(DATA_DIR, 'repos.json');
const API = 'https://api.github.com';

/* ---- repository gallery (real screenshots vendored from the repos) ---- */
const RASTER = /\.(png|jpe?g|gif|webp)$/i;
/* Icons, badges and QR codes are repository chrome, not pictures of the work. */
const NOT_A_PICTURE = /(favicon|apple-touch|maskable|icon[-_.]|logo|badge|qr[-_.]|spinner|cursor|favicon)/i;
const GALLERY_MAX = 1;
const GALLERY_WIDTH = 1200;
const GALLERY_QUALITY = 80;
const MIN_SOURCE_BYTES = 20_000;
const MAX_SOURCE_BYTES = 8_000_000;
/* Without an image encoder we only keep sources that are already web-sized. */
const MAX_UNTRANSCODED_BYTES = 400_000;

const token = resolveToken();
if (!token) {
  console.warn('⚠ No GitHub token found — unauthenticated requests are limited to 60/hour.');
}

function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

async function api(pathname, { accept = 'application/vnd.github+json', raw = false } = {}) {
  const headers = { Accept: accept, 'User-Agent': 'zmh-repo-sync' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${pathname}`, { headers });
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining && Number(remaining) < 10) {
    console.warn(`⚠ GitHub rate limit low (${remaining} remaining).`);
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} for ${pathname}: ${body.slice(0, 200)}`);
  }
  return raw ? res : res.json();
}

function decodeContent(payload) {
  if (!payload || !payload.content) return '';
  return Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8');
}

function isoDate(value) {
  return value ? new Date(value).toISOString() : null;
}

function normalizeTree(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry) => entry && entry.name !== '.git')
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type === 'dir' ? 'dir' : entry.type === 'file' ? 'file' : entry.type,
      size: typeof entry.size === 'number' ? entry.size : null,
    }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
}

function languageBreakdown(languages) {
  if (!languages || !Object.keys(languages).length) return [];
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0) || 1;
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => ({ name, bytes, percent: Math.round((bytes / total) * 1000) / 10 }));
}

/* ImageMagick (or GraphicsMagick) transcodes multi-megabyte repository PNGs into
   web-sized stills. CI never runs this script, so a missing encoder must not
   fail the sync: candidates then fall back to their original bytes when those
   are already small enough, and are skipped otherwise. */
function resolveImageEncoder() {
  for (const bin of ['magick', 'convert']) {
    try {
      execFileSync(bin, ['-version'], { stdio: ['ignore', 'ignore', 'ignore'] });
      return bin;
    } catch {
      /* try the next binary */
    }
  }
  return null;
}
const IMAGE_ENCODER = resolveImageEncoder();

function readmeImageRefs(markdown) {
  if (!markdown) return [];
  const refs = [
    ...markdown.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)/g),
    ...markdown.matchAll(/<img[^>]+src=["']([^"'\s]+)/g),
  ].map((match) => match[1]);
  return refs.filter((ref) => !/^(?:[a-z]+:|\/\/)/i.test(ref) && !ref.startsWith('#'));
}

function scoreGalleryCandidate(entry, readmeOrder) {
  const name = path.basename(entry.path);
  let score = 0;
  const inReadme = readmeOrder.indexOf(entry.path);
  if (inReadme >= 0) score += 60 + Math.max(0, 12 - inReadme * 2);
  if (/screenshot|preview|capture|hero|splash|demo/i.test(name)) score += 30;
  if (/detail|interface|screen|desktop|panel/i.test(name)) score += 12;
  if (/social|og[-_]|chart|diagram|fig[-_]|graph|plot|schema/i.test(name)) score -= 35;
  if (/^docs\//i.test(entry.path)) score += 6;
  return score;
}

function selectGalleryCandidates(tree, markdown, limit = GALLERY_MAX) {
  const order = readmeImageRefs(markdown)
    .map((ref) => decodeURIComponent(ref.replace(/^\.\//, '')))
    .map((ref) => {
      const hit = (tree || []).find((item) => item.type === 'file' && (item.path === ref || item.path.endsWith(`/${ref}`)));
      return hit ? hit.path : null;
    })
    .filter(Boolean);
  const candidates = (tree || []).filter(
    (item) =>
      item.type === 'file' &&
      RASTER.test(item.path) &&
      !NOT_A_PICTURE.test(item.path) &&
      !/node_modules|\.git\//i.test(item.path) &&
      typeof item.size === 'number' &&
      item.size >= MIN_SOURCE_BYTES &&
      item.size <= MAX_SOURCE_BYTES,
  );
  return candidates
    .map((item) => ({ ...item, score: scoreGalleryCandidate(item, order) }))
    .sort((a, b) => b.score - a.score || order.indexOf(a.path) - order.indexOf(b.path) || a.path.localeCompare(b.path))
    .slice(0, limit);
}

async function transcodeOrCopy(buffer, sourcePath, outBase) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (IMAGE_ENCODER) {
    const out = `${outBase}.jpg`;
    try {
      execFileSync(
        IMAGE_ENCODER,
        [
          '-',
          '-background',
          '#0a0a13',
          '-alpha',
          'remove',
          '-alpha',
          'off',
          '-resize',
          `${GALLERY_WIDTH}x>`,
          '-quality',
          String(GALLERY_QUALITY),
          '-strip',
          out,
        ],
        { input: buffer, stdio: ['pipe', 'ignore', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
      );
      const dims = execFileSync(IMAGE_ENCODER === 'magick' ? 'magick' : 'identify', [...(IMAGE_ENCODER === 'magick' ? ['identify'] : []), '-format', '%w %h', out], { encoding: 'utf8' })
        .trim()
        .split(/\s+/)
        .map(Number);
      const bytes = (await stat(out)).size;
      return { file: path.basename(out), bytes, width: dims[0] || null, height: dims[1] || null, transcoded: true };
    } catch {
      /* fall through to the raw-bytes path */
    }
  }
  if (ext === '.gif' || buffer.length > MAX_UNTRANSCODED_BYTES) return null;
  const out = `${outBase}${ext}`;
  await writeFile(out, buffer);
  const bytes = (await stat(out)).size;
  return { file: path.basename(out), bytes, width: null, height: null, transcoded: false };
}

async function syncGallery(record) {
  const base = `/repos/${record.fullName}`;
  const tree = await api(`${base}/git/trees/${encodeURIComponent(record.defaultBranch)}?recursive=1`);
  if (tree?.truncated) throw new Error('Gallery tree was truncated');
  const candidates = selectGalleryCandidates((tree?.tree || []).map(item => ({
    ...item, type: item.type === 'blob' ? 'file' : item.type,
  })), record.readme?.markdown);
  const dir = path.join(GALLERY_DIR, record.id);
  await mkdir(dir, { recursive: true });
  const gallery = [];
  for (const candidate of candidates) {
    const response = await api(`${base}/git/blobs/${candidate.sha}`);
    const buffer = Buffer.from(response.content.replace(/\n/g, ''), 'base64');
    const image = await transcodeOrCopy(buffer, candidate.path, path.join(dir, `preview-${gallery.length + 1}`));
    if (!image) continue;
    gallery.push({
      ...image, url: `art/repos/${record.id}/${image.file}`,
      alt: `${record.displayName} — ${path.basename(candidate.path, path.extname(candidate.path)).replace(/[-_]/g, ' ')}`,
      sourcePath: candidate.path,
      sourceUrl: `${record.url}/blob/${record.defaultBranch}/${candidate.path.split('/').map(encodeURIComponent).join('/')}`,
      blobSha: candidate.sha,
    });
  }
  return gallery;
}

async function syncRepo(entry, account) {
  const { repo } = entry;
  const base = `/repos/${account}/${repo}`;
  const record = {
    id: entry.id,
    repo,
    fullName: `${account}/${repo}`,
    url: `https://github.com/${account}/${repo}`,
    displayName: entry.displayName,
    category: entry.category,
    section: entry.section,
    accent: entry.accent || '#e6ff4a',
    summary: entry.summary,
    potential: entry.potential,
    rights: entry.rights,
    status: entry.status,
    demoUrl: entry.demoUrl || null,
    demoLabel: entry.demoLabel || null,
    embed: null,
    fetched: {},
    errors: [],
  };

  const meta = await api(base);
  if (!meta) throw new Error(`Repository not found: ${record.fullName}`);
  Object.assign(record, {
    description: meta.description || '',
    homepage: meta.homepage || null,
    language: meta.language || null,
    license: meta.license ? { key: meta.license.key, name: meta.license.name, spdx: meta.license.spdx_id } : null,
    stars: meta.stargazers_count ?? 0,
    forks: meta.forks_count ?? 0,
    watchers: meta.subscribers_count ?? meta.watchers_count ?? 0,
    openIssues: meta.open_issues_count ?? 0,
    topics: Array.isArray(meta.topics) ? meta.topics : [],
    defaultBranch: meta.default_branch || 'main',
    createdAt: isoDate(meta.created_at),
    updatedAt: isoDate(meta.updated_at),
    pushedAt: isoDate(meta.pushed_at),
    sizeKB: meta.size ?? null,
    archived: Boolean(meta.archived),
    fork: Boolean(meta.fork),
    visibility: meta.visibility || 'public',
  });

  const [languages, readmePayload, contents, commits, pages, packagePayload] = await Promise.all([
    api(`${base}/languages`).catch(() => null),
    api(`${base}/readme`).catch(() => null),
    api(`${base}/contents`).catch(() => null),
    api(`${base}/commits?per_page=8`).catch(() => null),
    api(`${base}/pages`).catch(() => null),
    api(`${base}/contents/package.json`).catch(() => null),
  ]);

  record.languages = languageBreakdown(languages);
  record.readme = readmePayload
    ? {
        name: readmePayload.name,
        path: readmePayload.path,
        sha: readmePayload.sha,
        htmlUrl: readmePayload.html_url,
        markdown: decodeContent(readmePayload).slice(0, 400_000),
        truncated: decodeContent(readmePayload).length > 400_000,
        fetchedFrom: `${record.fullName}@${record.defaultBranch}`,
      }
    : null;
  record.tree = normalizeTree(contents);
  record.commits = Array.isArray(commits)
    ? commits.map((commit) => ({
        sha: commit.sha,
        shortSha: commit.sha ? commit.sha.slice(0, 7) : '',
        message: (commit.commit?.message || '').split('\n')[0].slice(0, 220),
        author: commit.commit?.author?.name || commit.author?.login || 'unknown',
        date: isoDate(commit.commit?.author?.date),
        url: commit.html_url,
      }))
    : [];
  record.pages = pages
    ? {
        status: pages.status || null,
        buildType: pages.build_type || null,
        url: pages.html_url || null,
        source: pages.source || null,
      }
    : null;

  if (readmePayload) record.fetched.readme = record.readme.sha;
  record.fetched.tree = record.tree.length;

  if (packagePayload) {
    try {
      const pkg = JSON.parse(decodeContent(packagePayload));
      record.package = {
        name: pkg.name || null,
        version: pkg.version || null,
        scripts: pkg.scripts || {},
        dependencies: pkg.dependencies ? Object.keys(pkg.dependencies).length : 0,
        devDependencies: pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0,
      };
    } catch {
      record.errors.push('package.json could not be parsed');
    }
  } else {
    record.package = null;
  }

  // Vendored zero-build artifacts. These are copied verbatim from the default
  // branch so the site can run the actual product without a build server.
  if (entry.embed && entry.embed.sourcePath) {
    const payload = await api(`${base}/contents/${encodeURI(entry.embed.sourcePath)}`).catch(() => null);
    if (!payload || !payload.content) {
      record.errors.push(`Embed source missing: ${entry.embed.sourcePath}`);
    } else {
      const bytes = Buffer.from(payload.content.replace(/\n/g, ''), 'base64');
      const outDir = path.dirname(path.join(EMBED_DIR, entry.embed.output));
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(EMBED_DIR, entry.embed.output), bytes);
      record.embed = {
        // Repository-relative: the site is published under /zazie-media-holdings/,
        // so a root-absolute "/embeds/..." would resolve outside the subpath.
        url: `embeds/${entry.embed.output}`,
        label: entry.embed.label || 'SOURCE-SYNCED BUILD',
        sourcePath: entry.embed.sourcePath,
        sourceUrl: `${record.url}/blob/${record.defaultBranch}/${encodeURI(entry.embed.sourcePath)}`,
        bytes: bytes.length,
        blobSha: payload.sha || null,
        headSha: record.commits[0]?.sha || null,
        syncedAt: new Date().toISOString(),
        license: record.license?.spdx || null,
      };

      // Keep a provenance note and, when present, the repository's license next
      // to the copied build so the vendored file is self-describing.
      let licenseFile = record.tree.find((item) => item.type === 'file' && /^licen[cs]e/i.test(item.name));
      let licenseText = '';
      if (licenseFile) {
        const licensePayload = await api(`${base}/contents/${encodeURI(licenseFile.path)}`).catch(() => null);
        licenseText = decodeContent(licensePayload);
        if (licenseText) await writeFile(path.join(outDir, 'LICENSE.txt'), licenseText);
      }
      await writeFile(
        path.join(outDir, 'PROVENANCE.txt'),
        [
          `Vendored build: ${record.displayName}`,
          `Upstream: ${record.url}`,
          `Source file: ${record.embed.sourcePath}`,
          `Branch: ${record.defaultBranch}`,
          `Synced: ${record.embed.syncedAt}`,
          `Head commit: ${record.embed.headSha || 'unknown'}`,
          `Blob SHA: ${record.embed.blobSha || 'unknown'}`,
          `Bytes: ${record.embed.bytes}`,
          `License (GitHub metadata): ${record.license ? record.license.spdx || record.license.name : 'none detected'}`,
          `License file copied: ${licenseText ? 'yes' : 'no'}`,
          '',
          'This directory is generated by scripts/sync-repos.mjs. Do not edit by hand.',
          'The file is a verbatim first-party copy of the upstream repository artifact.',
        ].join('\n'),
      );
    }
  }

  try {
    record.gallery = await syncGallery(record);
  } catch (error) {
    record.gallery = [];
    record.errors.push(`Gallery sync: ${error.message}`);
  }
  return record;
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const account = manifest.account || 'zazieproductions';
  const repositories = manifest.repositories || [];
  console.log(`Syncing ${repositories.length} repositories from github.com/${account} …`);

  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(EMBED_DIR, { recursive: true });

  const results = [];
  let failures = 0;
  for (const entry of repositories) {
    process.stdout.write(`  • ${entry.id.padEnd(18)} `);
    try {
      const record = await syncRepo(entry, account);
      results.push(record);
      const bits = [
        record.language || 'n/a',
        record.license ? record.license.spdx || record.license.name : 'no license',
        `★ ${record.stars}`,
        record.readme ? `${record.readme.markdown.length}b readme` : 'no readme',
        record.embed ? `embed ${Math.round(record.embed.bytes / 1024)}kb` : 'no embed',
      ];
      console.log(`ok  (${bits.join(' · ')})`);
      if (record.errors.length) console.log(`      ⚠ ${record.errors.join('; ')}`);
    } catch (error) {
      failures += 1;
      console.log('FAILED');
      console.error(`      ${error.message}`);
    }
  }

  // Keep the same order as the manifest and fail loudly only if nothing worked.
  const byId = new Map(results.map((record) => [record.id, record]));
  const ordered = repositories.map((entry) => byId.get(entry.id)).filter(Boolean);

  const output = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    account,
    accountUrl: `https://github.com/${account}`,
    source: 'GitHub REST API — https://docs.github.com/rest',
    syncScript: 'scripts/sync-repos.mjs',
    manifest: 'data/repos.manifest.json',
    counts: {
      curated: ordered.length,
      embedded: ordered.filter((record) => record.embed).length,
      withReadme: ordered.filter((record) => record.readme).length,
      withExternalDemo: ordered.filter((record) => record.demoUrl).length,
      runnable: ordered.filter((record) => record.embed || record.demoUrl).length,
    },
    repositories: ordered,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  const bytes = (await readFile(OUTPUT_PATH)).length;
  console.log(`\nWrote ${path.relative(ROOT, OUTPUT_PATH)} (${(bytes / 1024).toFixed(1)} KB) with ${ordered.length} repositories.`);
  if (failures) {
    console.warn(`${failures} repositories failed to sync.`);
    if (!ordered.length) process.exitCode = 1;
  }
}

async function galleryOnly() {
  const snapshot = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'));
  for (const record of snapshot.repositories) {
    record.gallery = await syncGallery(record);
    console.log(`${record.id}: ${record.gallery.length} pictures`);
  }
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
}

(process.argv.includes('--gallery-only') ? galleryOnly() : main()).catch((error) => {
  console.error(error);
  process.exit(1);
});
