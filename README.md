# kenshi.wiki

Community wiki for [Kenshi](https://lofigames.com/), built with [Astro](https://astro.build) as a static site.

## Contributors and licenses

[VlcekM](https://github.com/VlcekM) built the original Astro prototype and proposed RimWorld Wiki as the model for its presentation. Prd ([mattresspad](https://github.com/mattresspad)) founded and maintains Kenshi Wiki, added the ecosystem navigation, and set up the site’s Cloudflare deployment. The wiki’s theme, Outland, adapts the legacy Vector skin and styling from RimWorld Wiki.

The [Contributors page on staging](https://kenshi-wiki-staging.prds.workers.dev/contributors) gives the upstream credits, license texts, and editable skin sources. The [repository history](https://github.com/mattresspad/kenshi-wiki/commits/main/) records individual changes.

Original wiki article text is licensed under [CC BY-SA 4.0](public/notices/CC-BY-SA-4.0.txt); articles adapted from the Kenshi Fandom wiki stay under [CC BY-SA 3.0](public/notices/CC-BY-SA-3.0.txt) and credit their source. A general license for original project software is deferred. The [Vector license](public/notices/Vector-COPYING.txt), [MediaWiki notices](public/notices/MediaWiki-COPYING.txt), and [RimWorld Wiki policy](https://rimworldwiki.com/wiki/RimWorld_Wiki:Copyrights) apply to their respective materials. See the [artwork inventory](public/notices/artwork.txt) for per-file terms and outstanding questions before publishing Git history.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the build
```

Search uses a [Pagefind](https://pagefind.app) index. `npm run build` writes it to `dist/pagefind/`; `npm run dev` builds one in
memory from the articles and rebuilds it when one changes.
It indexes each page's `<main>`; pass `searchable={false}` to `WikiLayout` to leave a page out.

## Contributing

Contributions are made as pull requests on GitHub.

- Articles imported from the Kenshi Fandom wiki live in `src/content/wiki/` as Markdown, one file per page (CC BY-SA 3.0,
  credited on each page). `node scripts/import-fandom.mjs [title ...]` re-imports them; images are not imported.
- Page URLs are lowercase with hyphens (`/about-kenshi`), made by `pageSlug` in `src/lib/wiki.js`. On Cloudflare,
  `worker/index.js` redirects other spellings (`/About_Kenshi`) to them.
- `node scripts/split-ui-atlas.mjs <Kenshi>/data/gui` cuts the game's UI atlas into one PNG per icon in the gitignored
  `ui-icons/`. They are Lo-Fi Games' artwork: copy only the icons the site uses into `public/icons/` and list each one in
  `public/notices/artwork.txt`.
- `node scripts/game-items.mjs <Kenshi>/data [--icons <folder>]` lists every game item with its stats, string id and icon in the
  gitignored `game-items/items.json`, for writing item infoboxes. Icons come from the game's `data/icons` cache, which only holds
  items the install has shown; `--icons` takes the folder MeitouClient's `meitou-tools icons <folder>` draws every item's icon
  into. `node scripts/game-items.mjs --copy-icons` then copies each icon an article uses (`/icons/items/<string id>.png`) into
  `public/icons/items/`.
- `node scripts/item-infoboxes.mjs` rebuilds the infobox of every item article from `game-items/items.json` and removes the
  in-game stat card Fandom put above its text. Articles are paired with items in `scripts/item-pairs.json` (article path to
  string id; else an infobox's `String id` row). Weapon, armour and crossbow stats come from MeitouClient's
  `--wiki-export <folder>`, passed to `game-items.mjs` as `--meitou <folder>`. Re-run it after `import-fandom.mjs`, which
  replaces infoboxes.
- `node scripts/crafting-sections.mjs` writes each item article's Crafting section from `game-items/items.json`: what one item
  takes at each bench or refinery that makes it (from MeitouClient's export, `madeAt`) and the research or blueprint that
  unlocks it. It replaces Fandom's input tables and blueprint cards, keeps its other text and lists where Fandom's amounts
  differ from the game's. Re-run it after `import-fandom.mjs`.
- `node scripts/grade-tables.mjs` merges the stat cards Fandom lists once per armour grade into one table with a column per
  grade. Re-run it after `import-fandom.mjs` too.
- Pages live in `src/pages/`; `about-kenshi.astro` is an example article using every building block.
- Every page wraps its content in `src/layouts/WikiLayout.astro` (sidebar, header, footer, categories).
- Article building blocks live in `src/components/`: `Infobox`, `Toc`, `Gallery` and `Navbox`.
  Collapsed sections are plain `<details class="collapsible">`.
- Site-wide styles live in `src/styles/global.css`. Colors are theme tokens (`light-dark()`) defined at the top of that file;
  use them instead of raw colors so light and dark mode both work.

## Preview and release

Pull requests run the build, package dry run and browser checks. A merge to `main` (or a manual
**Wiki staging** run on main) uploads one version of the `kenshi-wiki` Worker. The upload includes
its static assets and redirect code. GitHub tests the unique version URL printed in the run
summary. The friendly `staging-kenshi-wiki.prds.workers.dev` alias follows the latest upload.

To release, open the successful run in **Actions → Wiki staging**, open its **version-specific**
preview link, then choose **Review deployments → production → Approve and deploy**. The production
job routes 100% of traffic to that version ID. A run for an older main commit stops before
switching traffic. The **Verify live wiki** job then runs the reader checks against production
in desktop Chromium on a virtual display and compares the pages with the approved preview.

If the live check fails, inspect its HTTP status and Cloudflare Ray ID. **Re-run failed jobs**
retries a failed verification after a successful promotion. For a fresh read-only check, choose
**Wiki staging → Run workflow** and enter the currently deployed version's immutable HTTPS URL
in **Verify live only**. The run skips building and routing traffic. Leave the input blank to
start a normal release. If the site itself is broken, the Worker's **Deployments** history can
restore the last known good version.

Keep a required reviewer on the GitHub `production` environment. The job waits for approval because
of that environment setting. Both Cloudflare steps use `CLOUDFLARE_ACCOUNT_ID` and the
`CLOUDFLARE_API_TOKEN` Actions secret. Enable Version URLs on the existing Worker and retain the
`kenshi.wiki` custom domain. The previous `kenshi-wiki-staging` Worker can be retired separately
after the first production release succeeds.

Use Node from `.node-version` to run the local checks:

```sh
npm ci
npm run build
npm run staging:dry-run
npm exec -- playwright install chromium
npm test
```
