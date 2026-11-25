# Kenshi Wiki

A community wiki for [Kenshi](https://lofigames.com/), built with static Astro and Cloudflare Workers Static Assets. FreshWiki is the independently written application on `main`. The original prototype is preserved, with its full history, under [archive/initial-prototype](https://github.com/mattresspad/kenshi-wiki/tree/archive/initial-prototype).

## Contributors and licenses

<!-- Add up to four contributors per table row, then start another row. -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/mattresspad"><img src="https://avatars.githubusercontent.com/u/138346001?s=72" width="36" height="36" alt=""><br><strong>Prd</strong></a><br><sub>Project lead · Design · Deployment</sub></td>
    <td align="center"><a href="https://github.com/teppuM"><img src="https://avatars.githubusercontent.com/u/74569890?s=72" width="36" height="36" alt=""><br><strong>teppuM</strong></a><br><sub>Editing · Game testing · Guides</sub></td>
    <td align="center"><a href="https://github.com/VlcekM"><img src="https://avatars.githubusercontent.com/u/84700611?s=72" width="36" height="36" alt=""><br><strong>VlcekM</strong></a><br><sub>Prototype architecture · Editing</sub></td>
  </tr>
</table>

Fandom contributors and other authors retain the credit recorded on each article. [Contributors](https://kenshi.wiki/contributors) · [FreshWiki history](https://github.com/mattresspad/kenshi-wiki/commits/main/) · [Prototype history](https://github.com/mattresspad/kenshi-wiki/commits/archive/initial-prototype/) · [teppuM’s testing evidence](https://github.com/mattresspad/kenshi-wiki/pull/8) · [Code-mod hooks contribution](https://github.com/mattresspad/kenshi-wiki/pull/44).

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

## Releases

**PR checks → staging preview → Prd’s approval → publish the tested version**, all in GitHub Actions. After merge, **Preview and publish** builds once, uploads an inactive version, tests its immutable preview and waits for the protected production-environment approval. Publication uses that exact version without rebuilding; live smoke checks follow.

Routine checks select appropriate coverage from the PR diff. Exhaustive conversion audits and full reproducibility rehearsals remain available in the separate **Exhaustive audits** workflow; they are not an offscreen step after every preview. Start with the [short workflow guide](.github/workflows/README.md). See [CI policy](docs/ci-policy.md) and [release and recovery](conversion/release/README.md) for detail. Production approval always remains with Prd.

## Temporary maintenance

[Maintenance mode](docs/maintenance.md) provides an explicit GitHub On/Off control with production approval. It preserves the live sitemap and records the exact wiki version to restore. Adding this workflow does not place the site into maintenance.
