# Factions conversion

This local family starts at `dd27161` on `rebuild/restoration` and uses the immutable [83abc179 comparison](https://github.com/mattresspad/kenshi-wiki/tree/83abc179fafa63b826d7f2662c4a18a134a9e6c1). The [category roster](roster.json) contains all 95 Factions members, including the previously reviewed Holy Nation. The [supporting roster](supporting-pages.json) separately contains Guide to Faction Relations and Hostile Factions. All 96 new files retain their registered IDs, canonical paths, original categories, credits, licenses and recorded source files.

## Accepted sequence

| Batch | New articles | Local HTML pages |
|---|---:|---:|
| United Cities, Shek Kingdom, Tech Hunters, Slave Traders | 4 | 399 |
| Grayflayers, Skeleton Bandits | 2 | 401 |
| Factions (Alpha), Free Traders (Alpha) | 2 | 403 |
| Factions overview and the two supporting guides | 3 | 406 |
| Remaining titles, part 1 | 22 | 428 |
| Remaining titles, part 2 | 21 | 449 |
| Remaining titles, part 3 | 21 | 470 |
| Remaining titles, part 4 | 21 | 491 |

The four final groups follow the frozen English title order. Each batch has its own mechanical transfer commit and acceptance record. The two guides live in `gameplay/guides/`; the faction articles live in `factions/`. No factual rewrites were made in this family. Editorial sign-off remains independent of transfer and formatting acceptance; the prior eight editorial reviews remain recorded.

## Presentation and preservation

The shared outline now supports headings through h6. United Cities' fifth-level character sections can be reached through the desktop rail or phone drawer with the keyboard. Existing source heading IDs remain unchanged.

Typed facts support linked text, unlinked labels and explicit line breaks. Grayflayers keeps the unresolved “Shark (override) Grayflayer” HQ label unlinked. Skeleton Bandits keeps its six hostile-race entries on distinct lines. Both historical pages put the imported removal notice before their description.

The repeatable faction formatter converts single-cell disclosure scaffolding into paragraphs, two-column definition-list scaffolding into settlement lists, and directional relation labels into table headers. It retains source order, links, qualifications, signs and values. All source and output fingerprints compare after that presentation normalization. A separate text fingerprint still requires every original word in order. Table data and units, fact fields, citation links and return links have their own comparisons.

All **639 headings and 453 citation targets** in the newly transferred articles are preserved. The Holy Nation's existing 38 headings and 434 citation targets, Backpacks, the earlier 32 bookmarks, font-loaded/blocked ribbon tests and independent warm-cache edit-path test remain active.

Every acceptance runs the production build, six catalog/format/cache tests, the browser suite and Cloudflare package dry run. The final browser suite has **47 passing tests**, with no skipped faction cases. Every incoming article is checked for desktop and phone overflow; representatives are captured in light and dark. The four requested settlement → faction → settlement journeys pass in both sizes and palettes. The guide's six-column pacifier table retains the negative thresholds and amounts, and has its own phone scroll region.

## Routes, links and media

The preview contains **482 articles, seven categories, Home and the Modding portal: 491 HTML pages**. The Factions index lists all 95 members locally. Five aliases targeting the family work, including the already-active Holy Nation alias; 47 frozen redirects are active globally. Geography retains its 382-ID roster and all 42 aliases.

Relative to the completed geography preview, 91 formerly temporary destinations now resolve locally, 157 new destinations have been introduced by the faction content, and 1,238 distinct temporary live destinations remain. Each batch records the exact resolved, introduced and remaining paths in its report. No source link points to a missing fragment on an available local article.

The geography queue remains: King Gurgler's qualified population claim, Bonefields' Flats Lagoon town link, 84 empty galleries including Catun, and 15 links to 10 unregistered lore-book paths. Factions adds seven links across five unregistered book paths; two paths are new to that queue, giving 22 links across 12 distinct paths overall. Preserve these links pending book/alias/import reconciliation.

Red Sabres adds one empty imported Gallery. No additional body image files were referenced by these 96 imported Markdown articles. That does not establish complete media coverage: other original media remain unassessed, and existing artwork notices remain intact.

## Reproduction and handoff

- `node scripts/factions/intake.mjs verify-freeze <comparison-checkout> <pinned-source-and-build>` rechecks the roster and frozen evidence against pinned source blobs.
- `node scripts/factions/intake.mjs transfer <comparison-checkout> <pinned-source-and-build> <next-batch-name>` adds the next batch and activates available aliases.
- `npm run factions:accept` builds, tests, packages and captures the current checkpoint. The shared runner accumulates accepted IDs from all registered families.
- `node scripts/factions/gallery.mjs` creates the family review index from the accepted batch logs and captures.
- `npm run preview -- --host 127.0.0.1 --port 4392` serves the static build. Serve `reports/` on loopback port 4393 for the review gallery.

Normal builds read only checked-in FreshWiki content and evidence. The comparison checkout is an intake input. Per-URL edit targets come from the current file loader; provenance continues to use the original path at the recorded revision.

See [the next-family roster](../next-families.json) and [the technical-data investigation](../technical-data-investigation.md). Races follows this review, then Animals and Characters. The four deferred PR #43 guide edits remain in their existing ledger. The public restoration push, default-branch replacement and production cutover remain separate milestones.
