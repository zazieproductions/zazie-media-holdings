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

test('music vault mirrors the Drive master archive', () => {
  const source = js.match(/const MUSIC=(\[[\s\S]*?\n\]);/);
  assert.ok(source, 'expected a parseable music register');
  const releases = vm.runInNewContext(source[1]);

  const vault = releases.filter((r) => r.tracks);
  const only = releases.filter((r) => !r.tracks);
  assert.equal(releases.length, 23, 'the grid holds the archive plus the distributed-only editions');
  assert.equal(vault.length, 16, 'the Drive archive holds 16 release folders');
  assert.equal(only.length, 7, 'seven editions are distributed on streaming but absent from the shared archive');
  assert.equal(vault.reduce((n, r) => n + r.tracks.length, 0), 146, 'the archive holds 146 WAV masters');
  assert.ok(vault.every((r) => r.tracks.length > 0 && r.tracks.every((t) => typeof t === 'string' && t.trim())), 'every vaulted release lists its archived masters');
  // The label that matters: a streaming-only edition must never imply we hold its masters.
  assert.ok(only.every((r) => r.streamOnly === true && r.art === undefined), 'distributed-only entries carry no cover path and are flagged');
  assert.ok(only.every((r) => r.sp), 'distributed-only entries exist because they are actually on streaming');
  assert.ok(!/\.wav|Zazie Productions\.wav/.test(source[1]), 'track titles are cleaned of the master filename suffix');

  const byType = vault.reduce((acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }), {});
  assert.deepEqual(byType, { Single: 5, Album: 5, EP: 3, Deluxe: 3 }, 'the archive itself must not drift');
  const count = (t) => releases.filter((r) => r.type === t).length;
  assert.equal(releases.filter((r) => !r.type).length, 1, 'one edition whose type Spotify does not publish stays untyped');
  for (const chip of [`>ALL ${releases.length}<`, `>IN DRIVE VAULT (${vault.length})<`, `>SPOTIFY ONLY (${only.length})<`, `>SINGLES (${count('Single')})<`, `>EPS (${count('EP')})<`, `>ALBUMS (${count('Album')})<`, `>DELUXE (${count('Deluxe')})<`])
    assert.ok(html.includes(chip), `stale vault filter chip: ${chip}`);

  assert.ok(vault.every((r) => /^art\/covers\/[a-z0-9-]+\.jpg$/.test(r.art)), 'every vaulted release points at a manifest cover path');
  assert.ok(!/drive:\{|drive\.google\.com/.test(js), 'Drive file IDs stay out of the shipped bundle');
  assert.ok(existsSync('public/art/covers'), 'the drop-in cover directory must exist');

  // Titles recorded from the archive, including the long/accursed ones, survive escaping intact.
  for (const title of [
    'List of Russian Spies on Wikipedia',
    'Holly-Flecked Amphibians at the Iceberg Baptism (Previously Mummified in Wrapping Paper)',
    '90°N, 135°W- Signal Lost',
    'Gainax Ending',
    'Rhapsody of the Unplayable Hand',
  ]) assert.ok(source[1].includes(title), `missing archived track title: ${title}`);

  // Nothing enters the register on vibes: G7e Torpedo has no Drive folder and no Spotify edition, so it stays out.
  assert.ok(!source[1].includes('G7e Torpedo'), 'a release with no verifiable source stays out of the register');
  // ...while the seven with real release pages are in, labelled and embedded instead of transcribed.

  const manifest = readFileSync('docs/COVER-MANIFEST.md', 'utf8');
  assert.equal((manifest.match(/`[A-Za-z0-9_-]{33}`/g) || []).length, 16, 'the manifest maps every release to its Drive folder');
  for (const r of vault) assert.ok(manifest.includes(r.art.split('/').pop()), `manifest missing cover row for ${r.t}`);
  const rows = manifest.split('\n').filter((l) => l.startsWith('| `public/art/covers/'));
  assert.equal(rows.length, 16, 'the manifest maps exactly the 16 archive-backed releases, no more');
  assert.ok(!rows.some((l) => /Triangular Savant|Spectral Ode|Well Meaning/.test(l)), 'distributed-only editions get no cover row: they have no Drive folder');
});

test('catalog playback and audience embeds stay honest', () => {
  assert.match(js, /const SKETCH_SEC=30/, 'the sketch length must be explicit');
  assert.ok(!/m\.dur\b|parseDur/.test(js), 'fabricated release durations were removed with the invented catalog');
  assert.match(html, /SYNTH SKETCH — NOT THE ARCHIVED MASTER/);
  // A track index past the end of a shorter release (⏭ / ⏮ between editions) must clamp, not render "undefined".
  assert.match(js, /musicTrk=Math\.max\(0,Math\.min\(m\.tracks\.length-1,/);
  assert.match(js, /Math\.max\(0,Math\.min\(SKETCH_SEC-1,/);
  assert.match(js, /Synth sketch — not the archived master/);

  const playlist = 'open.spotify.com/embed/playlist/75PxWthUYPOskOU1EjGrFX';
  assert.match(js, new RegExp(playlist));
  assert.match(html, new RegExp('https://open\\.spotify\\.com/playlist/75PxWthUYPOskOU1EjGrFX'));
  assert.match(js, /function loadSpotifyEmbed\(\)/, 'the third-party frame stays click-to-load');
  assert.match(html, /id="spotifyGate"/, 'an offline fallback is shown before the embed loads');
  assert.ok(!js.includes('SPOTIFY_TRACKS'), 'the invented playlist transcription is gone');

  const profile = 'https://www.instagram.com/WellMeaningNeurotypicals/';
  assert.ok(js.includes(profile) && html.includes(profile), 'the real Instagram profile is linked');
  assert.match(html, /instagram\.com\/WellMeaningNeurotypicals\/"[^>]*rel="noopener noreferrer"/);
  assert.ok(!js.includes('INSTA_POSTS') && !html.includes('instaGrid'), 'stock photography is not passed off as the account posts');
  assert.ok(!/id="audiences"[\s\S]*?unsplash/.test(html.split('id="products"')[0].split('id="audiences"')[1] ?? ''), 'no third-party stock images remain in the audiences section');
});

test('releases embed the real Spotify pages instead of invented artwork or audio', () => {
  const source = js.match(/const MUSIC=(\[[\s\S]*?\n\]);/);
  const releases = vm.runInNewContext(source[1]);
  // Album ids transcribed from open.spotify.com/artist/4UOgvZEOo7xBhFBjJvlMm0/discography/all, 17 Oct 2026.
  const streaming = {
    'Anesthesia for the Signal Age': '6lXPT8fzPMASk1pMplfKts',
    'Sellotape (Super Deluxe Edition)': '1xYpioRpKFdNa0xMeJPUA0',
    'Opaline Lament (Life From The Beyond)': '2U1tlND5LlC11R8K6z96fu',
    'Greetings From Tinsel Time (Super Deluxe Edition)': '1EYHice4BTkbCmv5M4GT3S',
    'Stutter to stammer (Super Deluxe Edition)': '5R49gcjBOd3TDwfrhnPiAE',
    'A Long Way To Nowhere': '5NAW3TUYSKZnnL5memqLJe',
    'Vermiform': '3QU7SSax6sFqexlbaINw5I',
    'To Halt Space Adrift': '2X0To6GQrq8Dl5HCIJn1ab',
    'Miraculously Unhurt': '0zt357uS9wKjdQPDLzCU59',
    'Distant Bells For Surgical Minds': '2fqMbZnx3JjtECi9vgsgBf',
    'Anything Can Happen On An Electric Day': '4aNWeXNQ4ZU3gmSu0TKD2L',
    'Constrained Capacity': '0wC6y1JhqwSbl8EUdJolDa',
    'Interference Archive 01010101': '7HBUWtloawpuNs83XJKrPM',
    // Distributed-only editions: embedded from their release pages, never transcribed.
    'Spectral Ode to Synesthesia': '3hitywtlib6IXwQq0yZx61',
    "CAN'T GET MY EYES OFF YOU (123)": '5rTqFgVM76RysUeZ8txq2q',
    'The Triangular Savant': '6LWENAMRscJD4AE85umTJ7',
    'Well Meaning Neurotypicals': '2IlD3uGCmhjM3FNHokYF9j',
    'Sellotape': '0w9kegmW2DhwESwceOrER1',
    'Stutter to stammer': '2wOYcWhIizEwmepXkeI0a4',
    'Greetings From Tinsel Time': '0MR5pJVcKpywQzlQnfrBIA',
  };
  for (const [title, album] of Object.entries(streaming)) {
    const r = releases.find((x) => x.t === title);
    assert.ok(r, `release missing from the vault: ${title}`);
    assert.equal(r.sp && r.sp.album, album, `wrong Spotify album id for ${title}`);
    assert.match(r.sp.art, /^https:\/\/i\.scdn\.co\/image\/ab67616d0000e1a3[0-9a-f]{24}$/, `cover art must come from Spotify's own CDN: ${title}`);
  }
  // The October 2026 singles are not distributed yet and must not claim a link.
  for (const title of ['Salvation Ends The Pain', 'Liquid Phosphorus', 'An Atrium Full of Heaven']) {
    const r = releases.find((x) => x.t === title);
    assert.ok(r && !r.sp, `${title} stays archive-only until it is actually on streaming`);
  }
  assert.equal(releases.filter((r) => r.sp).length, 20, '20 of the 23 editions are on Spotify');
  const streamedTitles = releases.filter((r) => r.streamOnly).map((r) => r.t);
  for (const t of streamedTitles) assert.ok(streaming[t], `distributed-only entry without a verified release page: ${t}`);

  assert.match(js, /const SPOTIFY=\{artist:"https:\/\/open\.spotify\.com\/artist\/4UOgvZEOo7xBhFBjJvlMm0"/, 'the verified artist page is referenced once, not per card');
  assert.match(js, /open\.spotify\.com\/embed\/album\/'\+m\.sp\.album/, 'audio comes from Spotify embed of the release');
  assert.match(js, /function loadRelease\(i\)/);
  assert.match(js, /if\(!m\.sp\)\{playTrack\(i\);return\}/, 'undistributed releases fall back to the synth sketch');
  assert.match(js, /function coverFallback\(img\)/, 'covers degrade: repo file -> Spotify artwork -> procedural gradient');
  // The repo-file layer is opt-in: with no files in public/art/covers/ it would cost a 404 per card.
  assert.ok(js.includes('const LOCAL_COVERS=false'), 'the local cover layer stays off until files exist in public/art/covers/');
  assert.ok(js.includes('function coverSrc(m){return LOCAL_COVERS?m.art:(m.sp?m.sp.art:null)}'), 'cover order: dropped-in file, else Spotify artwork');
  assert.ok(js.includes("if(!src)return '';"), 'a release with no artwork source renders the gradient, not a broken image');
  assert.ok(js.includes('referrerpolicy="no-referrer"'), 'i.scdn.co is the only image host and is hotlinked without a referrer');
  assert.ok(!js.includes('drive.google.com'), 'Drive folder ids stay in docs/ so the master archive is not published');

  // Verified audience figures replace the invented ones.
  // The header advertises the streaming coverage the grid computes, so the two cannot drift apart.
  const streamed = releases.filter((r) => r.sp).length;
  assert.ok(html.includes(`${streamed} OF ${releases.length}`), 'the section header must state the real streaming coverage');

  assert.match(html, /31,348 SAVES/);
  assert.match(html, /MONTHLY LISTENERS<\/div><div class="font-bold text-xl">247<\/div>/);
  for (const fake of ['32K FOLLOWERS', 'data-target="48"', 'PLACEMENTS SOLD', '12K'])
    assert.ok(!html.includes(fake), `fabricated audience figure still published: ${fake}`);
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

test('institute patents and concepts are sourced from the live ZIAA archive', () => {
  assert.match(html, /id="institute-learn"/);
  assert.match(html, /id="patentGrid"/);
  assert.match(html, /id="conceptGrid"/);
  assert.match(html, /id="patentFilters"/);
  assert.match(html, /100 SPECULATIVE DOSSIERS/);
  const instituteBlock = html.match(/id="institute"[\s\S]*?<!-- AUDIENCES -->/);
  assert.ok(instituteBlock, 'expected the institute asset section');
  assert.doesNotMatch(instituteBlock[0], /unsplash/, 'institute section must not use stock photography');
  assert.match(html, /fig-plate/);
  assert.match(css, /\.fig-plate/);
  assert.match(js, /<iframe/);
  assert.match(js, /LIVE DOSSIER/);
  assert.match(html, /https:\/\/zazieinstitute\.org\/patents/);
  assert.match(html, /https:\/\/zazieinstitute\.org\/prototypes/);
  assert.match(html, /https:\/\/zazieinstitute\.org\/disciplines\//);
  for (const symbol of ['INSTITUTE_PATENTS', 'INSTITUTE_CONCEPTS', 'renderInstitutePatents', 'renderInstituteConcepts', 'openPatent', 'openConcept', 'openInstituteAsset', 'showInstituteTab']) assert.match(js, new RegExp(symbol));
  const pSource = js.match(/const INSTITUTE_PATENTS=(\[[\s\S]*?\n\]);/);
  const cSource = js.match(/const INSTITUTE_CONCEPTS=(\[[\s\S]*?\n\]);/);
  assert.ok(pSource, 'expected a parseable patent register');
  assert.ok(cSource, 'expected a parseable concept register');
  const patents = vm.runInNewContext(pSource[1]);
  const concepts = vm.runInNewContext(cSource[1]);
  assert.equal(patents.length, 8);
  assert.equal(concepts.length, 8);
  assert.equal(new Set(patents.map((p) => p.id)).size, 8, 'patent IDs should be unique');
  assert.equal(new Set(concepts.map((c) => c.id)).size, 8, 'concept IDs should be unique');
  assert.ok(patents.every((p) => p.url.startsWith('https://zazieinstitute.org/patents/')));
  assert.ok(concepts.every((c) => c.url.startsWith('https://zazieinstitute.org/prototypes/')));
  assert.ok(patents.every((p) => p.title && p.abstract && p.status && p.filed && p.discipline && p.claim && p.pub && p.code));
  assert.ok(concepts.every((c) => c.title && c.abstract && c.investigator && c.discipline && c.transducer && c.code && c.slug && c.fig && c.figtag && c.dims && c.status && c.year && c.power && c.snr && c.dsp));
  const statuses = new Set(patents.map((p) => p.status));
  for (const s of ['ISSUED PATENT', 'DEFENSIVE PUBLICATION', 'UNDER EXAMINATION', 'PROVISIONAL SPEC']) assert.ok(statuses.has(s), `missing patent status: ${s}`);
  const pRender = js.match(/function renderInstitutePatents\(\)\{[\s\S]*?\n\}/);
  const cRender = js.match(/function renderInstituteConcepts\(\)\{[\s\S]*?\n\}/);
  assert.ok(pRender, 'expected the patent card renderer');
  assert.ok(cRender, 'expected the concept card renderer');
  const grids = { patentGrid: { innerHTML: '' }, conceptGrid: { innerHTML: '' } };
  new Function('$', 'INSTITUTE_PATENTS', 'patentStatus', 'patentTone', `${pRender[0]}; renderInstitutePatents();`)(
    (id) => grids[id] || null, patents, 'all', () => '',
  );
  new Function('$', 'INSTITUTE_CONCEPTS', `${cRender[0]}; renderInstituteConcepts();`)(
    (id) => grids[id] || null, concepts,
  );
  assert.equal((grids.patentGrid.innerHTML.match(/<article /g) || []).length, 8);
  assert.equal((grids.conceptGrid.innerHTML.match(/<article /g) || []).length, 8);
  assert.match(grids.patentGrid.innerHTML, /openPatent\('/);
  assert.match(grids.conceptGrid.innerHTML, /openConcept\('/);
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

test('Institute prototype register links verified dossiers with specifications and an accessible chart', () => {
  assert.match(html, /id="prototypes"/);
  assert.match(html, /aria-label="Conceptual signal-flow chart:/);
  for (const id of ['147', '146', '019']) {
    assert.match(html, new RegExp(`https://zazieinstitute\\.org/prototypes/prot-${id}/`));
  }
  assert.match(html, /15 Hz – 46 kHz/);
  assert.match(html, /110 dB/);
  assert.match(html, /meters are visual indicators, not live measurements/);
});

test('prototype atlas indexes all generations and distinguishes verified specifications', () => {
  const records = JSON.parse(readFileSync('public/data/prototypes.json', 'utf8'));
  const atlas = readFileSync('prototypes.html', 'utf8');
  assert.equal(records.length, 160);
  assert.equal(new Set(records.map((record) => record.id)).size, 160);
  assert.ok(records.every((record) => /^https:\/\/zazieinstitute\.org\/prototypes\/prot-\d{3}\/$/.test(record.url)));
  assert.equal(records.find((record) => record.id === 'PROT-147').snr, '110 dB (A-Weighted @ 1 kHz)');
  assert.equal(records.find((record) => record.id === 'PROT-147').code, 'GESTURE-SPATIAL-V5');
  assert.equal(records.find((record) => record.id === 'PROT-115').bandwidth, '30 Hz – 38 kHz');
  assert.ok(records.every((record) => record.billOfMaterials.length > 0 && record.audioProfile && record.technicalNotes && record.schematicType));
  assert.match(atlas, /id="prototypeSearch"/);
  assert.match(atlas, /id="disciplineFilter"/);
  assert.match(atlas, /id="prototypeDetail"/);
  assert.match(html, /href="prototypes\.html\?id=PROT-147"/);
});

test('film archive publishes the four real shorts with official covers and published synopses', () => {
  const source = js.match(/const FILMS=(\[[\s\S]*?\n\];)/);
  assert.ok(source, 'expected a parseable film register');
  const films = vm.runInNewContext(source[1].replace(/;$/, ''));
  assert.equal(films.length, 4);
  assert.deepEqual(
    Array.from(films, (film) => film.title),
    ['Phantom Requiem', 'Beyond The Silken Threads', 'Deaf Orphans of Streamcast', 'Sepsis']
  );
  const byTitle = Object.fromEntries(films.map((film) => [film.title, film]));
  assert.equal(byTitle['Phantom Requiem'].runtime, '5 min');
  assert.equal(byTitle['Beyond The Silken Threads'].runtime, '5 min 37 sec');
  assert.equal(byTitle['Deaf Orphans of Streamcast'].runtime, '51 sec');
  assert.equal(byTitle['Sepsis'].runtime, '2 min 51 sec');
  assert.equal(byTitle['Phantom Requiem'].year, 2024);
  assert.equal(byTitle['Phantom Requiem'].awards.length, 9);
  assert.equal(byTitle['Beyond The Silken Threads'].awards.length, 1);
  assert.equal(byTitle['Deaf Orphans of Streamcast'].awards.length, 0);
  // every film carries a synopsis (published text, or a statement that none is published)
  for (const film of films) {
    assert.ok(film.log && film.log.length > 80, `${film.title} needs a synopsis`);
    assert.ok(film.roles && film.specs.length > 0 && film.source);
    assert.ok(film.watch && film.record);
    assert.match(film.watch, /^https:\/\//);
    assert.ok(film.img || film.remote, `${film.title} needs a cover`);
    // nothing that was never published may reappear
    assert.equal(film.rating, undefined);
    assert.equal(film.cast, undefined);
    assert.equal(film.rev, undefined);
  }
  assert.match(byTitle['Deaf Orphans of Streamcast'].logHead, /NO SYNOPSIS IS PUBLISHED/);
  assert.match(byTitle['Phantom Requiem'].log, /stop-motion film marries the macabre grace/);
  assert.match(byTitle['Beyond The Silken Threads'].log, /bruise-violet, overripe orange, chlorophyll green/);
  assert.match(byTitle['Sepsis'].log, /septic shock/);
  // covers resolve from a local file that has to exist, then the official press-kit still
  for (const film of films) {
    if (!film.img) continue;
    assert.match(film.img, /^\.\/art\/films\/[a-z0-9-]+\.jpg$/);
    assert.ok(existsSync('public' + film.img.replace('./', '/')), `${film.img} is missing`);
  }
  assert.match(byTitle['Deaf Orphans of Streamcast'].remote, /filmfreeway-production-storage-01-connector/);
  assert.match(byTitle['Sepsis'].remote, /newmediartspace\.info\/exhibitions\/2024_ripples/);
  assert.doesNotMatch(js, /images\.unsplash\.com/);
});

test('films section publishes shorts with matching filters and no invented rights copy', () => {
  const section = html.split('id="films"')[1].split('<!-- DOMAINS -->')[0];
  assert.match(section, /ZAZIE PICTURES • 4 SHORTS/);
  assert.doesNotMatch(section, /FEATURES/);
  assert.doesNotMatch(section, /RIGHTS: AVAILABLE/);
  assert.doesNotMatch(section, /Request Screener Access/);
  const filters = [...section.matchAll(/data-f="([A-Za-z]+)"/g)].map((match) => match[1]);
  assert.equal(filters.join(','), 'all,Experimental,Horror,Conceptual');
  const source = js.match(/const FILMS=(\[[\s\S]*?\n\];)/);
  const films = vm.runInNewContext(source[1].replace(/;$/, ''));
  const used = new Set([].concat(...films.map((film) => film.genres)));
  for (const filter of filters.filter((value) => value !== 'all')) {
    assert.ok(used.has(filter), `filter ${filter} matches no film`);
  }
  assert.match(js, /function filmCoverFallback\(/);
  assert.match(js, /data-fallback=/);
});
