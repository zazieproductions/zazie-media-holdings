# Release cover art — drop-in manifest

Every card in the music vault resolves its cover in three layers, in order of authority:

1. a file the owner drops at the repo path below (`public/art/covers/<name>`), so an uploaded or replaced cover always wins;
2. the 640px artwork Spotify already serves for that release (`m.sp.art`, transcribed from the artist's discography page on 17 Oct 2026) — this covers 20 of the 23 editions in the grid with zero work;
3. the procedural conic gradient, which keeps the grid intact when both layers are unavailable (offline, privacy blocker, or a release that is not on streaming).

Each failed layer degrades instead of showing a broken image. In practice that means the drop-in below is only
*needed* for `Salvation Ends The Pain`, `Liquid Phosphorus` and `An Atrium Full of Heaven`: the three October 2026
singles that are not distributed to streaming yet, and therefore have no Spotify artwork to fall back on.

This manifest covers only the 16 archive-backed releases. Seven further editions appear in the vault grid because they
are on Spotify (`Greetings From Tinsel Time` 2023, `Sellotape` 2020, `Stutter to stammer` 2019, `The Triangular Savant`,
`Well Meaning Neurotypicals`, `Spectral Ode to Synesthesia`, `CAN'T GET MY EYES OFF YOU (123)`); they have no Drive
folder, so they get no row here, no `m.art` path and no cover to drop — their artwork is layer 2 and only layer 2.

This manifest lives in `docs/` rather than `public/` on purpose: `public/` is copied verbatim into the deployed
bundle, and the Drive folder IDs are share links to the complete master archive (146 WAV files). Publishing them
would hand out the catalog, so they are recorded here for provenance and deliberately not linked from the site.

## Preparing the files (layer 1 overrides)

- Square, 800–1200px per side, sRGB, JPEG quality ~82. WebP/AVIF are fine if `m.art` is extended to match the new name.
- Keep the file local. `i.scdn.co` is hotlinked by design (it is Spotify's public artwork CDN and is what the embeds render); Drive is not, and `m.art` must never point there.
- Under ~200KB each. The Drive originals run 116KB–1.4MB.
- Artwork only. Never place the WAV masters here (146 files, several GB) — they are archive assets, not web assets.
- After adding files, run `npm run build` and check the sizes landing in `dist/art/covers/`.

| Repo path | Release | Drive folder ID | Archived cover filename in Drive |
|---|---|---|---|
| `public/art/covers/opaline-lament.jpg` | Opaline Lament (Life From The Beyond) | `148Gb52n0IGSp0pn5__xQ0gj4DjVmllRe` | `Opaline Lament (Life From The Beyond) (Cover Art).jpg` |
| `public/art/covers/a-long-way-to-nowhere.jpg` | A Long Way To Nowhere | `1kZm0O6QfU6QQBDXc5B1MSAocbyb4T3-2` | `A Long Way To Nowhere (Cover Art).jpg` |
| `public/art/covers/miraculously-unhurt.jpg` | Miraculously Unhurt | `1gdv91s30i8Y74VOx3SXc2oAfu20sn94T` | `Miraculously Unhurt (Cover Art)` |
| `public/art/covers/anything-can-happen.jpg` | Anything Can Happen On An Electric Day | `1nDnrtCMqAehA9i7bmGT5vr7BcTmYVvc_` | `Anything Can Happen On An Electric Day (Cover Art).jpg` |
| `public/art/covers/distant-bells.jpg` | Distant Bells For Surgical Minds | `1a6qh3pv7A7M_wPFzMHFxB3vGcI0aDWhu` | `Distant Bells For Surgical Minds (Cover Art).jpg` |
| `public/art/covers/interference-archive.jpg` | Interference Archive 01010101 | `1nbu8RNRmKkI69nw1blZydyZ_L07VpQlS` | `Interference Archive 01010101 (Cover Art)` |
| `public/art/covers/constrained-capacity.jpg` | Constrained Capacity | `1emqfUH164y48IJrmnsbuskVL5i6N1fwW` | `Constrained Capacity (Cover Art).jpg` |
| `public/art/covers/vermiform.jpg` | Vermiform | `1DIIs3gjxTkbKic9IYZ6Y3cKGslv8QWTv` | `Vermiform (Cover Art).jpg` |
| `public/art/covers/to-halt-space-adrift.jpg` | To Halt Space Adrift | `1an9ckTvLYlP-FnI2RX3NbYVRqEnUBstO` | `To Halt Space Adrift (Cover Art).jpg` |
| `public/art/covers/anesthesia-signal-age.jpg` | Anesthesia for the Signal Age | `1-MZEGFwBY3Y2FnUTLVupAWTfaj0QXrXB` | `Anesthesia for the Signal Age (Cover Art).jpg` |
| `public/art/covers/stutter-to-stammer-sde.jpg` | Stutter to stammer (Super Deluxe Edition) | `1jbtLWqK7wpGvn6HUi0wxIbpcHtQeTzWV` | `Stutter to stammer (Super Deluxe Edition) (Cover Art).jpg` |
| `public/art/covers/greetings-tinsel-sde.jpg` | Greetings From Tinsel Time (Super Deluxe Edition) | `1HehynoBNp0NrS_rLl7MqiQFXh_4Bga5y` | `Greetings From Tinsel Time (Super Deluxe Edition) (Cover Art).png` |
| `public/art/covers/sellotape-sde.jpg` | Sellotape (Super Deluxe Edition) | `1OY10DNc7kMhc-iBN4DYImTiNwNdEeJId` | `Sellotape (Super Deluxe Edition) (Cover Art).jpg` |
| `public/art/covers/salvation-ends-the-pain.jpg` | Salvation Ends The Pain | `1t8-X63Wsjfhi0AjJc_2KM0uhRAk59v6J` | `Salvation Ends The Pain (Cover Art)` |
| `public/art/covers/liquid-phosphorus.jpg` | Liquid Phosphorus | `1ElDgCuGDZEce6mNV2hG2xVtp5UJfhj4Q` | `Liquid Phosphorus (Cover Art)` |
| `public/art/covers/an-atrium-full-of-heaven.jpg` | An Atrium Full of Heaven | `1M94MX2xHtXbsDfpDHckKqfNLtHkm2UCJ` | `An Atrium Full of Heaven (Cover Art)` |

Total: 16 releases · 146 archived WAV masters.

## Rights note

Filenames and folder IDs are recorded so provenance is auditable, not to publish the Drive files themselves.
Before this artwork goes live publicly, confirm it is being distributed under the Zazie Productions LLC
catalog and that third-party imagery inside the artwork (photos, type, collaged frames) is cleared —
the artwork is not covered by the code license in `LICENSE.md`. See [CONTENT-AUDIT.md](CONTENT-AUDIT.md).
