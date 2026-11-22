# CI measurements

Raw plans, executed phases, counts and source SHAs are in [ci-measurements.json](ci-measurements.json). The selection rules are in [ci-policy.md](ci-policy.md).

## Successful local scenarios

| Scenario | Total seconds | Catalog passed | Published browser passed / skipped | Local editing passed |
| --- | ---: | ---: | ---: | ---: |
| Documentation only | 3.22 | 19 | 0 / 0 | 0 |
| Catun content only | 64.14 | 19 | 14 / 0 | 0 |
| Shared frame CSS | 374.26 | 73 | 249 / 2 | 6 |
| Complete audit implementation checkpoint | 373.94 | 72 | 250 / 2 | 6 |

Documentation retained identity/schema-independent structural checks and did not build or start Chromium. Catun built once, checked 43 affected/referring pages and three category indexes, and ran addressing, bookmark and geography browser tests. The shared change retained broad presentation, warm-cache and local-edit coverage without the exhaustive report.

The complete-audit measurement precedes the extra duplicate-ID guard and the report assertion split; the final exhaustive inventory includes both. Those follow-up checks passed, and the PR required check runs the full final inventory.

## Before and after

The old routine ran two full builds, each including the source report. The unchanged local build measured 101.20 seconds, of which 67.02 were the report. The new content case runs one static build and targeted current-state checks; docs run neither build nor browser. Broad changes deliberately remain expensive. The shared sample and full-audit sample had almost equal total time because browser/fixture timings varied; this is not evidence that source auditing is free.

Prior GitHub run 44943932928: 432.56 seconds of validation, 493 seconds including setup, 7,356,277-byte artifact, three seconds of artifact upload. Its release counterpart stored a 57,775,111-byte artifact. Compare the new PR check on GitHub alongside these records; do not equate Windows timings with Ubuntu runner timings.

Release retains a single complete source report, repeated package equality, the all-page package audit and the 32-capture matrix. Capture time on the unchanged local baseline was 4.93 seconds; the warm-cache fixture was 29.41 seconds inside the 30.95-second catalog phase. Both remain in their applicable modes. The new release path has not been used to replace the existing production candidate.

## Retained failed experiment

The first shared-layout trial passed 249 browser tests (two intentional skips) but failed a catalog assertion because reports/routes.json was absent. The full assertion group moved unchanged to the explicit audit suite. The second shared trial passed. The first log remains in the local benchmark evidence; it is not counted as a successful run. A separate targeted utility test invocation initially omitted the published-edit environment; rerunning with WIKI_RELEASE_TARGET=production and WIKI_EDIT_BRANCH=main passed all eleven targeted tests.

No runtime code, article prose, gap resolution or production deployment changes are included. Existing source assertions remain in the complete audit/release path. The CI-known site collision records stay open, separately from inherited editorial findings.
