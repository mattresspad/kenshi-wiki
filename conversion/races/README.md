# Races conversion

Source: 83abc179fafa63b826d7f2662c4a18a134a9e6c1. Local starting point: 615b877 on rebuild/restoration.

The roster freezes 32 Races-category members separately from the Races overview. Batches contain 3, 3, 14 and 13 articles. Their accepted page totals are 495, 498, 512 and 525. The original 362 headings and 136 citation targets are checked across all 33 pages. /skeleton remains the overview, /skeleton-race the specific subrace, /shek/health the health subpage, and /hiver redirects to /hive when available.

## Content and presentation

The mechanical transfer preserves source prose, numbers, ranges, units, quotations, restrictions, citations and links. Registered IDs, source pins, credit and licensing resolve through the common inventory. The tutorial's editorial home is modding/guides; the other pages live in creatures/races. No URL is derived from either home.

Anatomy tables gain semantic row/column headers. Severed-limb panels retain captions and properties. The overview's comparison matrix retains its original order, row/column spans and empty cells, with grouped headers and a local horizontal scroll region. Layout-only list tables become lists; no content is discarded or sorting imposed on the grouped matrix.

review.json records the existence, content and organization walk for each article. Open technical questions are joined to the gap register using the named claim IDs. A completed editorial review means the import has been read and assessed; it does not certify the old prose or an untested formula. The source's claims and qualifications remain intact pending evidence.

Notable follow-ups include the unfinished Hive sentence, Southern Worker speed blanks, missing overview values, the No-Head vision comparison, healing and reload claims, demographic estimates, and the new-race tutorial's unversioned export/packaging instructions. Removed Whistler content stays distinguished from playable fan mods. Empty sections and source missing-page labels are separately retained in the corpus register.

No body image references were present in the frozen race Markdown/HTML. This does not establish complete original-media coverage; the importer omitted artwork and all original-media comparisons remain unassessed.

## Verification

The acceptance runner builds once per batch, runs catalog tests (including a warm-cache file move and independent URL change), the browser suite and Cloudflare package dry run, then saves the route ledger, full gap report, link delta and desktop/phone captures in both palettes.

Browser coverage includes anatomy headings/properties, outline focus and drawer dismissal, every original fragment/citation target, the overview's final column by keyboard and touch, and the Hive redirect. Prior Holy Nation, Backpacks, ribbon/font and address-mapping regressions remain active.

Use:

    node scripts/races/intake.mjs verify-freeze <comparison-checkout> <pinned-reference-directory>
    node scripts/races/intake.mjs transfer <comparison-checkout> <pinned-reference-directory> <batch-name>
    npm run races:accept

Only source regeneration/intake needs the comparison checkout. Ordinary builds and tests read checked-in evidence. Acceptance logs and screenshots remain local review artifacts. Public restoration, branch replacement and production cutover are separate approval milestones.
