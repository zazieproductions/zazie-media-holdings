# Zazie Media Holdings (ZMH)

Interactive, single-page **concept showcase** for a proposed media and intellectual-property portfolio, adapted from the supplied HTML prototype. The project retains the imported catalog views, film and domain cards, simulated product cart, music vault, browser-generated audio instruments, organizational visualizations, valuation calculator, command palette, and animations.

> **Music vault and audiences:** the 16 archive-backed entries in the `MUSIC` register mirror the owner's Google Drive archive `ZAZIE PRODUCTIONS (FULL DISCOGRAPHY + MASTERS)` — 16 release folders containing 146 numbered WAV masters — so titles, types, years and running orders match the folder listing rather than a shorter "highlights" set; seven further editions are listed alongside them because they are distributed on streaming, labelled as not being in the shared vault and with no transcribed tracklist. Release years for the 2026 entries come from licensed ISRC registrations in a public Google Sheet; four folders have no year recorded anywhere and fall back to their position in the listing. Twenty of the 23 editions in the grid (16 archive-backed plus 7 distributed-only, which are labelled and carry no transcribed tracklist) carry a verified `open.spotify.com` album id: the release modal loads the real record through a click-to-activated Spotify embed, and Spotify's own 640px artwork is the cover fallback when a file has not been dropped into `public/art/covers/` (see [`docs/COVER-MANIFEST.md`](docs/COVER-MANIFEST.md)). Nothing is copied into the repository and no Drive URL is hotlinked; the Drive folder IDs stay in `docs/` because they are share links to the whole master archive. In-page audio is a **synth sketch** generated from the track index (used for the three undistributed 2026 singles and as a per-track sketch), not master playback. The Spotify card and the Instagram card publish only what their live pages verify — playlist saves, song count, runtime, monthly listeners — instead of invented follower figures. See [`docs/CONTENT-AUDIT.md`](docs/CONTENT-AUDIT.md) for remaining unverified claims.

> **Important:** This is a front-end demo. The original content contains illustrative and potentially fictional business metrics, film credits, investment claims, and asset ownership assertions. Purchases, acquisition submissions, newsletter signup and PDF downloads are simulations; they do not process transactions, messages or files. See [content audit](docs/CONTENT-AUDIT.md) before publishing.
>
> The software section now includes a curated screen of 12 additional public GitHub candidates (11 software projects and one research-data archive). They are presented as **potential candidates**, not appraised or verified company holdings; license and chain-of-title checks are called out in [the GitHub IP screen](docs/GITHUB-IP-SCAN.md).

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Local setup

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite. The site loads GSAP, Chart.js, and fonts from third-party CDNs; those features require internet connectivity.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run local development server |
| `npm run build` | Compile Tailwind CSS and bundle assets to `dist/` |
| `npm run preview` | Preview production output |
| `npm test` | Source and integration smoke assertions |
| `npm run check` | Tests plus production build |

## Structure

```text
index.html                 HTML markup and content
src/app.js                 Catalog data, UI state and audio interactions
src/styles.css             Tailwind directives and custom CSS
public/_headers            Cloudflare Pages security response headers
public/art/covers/         Drop-in release cover art (mapping in docs/COVER-MANIFEST.md)
.github/workflows/ci.yml   CI checks on pushes/PRs
vite.config.cjs            Build configuration
tailwind.config.cjs        Visual tokens and Tailwind content discovery
postcss.config.cjs         CSS tooling
docs/CONTENT-AUDIT.md      Operational and factual publication gates
docs/GITHUB-IP-SCAN.md     GitHub project shortlist, rights signals, and diligence notes
```

The current code follows the original, global-script architecture because existing inline handlers depend on global functions. The Vite config explicitly emits `src/app.js` as a classic script at the same path in production output. A future refactor can split the catalog, commerce, audio engine, and UI modules into testable packages, with real API integrations only after privacy/security design.

## Deployment (Cloudflare Pages)

Connect this repo to Cloudflare Pages and configure:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`

No API secrets are needed for this prototype. Third-party script/style CDN availability may affect the experience.

## Limitations and next steps

1. Verify intellectual-property and asset rights and remove invented financial/operational claims.
2. Implement an actual hosted checkout, real downloadable products, and licensing terms.
3. Implement server-backed, privacy-compliant inquiries and newsletter subscriptions.
4. Add usable accessibility, end-to-end/browser tests and mobile performance checks.
5. Replace hard-coded catalog entries with editable, verified structured content. The music vault is now mirrored against the Drive archive above; films, domains, products, social metrics and valuation figures are still hand-written demo claims.
6. Confirm the unverified audience metrics (the Instagram follower/view chip is the last one) and re-read `CAN'T GET MY EYES OFF YOU (123)` on Spotify to fill in the type and year the build could not verify; its entry is flagged `spUnknown:true` until then. Cover art needs no further work for the 20 editions with release pages; only the three undistributed singles need a JPEG dropped at `public/art/covers/`.
7. Stream or host approved low-bitrate audio per release; the vault currently plays browser-synthesized sketches and must never be presented as the master recording.
8. Version-pin and locally bundle third-party JavaScript dependencies.

## Rights

See [LICENSE.md](LICENSE.md). Do not assume rights to third-party names, images, brands or source material from their appearance in the prototype.

**Build verification:** `npm run check` passes locally (four smoke tests plus a production Vite build). Vite notes that the classic global script is not bundled as an ES module; the build config intentionally emits it to `dist/src/app.js` so the existing inline handlers continue to work.
