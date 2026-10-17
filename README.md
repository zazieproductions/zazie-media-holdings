# Zazie Media Holdings (ZMH)

Interactive, single-page **concept showcase** for a proposed media and intellectual-property portfolio, adapted from the supplied HTML prototype. The project retains the imported catalog views, film and domain cards, simulated product cart, music vault, browser-generated audio instruments, organizational visualizations, valuation calculator, command palette, and animations.

> **Important:** This is a front-end demo. The original content contains illustrative and potentially fictional business metrics, film credits, investment claims, and asset ownership assertions. Purchases, acquisition submissions, newsletter signup and PDF downloads are simulations; they do not process transactions, messages or files. See [content audit](docs/CONTENT-AUDIT.md) before publishing.
>
> The software section now includes a curated screen of 12 additional public GitHub candidates (11 software projects and one research-data archive). They are presented as **potential candidates**, not appraised or verified company holdings; license and chain-of-title checks are called out in [the GitHub IP screen](docs/GITHUB-IP-SCAN.md).
>
> The digital-product cards and the matching music-vault releases now carry the **real prices and cover art** mirrored from the public catalogue at [horror.zazieproductions.com/store](https://horror.zazieproductions.com/store) (hub prices last checked 24 September 2026); each card links out to its Gumroad, itch.io or Bandcamp listing, and BIOFLUID Vol. 01 — which has no live listing — is flagged as a concept. The on-page cart remains a simulation.

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
5. Replace hard-coded catalog entries with editable, verified structured content.
6. Version-pin and locally bundle third-party JavaScript dependencies.

## Rights

See [LICENSE.md](LICENSE.md). Do not assume rights to third-party names, images, brands or source material from their appearance in the prototype.

**Build verification:** `npm run check` passes locally (four smoke tests plus a production Vite build). Vite notes that the classic global script is not bundled as an ES module; the build config intentionally emits it to `dist/src/app.js` so the existing inline handlers continue to work.
