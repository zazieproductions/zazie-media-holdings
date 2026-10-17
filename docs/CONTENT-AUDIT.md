# Publication and content audit

The imported site is a **concept/demo**, not a verified company record or operational storefront. Review the following before publication:

- **Corporate and portfolio assertions:** film titles, rights/ownership, domain histories, patent claims, catalog counts, royalty/earnings, valuations, growth rates, investors and deal values are hard-coded in the original demo. Confirm each against actual records and mark fictional examples clearly.
- **Checkout:** `checkout()` displays an order-success modal but has no payment, authentication, inventory, invoicing, or download fulfillment. It must not represent a real sale.
- **Acquisition form:** `submitAcquire()` only shows a simulated confirmation and does not transmit or store submissions. It must not promise contact or an NDA.
- **Newsletter:** `subscribe()` only displays a toast; it does not add subscribers to a list.
- **Investor deck:** `openDeck()` shows a mock modal; its Download PDF button does not generate or download a PDF.
- **Music vault — what is now verified:** the grid holds 23 editions in two provenances. Sixteen mirror the Google Drive archive `ZAZIE PRODUCTIONS (FULL DISCOGRAPHY + MASTERS)` — 16 release folders, 146 numbered WAV masters, one cover file each, tracklists transcribed from the archived filenames. Seven more (`Greetings From Tinsel Time` 2023, `Sellotape` 2020, `Stutter to stammer` 2019, `The Triangular Savant`, `Well Meaning Neurotypicals`, `Spectral Ode to Synesthesia`, `CAN'T GET MY EYES OFF YOU (123)`) are distributed on Spotify but were not in the shared folder; they are labelled `DISTRIBUTED — NOT IN SHARED VAULT`, carry no transcribed tracklist and no master claim, and are embedded from their release pages like everything else that has one. Twenty of 23 have a verified `open.spotify.com/album/…` id; the three October 2026 singles exist only in the archive. Release years for the 2026 entries come from licensed ISRC registrations in a public Google Sheet, and the distributed-only years come from Spotify's discography list — recorded in `yearSrc`, never inferred.
- **Music vault — what is still illustrative:** 20 of the 23 editions carry a verified `open.spotify.com/album/…` id (13 of the 16 archive-backed ones, plus all seven distributed-only editions), and the release modal loads that album through a click-to-activated Spotify embed, so the *released recording* is one click away and is served by Spotify, not by this site. The 0:30 browser-synthesized clips remain for the three releases that are not distributed yet (`Salvation Ends The Pain`, `Liquid Phosphorus`, `An Atrium Full of Heaven`) and as a per-track sketch inside any modal; they are labelled `SYNTH SKETCH — NOT THE ARCHIVED MASTER`. Blurbs and genre tags are still editorial.
- **Cover art:** each card resolves a cover in three layers: a file dropped at `art/covers/<slug>.jpg` (see `public/art/covers/` and `docs/COVER-MANIFEST.md`), then the 640px artwork `i.scdn.co` already serves for that release, then the procedural conic gradient. Nothing is copied into the repository, nothing is hotlinked from Drive, and a failed layer degrades instead of showing a broken image. Twenty of the 23 editions resolve at layer 2, so no upload is required for them; the three undistributed singles have no streaming artwork, so a local file is the only way they get a real cover.
- **Audiences:** the Spotify card is the owner’s real `Goa Trance/Psy Trance` playlist (`75PxWthUYPOskOU1EjGrFX`): 31,348 saves, 382 songs, over 24 hours, read from the live page on 17 Oct 2026; the artist page (`4UOgvZEOo7xBhFBjJvlMm0`) reported 247 monthly listeners the same day. Those are the two numbers the card publishes — saves and monthly listeners are different metrics and neither is a follower count, which is why the earlier `32K FOLLOWERS`/`48K MONTHLY LISTENERS`/`$12K PLACEMENTS` figures were deleted rather than corrected. One catalog track is verified in rotation: the *Distant Bells For Surgical Minds* opener, listed as `Sound System: Neocortex Activation` (archive title `Sound System- Prefrontal Cortex Activation`), added 4 Dec 2023. The Instagram card links the real @WellMeaningNeurotypicals profile with no embed script; its `25K • 10M VIEWS` chip is still unverified because Instagram is not reachable from the build environment (two third-party profiles list 29k followers).
- **Images:** the three “Zazie Institute” prototype cards still use Unsplash placeholders, and Google Fonts is fetched from a CDN; both are outside services and need attribution/licensing review. The audience grid's former stock-photo stand-ins for @WellMeaningNeurotypicals posts have been removed, since restaging unrelated stock photography as the account's own output misrepresents the channel.
- **Podcast register (new):** `#podcast` lists Five Steps From The Fringe, a show the owner asked to enter as a holding. Public imprint is Obsidian Veil Media. Episode titles, dates, durations, descriptions and the cover URL were copied from the public Spotify show and Spotify for Creators profile on 2026-10-17. The desk lists 9 episodes. The 26 Sep 2024 Phantom Requiem episode remains on Spotify but is omitted here at the owner’s request, as self-promotional. Do not invent listener counts, revenue, or a chain-of-title document that was not supplied. The Spotify player is opt-in and loads from Spotify; it is not a licensed local audio file. See [podcast register](PODCAST-REGISTER.md).
- **Writings register (new):** `#writings` quotes openings and stanzas from manuscripts in the literary submissions archive. Excerpts are reproduced from the submitted files; statuses are copied from `_00_SUBMISSION_TRACKER_Literary_Journals`, last modified 2026-10-09, and expire. Acceptance is not publication: verify anthology titles, editors, dates and agreements before presenting a credit publicly. Do not publish personal contact details found in the manuscripts, and keep excerpts partial while pieces remain eligible for submission. See [writings and art register](WRITINGS-AND-ART.md).
- **Artwork (new):** ten web-resolution works and the ZAZIE PRODUCTIONS × FLESHWEATHER wordmark are copied into `public/art` from the Behance archive and the submissions folder. Confirm the artist controls every shown work, that any co-brand lockup has both parties' consent, and that no stock, font or reference material is unlicensed. The archive catalogue counts 129 galleries; the site shows ten and states as much.
- **Terminal:** The in-page NOETIC terminal is a scripted mock, not the standalone project, a real AI agent, or a diligence workflow.
- **Software/IP register:** the atlas contains 15 repositories (three in-page sketches plus 12 curated candidates); the software register also links RadioReach Funnel and 12 other GitHub entries. RadioReach is listed by link and repository-described systems only: its README says all rights reserved and no open-source license. Public visibility is not proof of company ownership or commercial rights; review contributors, dependencies, models/data, and current license terms. See [GitHub IP screen](GITHUB-IP-SCAN.md).
- **Repository dossier:** `repo.html` and the cards on the main page read a committed GitHub snapshot (`public/data/repos.json`). Stars, licenses, READMEs, file trees and commits go stale: run `npm run repos:sync` before publication and re-check demo deployments. Live directory listings, file fetches and commit diffs call GitHub from the visitor's browser (public, unauthenticated) and are subject to rate limits and third-party availability.
- **Embedded builds:** five single-file apps are copied verbatim into `public/embeds/<id>/`; each directory contains a generated `PROVENANCE.txt` and, where available, the upstream licence. Treat them as first-party publications: confirm chain of title, contributor rights and third-party CDN terms before promoting or selling them. StudioLex carries a README claim of proprietary status; PROMPT FORGE has no licence file.
- **External frame:** NOISE WALL is embedded from its GitHub Pages deployment. Its content, storage, cookies and availability are controlled by that origin, not this site. Keep the standalone fallback link and re-verify the deployment periodically.
- **README rendering:** GitHub markdown is parsed with `marked` and sanitised with DOMPurify; raw scripts, inline event handlers, forms and style attributes are stripped, relative links are resolved to the repository, and external links open in a new tab. Re-test this path after any dependency update.
- **Demo claims:** only deployments that responded during the 2026-10-17 check are advertised as live (Form-909 Warp, VOID//OCULUS, NOISE WALL). NOETIC, UIUA and SYNTHX-7 currently return "Site not found" and their live links have been removed; do not restore them without checking again.

- **RadioReach behavioral systems and privacy:** the repo README describes ESP and Momentum + Ownership as using scroll/click/intent signals, browser storage, and event attribution to adapt copy tone and sequence visitors. Verify the deployed feature flags and payloads, disclose the behavior clearly, honor consent/opt-out, minimize data and retention, and avoid sensitive-trait inference; the site summary is not a privacy or compliance audit.
- **RadioReach configuration security:** the public repository tree includes files named `.env.production` and `.env.local.save`. Their contents were not inspected or reproduced for this register. Privately verify that they contain no active credentials; rotate and remove any exposed secrets from current files and Git history as appropriate.
- **Sensitive repository follow-up:** the `cue-sheet-automation-` repository is publicly visible despite README text describing an internal/private publishing archive. Review its contents and make it private if needed before further promotion.
- **User data and security:** Set up proper back-end validation, rate limiting, consent, payment provider, privacy policy and contact details prior to collecting data or payment.
- **Mobile and accessibility:** Review focus handling, keyboard access, contrast, reduced motion and any animations or custom widgets.

## Streaming edition vs. archived master

The vault’s titles and running orders are transcribed from the Drive master archive, because that is what the
label actually holds. Spotify’s listing for the same releases differs in places, and in each case the archive is
the more trustworthy source. They are recorded here so the discrepancies are a decision, not a surprise:

| Archive (shown on the site) | Spotify listing | Note |
|---|---|---|
| A Long Way **To** Nowhere | A Long Way **From** Nowhere | same album, id `5NAW3TUYSKZnnL5memqLJe` |
| Sound System- Prefrontal Cortex Activation | Sound System: Neocortex Activation | distributor retitled the track |
| Man Who Cries -Hollow Sea- | Man Who Cries (Hollow Sea) | punctuation only |
| Pollyanna Carnival | Polyanna Carnival | Spotify spelling |
| Klerksdorp Sphere 3.1415 | Klerkdorp Sphere 3.1415 | Spotify typo (Klerksdorp is a town) |
| Beneath Mercury | Beneath Mecury | Spotify typo |
| Cow-O-Matic (Extended Noise) | Cow-O-Matic | edit suffix dropped |
| The Triangular Savant — “1 track” in the ISRC sheet | 6-track EP | the spreadsheet is wrong; do not treat it as gospel |

Track *counts* agree with the archive for all 13 shared releases, and lengths are visible in the embed, so the
site deliberately publishes no duration numbers of its own.

The seven distributed-only editions sit in the same grid but are not transcribed at all: no tracklist, no master
count, no cover path, and `CAN'T GET MY EYES OFF YOU (123)` carries no type or year because Spotify's listing had
already started returning a reCAPTCHA interstitial before those fields could be read (`spUnknown:true` marks it, and
the card renders `EDITION` + `·`). That gap is a fetch failure, not a decision to publish a guess; fill the fields in
`MUSIC` once the page can be read again. `G7e Torpedo` (2019) is absent from Spotify entirely,
and the seven releases that exist only in the label register (see `docs/` history) are not linked from the grid —
that filter is a scope decision, not missing data.

Per-track Spotify links are not generated by matching titles: the distributor renamed enough tracks that a fuzzy
join across 146 titles would produce wrong links, so embedding happens at release granularity only.

**Publication gate:** replace simulation language and fictional financial assertions with supported statements before treating this site as a real ZMH business portal.

**Publication gate:** replace simulation language and fictional financial assertions with supported statements before treating this site as a real ZMH business portal. Re-run `npm run repos:sync`, re-verify every advertised demo URL, and review the provenance of each embedded build before publishing.
