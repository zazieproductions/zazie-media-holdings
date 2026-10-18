const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync, statSync } = require('node:fs');
const vm = require('node:vm');
const snapshot = require('../public/data/repos.json');
const js = readFileSync('src/app.js', 'utf8');

test('real repository screenshots are optimized local assets with source provenance', () => {
  const illustrated = snapshot.repositories.filter(r => r.gallery.length);
  assert.deepEqual(illustrated.map(r => r.id), ['noetic', 'sonogenesis', 'agon-signal', 'void-oculus']);
  for (const repo of illustrated) {
    for (const image of repo.gallery) {
      assert.match(image.url, /^art\/repos\/[a-z0-9-]+\/preview-\d+\.jpg$/);
      const bytes = readFileSync(`public/${image.url}`);
      assert.equal(bytes.readUInt16BE(0), 0xffd8, 'real JPEG bytes');
      assert.equal(bytes.length, image.bytes);
      assert.ok(bytes.length < 160000, 'web-sized image');
      assert.ok(image.width > 0 && image.width <= 1200 && image.height > 0);
      assert.ok(image.sourceUrl.startsWith(`${repo.url}/blob/`));
      assert.match(image.blobSha, /^[a-f0-9]{40}$/);
      if (existsSync('dist/index.html')) assert.equal(statSync(`dist/${image.url}`).size, bytes.length);
    }
  }
});

test('home-page cards render linked screenshots without loading apps or inventing placeholders', () => {
  const helper = js.match(/function repositoryPicture\(repo\)\{[\s\S]*?\n\}/)[0];
  const render = js.match(/function renderCodeHoldings\(\)\{[\s\S]*?\n\}/)[0];
  const holdings = js.match(/const CODE_HOLDINGS=(\[[\s\S]*?\n\]);/)[0];
  const grid = { innerHTML: '' };
  const context = { globalThis: { ZMH_REPOS: snapshot }, $: () => grid, siteAsset: p => p };
  vm.runInNewContext(`${holdings}; ${helper}; ${render}; renderCodeHoldings();`, context);
  assert.equal((grid.innerHTML.match(/<figure class="repo-picture">/g) || []).length, 3);
  assert.match(grid.innerHTML, /loading="lazy" decoding="async"/);
  assert.match(grid.innerHTML, /SOURCE ↗/);
  assert.doesNotMatch(grid.innerHTML, /<iframe/);
  assert.equal(vm.runInNewContext(`${helper}; repositoryPicture(null)`, context), '');
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /src="art\/repos\/noetic\/preview-1.jpg"/);
});
