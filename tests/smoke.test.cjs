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
test('Five Steps From The Fringe is registered with cover, episodes and an opt-in player', () => {
  assert.match(html, /id="podcast"/);
  assert.match(html, /https:\/\/open\.spotify\.com\/show\/7FPixyDvxgFkG9ndNOSDxJ/);
  assert.match(html, /ab6765630000bdcff5f08fa13ab6ecdc76c988d2/);
  assert.match(html, /Obsidian Veil Media/);
  assert.match(html, /loadFringePlayer\('fringePlayer','show','7FPixyDvxgFkG9ndNOSDxJ'\)/);
  assert.doesNotMatch(html, /<iframe/);
  assert.match(js, /function renderFringe\(/);
  assert.match(js, /function openFringeEpisode\(/);
  assert.match(js, /function loadFringePlayer\(/);
  const showSource = js.match(/const FRINGE_SHOW=(\{[\s\S]*?\n\});/);
  const episodeSource = js.match(/const FRINGE_EPISODES=(\[[\s\S]*?\n\]);/);
  assert.ok(showSource, 'expected a parseable show record');
  assert.ok(episodeSource, 'expected a parseable episode register');
  const show = vm.runInNewContext('(' + showSource[1] + ')');
  const episodes = vm.runInNewContext(episodeSource[1]);
  assert.equal(show.spotifyId, '7FPixyDvxgFkG9ndNOSDxJ');
  assert.equal(show.publisher, 'Obsidian Veil Media');
  assert.equal(episodes.length, 9);
  assert.equal(new Set(episodes.map((episode) => episode.id)).size, 9);
  assert.equal(new Set(episodes.map((episode) => episode.spotifyId)).size, 9);
  assert.equal(episodes.reduce((sum, episode) => sum + episode.sec, 0), 3990);
  assert.equal(episodes.find((episode) => episode.id === 'phantom-requiem'), undefined);
  assert.doesNotMatch(js, /1fvq4kF8w6ew8IllOLf5yn/);
  for (const episode of episodes) {
    assert.match(episode.spotifyId, /^[A-Za-z0-9]+$/);
    assert.ok(episode.title && episode.summary && episode.date && episode.dur && episode.desk);
    assert.match(js, new RegExp(episode.spotifyId));
  }
  const desks = {};
  for (const episode of episodes) desks[episode.desk] = (desks[episode.desk] || 0) + 1;
  assert.deepEqual(desks, { Community: 1, Music: 3, Art: 3, Science: 2 });
  const start = js.indexOf('function fringeEsc');
  const end = js.indexOf('function openFringeEpisode');
  assert.ok(start > -1 && end > start, 'expected the podcast renderer block');
  const source = js.slice(start, end);
  const list = { innerHTML: '', querySelectorAll: () => [] };
  const count = { textContent: '' };
  const runtime = { textContent: '' };
  new Function('$', 'FRINGE_SHOW', 'FRINGE_EPISODES', 'fringeDesk', `${source}; renderFringe();`)(
    (id) => ({ fringeList: list, fringeSearch: { value: '' }, fringeCount: count, fringeRuntime: runtime })[id] || null,
    show,
    episodes,
    'all',
  );
  assert.equal((list.innerHTML.match(/<article /g) || []).length, 9);
  assert.match(list.innerHTML, /EP 09/);
  assert.match(list.innerHTML, /Busy Bee/);
  assert.doesNotMatch(list.innerHTML, /Phantom Requiem/);
  assert.equal(runtime.textContent, '1:06:30');
  assert.match(html, /NOT IN THE SIMULATED VALUATION/);
  assert.match(html, /they are not invented here/);
  assert.doesNotMatch(html, /id="podcast"[\s\S]{0,1800}monthly listeners|id="podcast"[\s\S]{0,1800}\$\d[\d,.]*[kKmM]/);
  const player = { querySelector: () => null, replaceChildren: (node) => { player.child = node; } };
  const frame = { style: {}, setAttribute() {} };
  new Function('$', 'document', 'FRINGE_SHOW', 'FRINGE_EPISODES', `${source}; loadFringePlayer('fringePlayer','show','7FPixyDvxgFkG9ndNOSDxJ');`)(
    () => player,
    { createElement: (tag) => { assert.equal(tag, 'iframe'); return frame; } },
    show,
    episodes,
  );
  assert.match(frame.src, /^https:\/\/open\.spotify\.com\/embed\/show\/7FPixyDvxgFkG9ndNOSDxJ/);
  assert.match(frame.title, /Five Steps From The Fringe/);
  assert.match(frame.allow, /autoplay/);
  assert.equal(player.child, frame);
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
  assert.equal(holdings.length, 14);
  assert.equal(new Set(holdings.map((holding) => holding.id)).size, 14, 'holding IDs should be unique');
  assert.ok(holdings.every((holding) => holding.repo.startsWith('https://github.com/zazieproductions/')));
  assert.ok(holdings.every((holding) => holding.rights && holding.status));
  const renderFunction = js.match(/function renderCodeHoldings\(\)\{[\s\S]*?\n\}/);
  assert.ok(renderFunction, 'expected the holdings card renderer');
  const grid = { innerHTML: '' };
  new Function('$', 'CODE_HOLDINGS', `${renderFunction[0]}; renderCodeHoldings();`)(
    (id) => id === 'codeHoldingsGrid' ? grid : null,
    holdings,
  );
  assert.equal((grid.innerHTML.match(/<article /g) || []).length, 14);
  for (const repo of [
    'radioreach-funnel',
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
  assert.match(html, /GITHUB IP REGISTER • 14 ADDITIONAL PROJECTS/);
  const radioReach = holdings.find((holding) => holding.id === 'radioreach-funnel');
  assert.ok(radioReach, 'RadioReach source should be listed');
  assert.equal(radioReach.site, 'https://radioreach.us');
  assert.match(radioReach.rights, /all rights reserved/i);
  assert.match(radioReach.rights, /no open-source license/i);
  for (const system of ['Emotional State Proxy (ESP)', 'Momentum + Ownership', 'Conversion Lab', 'Lucky Wheel', 'Secret Slots', 'Meta Pixel / Conversions API']) {
    assert.ok(radioReach.systems.some((entry) => entry.includes(system)), `missing RadioReach system: ${system}`);
  }
  assert.match(grid.innerHTML, /href="https:\/\/radioreach\.us"/);
  assert.match(grid.innerHTML, /href="https:\/\/github\.com\/zazieproductions\/radioreach-funnel"/);
  assert.match(grid.innerHTML, /SYSTEMS \/ CODE IDENTIFIED/);
  assert.match(grid.innerHTML, /href="#radioreach-systems"/);
  assert.doesNotMatch(html, /License — \$49/);
});

test('RadioReach proprietary behavioral systems are documented with transparency controls', () => {
  assert.match(html, /id="radioreach-systems"/);
  assert.match(html, /Marketing Psychology &amp; Conversion Systems/);
  assert.match(html, /Emotional State Proxy \(ESP\)/);
  assert.match(html, /scroll velocity/);
  assert.match(html, /20-second half-life/);
  for (const mode of ['calm', 'aspire', 'urgency']) assert.match(html, new RegExp(`>${mode}<`));
  assert.match(html, /sessionStorage\["esp\.events\.v1"\]/);
  assert.match(html, /src\/esp\/README\.md/);
  assert.match(html, /Momentum \+ Ownership Sequence/);
  assert.match(html, /localStorage/);
  assert.match(html, /MomentumSequenceViewed/);
  assert.match(html, /TRANSPARENCY &amp; PRIVACY REVIEW/);
});

test('RadioReach domain card links to its live funnel and source repository', () => {
  const dataSource = js.match(/const DOMAINS=(\[[\s\S]*?\n\]);/);
  const renderStart = js.indexOf('function renderDomains(){');
  const renderEnd = js.indexOf('\n}\nrenderDomains();', renderStart);
  assert.ok(dataSource, 'expected a parseable domain register');
  assert.ok(renderStart > -1 && renderEnd > renderStart, 'expected the domain card renderer');
  const renderFunction = js.slice(renderStart, renderEnd + 2);
  const domains = vm.runInNewContext(dataSource[1]);
  const grid = { innerHTML: '' };
  new Function('$', 'DOMAINS', renderFunction + '; renderDomains();')(
    (id) => id === 'domainGrid' ? grid : null,
    domains,
  );
  assert.match(grid.innerHTML, /href="https:\/\/radioreach\.us"/);
  assert.match(grid.innerHTML, /href="https:\/\/github\.com\/zazieproductions\/radioreach-funnel"/);
  assert.match(grid.innerHTML, /OPEN LIVE FUNNEL/);
  assert.match(grid.innerHTML, /Cloudflare KV/);
  assert.doesNotMatch(grid.innerHTML, /62K \/yr|\$54K funnel sales|4\.2% conversion/);
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


test('THE PRODUCT preserves the original UI through an opt-in isolated embed', () => {
  assert.match(html, /id="the-product"/);
  assert.match(html, /Simulation/);
  assert.match(html, /Critique/);
  assert.match(html, /Baudrillard/);
  assert.match(html, /EXPLORE SOURCE CODE/);
  assert.doesNotMatch(html, /<iframe/);
  const loader = js.match(/function loadProductEmbed\(\)\{[\s\S]*?\n\}/)[0];
  const attributes = {};
  const frame = { setAttribute: (key, value) => attributes[key] = value };
  const host = { querySelector: () => null, replaceChildren: (value) => assert.equal(value, frame) };
  const toggle = { hidden: false };
  const status = { textContent: '' };
  new Function('$', 'document', `${loader}; loadProductEmbed();`)(
    id => ({ productEmbed: host, productEmbedToggle: toggle, productEmbedStatus: status })[id],
    { createElement: tag => { assert.equal(tag, 'iframe'); return frame; } }
  );
  assert.equal(attributes.sandbox, 'allow-scripts allow-same-origin');
  assert.match(frame.src, /^https:\/\/zazieproductions\.github\.io\/Baudrillardian/);
  assert.ok(frame.title);
  assert.equal(toggle.hidden, true);
  assert.match(status.textContent, /blocked/);
});
