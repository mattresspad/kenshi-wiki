# Inherited bookmark restoration

This focused post-launch change restores 11 compatibility fragments on seven articles, covering all 14 recorded referring links. The exact mappings, original source revision, editable paths and affected occurrences are in [restoration.json](restoration.json). The accepted base is 646c28adad5b10395a2c685f38ff7da72a54aa4c; source evidence remains pinned to 83abc179fafa63b826d7f2662c4a18a134a9e6c1.

Each alias is declared through the existing Markdown bookmarks field. The current headings, original IDs, article bodies, other metadata, credits and categories stay unchanged. The generated decorative marker precedes the established heading. JavaScript focuses that heading for keyboard reading without rewriting the URL fragment; native fragment navigation remains available without JavaScript.

The preservation audit checks every declared alias for uniqueness, its empty decorative marker and its immediate target. It then compares the original content and IDs exactly with the frozen evidence, excluding only those verified additive markers. Undeclared IDs and changed headings, words, tables, facts, links or citations still fail preservation.

Only the eleven fragment findings listed in restoration.json receive resolution records. Their original source occurrences remain in the gap evidence; closure is navigation restoration, not gameplay verification or editorial approval. Other findings, previous resolution history and all editorial-review records remain unchanged.

Local acceptance covered the production build and source comparisons, targeted gap tests, and 27 browser checks: all direct aliases, every recorded link using the keyboard, desktop and phone in light and dark, repeated-fragment activation, malformed fragments, JavaScript-disabled navigation, and existing Holy Nation/Backpacks/final-corpus regressions. The required PR check additionally runs the full catalog and browser suites, focused local editing checks, Cloudflare package dry run and all-page package audit. Its downloadable artifacts retain the executed checks and failure diagnostics.

The resulting contributor queue has 721 open findings and 2,572 resolved findings. All 2,185 articles remain transferred and format-checked; 1,723 have editorial review recorded and 462 still await it. This branch is for PR review; it does not change production traffic.
