# ZIAA asset notes — speculative patents & concepts

The Institute deep-dive (`#institute` → `#institute-learn`) curates a selection
from the public Zazie Institute of Applied Anomalies (ZIAA) open archive at
<https://zazieinstitute.org>, the flagship R&D asset in the domains portfolio.

## What is shown

- **8 speculative patent dossiers** (`INSTITUTE_PATENTS` in `src/app.js`):
  PAT-2021-001, PAT-2022-002, PAT-2023-003, PAT-2024-004, PAT-2025-005,
  PAT-2026-006, PAT-2021-007, PAT-2022-008 — two per disclosure status
  (issued / defensive / examination / provisional), spanning six research
  divisions. Each card shows the publication number, title, status, filing
  date, discipline and abstract; the modal adds an independent-claim excerpt
  and links to the full citable dossier.
- **8 prototype concepts** (`INSTITUTE_CONCEPTS`): PROT-001, PROT-005,
  PROT-006, PROT-009, PROT-014, PROT-017, PROT-020, PROT-021 — spanning six
  divisions. Each card shows accession, clearance, discipline and abstract;
  the modal adds transducer, investigator and bandwidth, and links out.
- **8 research-division links** (static anchors to `/disciplines/*`) and
  outbound links to the full 100-dossier, 160-prototype and about pages.
- Archive counts (160 prototypes, 100 dossiers, 330 notes, 8 monographs,
  16 field stations, 20 fellows, 8 divisions) are quoted as published on
  the ZIAA homepage.

## Sources & curation date

- Homepage: <https://zazieinstitute.org>
- Patents index: <https://zazieinstitute.org/patents>
- Prototypes index: <https://zazieinstitute.org/prototypes>
- Example dossier: <https://zazieinstitute.org/patents/pat-2021-001>
- Curated 2026-10-17. Titles, abstracts, filing metadata and investigator
  credits were transcribed from the live pages on that date.

## Publication gates

1. ZIAA materials are **speculative / defensive research disclosures**, not
   legal advice and not proof of enforceable patent rights. The UI carries
   this disclaimer; keep it wherever dossiers are shown.
2. Re-verify disclosure **statuses** against the live dossiers before any
   licensing conversation — examination states change.
3. Confirm **assignee and chain of title** (ZIAA / Zazie Productions LLC)
   before representing any dossier as a company holding.
4. Full texts live on zazieinstitute.org; this site shows abstracts and
   excerpts only, with outbound links. Do not copy full claim schedules.
5. Teaser-card imagery in `#institute` is generic stock photography, not
   ZIAA exhibit art — do not present it as prototype documentation.
