# Restoration gap register

The frozen comparison is 83abc179fafa63b826d7f2662c4a18a134a9e6c1. The source graph covers all 2,184 registered Markdown articles and 206 additional rendered category, portal and utility pages. It records exact internal links and fragments, repeated occurrences, unlinked missing-page labels, empty sections and referenced media. It is an audit baseline, not a claim that the original import was complete.

## Evidence and investigation

- source.json is extracted evidence: registered destinations, redirects, every source page's original file and revision, SHA-256 hashes, rendered IDs, link/media occurrences and empty sections. Only regeneration needs the comparison checkout; builds read checked-in data.
- register.json holds durable investigation notes. Findings are keyed by destination and exact fragment, or by media URL, missing-page label, empty section or curated claim. Shared targets retain every affected article and repeated literal occurrence.
- book-import-evidence.json preserves the earlier lore-book investigation's metadata, original revision links, extraction counts and checksums. It does not claim a new Fandom fetch or reproduce the books.
- The report joins occurrences to their source file and pinned revision. Exact source lines are recorded when a literal link occurs once; repeated links retain the precise rendered element ordinal and containing section. Do not pretend a guessed Markdown line is exact.
- Coverage is separate: automated scan, transfer, format acceptance, article existence/content/organization review and original-media comparison. Earlier transfers without editorial evidence remain outstanding.

The six classifications are pending conversion, omitted article, missing alias, incomplete import, genuinely absent material and unresolved. An unregistered address alone does not establish genuinely absent material. Check the registered names, redirect aliases, related headings and importer omissions first. The planning counts were candidates, not fixed acceptance totals.

Findings include origin, proposed resolution, evidence, uncertainty, priority, verification, status and post-cutover behavior. P1 is an actionable information/behavior contradiction or incomplete instruction; P2 is restoration/investigation; P3 is routine conversion. Uncertainty remains explicit. A completed article review may leave open findings.

## Regeneration and closure

Run npm run gaps:normalize, then npm run gaps:normalize -- --check. Regeneration merges new machine findings while retaining all curated fields and closed or manually added entries. Source extraction is a separate operation:

    node scripts/gaps/freeze.mjs verify <comparison-checkout> <pinned-reference-directory>

A build fails on an unregistered detected finding, introduced missing destination/media/bookmark, or unsupported resolved status. Route availability is closed only by output existence plus the normal catalog checks; copied media use the pinned SHA-256. Independently maintained text resources record their new and original hashes. A claim needs a method, evidence and reviewer before closure. Availability never establishes factual correctness.

Each accepted batch retains its route ledger, link delta and full joined gap report. The current searchable report is reports/gaps/index.html. It filters by family, priority, kind and status; all repeated occurrences remain in register.json. Closed findings remain visible with resolution evidence.

## Cutover contract

Pending conversions must become local destinations before restoration. An absolute kenshi.wiki URL will point at FreshWiki after cutover and is never a surviving prototype fallback.

An unresolved absent destination retains its intended wiki address and must return a genuine HTTP 404 with search and correction choices. The common error page is scheduled for the utility batch. An existing article with an unresolved fragment remains an HTTP 200 article request; add an alias only after identifying the intended section. Unlinked labels remain plain text until a destination is verified. Do not silently redirect unrelated titles or hide gaps.

The public milestone requires disposition of every route, complete existence/content/organization review for every inventoried article, no conversion regressions, reconciliation with upstream changes, removal of temporary live-site dependencies, a software license decision and staging/rollback review. Documented inherited gaps may remain for later PRs. Branch replacement and production cutover still require their separate approvals.

## Media and technical facts

Empty galleries are only one signal. The importer omitted images; the Markdown inventory cannot prove complete media coverage. All original source-media comparisons remain unassessed until individually documented. Linked media availability and image attribution do not imply permission has changed.

KDT's broader export capabilities remain a separate research backlog. Before accepting a technical correction, record exact FCS IDs, game/mod versions, export checksums, transformations, defaults and semantic qualifications. Label exported values, derived interpretations and observed game behavior separately. Races conversion neither integrates KDT/KDC nor chooses a delivery architecture.
