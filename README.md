# Zazie Media Holdings (ZMH)

Interactive **concept showcase** for a proposed media and intellectual-property portfolio, adapted from the supplied HTML prototype. The project retains the imported catalog views, film and domain cards, simulated product cart, music vault, browser-generated audio instruments, organizational visualizations, valuation calculator, command palette, and animations.

The software section now points at the real thing. A repository dossier at [`repo.html`](repo.html) renders the actual GitHub repositories behind Zazie Labs — real READMEs (markdown, sanitised), real file trees and file contents, real commit history, language breakdowns, licences and metadata synced from GitHub. Each dossier opens with a custom telemetry dashboard: a commit timeline, language-composition ring and percentile comparison against the curated atlas. Where a verified demo/build is available, the live app opens embedded by default; the README and source tabs remain one click away. Five zero-build projects are vendored verbatim from their repositories and run inside the site; a sixth is embedded from its working GitHub Pages deployment. Repositories with no working deployment get a full source dossier instead of a dead "live demo" link.

> **Music vault and audiences:** the 16 archive-backed entries in the `MUSIC` register mirror the owner's Google Drive archive `ZAZIE PRODUCTIONS (FULL DISCOGRAPHY + MASTERS)` — 16 release folders containing 146 numbered WAV masters — so titles, types, years and running orders match the folder listing rather than a shorter "highlights" set; seven further editions are listed alongside them because they are distributed on streaming, labelled as not being in the shared vault and with no transcribed tracklist. Release years for the 2026 entries come from licensed ISRC registrations in a public Google Sheet; four folders have no year recorded anywhere and fall back to their position in the listing. Twenty of the 23 editions in the grid (16 archive-backed plus 7 distributed-only, which are labelled and carry no transcribed tracklist) carry a verified `open.spotify.com` album id: the release modal loads the real record through a click-to-activated Spotify embed, and Spotify's own 640px artwork is the cover fallback when a file has not been dropped into `public/art/covers/` (see [`docs/COVER-MANIFEST.md`](docs/COVER-MANIFEST.md)). Nothing is copied into the repository and no Drive URL is hotlinked; the Drive folder IDs stay in `docs/` because they are share links to the whole master archive. In-page audio is a **synth sketch** generated from the track index (used for the three undistributed 2026 singles and as a per-track sketch), not master playback. The Spotify card and the Instagram card publish only what their live pages verify — playlist saves, song count, runtime, monthly listeners — instead of invented follower figures. See [`docs/CONTENT-AUDIT.md`](docs/CONTENT-AUDIT.md) for remaining unverified claims.

> **Important:** This is a front-end demo. The original content contains illustrative and potentially fictional business metrics, film credits, investment claims, and asset ownership assertions. Purchases, acquisition submissions, newsletter signup and PDF downloads are simulations; they do not process transactions, messages or files. See [content audit](docs/CONTENT-AUDIT.md) before publishing.
>
> The repository dossier includes 15 curated repositories: the three software sketches plus 12 additional public candidates. They are presented as **potential candidates**, not appraised or verified company holdings; license and chain-of-title checks are called out in [the GitHub IP screen](docs/GITHUB-IP-SCAN.md). The embedded builds are first-party copies; each `/embeds/<id>/` directory carries a `PROVENANCE.txt` and, when available, the repository's licence file.
>
> The `#podcast` section registers [Five Steps From The Fringe](https://open.spotify.com/show/7FPixyDvxgFkG9ndNOSDxJ) (Obsidian Veil Media) as an owner-asserted holding: official cover, 9 episodes on the desk, and an opt-in Spotify player. The 26 Sep 2024 Phantom Requiem episode is omitted from the desk at the owner’s request. It is not part of the simulated $4.2M valuation. See [the podcast register](docs/PODCAST-REGISTER.md).
>
> The `#writings` section quotes from manuscripts held in the Zazie Productions literary submissions archive (15 pieces, excerpts only) and shows ten works from the Behance art archive plus the ZAZIE PRODUCTIONS × FLESHWEATHER wordmark. Statuses are from the submission tracker dated 2026-10-09; see [the writings and art register](docs/WRITINGS-AND-ART.md) before promoting any credit.
>
> The software section now links the [RadioReach production funnel](https://radioreach.us) and lists its [source repository](https://github.com/zazieproductions/radioreach-funnel), alongside 13 other GitHub entries (12 software candidates and one research-data archive). RadioReach's README states that its code is all-rights-reserved and has no open-source license; the repository link is a high-level register, not a grant to copy or reuse source. None of the entries is an appraisal or proof of ZMH ownership. See [the GitHub IP screen](docs/GITHUB-IP-SCAN.md) for rights and security diligence.
>
> The Institute asset section curates 8 speculative patent dossiers and 8 prototype concepts from the public [Zazie Institute of Applied Anomalies](https://zazieinstitute.org) open archive (curated 2026-10-17); abstracts link out to the full citable dossiers, and statuses must be re-verified before any licensing use — see [the ZIAA asset notes](docs/ZIAA-ASSET-NOTES.md).
>
> The music vault links the [Zazie Productions Bandcamp storefront](https://zazieproductions.bandcamp.com) as an external catalog asset, and [Hubris Books](https://hubrisbooks.win) is listed under domains as a satirical publishing imprint. Both are live outbound links (added 2026-10-17); listening, purchases and reading happen on those properties under their own terms. See [content audit](docs/CONTENT-AUDIT.md).

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
| `npm run repos:sync` | Refresh `public/data/repos.json` and the vendored `/embeds` builds from GitHub (needs network; uses `GITHUB_TOKEN`/`GH_TOKEN` or `gh auth token`) |

## Structure

```text
index.html                     Main portfolio, software atlas entry, and writings/art register
repo.html                      Repository atlas + dossier shell
src/app.js                     Catalog data, UI state, podcast/writing/art renderers, and audio interactions
docs/PODCAST-REGISTER.md       Five Steps From The Fringe: source URLs, episode IDs, publication gates
src/repo-view.mjs              Dossier renderer (marked + DOMPurify, telemetry, file browser, live embeds)
src/styles.css                 Tailwind directives and custom CSS
data/repos.manifest.json       Curated 15-repository atlas manifest
scripts/sync-repos.mjs         GitHub sync: metadata, READMEs, trees, commits, and vendored builds
public/data/repos.json         Generated 15-repository snapshot consumed by both pages
public/embeds/<id>/            Verbatim zero-build apps + PROVENANCE.txt / LICENSE.txt
public/art/                    Web-resolution artwork and wordmark copies (masters stay in Drive)
public/art/covers/               Drop-in release cover art (mapping in docs/COVER-MANIFEST.md)
docs/WRITINGS-AND-ART.md       Writings and artwork sources, statuses, Drive IDs, publication gates
public/_headers                Cloudflare Pages security response headers
.github/workflows/ci.yml       CI checks on pushes/PRs
vite.config.cjs                Multi-page build configuration
tailwind.config.cjs            Visual tokens and Tailwind content discovery
postcss.config.cjs             CSS tooling
docs/CONTENT-AUDIT.md          Operational and factual publication gates
docs/COVER-MANIFEST.md           Release-to-Drive-folder cover manifest
docs/GITHUB-IP-SCAN.md         GitHub project shortlist, RadioReach systems, rights signals, and diligence notes
```

## Repository dossier

`repo.html` works with no server-side API:

- `?id=<repo>` opens a dossier for one of the 15 curated repositories; no query renders the full atlas.
- The README tab renders the repository's actual markdown. Relative images and links are rewritten to the repository's `raw.githubusercontent.com` / GitHub paths; output is sanitised with DOMPurify.
- The FILES tab starts from the snapshot's real top-level tree and fetches subdirectories and file contents live from GitHub (raw first, Contents API as fallback) when you click them. Images render inline; binary files link to the source.
- The COMMITS tab shows the last eight real commits and can fetch a commit's changed-file list live.
- The RUN APP tab only exists where there is something real to run: five vendored single-file builds and the NOISE WALL GitHub Pages deployment. No mock iframes, no dead links.
- The aside panels show real facts (stars, forks, size, licence, Pages status, languages) and the curated rights/diligence note.

Embedded builds are copied byte-for-byte from the default branch. `scripts/sync-repos.mjs` records the blob SHA, head commit, byte count and sync date, copies the repository licence when present, and writes the provenance file. Re-run `npm run repos:sync` to refresh both the snapshot and the builds.

### Verified deployment status

Only demos that responded when checked are advertised: Form-909 Warp, VOID//OCULUS and NOISE WALL. The GitHub Pages URLs previously shown for NOETIC, UIUA Resonance Lab and SYNTHX-7/AGON currently return GitHub's "Site not found" page; those entries now point to their source dossiers (UIUA is additionally runnable from its vendored single-file build).

The current code follows the original, global-script architecture because existing inline handlers depend on global functions. The Vite config explicitly emits `src/app.js` as a classic script at the same path in production output. A future refactor can split the catalog, commerce, audio engine, and UI modules into testable packages, with real API integrations only after privacy/security design.

## Deployment (Cloudflare Pages)

Connect this repo to Cloudflare Pages and configure:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`

No API secrets are needed for this prototype. The build produces two HTML entry points (`/index.html` and `/repo.html`) and copies `public/data` and `public/embeds` into `dist`. `public/_headers` keeps `X-Frame-Options: SAMEORIGIN` so the same-origin `/embeds/*` builds can be framed while other origins remain blocked. Third-party script/style/CDN availability may affect the experience (the dossier itself works from the committed snapshot, while live directory listings and commit diffs call the GitHub API from the browser, subject to GitHub's unauthenticated rate limits).

## Limitations and next steps

1. Verify intellectual-property and asset rights and remove invented financial/operational claims. Confirm RadioReach's legal ownership and review the public repository's environment-file artifacts before publication.
2. Implement an actual hosted checkout, real downloadable products, and licensing terms.
3. Implement server-backed, privacy-compliant inquiries and newsletter subscriptions.
4. Add usable accessibility, end-to-end/browser tests and mobile performance checks.
5. Replace hard-coded catalog entries with editable, verified structured content (the repository section is already generated from `data/repos.manifest.json`, and the music vault is mirrored against the Drive archive above); films, domains, products, social metrics and valuation figures are still hand-written demo claims.
6. Version-pin and locally bundle third-party JavaScript dependencies.
7. Re-run `npm run repos:sync` on a schedule or before publication so stars, READMEs and commits do not drift; re-verify demo deployments at the same time.
8. Confirm the last unverified audience metric (the Instagram follower/view chip) and re-read `CAN'T GET MY EYES OFF YOU (123)` on Spotify to fill the type and year this build could not verify; its entry is flagged `spUnknown:true` until then. Cover art needs no further work for the 20 editions with release pages; only the three undistributed singles need a JPEG dropped at `public/art/covers/`.

## Rights

See [LICENSE.md](LICENSE.md). Do not assume rights to third-party names, images, brands or source material from their appearance in the prototype.

**Build verification:** `npm test` passes locally (24 tests covering the repository snapshot/dossier, THE PRODUCT embed, RadioReach disclosures, the writings/art register, the music vault, the institute prototype atlas, and the Five Steps From The Fringe podcast register). `npm run check` adds a production Vite build. Vite notes that the classic global script is not bundled as an ES module; the build config intentionally emits it to `dist/src/app.js` so the existing inline handlers continue to work. The dossier was additionally exercised in a JSDOM harness: README rendering, sanitisation, file fetching, commit diffs, live iframe wiring, atlas fallback and the main-page launch bay.

### Featured conceptual interface

The software register includes **THE PRODUCT™ — This Page Precedes It**, with a four-stage concept summary, source and architecture links, and a click-to-load embed of the original GitHub Pages interface. The embed is external and sandboxed; an external launch link remains available if framing fails. Its simulated persuasion elements are labeled as artwork, and its all-rights-reserved source is not redistributed. See `docs/GITHUB-IP-SCAN.md`.
