# Kenshi Wiki restoration

The local Astro worktree rebuilds the reader experience from the approved FreshWiki design. Prd (mattresspad) leads the project and maintains the wiki. Article corrections and credited pull requests are welcome. Discuss bulk imports or architectural proposals with Prd before implementation.

## Run locally

Use Node 24 and npm. Run `npm ci`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4392`. `npm run test:catalog` checks the frozen taxonomy. `npm test` runs the browser suite. Set `WIKI_CHROME` to a local Chromium executable or install Playwright Chromium. `npm run package:check` validates the prebuilt assets-only Cloudflare package.

The preview serves the packaged assets through Cloudflare’s local asset router, including the published Holy Nation aliases. With the loopback preview running, use `npm run review` to check both palettes at all three viewport sizes. Open `reports/index.html` for the full-size screenshots, per-URL ledger, and browser measurements.

## Article and route review

Edit accepted pages in `src/content/articles`. The title, description, categories, credit and source revision belong with their Markdown. Article headings supply the sidebar. Keep stable heading IDs and add aliases when moving a section. Sources and corrections link to the recorded history and current public contribution flow.

Each article declares its permanent ID. The checked-in conversion inventory records its public path, original Git file, revision and credits. In a local preview, Copy file path shows its actual FreshWiki file. Set `WIKI_EDIT_BRANCH` to the published rebuild branch when generating GitHub edit links. To reproduce it from a repository containing that revision, run `npm run inventory -- <repository>`. Builds read the snapshot offline. Reader links open a reviewed article locally or its live wiki page during the local rollout. The public milestone requires clearing temporary links. See [the conversion ledger](conversion/README.md).

## Credits

Article provenance is recorded per page. Fandom adaptations retain CC BY-SA 3.0 credit and original wiki writing retains CC BY-SA 4.0 credit. See [artwork notices](public/notices/artwork.txt) for graphics and the ribbon font. Package versions and their upstream identities are recorded in the npm lockfile. Prd’s choice of software license is pending before the first public rebuild push.
