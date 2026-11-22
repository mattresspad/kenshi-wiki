# Kenshi Wiki

A community wiki for [Kenshi](https://lofigames.com/), built with static Astro and Cloudflare Workers Static Assets. FreshWiki is the independently written application on `main`. The original prototype is preserved, with its full history, under [archive/initial-prototype](https://github.com/mattresspad/kenshi-wiki/tree/archive/initial-prototype).

## Contributors and licenses

| Contributor | Work |
| --- | --- |
| [Prd (mattresspad)](https://github.com/mattresspad) | Founder, project lead and maintainer; design, navigation, deployment and editorial direction. |
| [teppuM](https://github.com/teppuM) | Editing, repeatable game testing, Blender guidance and Meitou code-mod documentation. |
| [VlcekM](https://github.com/VlcekM) | Original Astro prototype and editing; proposed RimWorld Wiki as that prototype's presentation model. |

The Fandom contributors and other authors retain the credit recorded on each article. See [Contributors](https://kenshi.wiki/contributors), [FreshWiki history](https://github.com/mattresspad/kenshi-wiki/commits/main/) and [the prototype history](https://github.com/mattresspad/kenshi-wiki/commits/archive/initial-prototype/). teppuM's [Skeleton Repair Bed/Robotics observations](https://github.com/mattresspad/kenshi-wiki/pull/8) and [code-mod hooks contribution](https://github.com/mattresspad/kenshi-wiki/pull/44) retain their original evidence and adaptation history.

Independent application code, styling, scripts, tests and configuration use [MIT](LICENSE). Original article text uses [CC BY-SA 4.0](public/notices/CC-BY-SA-4.0.txt); Fandom adaptations retain [CC BY-SA 3.0](public/notices/CC-BY-SA-3.0.txt). Read [licensing boundaries](LICENSING.md), [artwork notices](public/notices/artwork.txt) and [Copyright and permissions](https://kenshi.wiki/copyright-and-permissions). Permission information and private copyright concerns can be sent to [admin@kenshi.wiki](mailto:admin@kenshi.wiki). Fonts and dependencies keep their own terms. The archived prototype's Vector, MediaWiki and RimWorld credits remain historical and are not relicensed as MIT.

## Acknowledgements

[<img src=".github/assets/pindrop.png" alt="" width="20" height="20" align="middle"> PinDrop's Kenshi map](https://pindrop.gg/kenshi/map), built by [Yurii](https://pindrop.gg/about), connects locations with wiki articles. Thanks to Yurii for crediting the Kenshi Interactive Map and inviting players to contribute. The supplied README icon's scope is recorded in the artwork inventory.

## Contribute

[Suggest an article correction](https://github.com/mattresspad/kenshi-wiki/issues/new?template=article-correction.yml), [report a website issue](https://github.com/mattresspad/kenshi-wiki/issues/new?template=website.yml), or choose a task from [Pages needing work](https://kenshi.wiki/pages-needing-work). [CONTRIBUTING.md](CONTRIBUTING.md) walks through browser edits and local contributions. Follow the [code of conduct](CODE_OF_CONDUCT.md); use [private security reporting](SECURITY.md) for sensitive issues. Bring bulk imports and architectural proposals to Prd before implementation.

## Run locally

Use Node **24.22.2** from `.node-version` and the checked-in lockfile:

```sh
npm ci
npm exec -- playwright install chromium
npm run build
npm run preview -- --host 127.0.0.1 --port 4392
```

In another terminal, `npm run test:catalog` checks preservation and catalog behavior, `npm test` runs the browser suite, and `npm run package:check` validates the prebuilt Cloudflare package without uploading it. `WIKI_CHROME` can select a local Chromium executable. The preview uses Cloudflare's local asset router, including redirects and genuine 404s. `npm run review` captures the established layouts; generated reports remain local.

## Article and route review

Accepted articles live under `src/content/articles/`. Each declares a permanent ID; the checked-in registry records its canonical path and pinned source. Moving a file does not change its URL. Keep facts, qualifications, categories, heading bookmarks, source history and credits. Local previews show **Copy file path**; production packages use `WIKI_EDIT_BRANCH=main` for actual GitHub edit destinations.

Builds use checked-in evidence and need neither the comparison checkout nor previous reports. Registered navigation, search and sitemaps share canonical addresses. Pagefind 1.6.0 indexes rendered content; `/search-titles.json` retains its `[title, path]` interface. Unresolved destinations retain their intended addresses and receive a helpful genuine 404. Random eligibility is independent of editorial review. See [conversion conventions](conversion/README.md).

## Restoration readiness

Report transfer, format acceptance, editorial coverage and findings separately. Faithfully transferred and preservation-checked pages may be published while substantive review continues. [Pages needing work](https://kenshi.wiki/pages-needing-work) exposes the backlog without replacing imported categories.

Documented inherited gaps may remain for later work. Introduced conversion errors, unsupported resolutions, unaccounted routes and temporary prototype dependencies block readiness. MIT licensing, public candidate integration and the branch swap are complete. Production promotion still requires Prd's approval of the exact tested version.

## Release preparation

`npm run ci:check` selects proportionate checks from the actual PR diff; unknown and shared dependencies receive broader coverage. `npm run audit:check` retains the complete conversion audit. See [CI policy and measurements](docs/ci-policy.md). PRs trigger the stable required check; pushes do not duplicate the run. For a merged candidate, dispatch **FreshWiki validation** on `main` with mode `release` and its exact SHA, or set `WIKI_EXPECTED_SHA` and run `npm run release:check`. The rehearsal additionally compares repeated package checksums and captures desktop/phone previews. `npm run release:stage` accepts only an explicitly prepared, checked staging package. Neither merging a PR nor uploading an inactive version approves production traffic. See [release preparation and rollback](conversion/release/README.md) for current state and the separate approval boundary.
