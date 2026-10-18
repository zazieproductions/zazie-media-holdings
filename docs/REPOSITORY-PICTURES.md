# Home-page repository pictures

The home page shows actual committed interface screenshots for NOETIC,
SONOGENESIS, AGON // SIGNAL ENGINE, and VOID//OCULUS. Projects without a
suitable committed picture retain their existing text and controls; no
placeholder art or AI-generated product mockups are used.

`public/data/repos.json` records each picture's original repository path,
GitHub source link, blob SHA, output dimensions, and byte size. The local
JPEGs in `public/art/repos/` preserve the complete source composition,
resized to at most 1200 pixels wide at JPEG quality 80 with metadata stripped.
They total approximately 339 KB. Pictures do not run the apps or start audio.
NOETIC's picture sits next to its introductory project information; the
other three appear in the source-code register cards.

Refresh pictures without changing existing repository facts or embedded builds:

```sh
node scripts/sync-repos.mjs --gallery-only
```

The normal `npm run repos:sync` also refreshes pictures. The script selects
one raster picture per repository, prioritizing README screenshots and
excluding icons and badges. Install ImageMagick (`magick`, or `convert`
plus `identify`) for resizing. Without it, only already-small raster assets
are copied. Review selected pictures and run `npm run check` after syncing.
Repository-level license and ownership notices still apply; a screenshot
is not evidence of commercial rights or a currently available deployment.
