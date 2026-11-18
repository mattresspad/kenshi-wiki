# Characters local restoration

Frozen source: 83abc179fafa63b826d7f2662c4a18a134a9e6c1. Starting rebuild: 355889e. Branch: rebuild/restoration.

## Scope and identity

The frozen roster has 504 Characters-category IDs: 461 new articles, 42 already-reviewed animals and World States. Animals keep their creatures/animals homes; World States keeps gameplay/world-states.md. New articles have one home under characters/. The final local preview has 1,021 articles and 1,033 HTML pages. The category, registered canonical paths, search index, sitemap, redirects and links all use the permanent registry.

The four pilots are Beep, Armour King, Emperor Tengu and Samurai. Recruitment indexes, Drifter/stock/creature structures and removed Crow Face follow. Remaining articles use the requested Playable, Traders, Bosses/Superbosses/Nobles/Leaders precedence, then other NPCs, in frozen title order. Twenty-three batches range from structural pilots to 20–25 siblings. acceptances.json and link-changes.json retain each boundary and its evidence.

## Preservation and presentation

Each new Markdown body comes from its registered source path and verified pinned Git blob. Mechanical article/icon transfers are committed separately from formatting, editorial notes and acceptance metadata. No article URL is derived from its editorial filename. Attribution, license, original history, evidence and FreshWiki edit targets remain distinct.

The frozen comparison covers all 1,508 heading bookmarks, 175 citation targets, text, table cells/spans, numerical values and units, sort values, links, facts and referenced images. All 83 body item icons have pinned SHA-256 checksums: eight existed at the starting revision and 75 are restored. This does not establish portrait or gallery coverage. media-coverage.json records every newly transferred article, its original-source reference, unassessed portrait coverage and known empty galleries independently of its verified body icons. Fourteen additional frozen redirects are activated; the 16 family redirects include the two earlier animal aliases.

Statistics panels wrap on desktop and stack on phones. The 156 articles with ambiguous race associations retain original group order and values, numbered group labels and an explicit qualification. No race labels are inferred from adjacent lists. Skeleton Bandit, Upgraded Skeleton Bandit and Upgraded Skeleton Guard retain the original crossed-out Skeleton label followed by Human, including both links. Randomization notes remain beside the statistics. Negative ranges and source formula interpretations remain unchanged.

Unique Recruits retains all 44 entries and five information columns. Its inert Fandom checkbox column is removed by an idempotent renderer cleanup; original checkbox IDs remain as invisible bookmark targets. No tracking feature is introduced. Raw source Markdown retains the original material, and review.json records the presentation decision separately.

Fish and Drugs Seller retains its keyboard-operated stock disclosure; Alpha Gurgler retains creature anatomy/death-item tables; Crow Face’s historical notice precedes its description. Wide tables have their own scroll area. Equipment rows sharing a manufacturer cell retain source order instead of offering an invalid sort; independent item rows sort by the name beside their icons. A newly discovered long-category header overflow on Big Darkbrow was fixed by allowing its category strip to scroll without squeezing the search field outside the frame.

## Review and gaps

review.json contains 462 new individual existence/content/organization reviews, including World States. The 42 animal members retain their earlier review evidence. Transfer, format acceptance and editorial review remain separate. Review completion does not mean gameplay claims have been independently verified.

questions.json records targeted follow-ups alongside shared statistics, recruitment, equipment, stock and world-state questions. Examples include lost race associations, negative/randomized bounds, prisoner-import version discrepancies, Bo’s knockout predicates, robot recruitment cooldowns, speculative population estimates, sparse Rebirth Slave content, casino probability instructions, unloaded NPC AI and the incorrect 64-bit hexadecimal explanation. Imported lore and intent interpretations remain qualified. Claims are not closed merely because their destinations become available.

Original-source gap occurrences, prior investigation notes, media findings and resolution history survive regeneration. Catun/Fishmen, Bonefields, Grayflayers, missing lore books and earlier empty galleries remain tracked. Every batch records temporary destinations resolved, newly exposed and still pending. After production cutover, absolute kenshi.wiki links will reach the replacement; they are not a surviving old-site fallback.

## Reproduction

Normal build inputs are checked into FreshWiki and do not depend on the comparison checkout. Intake and audit extraction alone use the frozen reference:

- node scripts/characters/intake.mjs verify-freeze <comparison checkout> reports/geography-work/reference-83abc179
- node scripts/characters/audit.mjs <frozen batch> — extract the source review for inspection.
- node scripts/characters/run-batch.mjs <next frozen batch> — guarded sequential transfer, review recording, acceptance and separate local commits. Do not run it for an already transferred batch.
- npm run characters:accept — rebuild and accept the current transferred boundary, including after fixing a failed gate.
- node scripts/characters/review.mjs --complete — require all 461 new reviews plus World States.
- node scripts/gaps/register.mjs — deterministic normalization preserving curated findings.
- node scripts/gaps/record-resolutions.mjs characters — append accepted closure evidence without replacing old records.
- node scripts/characters/handoff.mjs — generate batch gap deltas, review gallery and next-family assessment after final acceptance.

Each acceptance runs the production build, catalog suite, Playwright suite and Cloudflare prebuilt package dry run. It compares frozen content and route metadata; checks every incoming page for desktop/phone overflow; saves representative 1440×900 and 390×844 light/dark captures; and retains logs, route/gap snapshots and link deltas. The browser suite keeps Holy Nation citations, Backpacks sorting through Dodge, Animals journeys, ribbon font fallbacks and warm-cache edit-path checks active.

The review gallery links the full evidence for every batch. Source conclusions remain separate from restored availability and observed UI behavior.

## After review

The next proposal is Items and equipment, starting with Katana, Samurai Armour, Small Backpack, Economy Arm (left) and Basic First Aid Kit. next-family-assessment.json gives a deduplicated candidate union and nonadditive category counts. Freeze the final roster and distinguish Technology/book/map supporting records before transfer. Backpacks is already available and remains a regression reference.

Public restoration, software licensing, branch replacement, production cutover and KDT/KDC integration retain their separate milestones. Nothing in this local handoff publishes or switches the live wiki.

Final screenshot review identified 764 blank leading equipment/stock table cells across 105 articles. empty-equipment-cells.json records their source checksums and linked labels; media:character-empty-equipment-cells keeps the original-image question open in the gap register. A blank cell alone does not prove an image is missing. final-review.json records this post-acceptance metadata finding; rendered content is unchanged. Reproduce the extraction with node scripts/characters/media-review.mjs against the pinned local extraction.
