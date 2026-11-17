# Races local handoff — 17 November 2026

The local rebuild now serves 525 HTML pages: 515 transferred and format-checked articles, eight category indexes, Home and the Modding portal. The 32 Races-category members and separate Races overview are complete for this batch. All 362 original race headings and 136 citation targets are retained. /hiver is active; /skeleton, /skeleton-race and /shek/health remain distinct.

## Review links

- Preview: http://127.0.0.1:4392/category/races
- Comparison table: http://127.0.0.1:4392/races
- Anatomy/property example: http://127.0.0.1:4392/greenlander#anatomy
- Nested health page: http://127.0.0.1:4392/shek/health
- Modding instructions: http://127.0.0.1:4392/how-to-make-a-new-race
- Fifty desktop/phone, light/dark captures and acceptance logs: http://127.0.0.1:4393/races/
- Searchable gap register: http://127.0.0.1:4393/gaps/
- Route ledger: http://127.0.0.1:4393/route-report.md

The servers are loopback only. Reports and screenshots are local artifacts; checked-in acceptance manifests, frozen evidence, article reviews and investigation notes reproduce their inputs.

## Accepted batches

| Batch | Incoming articles | HTML pages | Temporary destinations resolved | Newly encountered | Remaining |
|---|---:|---:|---:|---:|---:|
| Pilots | 3 | 495 | 3 | 29 | 1,264 |
| Structural examples | 3 | 498 | 3 | 15 | 1,276 |
| First remaining group | 14 | 512 | 14 | 4 | 1,266 |
| Final group | 13 | 525 | 13 | 3 | 1,256 |

Every batch passed the production build, catalog suite, browser suite and Cloudflare package dry run. The final suite had 15 catalog tests and 61 browser tests. The retained regressions include Holy Nation citations/deep outlines, Backpacks sorting and phone scrolling, loaded/blocked fonts, exact category membership, canonical/search/sitemap agreement and warm-cache edit paths. The final metadata follow-up also passed all 15 catalog checks.

The overview test found and fixed a shared formatter overwriting explicit grouped column scopes. A full article-preparation regression now covers it. The phone gap-filter test found and fixed an oversized family selector. Both issues are fixed in the accepted result.

No wiki article prose or numerical values were substantively rewritten. Mechanical article transfers and editorial review records have separate local commits.

## Gap baseline and remaining review

The baseline audits 2,184 Markdown articles and 206 additional rendered pages. It records 34 unregistered destinations, 11 distinct missing-fragment targets (14 references), 85 unlinked missing-page labels (179 occurrences), 335 empty-section candidates including 107 galleries, and 426 media/resource targets. These are scoped findings, not completeness claims or fixed acceptance targets.

Nineteen missing book destinations have evidence of importer exclusion; verified aliases have not been invented to hide them. Potential fragment aliases are documented against exact pinned headings and remain open until their destination batches restore and test them. Grayflayers' unlinked HQ label, Catun's King Gurgler qualification and Bonefields' town-vs-zone link remain open.

The shared register contains 3,141 grouped records, including routine route/media conversion tracking. There are 580 automatically observed closures with retained evidence and 2,561 open records. Fifty inherited broken-link occurrences are visible on current pages. No introduced destination, fragment or media regression was accepted.

All 33 race articles have recorded existence/content/organization reviews. Together with the earlier eight reviews, 41 of 2,184 are recorded; 2,143 still need that review before the public restoration milestone. Transfer or automated preservation does not stand in for editorial review. Original-media comparison remains unassessed.

The race walk registered 24 shared questions, including:
- Missing Southern Worker speed values and overview comparison cells.
- Hive's unfinished alliance sentence and overbroad toughness claim.
- Unexplained hit weights, defaults, movement units and healing calculations.
- No-Head vision compared with Screamer MkI, and injury-derived penalty claims.
- Save/reload workarounds, recruitment probabilities and population estimates.
- The FCS tutorial's unversioned toolchain, export assumptions, mask syntax and incomplete fresh-install handoff test.

The source's wording and qualifications remain available while these questions await evidence. Recorded review is not a claim that imported gameplay facts have been verified.

Two successive regenerations left extracted evidence, curated notes and accepted resolution history byte-identical. The frozen corpus and race evidence also regenerated identically against 83abc179. Ordinary builds and the warm-build fixture use checked-in FreshWiki data.

## Milestone boundaries

An absolute kenshi.wiki link will resolve to FreshWiki after cutover, not to the prototype. Registered pending pages need local conversion. Unresolved absent destinations retain their intended address and need a real 404 with search/correction options in the utility batch. Missing bookmarks on existing pages remain separate HTTP 200 article requests.

KDT's broader exports and KDC/index choices remain research, with no integration or delivery-architecture commitment in this batch. Future factual corrections need exact record IDs, game/mod versions, checksums, transformations and clear distinctions between exported values, interpretations and observed behavior.

This handoff is local review. Software licensing, all-route disposition, earlier article reviews, upstream reconciliation and staging/rollback review remain public-restoration prerequisites. Public push, branch replacement and production cutover retain their separate approvals.
