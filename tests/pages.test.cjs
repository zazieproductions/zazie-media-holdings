const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const read = (file) => readFileSync(file, 'utf8');

const PAGES = ['index.html', 'repo.html', 'prototypes.html'];

test('deployment supports repository subpaths without changing classic script semantics', () => {
  assert.equal(require('../vite.config.cjs').base, './');
  assert.match(read('index.html'), /<script src="\.\/src\/app\.js"><\/script>/);
  for (const file of ['index.html', 'src/app.js']) {
    assert.doesNotMatch(read(file), /src="\/art\//);
  }
  assert.match(read('src/prototypes.js'), /fetch\('data\/prototypes\.json'\)/);
});

test('Pages publishes tested build output rather than raw source', () => {
  const workflow = read('.github/workflows/pages.yml');
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test('every page references its assets relative to the page, not the domain root', () => {
  /* GitHub Pages serves the site from /zazie-media-holdings/. A root-absolute
     "/src/styles.css" resolves to https://zazieproductions.github.io/src/styles.css
     (404), which leaves the published page unstyled with its loader on screen. */
  for (const file of PAGES) {
    const source = read(file);
    assert.doesNotMatch(source, /href="\/(?!\/)src\//, `${file} must not use a root-absolute stylesheet`);
    assert.doesNotMatch(source, /src="\/(?!\/)src\//, `${file} must not use a root-absolute script`);
    assert.match(source, /href="\.\/src\/styles\.css"/, `${file} must link the stylesheet relatively`);
  }
  assert.match(read('repo.html'), /type="module" src="\.\/src\/repo-view\.mjs"/);
  assert.match(read('prototypes.html'), /type="module" src="\.\/src\/prototypes\.js"/);
});

test('embedded repository builds resolve under the repository subpath', () => {
  const snapshot = JSON.parse(read('public/data/repos.json'));
  const urls = snapshot.repositories.map((repo) => repo.embed && repo.embed.url).filter(Boolean);
  assert.ok(urls.length >= 5, 'expected the five source-synced builds');
  for (const url of urls) {
    assert.doesNotMatch(url, /^\//, `embed url "${url}" is root-absolute and misses the subpath`);
    assert.ok(existsSync(path.join('public', url)), `${url} must exist under public/`);
  }
  assert.doesNotMatch(read('scripts/sync-repos.mjs'), /url: `\/embeds\//, 'the sync script must keep embed urls relative');
  assert.match(read('src/repo-view.mjs'), /export function siteAsset/);
  assert.match(read('src/repo-view.mjs'), /siteAsset\(repo\.embed\.url\)/);
  assert.match(read('src/app.js'), /function siteAsset\(/);
  assert.match(read('src/app.js'), /siteAsset\(active\.embed\?active\.embed\.url:active\.demoUrl\)/);
});

test('a missing CDN must not blank the page or stop the inline handlers', () => {
  const js = read('src/app.js');
  /* GSAP drives the reveal animation; without it every .reveal element would stay
     at opacity:0 and the rest of the script would never run. */
  assert.match(js, /typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined'/);
  assert.match(js, /typeof Chart==='undefined'\)return/);
  assert.match(js, /el\.style\.opacity='1'/);
});
