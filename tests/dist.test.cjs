/**
 * Assertions against the *build output*. These are the checks that would have
 * caught the original Pages breakage: the published artifact must contain the
 * compiled stylesheet and the emitted classic script — not the raw source.
 *
 * `npm run check` builds before it tests, so these run in CI. They skip when no
 * build has been produced yet, so a bare `npm test` still works.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const path = require('node:path');

const DIST = 'dist';
const hasBuild = existsSync(path.join(DIST, 'index.html'));
const skip = { skip: hasBuild ? false : 'run `npm run build` first' };
const read = (file) => readFileSync(path.join(DIST, file), 'utf8');
const localRefs = (html) => [
  ...[...html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)].map((m) => m[1]),
  ...[...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/gi)].map((m) => m[1]),
].filter((url) => !/^(?:[a-z]+:)?\/\//i.test(url));

test('build output links the compiled stylesheet, never the Tailwind source', skip, () => {
  for (const page of ['index.html', 'repo.html', 'prototypes.html']) {
    const html = read(page);
    assert.doesNotMatch(html, /\/src\/styles\.css/, `${page} must not reference the source stylesheet`);
    assert.doesNotMatch(html, /@tailwind\s+base/, `${page} must not inline Tailwind directives`);
    const stylesheets = [...html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)]
      .filter((m) => /rel="[^"]*stylesheet/i.test(m[0]))
      .map((m) => m[1]);
    const compiled = stylesheets.filter((href) => /^\.\/assets\/[\w.-]+\.css$/.test(href));
    assert.equal(compiled.length, 1, `${page} must link exactly one compiled stylesheet (found ${stylesheets.join(', ')})`);
  }
});

test('build output ships the classic script that powers the inline handlers', skip, () => {
  assert.match(read('index.html'), /<script src="\.\/src\/app\.js"><\/script>/);
  assert.ok(existsSync(path.join(DIST, 'src', 'app.js')), 'dist/src/app.js must be emitted');
  assert.equal(read(path.join('src', 'app.js')), readFileSync('src/app.js', 'utf8'), 'the emitted script must match the source');
  // Inline handlers (openPalette, launchBayLoad, …) need globals, not a module.
  assert.doesNotMatch(read('index.html'), /<script[^>]+type="module"[^>]+src="\.\/src\/app\.js"/);
});

test('every local asset referenced by the build output exists in the artifact', skip, () => {
  for (const page of ['index.html', 'repo.html', 'prototypes.html']) {
    for (const ref of localRefs(read(page))) {
      const target = path.join(DIST, ref.replace(/^\.\//, ''));
      assert.ok(existsSync(target), `${page} references ${ref}, which is missing from dist/`);
    }
  }
});

test('build output publishes compiled assets, data, embeds and artwork', skip, () => {
  const assets = readdirSync(path.join(DIST, 'assets'));
  assert.ok(assets.some((file) => file.endsWith('.css')), 'expected a compiled CSS asset');
  assert.ok(assets.some((file) => file.endsWith('.js')), 'expected bundled JS assets');

  for (const data of ['data/repos.json', 'data/prototypes.json']) {
    assert.ok(existsSync(path.join(DIST, data)), `${data} must be published`);
    JSON.parse(read(data));
  }

  const snapshot = JSON.parse(read('data/repos.json'));
  const embeds = snapshot.repositories.map((repo) => repo.embed && repo.embed.url).filter(Boolean);
  assert.ok(embeds.length >= 5, 'expected the five source-synced builds');
  for (const url of embeds) {
    assert.doesNotMatch(url, /^\//, `embed url "${url}" would resolve outside the subpath`);
    assert.ok(existsSync(path.join(DIST, url)), `${url} must be published in dist/`);
  }

  assert.ok(existsSync(path.join(DIST, 'art', 'wordmark.jpg')), 'artwork must be published');
});

test('build output keeps the same-origin frame policy for the embedded apps', skip, () => {
  const headers = read('_headers');
  assert.match(headers, /X-Frame-Options: SAMEORIGIN/);
  assert.doesNotMatch(headers, /X-Frame-Options: DENY/);
});
