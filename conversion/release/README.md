# FreshWiki release preparation and rollback

## Current boundary

FreshWiki is default `main`. The protected `archive/initial-prototype` branch and annotated `prototype/pre-restoration-83abc179` tag preserve 83abc179fafa63b826d7f2662c4a18a134a9e6c1 and its original history. The rebuild history remains independent. PR #44 was integrated with credit and evidence and its original PR reconciled. Do not repeat the branch swap or merge prototype ancestry.

Prd selected MIT for independent software; LICENSE and LICENSING.md delimit it. Article prose, evidence, artwork and dependencies retain separate terms. The [earlier release contract](https://github.com/mattresspad/kenshi-wiki/blob/dc67a48ff6965d64d0a5c640d28bfa590eb894a2/conversion/release/README.md) preserves historical preparation details. [Repository-readiness dispositions](repository-readiness.json) record restored policies, templates and acknowledgements.

Readiness keeps transfer, formatting, editorial coverage and findings separate. The accepted registry contains 2,185 articles, 198 categories, 4,120 memberships, 2,191 title/full-text entries and 2,114 random-eligible paths. Inherited findings and pending editorial review remain valid post-launch work. Introduced regressions, unsupported resolutions, unaccounted routes and temporary prototype dependencies block acceptance.

## Routine PR validation

Use Node 24.22.2, `npm ci` and Playwright Chromium. `npm run ci:check` builds local editing mode and runs only the focused editing tests, then builds production mode (`WIKI_RELEASE_TARGET=production`, `WIKI_EDIT_BRANCH=main`) and runs all catalog tests, the complete browser suite, package dry run and an all-page canonical/edit/source/indexability audit. Browser coverage for queue navigation and filtering remains in the full suite. Warm-cache, family, fonts and accessibility checks remain active. No comparison checkout or previous report is required; tracked-file changes fail acceptance.

PRs targeting main run the required **check-and-stage** job. There are no push triggers or path exclusions. Required checks remain strict and enforced for administrators; the separate review rule retains Prd's PR-only exception, which cannot bypass failed checks. PR jobs receive read-only repository permissions and no deployment credentials.

Routine artifacts retain logs, timings, route/gap reports, checksums and failure traces for 14 days. They do not include duplicate build/package trees. The job name is retained for branch-protection compatibility; it does not upload a Worker version.

## Explicit release rehearsal

After reviewed PRs merge, select the exact main SHA. Dispatch **FreshWiki validation** on main with `expected_sha`. The runner verifies that SHA against its checkout and current upstream main. Locally set `WIKI_EXPECTED_SHA` to the selected commit before `npm run release:check`.

The rehearsal runs routine coverage, rebuilds the published package and requires identical per-file checksums, then records representative desktop 1440x900 and phone 390x844 captures in both palettes. Evidence lists executed checks rather than assuming a pass. The single package tree and release evidence are retained for 90 days; dist is not uploaded separately. Stage timings and artifact sizes support before/after comparisons without promising fixed runner performance.

`reports/release/candidate.json` binds the source SHA, target, edit branch, lockfile and package-file checksums to counts and validation. Download the successful artifact for that exact run; verify its digest and every package file before upload. Never substitute older local build output. Browser verification that needs dist may reconstruct it from the verified packaged assets, not rebuild them silently.

For isolated staging only, use `npm run release:check -- --staging` with the exact expected SHA, then explicitly run `npm run release:stage` with `WIKI_RELEASE_TARGET=staging`, `WIKI_EDIT_BRANCH=main` and that expected SHA. The command rejects a production package and remains restricted to kenshi-wiki-restoration. In GitHub it additionally requires workflow_dispatch on trusted main; no automatic staging job is configured. `npm run release:verify` verifies the resulting immutable staging URL. Staging discourages indexing while keeping production canonicals.

## Inactive production candidate

The production target is **kenshi-wiki**, with edit branch **main**. Its version must be uploaded separately from staging; Worker version IDs cannot cross Workers. Upload the checksum-verified production package with `cf workers versions create --prebuilt`, never a deploy command. Record the source SHA, package checksum, new version and immutable URL. Keep the version inactive while verifying it.

Run the complete browser suite over that immutable HTTPS URL and record desktop/phone captures, source/edit links, search and assets, categories, random eligibility, redirects, genuine root/nested GET and HEAD 404s and Pages needing work. Production package headers must permit indexing on ordinary pages. Cloudflare's immutable-preview-level noindex behavior is separate and does not prove the apex's eventual headers.

Check effective main/archive/tag protections, outstanding PRs, the production environment's required Prd review and disabled administrator bypass, and production metadata before and after upload. Automatic production promotion remains absent from CI. Present the exact new version for Prd's approval. An approval for an older candidate does not transfer automatically.

## Rollback and later traffic promotion

At the readiness baseline, kenshi-wiki serves **f9d52d77-376e-4647-8d8c-93b414364d68** at 100%, from prototype 83abc179. Preserve its package with SHA-256 **460c93499ac8bb668d24269b97be44e550c89b1969c51fc3230142938aee53d1**. Recheck eligibility and availability immediately before cutover; the source archive alone is not a deployable artifact.

After separate exact-version approval, the command shape is:

```sh
cf workers deployments create --worker kenshi-wiki --strategy percentage --versions '[{"version_id":"APPROVED_VERSION","percentage":100}]'
```

Rollback uses the same command with `f9d52d77-376e-4647-8d8c-93b414364d68`. Revalidate the request with --dry-run first. If that version is no longer eligible, upload the checksummed prototype artifact as a new inactive kenshi-wiki version, verify its immutable URL, and promote it under the approved recovery procedure. Retain its notices. Hosting rollback does not rename Git branches.

Immediately after an approved promotion, compare apex fingerprints with the approved package and check Home, Catun, Blender plugins, a category, Pagefind/title/body search, random navigation, aliases/historical endpoints, root/nested GET and HEAD 404s, correction/edit/source links, licensing and Pages needing work. Check desktop/phone keyboard and layout behavior. Roll back for material routing, missing-asset, search, content or status-code failures; record the result and investigate before another promotion. Readiness work itself changes no traffic, routes or DNS.
