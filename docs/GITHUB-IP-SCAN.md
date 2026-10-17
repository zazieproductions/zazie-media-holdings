# GitHub project and IP screen

**Reviewed:** 2026-10-13 (UTC) · repository dossier and embeds refreshed 2026-10-17  
**Account:** [`zazieproductions`](https://github.com/zazieproductions)  
**Purpose:** surface source-code, creative-software, and research-data candidates for the Zazie Media Holdings portfolio.

## Scope and limits

I reviewed the account-visible repository catalog, descriptions, selected README files, repository license indicators, and demo links documented by the projects. GitHub showed 62 repositories at the time of review (63 on 2026-10-17), including this website; the `OpenAudio` fork was not treated as original project IP. Twelve additional candidates are now surfaced in the website's software register (11 software projects plus one research-data archive). The three existing in-page software sketches—Form-909 Warp, Signal Rot, and NOETIC—now link to their separate GitHub projects.

This is a discovery shortlist, **not** a legal opinion, technical audit, chain-of-title review, product validation, or valuation. A repository under an account does not, by itself, prove that ZMH owns all code, content, trademarks, data, or commercial rights. License labels below are repository-level indicators and can be incomplete or inaccurate. No dollar values are assigned. Live-demo links were taken from project READMEs and were not independently uptime-tested.

## Twelve additional candidates added to the site

| Candidate | Why it may merit portfolio attention | Rights / maturity signal to resolve |
|---|---|---|
| [Backlink Tracker / Research Archive](https://github.com/zazieproductions/Comprehensive-Backlink-Tracker---Zazie-Productions-) | Python-assisted research archive and structured data for public mentions, backlinks, media features, credits, and syndication. Could support internal brand intelligence or recurring research reports. | README claims 755 records and September 2026 research/intake dates. Revalidate the data, methods, source terms, privacy, and accuracy before publishing those figures or offering the dataset. |
| [SONOGENESIS](https://github.com/zazieproductions/Sonogenesis-Bioacoustic-Aquarium) | Distinctive artificial-life instrument: genome-driven organisms and habitat simulation feed a generative audio experience. Strong fit for performance, installation, and creative-tool extensions. | Repository includes an all-rights-reserved notice and says no general redistribution or modification rights are granted. README explicitly says it is an exploratory artwork, not a validated ecological model. Confirm authorship and assignment. |
| [AURALIS — Bioacoustic Synthesphere](https://github.com/zazieproductions/Auralis-Bioacoustic-Synthesphere) | A separate synthesizer codebase and companion identity to SONOGENESIS; potential to extend the fictional universe without duplicating the flagship instrument. | README calls it experimental. No license file was found; contributor ownership and reuse terms need confirmation. |
| [UMBRA·SCORE](https://github.com/zazieproductions/Umbra-Score-Sound-Design-Engine) | Ambitious sound-design workstation linking procedural synthesis, library retrieval, video spotting, timeline editing, and rendering. The workflow and provenance layer may be the defensible product asset. | No top-level code license was identified. Model weights, provider APIs, sample libraries, and dependencies have separate terms. Project docs say trained-model inference needs local weights and runtime verification. Treat as R&D until verified. |
| [PROMPT FORGE](https://github.com/zazieproductions/PROMPT-FORGE-v2.4.1-LOCAL-COMPILER-DETERMINISTIC-MEGA-PROMPT-COMPILER) | Local-first brief compiler with deterministic composition rules, presets, editable output, and export. Could become a focused authoring workflow with domain templates or team editions. | The README says it does not execute prompts or call an LLM, and describes the current implementation as a working prototype. No license file was found; public visibility is not a reuse grant. |
| [CineContract Studio / StudioLex](https://github.com/zazieproductions/StudioLex-Contract-Automation) | README describes a single-page tool for film-production contract templates, live preview, signature capture, and PDF export—an obvious workflow fit for independent producers if validated. | README labels it proprietary, but no separate license file was found. **Not legal advice:** qualified entertainment counsel must review every template and workflow before any operational use or commercialization. |
| [UIUA Resonance Lab](https://github.com/zazieproductions/UIUA-RESONANCE-LAB) | Single-file, zero-build creative-coding instrument combining array/tensor visualization, Uiua-inspired glyphs, and Web Audio; could support workshops, lessons, or preset packs. | MIT license is reported in the repository. Check contributor rights and separately licensed fonts/dependencies. The README links a [live demo](https://zazieproductions.github.io/UIUA-RESONANCE-LAB). |
| [CHIMERA V1](https://github.com/zazieproductions/CHIMERA-V1-Generative-Synth) | Six generative engines share a typed interface and seedable random-number generator; that common engine architecture is more reusable than a single visual sketch. | README explicitly says there is no license and the public source is for inspection, not copying or redistribution. Clarify rights before reuse or release. |
| [AGON // Signal Engine (formerly SYNTHX-7)](https://github.com/zazieproductions/synthx-7-modular-synthesis-terminal) | Browser-based modular synth with polyphonic voices, effects, and audiovisual controls; a natural fit for creator-focused instruments, presets, and performance tools. | MIT license. Open-source reuse is non-exclusive; check contributors and third-party dependencies. README links a [live demo](https://zazieproductions.github.io/synthx-7-modular-synthesis-terminal/). |
| [VOID//OCULUS](https://github.com/zazieproductions/void-oculus) | A pan-and-zoom knowledge canvas with linked cards and a distinctive procedural visual identity. Could serve research workshops, installations, or custom deployments. | MIT license is reported in the README. README also documents keyboard and assistive-technology gaps. It had 19 GitHub stars at review time. [Live demo](https://zazieproductions.github.io/void-oculus/). |
| [NOISE WALL](https://github.com/zazieproductions/interactive-harsh-noise-generator) | Deterministic browser-based harsh-noise instrument with an installable, offline-capable PWA path and recording/export controls. Could extend the audio-tool and sound-pack catalog. | MIT license. Preserve the prominent hearing/volume warning and review any bundled dependencies. README links a [live demo](https://zazieproductions.github.io/interactive-harsh-noise-generator/). |
| [AETHER V9 Pro](https://github.com/zazieproductions/AETHER-V9-Pro) | Detailed simulated paranormal instrument UI with radar, map, field guide, and procedural audio; a promising horror-game companion or storyworld interface. | MIT license. It is explicitly fictional: no real sensor readings or sensor permissions. Check contributor rights and separate story, trademark, and brand rights. |

## Repository dossier and embedded builds (2026-10-17)

The site now renders the repositories themselves instead of a link list. `repo.html` reads a committed snapshot (`public/data/repos.json`) generated by `scripts/sync-repos.mjs` from the GitHub REST API, and displays the real README, top-level file tree, recent commits, languages, licence, stars, forks, size, Pages status and last push for each of the 15 curated repositories. Directory listings and commit diffs are fetched live from GitHub only when a visitor opens them.

Five zero-build, single-file apps are copied **verbatim** from their default branch and served from the site so they actually run in an embedded frame. Each copy sits in `public/embeds/<id>/` with a generated `PROVENANCE.txt` (upstream URL, source path, head commit, blob SHA, byte count, licence) and the repository's licence file where one exists.

| Embedded build | Source file | Licence reported | Why it is vendored |
|---|---|---|---|
| [Form 909-WARP](https://github.com/zazieproductions/Form-909-Warp-IDM-Drum-Machine) | `Form-909 Warp IDM Drum Machine.html` | MIT | One self-contained HTML file, zero dependencies. |
| [PROMPT FORGE](https://github.com/zazieproductions/PROMPT-FORGE-v2.4.1-LOCAL-COMPILER-DETERMINISTIC-MEGA-PROMPT-COMPILER) | `index.html` | No licence file | Single-file browser app; no build step. |
| [CINECONTRACT / StudioLex](https://github.com/zazieproductions/StudioLex-Contract-Automation) | `index.html` | README says proprietary; no licence file | Single-file browser app, kept for internal evaluation of the templates. |
| [Uiua Resonance Lab](https://github.com/zazieproductions/UIUA-RESONANCE-LAB) | `index.html` | MIT | Single-file browser app; its former Pages link is currently 404. |
| [VOID//OCULUS](https://github.com/zazieproductions/void-oculus) | `index.html` | MIT in README/`LICENSE.md` (GitHub metadata: NOASSERTION) | Single-file app; also live on GitHub Pages. |

[NOISE WALL](https://github.com/zazieproductions/interactive-harsh-noise-generator) is embedded from its working GitHub Pages deployment rather than copied. Nothing else is iframed.

### Deployment verification

Checked on 2026-10-17:

- **Working:** Form-909 Warp (Pages `built`), VOID//OCULUS (Pages `built`), NOISE WALL (Pages workflow deployment; page responded).
- **Not working:** NOETIC Cognitive Command Deck, UIUA Resonance Lab and SYNTHX-7 / AGON//Signal Engine all returned GitHub's "Site not found" page (the Pages API shows no site for those repositories). Their "FULL LIVE DEMO" links were removed; UIUA is now runnable from its vendored source, and the others link to their source dossiers.
- **Not advertised:** SONOGENESIS has a Pages site configured, but its deployment was not verified as runnable, so it is presented as a source dossier only.

Live directory listings and commit-diff expansion call the public GitHub API from the visitor's browser without a token (60 requests/hour per IP, cached per session). The dossier is fully readable without those calls because the snapshot includes every README and top-level tree.

The earlier caveat still applies: a repository under the account is not proof of chain of title. The five copied builds are first-party sites, but confirm authorship, contributor assignments, third-party CDN terms, and the absence of sensitive data before promoting or commercialising them.

## Existing software cards and source links

- **Form-909 Warp:** MIT-licensed public project. The site's four-voice sequencer is still a reduced sketch, but the real six-voice app is now embedded from source and available at `repo.html?id=form-909#live`.
- **Signal Rot:** public repository; its `LICENSE` file is MIT. The in-page test-tone control is not the mastering workstation itself; the dossier renders the real README and source tree.
- **NOETIC:** separate browser-based creative-fiction project. Its advertised Pages demo currently returns "Site not found", so no live link is shown. Its README describes a fictional, deterministic interface. The in-page command terminal remains a scripted mock, not the standalone project, an AI system, or an acquisitions workflow. No project license was identified in the repository metadata reviewed.

## High-priority follow-up

1. **Confirm chain of title:** identify authors, contributors, contractors, generated assets, and any assignments to the correct legal entity.
2. **Normalize licensing:** decide which projects are proprietary, permissively open-source, or internal-only. Add accurate license files and contribution terms; do not infer rights from public visibility.
3. **Separate product claims from prototypes:** test builds, browser support, audio export, accessibility, security, and any model/API dependencies. Avoid revenue, user, valuation, or performance claims without evidence.
4. **Refresh the research archive:** independently validate the Backlink Tracker's record count, source trail, and update date before showing any metrics publicly.
5. **Review sensitive repositories before more publication:** `cue-sheet-automation-` is listed as public on GitHub even though its README describes an internal/private publishing archive; the repository includes a spreadsheet and music-administration notes. I did not copy its contents or change its visibility. Review it promptly and make it private if it is intended to remain internal. It was intentionally **not** added to the public website shortlist.

The website labels the new entries as candidates and shows the rights signals beside each project so visitors can distinguish public-source evidence from verified ownership or an offer to license.