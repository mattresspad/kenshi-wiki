# Crafting and Technology conversion

Source: 83abc179fafa63b826d7f2662c4a18a134a9e6c1. Local baseline: 372b9d3 on rebuild/restoration.

The two rosters remain independent. Crafting / Construction has two articles in gameplay/guides/. Technology has 134 category members in gameplay/technology/. Every file retains its permanent ID, registered public address, original categories, source history, license and correction address. Eight Robot Limbs research deferrals are included in Technology.

Technology uses five pilots, three structural examples and six title-ordered batches of 21. The workflow commits unrewritten Markdown transfers separately from presentation/review changes. Source fingerprints cover 657 headings, 69 redirect targets, text, tables, links and facts across both families. There are no citation targets or referenced images in these imported bodies; original media coverage is unassessed.

Research panels preserve list items, plain labels, breaks and links. Two-column research tables gain semantic property headers without changing cells or order. Imported version notices stay before descriptions. No sorting, inferred prerequisite links, blueprint availability, formula corrections or gameplay verification are introduced. Unsupported typed fact markup fails extraction.

## Reproduction

Run from the site directory with Node and installed dependencies:

- node scripts/conversion/audit-family.mjs FAMILY BATCH — inspect the pinned narrative, headings and table inventory. This intake step uses the extracted frozen comparison.
- node scripts/conversion/run-family-batch.mjs FAMILY BATCH — transfer the next frozen batch, commit mechanical changes, record its individual reviews, build, run catalog/full browser checks and Cloudflare package dry run, capture both widths/palettes, record availability resolutions, then commit acceptance.
- npm run build, npm run test:catalog, npm test and npm run package:check use checked-in FreshWiki data only.
- npm run gaps:normalize must leave a second normalization unchanged; investigation notes and resolution history are retained.
- node scripts/conversion/handoff-research.mjs creates the final gallery, per-batch results, exceptions and counts after all acceptances.

Article reviews live in each family's review.json and the central reviews.json. Transfer, formatting acceptance and editorial review remain separate. A content review can retain unresolved claims. Restoring a route does not verify its gameplay statements. Gap findings include exact pinned occurrences; Tech Tree's missing credited diagram, conflicting Robotics duration, legacy construction/weapon tiers and the save/reload turret claim remain sourcing work.

## Following scope

../following-shops.json freezes the union of Town Residents, Traders and Vendors: 152 IDs, 125 pending and 27 reused. It contains two Modding-category tutorials that require an explicit editorial-home decision when that batch is planned. No following-family transfers are included. ../later-work.md holds design and technical ideas outside these conversion batches.

All previews remain local. Public restoration, licensing, branch replacement, production approval and technical-data integration are separate milestones.

The first pilot browser attempt exposed a test selector that assumed Steel Bars research was already local. The test now recognizes both its pending absolute URL and subsequent local URL; failed-attempt logs are retained beside the passing rerun. No source link was changed to satisfy the test.

The first larger research batch encountered Chromium ERR_NETWORK_CHANGED on a loopback building navigation (139 other browser checks passed). Its failed log is retained and the full suite is rerun without weakening that test. Screenshot review also prompted scoped inline quote-credit links and wrapping two-column research properties.
