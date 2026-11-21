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

Article text retains its applicable license: original writing uses CC BY-SA 4.0; Fandom adaptations retain CC BY-SA 3.0. Preserve source revisions, author credit and change notices. [Licensing boundaries](LICENSING.md) distinguish article text, the independent MIT software, evidence excerpts, artwork and dependencies.

Before adding artwork, establish its creator, source and reuse terms and update [the artwork inventory](public/notices/artwork.txt). Credit alone is not permission. If terms are unclear, link to the creator's page and record the question.

## Work on the website

[Report a website issue](https://github.com/mattresspad/kenshi-wiki/issues/new?template=website.yml) for layout, navigation or tools. Include the page, expected behavior, reproduction steps and browser details. Screenshots should omit personal information.

The [README](README.md#run-locally) covers the pinned Node version and local checks. For a code PR, describe the affected behavior and validation; include desktop/phone evidence for layout changes. Preserve accessibility, registered paths, source attribution and the gap register. Deployment is a separate maintainer approval; opening or merging a PR does not approve a production release.

Follow the [code of conduct](CODE_OF_CONDUCT.md). Report sensitive security concerns through [the private channel](SECURITY.md), not public issues.
