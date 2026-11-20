# Books and Lore — local conversion

Frozen source: 83abc179fafa63b826d7f2662c4a18a134a9e6c1. Starting revision: daaab31.

62 distinct IDs: 49 additions and 13 reused articles. Books has 41 members; Lore has 23. Four checkpoints reach 2025, 2028, 2050 and 2071 HTML pages. Mechanical transfers, repeatable presentation changes and editorial findings are committed separately.

35 new captions and four reused Books captions become literal recordedItemText, rendered exactly once in the reading column. Item images, compact facts, body text and speaker signatures remain preserved. The original caption evidence contract compares text across both presentation locations; non-book captions are unchanged. Unsupported fact markup fails. Reused bodies and paths are checked independently.

Ludin’s Reports retains Prd’s original summary, authorship, CC BY-SA 4.0, original commit and historical transcription link. It is not a reconstructed transcription. Turkish History of Kenshi keeps its address, wording, headings and inherited citation defects; its article language is tr while site controls are English. Wanted Posters retains its nine bold-captioned tables without decorative separators or sorting.

Each new article is reviewed for existence, content and organization independently of transfer and formatting acceptance. Broken Cities’ outstanding review is included; other reused evidence is retained. Missing-book reconciliation preserves 19 destinations and 149 original occurrences. No synthetic articles, speculative aliases or gameplay corrections are introduced. Narrative testimony, exported data and observed behavior remain distinct.

Run node scripts/lore/continue.mjs 4 only after the source batches have been reviewed. Every acceptance includes build, catalog/browser suites, Cloudflare package dry run, captures and destination deltas. Ordinary builds use checked-in evidence. The comparison checkout is only used for intake and review.

Public restoration, software licensing, branch replacement, production and KDT integration remain separate milestones.

## Accepted local handoff

Four acceptance runs passed: 2,025 → 2,028 → 2,050 → 2,071 HTML pages. The final preview contains 2,034 articles, with Books (41) and Lore (23) membership intact. All 49 additions plus Broken Cities have individual review records; the other reused records remain intact. Earlier outstanding editorial reviews remain a separate 462-article backlog.

Each run includes production build, 49 catalog checks, the full browser suite and Cloudflare package dry run. The final browser run passed 185 tests; two desktop-only category-strip cases intentionally skip on phone. The first checkpoint also skipped four tests for not-yet-transferred structural examples. All four logs and 120 captures are in `reports/lore/`; no failed gate remains.

`node scripts/lore/normalize.mjs` checks literal source caption strings or pinned caption hashes, including unusual source control characters. It only moves the legacy field if needed and never repairs caption text. Two final passes checked all 39 passages and changed no article files. Gap regeneration and missing-book reconciliation are repeatable without changing curated notes or resolution history.

`node scripts/lore/finish.mjs` refreshes review coverage, repeatability proof, the route ledger and handoff. The final source-file audit accounts for 49 new files and four formatting-only changes; 1,981 earlier article files remain untouched. There are no introduced link, fragment or asset regressions. The final loopback smoke check covered 63 article, category and report URLs.

Relative to Events, 46 temporary destinations became local and two additional inherited destinations became visible, leaving 271. Fifteen investigation findings opened and 84 availability findings resolved; none of those closures verifies a gameplay claim. All 19 omitted books and 149 recorded occurrences remain open. The readable reconciliation is `reports/lore/missing-books.md`; JSON retains exact occurrences, pinned sources and alias/fragment investigation.

150 registered articles remain: Modding and mod projects (104), Manufacturers and historical remainder (30), Reference/unresolved remainder (16). Cross is already converted here. The four PR #43 guide updates remain explicitly deferred to Modding.

Local entry points: http://127.0.0.1:4392/category/books, http://127.0.0.1:4392/category/lore, http://127.0.0.1:4393/lore/ and http://127.0.0.1:4393/gaps/. Production remains unchanged.
