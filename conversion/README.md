# Conversion ledger

The current comparison is [83abc179](https://github.com/mattresspad/kenshi-wiki/commit/83abc179fafa63b826d7f2662c4a18a134a9e6c1). The first batch was frozen at [0c9b434](https://github.com/mattresspad/kenshi-wiki/tree/0c9b4348592605169315b6dd613dde1c220d1237). [Second batch and PR #43](second-batch.md). Reconcile public main again before the restoration push.

| Imported category | Public category | Membership decision |
|---|---|---|
| WIP (77), Wip (4) | WIP, /category/wip | Union of 81 distinct articles. The prototype output listed 4. |
| Traders Guild (18), Trader's Guild (1), Traders guild (1) | Traders Guild, /category/traders-guild | Union of 19. Samurai Rogue has two labels and appears once. Slave Market Master is retained. The prototype output listed 1. |
| Pages with non-numeric formatnum arguments | Excluded from reader navigation and the sitemap | The 51 affected articles stay in the inventory with their original category metadata. |
| Locations | /category/locations | All 273 members, in the A–Z index. |

The source records 2,184 articles, 202 original category names and 263 explicit redirects. After the mappings and exclusion, readers have 198 distinct categories and 4,119 distinct article memberships. An unrecognized category URL collision fails the build.

Home and the two article interiors use the approved independent design brief. [Catun’s section ledger](catun.md) includes the held King Gurgler question. The saddle guide preserves Prd’s original content, first commit, evidence and sample-art credit. Both articles retain their original public paths.

The build writes a human summary and a machine-readable per-URL ledger under reports. Pending rows keep their original paths and credits. The second batch covers The Holy Nation’s long outline and Backpacks’ tables. Preserve page-specific facts, qualifications, bookmarks, authorship and corrections as each article is accepted. Prd approves any intentional retirement.

The restoration milestone requires final dispositions for all public URLs, reconciliation with live changes, cleared temporary links, a software license decision and a reviewed candidate. Record the good production Worker and source revision before the separate archive, branch swap and cutover.

The frozen Holy Nation page has 38 article headings from History through References. The Backpacks page contains a 12-column table. These are now part of the browser and bookmark checks.

The [geography family](geography/README.md) records the intake order, source comparisons and review evidence.

## Article addresses and editorial homes

Each entry in [the registry](reference.json) has a permanent `id`, an explicit public `path`, and the `sourceFile` captured from the pinned Git tree. The initial keys were seeded once from the frozen article slugs. Keep the key when renaming the article, moving its file, or changing its public address. An intentional public address change also needs a redirect from its previous address. The inventory command updates source metadata against registered source files and fails on an unregistered addition or removal.

The Markdown frontmatter declares `articleId`. Astro keys its content cache by the physical filename and supplies the actual repo-relative file path. The site resolves the permanent ID from frontmatter so a byte-identical move changes the editor target on a warm build. The offline checks discover files from the same directory and verify the built editor targets. The route report records no editable file until an article is transferred. Titles, descriptions and reader-facing categories are editable in Markdown. Curated portals keep their own data outside the article folders.

Use one editorial home per article. Choose `locations/`, `characters/`, `factions/`, `creatures/`, `items/`, `buildings/`, `gameplay/`, `lore/`, `modding/`, or `reference/`. Use `reference/` while classification is uncertain. Create a subfolder when it helps an editor find related articles. Catun belongs in `locations/towns/`, The Holy Nation in `factions/`, Backpacks in `items/`, Blender plugins in `modding/tools/`, and the saddle guide in `modding/meitou/`. Reader categories can span any number of editorial homes.

### Edits, provenance and search

Local previews show a selectable repo-relative path and a Copy button on supported browsers. For a published branch, set `WIKI_EDIT_BRANCH` for the static build. The Modding portal points editors to its FreshWiki JSON and cites the prototype YAML separately. Category settings point to the category policy. Change the members of a category in the member articles.

Recorded Markdown uses the registered original file and its source revision. Source history follows that original file through the pinned comparison commit. Earlier evidence links, including the first batch’s older source pin, stay attached to the article. The registry retains the original Git commit, author credit, article license, and Fandom title and revision where applicable. Contributor-specific evidence and supplemental citations are kept alongside those fields. Each record with outbound references also keeps the external links found in the pinned Markdown, including links in HTML and Markdown reference syntax. These source links remain available in the route ledger before an article is transferred.

Navigation, corrections, search and sitemap generation use public addresses from the catalog. The title index at `/search-titles.json` contains public title/path pairs for the 2,184 articles, three portals, About Kenshi and Contributors. The header uses live search during this review. Categories continue to appear in the sitemap according to the reviewed local routes.

### Transfer and review

To transfer an article, select its registered ID, add one Markdown file in the appropriate home, and run the build and link checks. Transfer is detected from the file. Record a format check or an editorial review separately in [the review ledger](reviews.json), with its evidence. A file move carries no new editorial approval. Future batches should commit editorial rewrites independently of mechanical moves.

The Fandom importer omitted images. Record known gaps by article ID, section, source revision or evidence link, and verification status. Catun’s empty Gallery is awaiting comparison with Fandom revision 93167. Verify media coverage separately against credited source revisions.

Use `npm run inventory -- <comparison-checkout>` only to reconcile the checked-in source registry. A normal build and the catalog tests use the repository’s own data. Repeating inventory normalization against the same revision should leave the registry byte-identical.
