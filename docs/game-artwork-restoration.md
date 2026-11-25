# Home artwork and branding restoration

This change restores 17 files from the protected prototype at `83abc179fafa63b826d7f2662c4a18a134a9e6c1` to the independent wiki frame: twelve screenshot thumbnails, two equipment cutouts, the circular sidebar logo, Home wordmark and favicon. Source bytes are unchanged. The [asset manifest](../public/notices/restored-game-artwork.json) records each source path, Git blob, checksum, size and placement; the [artwork notices](../public/notices/artwork.txt) retain credits and unresolved permission/provenance questions.

The worktree began at `7b97f14afde147fe3b1c70b9d99b61732b3789be`. A source comparison found all 392 archived article item-icon files already present with identical SHA-256 checksums, and the same 2,163 icon references in the corresponding registered articles. The built article HTML also retains all 2,163 references with no per-article differences. No article body, icon file, category, identity or bookmark needed rewriting. The existing loading-tip marker and ribbon marks remain in place.

## Availability and open questions

Fifteen existing media findings cover the fourteen topic images and Home wordmark. Their availability closure uses the pinned file checksum; the original findings and resolution history remain recorded. The shared-frame logo and favicon were outside that source-content scan and are accounted for in the asset manifest.

The closure does not establish permission, clear the composite logo/favicon provenance questions, verify gameplay claims or establish complete portrait/gallery coverage. Prd reports contacting Lo-Fi Games; no response or additional permission is recorded. Private correspondence stays outside the repository. The copyright form and email alternative remain available.

## Verification

`tests/game-artwork.test.mjs` checks pinned bytes and distinct Home placements. `tests/game-artwork.spec.mjs` checks images at 1920, 1440, 1024 and 390 pixels in both palettes, desktop fit, accessible branding, keyboard navigation, the phone drawer, blocked-image/no-JavaScript fallbacks and representative article icons. Screenshot evidence is retained in `reports/ci/artwork/` and the PR diagnostic artifact, so the later local-edit checks do not replace it.

The existing broad shared-layout CI selection runs production-mode build, catalog/current-route checks, browser regressions, package dry run and focused local-edit checks. It retains the family, category, bookmark, font, footer/settings and warm-cache coverage. Exhaustive conversion audits remain a separate invocation. This change does not alter deployment workflows or maintenance behavior; publication still requires the existing preview and approval process.
