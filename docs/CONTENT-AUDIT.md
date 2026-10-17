# Publication and content audit

The imported site is a **concept/demo**, not a verified company record or operational storefront. Review the following before publication:

- **Corporate and portfolio assertions:** film titles, rights/ownership, domain histories, patent claims, catalog counts, royalty/earnings, valuations, growth rates, investors and deal values are hard-coded in the original demo. Confirm each against actual records and mark fictional examples clearly.
- **Checkout:** `checkout()` displays an order-success modal but has no payment, authentication, inventory, invoicing, or download fulfillment. It must not represent a real sale.
- **Acquisition form:** `submitAcquire()` only shows a simulated confirmation and does not transmit or store submissions. It must not promise contact or an NDA.
- **Newsletter:** `subscribe()` only displays a toast; it does not add subscribers to a list.
- **Investor deck:** `openDeck()` shows a mock modal; its Download PDF button does not generate or download a PDF.
- **Music:** Audio is browser-synthesized / illustrative, not a licensed catalog stream. Replace with authorized audio files and accurate metadata before commercialization.
- **Images:** Unsplash URLs and Google Fonts are fetched from outside services. Verify attribution, licensing, consent and privacy implications.
- **Writings register (new):** `#writings` quotes openings and stanzas from manuscripts in the literary submissions archive. Excerpts are reproduced from the submitted files; statuses are copied from `_00_SUBMISSION_TRACKER_Literary_Journals`, last modified 2026-10-09, and expire. Acceptance is not publication: verify anthology titles, editors, dates and agreements before presenting a credit publicly. Do not publish personal contact details found in the manuscripts, and keep excerpts partial while pieces remain eligible for submission. See [writings and art register](WRITINGS-AND-ART.md).
- **Artwork (new):** ten web-resolution works and the ZAZIE PRODUCTIONS × FLESHWEATHER wordmark are copied into `public/art` from the Behance archive and the submissions folder. Confirm the artist controls every shown work, that any co-brand lockup has both parties' consent, and that no stock, font or reference material is unlicensed. The archive catalogue counts 129 galleries; the site shows ten and states as much.
- **Terminal:** The in-page NOETIC terminal is a scripted mock, not the standalone project, a real AI agent, or a diligence workflow.
- **Software/IP register:** 12 additional public GitHub candidates are now listed (11 software projects plus one research archive). Repository visibility is not proof of company ownership or commercial rights; license notices vary, some repositories have no license, and third-party dependencies/models/data need review. See [GitHub IP screen](GITHUB-IP-SCAN.md) and [writings and art register](WRITINGS-AND-ART.md).
- **Sensitive repository follow-up:** the `cue-sheet-automation-` repository is publicly visible despite README text describing an internal/private publishing archive. Review its contents and make it private if needed before further promotion.
- **User data and security:** Set up proper back-end validation, rate limiting, consent, payment provider, privacy policy and contact details prior to collecting data or payment.
- **Mobile and accessibility:** Review focus handling, keyboard access, contrast, reduced motion and any animations or custom widgets.

**Publication gate:** replace simulation language and fictional financial assertions with supported statements before treating this site as a real ZMH business portal.
