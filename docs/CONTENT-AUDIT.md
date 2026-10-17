# Publication and content audit

The imported site is a **concept/demo**, not a verified company record or operational storefront. Review the following before publication:

- **Corporate and portfolio assertions:** film titles, rights/ownership, domain histories, patent claims, catalog counts, royalty/earnings, valuations, growth rates, investors and deal values are hard-coded in the original demo. Confirm each against actual records and mark fictional examples clearly.
- **Checkout:** `checkout()` displays an order-success modal but has no payment, authentication, inventory, invoicing, or download fulfillment. It must not represent a real sale.
- **Acquisition form:** `submitAcquire()` only shows a simulated confirmation and does not transmit or store submissions. It must not promise contact or an NDA.
- **Newsletter:** `subscribe()` only displays a toast; it does not add subscribers to a list.
- **Investor deck:** `openDeck()` shows a mock modal; its Download PDF button does not generate or download a PDF.
- **Music:** Audio is browser-synthesized / illustrative, not a licensed catalog stream. Replace with authorized audio files and accurate metadata before commercialization.
- **Images:** Unsplash URLs and Google Fonts are fetched from outside services. Verify attribution, licensing, consent and privacy implications.
- **Terminal:** The in-page NOETIC terminal is a scripted mock, not the standalone project, a real AI agent, or a diligence workflow.
- **Software/IP register:** 12 additional public GitHub candidates are listed (11 software projects plus one research archive), alongside the three core sketches. Repository visibility is not proof of company ownership or commercial rights; license notices vary, some repositories have no license, and third-party dependencies/models/data need review. See [GitHub IP screen](GITHUB-IP-SCAN.md).
- **Repository dossier:** `repo.html` and the cards on the main page read a committed GitHub snapshot (`public/data/repos.json`). Stars, licenses, READMEs, file trees and commits go stale: run `npm run repos:sync` before publication and re-check demo deployments. Live directory listings, file fetches and commit diffs call GitHub from the visitor's browser (public, unauthenticated) and are subject to rate limits and third-party availability.
- **Embedded builds:** five single-file apps are copied verbatim into `public/embeds/<id>/`; each directory contains a generated `PROVENANCE.txt` and, where available, the upstream licence. Treat them as first-party publications: confirm chain of title, contributor rights and third-party CDN terms before promoting or selling them. StudioLex carries a README claim of proprietary status; PROMPT FORGE has no licence file.
- **External frame:** NOISE WALL is embedded from its GitHub Pages deployment. Its content, storage, cookies and availability are controlled by that origin, not this site. Keep the standalone fallback link and re-verify the deployment periodically.
- **README rendering:** GitHub markdown is parsed with `marked` and sanitised with DOMPurify; raw scripts, inline event handlers, forms and style attributes are stripped, relative links are resolved to the repository, and external links open in a new tab. Re-test this path after any dependency update.
- **Demo claims:** only deployments that responded during the 2026-10-17 check are advertised as live (Form-909 Warp, VOID//OCULUS, NOISE WALL). NOETIC, UIUA and SYNTHX-7 currently return "Site not found" and their live links have been removed; do not restore them without checking again.
- **Sensitive repository follow-up:** the `cue-sheet-automation-` repository is publicly visible despite README text describing an internal/private publishing archive. Review its contents and make it private if needed before further promotion.
- **User data and security:** Set up proper back-end validation, rate limiting, consent, payment provider, privacy policy and contact details prior to collecting data or payment.
- **Mobile and accessibility:** Review focus handling, keyboard access, contrast, reduced motion and any animations or custom widgets.

**Publication gate:** replace simulation language and fictional financial assertions with supported statements before treating this site as a real ZMH business portal. Re-run `npm run repos:sync`, re-verify every advertised demo URL, and review the provenance of each embedded build before publishing.
