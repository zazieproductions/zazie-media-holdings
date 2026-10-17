const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');
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
test('GitHub software and research candidates are surfaced with rights context', () => {
  assert.match(html, /id="software-ip"/);
  assert.match(html, /id="codeHoldingsGrid"/);
  assert.match(html, /Repository visibility does not establish company ownership/);
  assert.match(js, /function renderCodeHoldings\(\)/);
  assert.match(js, /function openCodeHolding\(id\)/);
  assert.match(js, /target="_blank" rel="noopener noreferrer"/);
  const dataSource = js.match(/const CODE_HOLDINGS=(\[[\s\S]*?\n\]);/);
  assert.ok(dataSource, 'expected a parseable source-code holdings register');
  const holdings = vm.runInNewContext(dataSource[1]);
  assert.equal(holdings.length, 12);
  assert.equal(new Set(holdings.map((holding) => holding.id)).size, 12, 'holding IDs should be unique');
  assert.ok(holdings.every((holding) => holding.repo.startsWith('https://github.com/zazieproductions/')));
  assert.ok(holdings.every((holding) => holding.rights && holding.status));
  const renderFunction = js.match(/function renderCodeHoldings\(\)\{[\s\S]*?\n\}/);
  assert.ok(renderFunction, 'expected the holdings card renderer');
  const grid = { innerHTML: '' };
  new Function('$', 'CODE_HOLDINGS', `${renderFunction[0]}; renderCodeHoldings();`)(
    (id) => id === 'codeHoldingsGrid' ? grid : null,
    holdings,
  );
  assert.equal((grid.innerHTML.match(/<article /g) || []).length, 12);
  for (const repo of [
    'Comprehensive-Backlink-Tracker---Zazie-Productions-',
    'Sonogenesis-Bioacoustic-Aquarium',
    'Auralis-Bioacoustic-Synthesphere',
    'Umbra-Score-Sound-Design-Engine',
    'PROMPT-FORGE-v2.4.1-LOCAL-COMPILER-DETERMINISTIC-MEGA-PROMPT-COMPILER',
    'StudioLex-Contract-Automation',
    'UIUA-RESONANCE-LAB',
    'CHIMERA-V1-Generative-Synth',
    'synthx-7-modular-synthesis-terminal',
    'void-oculus',
    'interactive-harsh-noise-generator',
    'AETHER-V9-Pro'
  ]) assert.ok(js.includes(repo), `missing curated source repository: ${repo}`);
  assert.match(html, /GITHUB SCAN • 12 ADDITIONAL ASSETS/);
  assert.doesNotMatch(html, /License — \$49/);
});

test('writings and artwork registers are complete and assets exist', () => {
  assert.match(html, /id="writings"/);
  assert.match(html, /id="writingGrid"/);
  assert.match(html, /id="artGrid"/);
  assert.match(html, /wordmark\.jpg/);
  const wSource = js.match(/const WRITINGS=(\[[\s\S]*?\n\]);/);
  const aSource = js.match(/const ARTWORKS=(\[[\s\S]*?\n\]);/);
  assert.ok(wSource, 'expected a parseable writings register');
  assert.ok(aSource, 'expected a parseable artwork register');
  const writings = vm.runInNewContext(wSource[1]);
  const artworks = vm.runInNewContext(aSource[1]);
  assert.equal(writings.length, 15);
  assert.equal(artworks.length, 10);
  assert.equal(new Set(writings.map((w) => w.id)).size, 15, 'writing IDs should be unique');
  assert.equal(new Set(artworks.map((a) => a.id)).size, 10, 'artwork IDs should be unique');
  const statuses = new Set(['ACCEPTED', 'SUBMITTED', 'READY', 'UNSENT']);
  for (const w of writings) {
    assert.ok(statuses.has(w.status), `unexpected writing status: ${w.status}`);
    assert.ok(w.title && w.form && w.note && w.source);
    assert.ok(Array.isArray(w.lines) && w.lines.length, `missing card excerpt: ${w.title}`);
    assert.ok(Array.isArray(w.body) && w.body.length, `missing modal excerpt: ${w.title}`);
  }
  assert.ok(writings.some((w) => w.status === 'ACCEPTED'), 'accepted credits should be visible');
  for (const a of artworks) {
    for (const asset of [`public/art/${a.file}.jpg`, `public/art/thumbs/${a.file}.jpg`]) {
      assert.ok(existsSync(asset), `missing artwork asset: ${asset}`);
    }
  }
});

test('writing and artwork renderers emit accessible cards', () => {
  const start = js.indexOf("let writingStatus='all';");
  const endMarker = 'renderWritings();renderArt();';
  const end = js.indexOf(endMarker);
  assert.ok(start > -1 && end > start, 'expected the writings renderer block');
  const source = js.slice(start, end + endMarker.length);
  const wSource = js.match(/const WRITINGS=(\[[\s\S]*?\n\]);/);
  const aSource = js.match(/const ARTWORKS=(\[[\s\S]*?\n\]);/);
  const writings = vm.runInNewContext(wSource[1]);
  const artworks = vm.runInNewContext(aSource[1]);
  const grids = { writingGrid: { innerHTML: '' }, artGrid: { innerHTML: '' } };
  const doc = { getElementById: (id) => grids[id] || null, querySelectorAll: () => [] };
  const rendered = new Function('document', '$', 'WRITINGS', 'ARTWORKS', 'toast', 'openModal', 'closeModal', `${source}; return { w: document.getElementById('writingGrid').innerHTML, a: document.getElementById('artGrid').innerHTML };`)(
    doc, (id) => doc.getElementById(id), writings, artworks, () => {}, () => {}, () => {},
  );
  assert.equal((rendered.w.match(/<article /g) || []).length, 15);
  assert.equal((rendered.a.match(/<figure /g) || []).length, 10);
  assert.match(rendered.w, /role="button"/);
  assert.match(rendered.w, /openWriting\('/);
  assert.match(rendered.a, /\/art\/thumbs\//);
});
