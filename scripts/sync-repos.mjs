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
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'data', 'repos.manifest.json');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const EMBED_DIR = path.join(ROOT, 'public', 'embeds');
const OUTPUT_PATH = path.join(DATA_DIR, 'repos.json');
const API = 'https://api.github.com';

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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
