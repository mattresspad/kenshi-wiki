# Categories and utilities restoration

The immutable source remains 83abc179. The frozen category roster records exact baseline membership separately from PR #44. Four checkpoints restore the pilot indexes, remaining indexes, source pages, and search/random/404 functionality. Each checkpoint runs the production build, catalog and browser suites, and Cloudflare package dry run.

These are local functionality acceptances. Article transfer, format acceptance, editorial coverage and open findings remain independent. Category availability does not verify article claims. The existing alias/exclusion policy and all source evidence remain intact.

## Utility source and routing records

About Kenshi and Contributors live in `src/content/site/`, keyed by `pageId`. Astro supplies the actual editable file; recorded source/history links use the original Astro file at 83abc179. `sources.json` records seven image checksums, the visual caption review, source bookmarks and official claim checks. `gap-findings.json` retains unresolved utility questions independently of article identities.

`utility-routes.mjs` defines active paths, historical source redirects, reserved search assets and sitemap exclusions. The 263 frozen aliases, nine existing Holy Nation compatibility aliases and two external historical source endpoints remain distinct. Query strings and browser fragments survive the applicable redirects. `/sources/outland.css.txt` and `/sources/wiki-header.css.txt` lead to immutable prototype files; they are not active rebuild CSS.

## Search and recovery

Pagefind 1.6.0 indexes explicit canonical candidates after Astro and before Cloudflare packaging. Articles, three portals, About Kenshi, Contributors and only the maintenance landing introduction are indexed. Navigation, source controls, maintenance entries/history and category listings are excluded. A shared English-controls index retains Turkish text; Turkish stemming is not claimed. Pagefind may provide approximate matches; quoted phrases can narrow a query.

Eight title suggestions support arrow keys, Enter and Escape. Search results use groups of 20; `fulltext=1` bypasses the normalized exact-title shortcut. Load failures expose a retry and ordinary browsing links. Request sequence checks prevent stale results from replacing a newer search.

Random navigation replaces its own history entry and excludes Removed Content and Candidates for deletion. Search/random are canonical but noindex; the error page is noindex without a canonical. Cloudflare's static asset `404-page` behavior returns real GET/HEAD 404 responses for absent root and nested paths. Existing pages with missing bookmarks remain article responses.

MIT licensing is recorded in LICENSE and LICENSING.md. Public publication, staging/rollback, branch replacement and production approval remain separate milestones. No new substantive editorial sign-off is inferred from restored utility availability.
