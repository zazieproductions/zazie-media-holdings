const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync, statSync } = require('node:fs');
const path = require('node:path');

const html = readFileSync('index.html', 'utf8');
const repoHtml = readFileSync('repo.html', 'utf8');
const repoView = readFileSync('src/repo-view.mjs', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const appJs = readFileSync('src/app.js', 'utf8');
const manifest = JSON.parse(readFileSync('data/repos.manifest.json', 'utf8'));
const snapshot = JSON.parse(readFileSync('public/data/repos.json', 'utf8'));
const vite = readFileSync('vite.config.cjs', 'utf8');
const tailwind = readFileSync('tailwind.config.cjs', 'utf8');
const headers = readFileSync('public/_headers', 'utf8');
const indexLinkPattern = /<a href="repo\.html" class="nav-link[^"]*">REPOS<\/a>/;

test('the site embeds the real repository dossier page', () => {
  assert.match(repoHtml, /id="repoView"/);
  assert.match(repoHtml, /id="catalogView"/);
  assert.match(repoHtml, /id="readmeBody"/);
  assert.match(repoHtml, /id="fileTree"/);
  assert.match(repoHtml, /id="commitList"/);
  assert.match(repoHtml, /id="liveStage"/);
  assert.match(repoHtml, /id="repoTelemetry"/);
  assert.match(repoHtml, /type="module" src="\.\/src\/repo-view\.mjs"/);
  assert.match(repoHtml, /role="tablist"/);
  assert.match(html, /id="launchBayBody"/);
  assert.match(html, /REAL REPOSITORY BUILDS/);
  assert.match(html, /repo\.html\?id=form-909#live/);
  assert.match(html, indexLinkPattern);
});

test('repository snapshot contains real READMEs, trees, commits and licences', () => {
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.account, 'zazieproductions');
  assert.equal(snapshot.repositories.length, 15);
  assert.equal(new Set(snapshot.repositories.map((repo) => repo.id)).size, 15, 'repository ids are unique');
  assert.equal(snapshot.counts.curated, 15);
  assert.equal(snapshot.counts.withReadme, 15);
  assert.equal(snapshot.counts.embedded, 5);
  assert.equal(snapshot.counts.runnable, 6, 'five embedded builds plus one external deployment');

  for (const repo of snapshot.repositories) {
    assert.ok(repo.url.startsWith('https://github.com/zazieproductions/'), `unexpected repo URL: ${repo.url}`);
    assert.ok(repo.readme && repo.readme.markdown.length > 500, `${repo.id} should embed a real README`);
    assert.ok(repo.readme.markdown.includes('#') || repo.readme.markdown.includes('='), `${repo.id} README should look like markdown`);
    assert.ok(repo.tree.length > 0, `${repo.id} should expose a real file tree`);
    assert.ok(repo.commits.length > 0 && repo.commits.every((commit) => /^[0-9a-f]{7,40}$/.test(commit.sha)), `${repo.id} should expose real commits`);
    assert.ok(repo.summary && repo.potential && repo.rights && repo.status, `${repo.id} keeps its curated diligence fields`);
    assert.ok(Array.isArray(repo.languages), `${repo.id} should include languages`);
  }
});

test('only verified demos are advertised, and dead deployments are not linked', () => {
  const demos = snapshot.repositories.filter((repo) => repo.demoUrl).map((repo) => repo.demoUrl);
  assert.deepEqual(demos.sort(), [
    'https://zazieproductions.github.io/Form-909-Warp-IDM-Drum-Machine/Form-909%20Warp%20IDM%20Drum%20Machine.html',
    'https://zazieproductions.github.io/interactive-harsh-noise-generator/',
    'https://zazieproductions.github.io/void-oculus/',
  ].sort());
  // These deployments currently return "Site not found" and must not be
  // presented as live demos on the marketing page or in the snapshot.
  for (const dead of ['NOETIC-Cognitive-Command-Deck', 'UIUA-RESONANCE-LAB', 'synthx-7-modular-synthesis-terminal']) {
    assert.doesNotMatch(html, new RegExp(`https://zazieproductions\\.github\\.io/${dead}`));
    assert.ok(!snapshot.repositories.some((repo) => repo.demoUrl && repo.demoUrl.includes(dead)), `${dead} must not be advertised as live`);
  }
  assert.match(html, /No public deployment is live/);
});

test('embedded builds are vendored verbatim with provenance and licence files', () => {
  const embedded = snapshot.repositories.filter((repo) => repo.embed);
  assert.equal(embedded.length, 5);
  for (const repo of embedded) {
    const file = path.join('public', repo.embed.url);
    assert.ok(existsSync(file), `missing embedded build for ${repo.id}: ${file}`);
    const stats = statSync(file);
    assert.ok(stats.size > 30_000, `${repo.id} embedded build is unexpectedly small`);
    assert.ok(stats.size === repo.embed.bytes, `${repo.id} embedded build should match the synced byte count`);
    const provenance = readFileSync(path.join(path.dirname(file), 'PROVENANCE.txt'), 'utf8');
    assert.match(provenance, new RegExp(`Upstream: https://github\\.com/zazieproductions/${repo.repo}`));
    assert.match(provenance, /Head commit: [0-9a-f]{7,40}/);
    assert.match(provenance, /License/);
    assert.ok(repo.embed.sourceUrl.startsWith(repo.url), `${repo.id} provenance should point back to the source file`);
    assert.match(repoView, /repo\.embed\.url/);
  }
  for (const id of ['form-909', 'prompt-forge', 'cinecontract', 'uiua-resonance', 'void-oculus']) {
    const repo = snapshot.repositories.find((item) => item.id === id);
    assert.ok(repo && repo.embed, `expected an embed for ${id}`);
  }
});

test('dossier renderer uses real GitHub READMEs with sanitisation', () => {
  assert.match(repoView, /import \{ marked \} from 'marked'/);
  assert.match(repoView, /import DOMPurify from 'dompurify'/);
  assert.match(repoView, /DOMPurify\.safe|DOMPurify\.sanitize/);
  assert.match(repoView, /marked\.parse/);
  assert.match(repoView, /raw\.githubusercontent\.com/);
  assert.match(repoView, /api\.github\.com\/repos/);
  assert.match(repoView, /FORBID_TAGS/);
  assert.match(repoView, /noopener noreferrer/);
  assert.match(repoView, /data\/repos\.json/);
  assert.match(repoView, /function renderReadme/);
  assert.match(repoView, /function loadDirectory/);
  assert.match(repoView, /function openFile/);
  assert.match(repoView, /function buildLiveToolbar/);
  assert.match(repoView, /function renderTelemetry/);
  assert.match(repoView, /ACTIVITY TRACE/);
  assert.match(repoView, /SOURCE PROFILE/);
  assert.match(repoView, /PORTFOLIO CONTEXT/);
  assert.match(repoView, /live \? 'live' : 'readme'/);
  assert.match(repoView, /aria-label="Timeline of the/);
  assert.match(repoView, /aria-label="Source language composition/);
  assert.match(styles, /\.telemetry-card/);
  assert.match(styles, /\.language-ring/);
  assert.match(styles, /\.peer-track/);
  assert.match(repoView, /function renderRepo/);
  assert.match(repoView, /function renderCatalog/);
});

test('main page merges live repository facts into the cards and launch bay', () => {
  assert.match(appJs, /globalThis\.ZMH_REPOS/);
  assert.match(appJs, /function renderLaunchBay/);
  assert.match(appJs, /function launchBaySelect/);
  assert.match(appJs, /function loadRepoSnapshot/);
  assert.match(appJs, /fetch\('data\/repos\.json'/);
  assert.match(appJs, /repo\.html\?id=/);
  assert.match(appJs, /RUNS IN SITE/);
  assert.match(html, /id="repoSyncStamp"/);
});

test('build configuration serves the multi-page dossier and same-origin embeds', () => {
  assert.match(vite, /repo:\s*resolve\(__dirname, 'repo\.html'\)/);
  assert.match(tailwind, /repo\.html/);
  assert.match(tailwind, /mjs/);
  assert.match(headers, /X-Frame-Options: SAMEORIGIN/);
  assert.doesNotMatch(headers, /X-Frame-Options: DENY/);
});

test('manifest and snapshot stay in sync on the curated ids and repository names', () => {
  assert.equal(manifest.repositories.length, snapshot.repositories.length);
  for (const entry of manifest.repositories) {
    const repo = snapshot.repositories.find((item) => item.id === entry.id);
    assert.ok(repo, `missing snapshot entry for ${entry.id}`);
    assert.equal(repo.repo, entry.repo);
    assert.equal(repo.displayName, entry.displayName);
    assert.equal(repo.summary, entry.summary);
    assert.equal(Boolean(repo.embed), Boolean(entry.embed));
  }
});
