# Gameplay, Skills and player guides — local conversion

Source: `83abc179fafa63b826d7f2662c4a18a134a9e6c1`. Starting restoration revision: `c47d746`.

## Scope and identities

`roster.json` freezes 90 IDs: 69 new articles and 21 existing files. New editorial homes are 27 `gameplay/skills/`, seven `gameplay/interfaces/`, 12 `gameplay/mechanics/` and 23 `gameplay/guides/`. Source suffixes are preserved, including `damage/limb-data`. Public paths and permanent IDs come from the common article inventory, independently of those editable file locations.

Six indexes retain their complete memberships: Statistics 35, Combat 5, User Interfaces 10, World Data 12, Strategies 3 and Guides 46. Some members belong to later families; their registered destinations remain explicit. Gameplay and Guides use their pinned YAML wording and article-ID references. Their editable files are `src/data/gameplay.json` and `src/data/guides.json`; historical links continue to the original `src/data/portals/*.yaml` at the source revision. Modding retains the shared portal behavior.

The seven acceptance checkpoints contain 1,875 / 1,878 / 1,882 / 1,885 / 1,909 / 1,925 / 1,941 HTML pages. The final checkpoint has 1,907 articles. `acceptances.json`, `link-changes.json` and the per-batch reports record actual results rather than inferred completion.

## Preservation and presentation

- Mechanical article transfers have separate commits. Source bodies are unchanged; presentation is normalized in the shared renderer.
- Recognize only the imported five-row skill summary with its expected merged cells. Reassemble affected statistics and training methods into labeled fields, with the description/physical effects and skill-group link retained. Unknown structures throw. Catalog examples and browser checks compare original cells, labels and links independently.
- Move consecutive all-header rows into a semantic table head, retaining captions, row order, blank cells, spans, sort values and all data. Statistics keeps all 35 rows, 11 columns and three header rows; its grouped structure is not sorted.
- Sorting is limited to source-marked, rectangular, unmerged comparisons. Existing unsortable-column flags remain. Anatomy, grouped comparisons and malformed tables retain order. Wide tables scroll within a labeled keyboard-focusable region.
- Formula passages retain their text and TeX remnants and wrap inside the reading area. No formula correction or mathematics dependency is introduced.
- Preserve 475 heading bookmarks, 30 citation targets and 23 additional redirects. The frozen roster also references 11 redirects already active before this family.
- `assets.json` verifies all 41 referenced item images against pinned checksums and the artwork notices. No new images are copied. These checks do not establish UI screenshot, portrait, map-icon or complete media coverage.

`reference.json` fingerprints the normalized frozen presentation; `raw-reference.json` retains the independent pre-normalization fingerprints. `normalization.json` records each article's recognized panels, tables, sortable comparisons and formula passages. The normalized text/table/link fingerprints equal the raw ones except where skill cells are deliberately reordered; cell-level checks cover that change. Repeat normalization is unchanged.

## Review and unresolved content

Transfer, formatting acceptance and editorial review remain independent in `conversion/reviews.json`. Every addition receives an existence/content/organization review in `review.json`. Guide to Faction Relations, Hostile Factions, Pacifiers and Town Overrides complete outstanding reviews. The other 17 reused files keep their prior evidence; all 21 reused Markdown files remain unchanged.

`questions.json` supplies pinned, line-level occurrences to the corpus-wide register. Findings cover formulas and missing expressions; blank racial modifiers; movement, damage, healing and recruitment thresholds; job priority; shopping budgets; farming arithmetic; save/import behavior; incomplete guide/UI material; and contradictions between articles. Jobs retains teppuM's narrow Kenshi 1.0.68 evidence and contributor links. Imported claims remain qualified. Availability restoration does not close technical or gameplay-verification findings.

Notable unresolved comparisons include town-override effects on owned buildings, Martial Arts strength requirements, encumbrance penalties, duststorm perception modifiers and the recruitment-stat threshold. The outpost guide adds a Fishman Island occurrence to the existing King Gurgler investigation without treating it as evidence for Catun's separate takeover.

## Remaining inventory

`../remaining-after-shops.json` accounts for every one of the 346 pending IDs at the starting revision: this family 69, Events 78, Books/lore 49, Modding/projects 104, Manufacturers/historical 30, Reference/unresolved 16. Completing this family leaves 277. The 16 uncertain entries are individually recorded; classification grants no permission to retire their routes. The four deferred PR #43 guide edits remain in the Modding backlog.

An absolute `kenshi.wiki` URL will reach the replacement after cutover. It is not a permanent old-site fallback. Outstanding articles, links, fragments and media retain their registered disposition and gap evidence. Ordinary builds use checked-in source evidence and transferred content without the comparison checkout.

## Reproduction and acceptance

Use `node scripts/gameplay/continue.mjs 7` to resume at the next unaccepted checkpoint after its source review. Do not rerun one-time intake. Each checkpoint runs `npm run build`, `npm run test:catalog`, the full `npm test` browser suite and `npm run package:check` (Cloudflare package dry run only), then captures representative desktop/phone views in both palettes. Failed attempts are retained beside successful logs.

The browser suite covers portal journeys, exact destinations, Jobs citation returns, deep guide outlines and drawer focus, Statistics' Soldierbot column, Science's Needed for column, food calculations and numeric shopping sorting. Existing family, ribbon/font and warm-cache edit-path tests remain active. Every incoming page receives desktop and phone overflow/canonical checks; representative captures use 1440 × 900 and 390 × 844.

`node scripts/gameplay/handoff.mjs` verifies all seven acceptances, unchanged reused files, final totals and reviews, then publishes the local report gallery and remaining-inventory assessment. Preview: `http://127.0.0.1:4392/`. Reports: `http://127.0.0.1:4393/gameplay/`; corpus gaps: `/gaps/` on the report server.

This milestone is local review. KDT-backed validation, public restoration, software licensing, branch replacement and production cutover remain separately approved work.
