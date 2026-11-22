# Contributing to Kenshi Wiki

Prd ([mattresspad](https://github.com/mattresspad)) is the project lead and maintainer. A typo, a source, or a one-sentence correction is welcome. Discuss bulk imports and architectural changes with Prd before implementing them.

## Suggest a correction

[Open the article correction form](https://github.com/mattresspad/kenshi-wiki/issues/new?template=article-correction.yml) and identify the article and heading. Describe the change and include sources or observations where possible. For mechanics, give the game/mod version, conditions and what you observed; distinguish observations from interpretations. [teppuM's Skeleton Repair Bed and Robotics job notes](https://github.com/mattresspad/kenshi-wiki/pull/8/files) provide an example.

[Pages needing work](https://kenshi.wiki/pages-needing-work) offers article tasks, pinned evidence and investigation notes. Awaiting editorial review, reviewed with open findings, and specific restoration tasks are separate markings. Restoring a missing link or image does not verify a gameplay claim. Keep uncertain claims qualified and retain findings until evidence supports closing them.

## Edit an article in your browser

1. On the article, choose **Edit on GitHub** (inside **Wiki tools** on a phone). Sign in; accept GitHub's offer to create a fork if needed.
2. Edit the relevant Markdown and use Preview. Keep the permanent `articleId`, source credits, license, values and heading bookmarks. Each article has one editable home under `src/content/articles/`; its file location does not determine its public URL.
3. Propose the change as a pull request to `mattresspad/kenshi-wiki` on `main`. Explain what changed and how another editor can check it. A maintainer can help with formatting or failed checks.

In a local preview, **Copy file path** gives the actual editable file. Recorded Markdown and history links identify the original source, not the file to edit. Portals use editable data under `src/data/`; About Kenshi and Contributors use `src/content/site/`. Preserve their recorded sources too. See [the conversion conventions](conversion/README.md).

## Reuse text and contribute assets

Article edits follow the destination page’s recorded license; new original articles use CC BY-SA 4.0, and Fandom adaptations retain CC BY-SA 3.0. Independent website software contributions use MIT. Preserve source revisions, author credit, applicable license and change notices. [Licensing boundaries](LICENSING.md) and the [Copyright and permissions guide](https://kenshi.wiki/copyright-and-permissions) distinguish article text, software, quotations, source excerpts, artwork and dependencies.

When adding imported text, quotations, code or media, identify its creator and source, explain the basis for reuse (such as your authorship, a compatible license or specific permission), and retain necessary credits and the scope of any grant. If relying on a legal exception, identify the intended use for maintainer assessment rather than asserting blanket permission. A short source/rights note in the pull request is enough when the evidence is straightforward; ordinary typo and factual corrections need no additional rights declaration.

Before adding artwork, establish its reuse terms and update [the artwork inventory](public/notices/artwork.txt). Attribution, online availability, noncommercial use and AI-assisted redrawing do not automatically establish permission. If terms or compatibility are unclear, propose the material with a source link and record the question before adding it; do not upload it merely to request clearance. A missing permission record is an open question, not an automatic finding of infringement.

Send copyright concerns, permission evidence or sensitive correction details to [admin@kenshi.wiki](mailto:admin@kenshi.wiki), rather than a public issue or pull request. Identify the affected URL/file, underlying work and concern, and include a reply address. Informal questions are welcome. Keep private correspondence and personal contact details out of public Git history; publish only the relevant source/permission scope and a suitable summary of the outcome. Unresolved findings and resolution history must remain recorded.

## Work on the website

[Report a website issue](https://github.com/mattresspad/kenshi-wiki/issues/new?template=website.yml) for layout, navigation or tools. Include the page, expected behavior, reproduction steps and browser details. Screenshots should omit personal information.

The [README](README.md#run-locally) covers the pinned Node version and local checks. For a code PR, describe the affected behavior and validation; include desktop/phone evidence for layout changes. Preserve accessibility, registered paths, source attribution and the gap register. Deployment is a separate maintainer approval; opening or merging a PR does not approve a production release. The [workflow guide](.github/workflows/README.md) explains the PR checks, preview, approval gate and read-only live recheck.

Follow the [code of conduct](CODE_OF_CONDUCT.md). Report sensitive security concerns through [the private channel](SECURITY.md), not public issues.
