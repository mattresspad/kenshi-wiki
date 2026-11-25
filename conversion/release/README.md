# Release and recovery

## Normal path

1. Open a PR. **PR checks** selects and reports the appropriate structural, content or broad checks.
2. Merge after checks and review. **Preview and publish** runs **Staging preview**: one production build, current-route/package validation, inactive upload and focused HTTPS smoke checks.
3. Open the immutable preview in that run's summary. Prd approves the **production** environment using **Review deployments**.
4. **Approve and publish tested version** selects the tested Worker version without rebuilding or uploading. Live HTTP/content checks report in the same run.

Production stays unchanged until step 4. Failed checks stop the sequence. The GitHub run is the status page: there is no required offscreen local completion process after a green preview.

An explicit retry is available by dispatching **Preview and publish** on main with its exact current SHA. It creates a fresh reviewed preview; it is not permission to reuse an older approval. Exhaustive conversion audits and full reproducibility rehearsals live in the separate **Exhaustive audits** workflow. See [the policy](../../docs/ci-policy.md).

## Exact package and approval

The package target is `kenshi-wiki`, edit branch `main`. The preview is an inactive version of this same Worker, at its immutable version URL. This allows publication of the exact tested version without transferring versions between Workers. Preview URLs receive Cloudflare's noindex restriction; the final package is checked separately for production indexability.

The preview artifact contains the package once, per-file checksums, a SHA-256 of the canonical package-file manifest, source SHA, route/package reports, HTTPS results and desktop/phone captures. The manifest checksum is not a ZIP checksum. The publication receipt identifies the previous deployment and rollback version. These artifacts last 90 days.

The production environment requires Prd's approval; administrator bypass stays disabled. Before publication the script rechecks current main, the active deployment, the approved version's source/package annotation and rollback availability. Any mismatch stops publication. Nothing here authorizes agents to approve their own deployment. No routes, DNS or branch names are changed by this workflow.

## Smoke checks and failure behavior

Preview checks cover Home/assets, a category-to-article journey, canonical/edit/pinned-source links, Pages needing work, citation and keyboard return, phone drawer focus, light/dark wrapping, title and full-text search, random navigation, an alias with query preservation, and root/nested GET/HEAD 404 responses.

The public domain has Bot Fight Mode enabled. Automated Chromium may receive a security challenge instead of wiki content. Live checks therefore verify HTTP delivery, indexing, redirects and statuses, plus seven representative pages and their script/style/index assets against the exact immutable version. Only the recognized appended Cloudflare JS Detection bootstrap is removed for HTML comparison, and this is recorded explicitly. Browser interactions remain covered by preview checks; apex browser acceptance is not claimed.

A failed live check leaves the workflow red and preserves evidence. Do not rerun publication to repeat verification: dispatch **Recheck live deployment** on main with the existing active version and its source SHA. This checks source/version/traffic before and after read-only verification and records its test-code SHA separately. No build, upload, traffic promotion or security-rule change occurs.

Inspect the failed check and live behavior. Roll back promptly for material routing, missing-asset, search, content or HTTP-status failures. The retained receipt includes the exact previous version and command:

```sh
cf workers deployments create --worker kenshi-wiki --strategy percentage --versions '[{"version_id":"RECORDED_ROLLBACK_VERSION","percentage":100}]'
```

Use the version recorded by that run, after checking current deployment state and recovery authorization. Do not substitute an older receipt. Confirm Home, search, a category/article, an alias and root/nested 404s after recovery. If the previous version is no longer eligible, use its retained checksummed package as an explicitly reviewed recovery candidate. Never rebuild old source and call it the original tested artifact.

## Preserved history and release boundaries

FreshWiki is already default main and is live. The protected archive/initial-prototype and prototype/pre-restoration-83abc179 tag preserve the prototype's full history. Do not repeat the branch swap or merge its ancestry into FreshWiki. PR #44's original authorship and adaptation evidence remain intact.

At this workflow-change baseline, production serves `46e70484-2705-4aea-8a5f-8f1c165ccae9`. Its preserved package ZIP checksum is `b87b1a7adc72fdda32230579916266b0f6c543735da226c1eef5865543fa0a5c`. This historical reference does not replace the deployment snapshot taken for each new preview.

MIT covers independently written software. Article prose, evidence, artwork and dependencies retain their separate terms. Inherited gaps and pending editorial reviews remain honest post-launch work; introduced regressions and unsupported resolution claims remain blockers. Publication of this workflow does not close any editorial finding.

## Maintenance guard

The manual [Maintenance mode workflow](../../.github/workflows/maintenance.yml) uses the same production approval environment and deployment concurrency group. Ordinary publication refuses to replace an active maintenance version. Use **Off** to restore its recorded wiki, then prepare any newer release. See the [operator and recovery guide](../../docs/maintenance.md).
