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
