const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
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
