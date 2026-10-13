const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const html = readFileSync('index.html', 'utf8');
const js = readFileSync('src/app.js', 'utf8');
const css = readFileSync('src/styles.css', 'utf8');
test('site has expected document and JavaScript entrypoint', () => {
  assert.match(html, /Zazie Media Holdings/);
  assert.match(html, /\/src\/app\.js/);
  assert.match(html, /\/src\/styles\.css/);
});
test('catalog, cart, music and instrument modules are retained', () => {
  for (const symbol of ['FILMS', 'DOMAINS', 'PRODUCTS', 'MUSIC', 'checkout', 'renderSeq', 'toggleRot']) assert.match(js, new RegExp(symbol));
});
test('custom styles are retained', () => {
  assert.match(css, /\.film-poster/);
  assert.match(css, /\.sequencer-btn/);
});
