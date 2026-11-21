# CI policy and measured coverage

The required `check-and-stage` job reports for every PR targeting main. There are no path filters or push runs. Selection uses the PR's base SHA and the tested merge tree; filenames are never supplied by a comment or issue.

## Three modes

| Mode | Invocation | Coverage |
| --- | --- | --- |
| Routine PR | `npm run ci:check` (set `WIKI_CI_BASE_SHA` locally) | Identity/registry checks and structural tests always. Content changes build once in published mode, check affected routes and inbound links, provenance, categories, search and sitemap, then run the affected family browser files and navigation checks. |
| Exhaustive conversion audit | `npm run audit:check`, or manual workflow mode `audit` | All catalog tests including historical format fixtures and warm-cache moves, complete source report and gap projection, all browser tests, focused local editing and Cloudflare dry run. PRs changing preservation machinery also select this. |
| Release rehearsal | Exact main SHA, manual workflow mode `release` or `WIKI_EXPECTED_SHA=â€¦ npm run release:check` | Full audit and browser coverage, local editing checks, repeated package hashes, all-page package audit and 32 desktop/phone captures. HTTPS acceptance remains a separate validation of the uploaded immutable version. |

The release runner retains the complete report once, on the published build. Local editing and the reproducibility rebuild render/search/package without rerunning the same source report. Package equality is still checked. No assertion in the existing conversion audits or family suites was removed.

## Impact rules and shared dependencies

- README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, LICENSING, and Markdown under docs: structural checks only. These are not site-rendering inputs.
- Registered article Markdown: permanent IDs determine families from frozen rosters, including overlaps. The family tests retain their source comparisons and phone/desktop behavior. Addressing and bookmark tests also run. Unknown article structures, deletions and moves fall back to the complete audit.
- Shared components, layouts, styles, navigation, search scripts, portal data and public assets: broad catalog/browser coverage and warm-cache/local editing checks. The local-only detailed gap-report browser test requires the exhaustive report and runs in audit/release modes.
- Scripts, schemas, source records, registry and gap data, dependency locks, test machinery, workflow changes or unclassified files: complete audit. Broad fallback is deliberate until a narrower dependency is demonstrated.
- New test files automatically join the exhaustive inventory. Adding or changing a test selects that entire inventory. No family assertion is discarded to make a particular PR green.

The current-state check parses rendered pages to find inbound links, then checks changed and referring pages. It rejects introduced broken destinations/fragments/assets and unsupported resolved link findings, while retaining recorded inherited gaps. It checks actual editable paths separately from original source/history (including PR #44's independent history revision). It does not claim an editorial review or a complete historical preservation audit.

Duplicate DOM IDs are emitted as diagnostics. Pre-existing `tools` (NPC Shopping Behavior) and `content` (Old World) ID collisions were exposed during implementation; article targets collide with shared frame IDs. This is separate website investigation work, not an inherited editorial finding or a content change in this PR.

## Evidence and approval controls

Each invocation writes its exact plan, reasons, paths, executed checks, phase logs and timing JSON under reports/ci or reports/release. A docs-only run does not claim browser or package coverage. Routine/audit diagnostics last 14 days; release evidence and the single packaged asset tree last 90 days. dist is not uploaded alongside the package. Contributor-index browser tests read the packaged assets, allowing immutable HTTPS tests from a downloaded release artifact without reconstructing dist.

PR jobs have read-only repository permissions and no deployment credentials. Explicit rehearsals verify the selected SHA. Neither mode uploads or promotes production. Staging tools remain restricted to the named staging Worker and exact trusted-main rehearsal. Production still requires approval for the exact validated version and promotes that existing artifact without rebuilding.

## Profiling

Baseline source: d8bd6e1def09007a28201b1a5fe25727c8614104, Node 24.22.2.

| Measured unchanged local phase (Windows) | Seconds |
| --- | ---: |
| Identity | 1.37 |
| Astro render | 17.70 |
| Pagefind | 12.35 |
| Package | 2.76 |
| Full frozen report | 67.02 |
| Catalog including warm-cache fixture | 30.95 |
| Warm-cache fixture within catalog | 29.41 |
| 32 release captures | 4.93 |

The previous routine PR run [44943932928](https://github.com/mattresspad/kenshi-wiki/actions/runs/44943932928) measured 432.56 seconds inside validation: local build 99.70, focused editing 10.19, published build 98.58, browser 207.89, catalog 45.14 and dry run 1.21. Catalog/browser/dry-run run concurrently, so phase times must not be added to estimate total. 250 browser tests passed, two skipped; six local editing and 66 catalog tests passed. Warm-cache work accounted for 42.79 seconds within that catalog phase.

That GitHub job took 493 seconds including setup. Dependency installation took 4 seconds, Chromium installation 34, artifact upload 3. Routine artifact size was 7,356,277 bytes. The exact-SHA release artifact was 57,775,111 bytes and stored packaged assets once. Windows component measurements and Ubuntu runner totals are distinct experiments; do not present their difference as a controlled speedup.

After measurements and the resulting PR check are recorded in the measured-results document. Selection tests cover documentation, content, shared rendering, preservation changes, moves/deletions, unknown dependencies and explicit audit/release modes. The policy PR itself takes the exhaustive path.
