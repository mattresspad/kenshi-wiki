# Workflow guide

**PR checks → staging preview → Prd’s approval → publish the tested version**

Follow the run in [GitHub Actions](https://github.com/mattresspad/kenshi-wiki/actions). Its summary shows the selected checks, preview link, exact commit and version, and results.

## The normal release path

1. **Open or update a PR.** [PR checks](restoration.yml) validates the proposed change. Coverage depends on what changed: documentation gets structural checks, articles get relevant content/navigation checks, and shared code gets broader coverage. Changes under `.github/` currently receive broad checks, including this guide. PR checks cannot deploy.

2. **Merge after checks and review.** [Preview and publish](release.yml) builds the final package once, uploads an **inactive version**, and tests its permanent preview URL. This includes desktop and phone browser behavior. Uploading the preview leaves the live website unchanged.

3. **Review and approve.** After the preview passes, **Approve and publish tested version** waits for Prd. Open the preview, then choose **Review deployments → production → Approve and deploy** in the same run. A failed preview blocks publication. If main or the active deployment changes, the publication guard stops the outdated candidate.

4. **Publish the version already tested.** Approval promotes that existing version without another build or upload. Live HTTP/content checks follow. The receipt records the previous production version for recovery.

Merging a PR and approving production are separate decisions. Agents do not approve the production gate.

## Supporting workflows

| Workflow | When to use it | Production effect |
| --- | --- | --- |
| [Exhaustive audits](audits.yml) | Deliberate full conversion audits, or comprehensive release rehearsals with reproducibility checks. Select the mode and exact main commit. | No upload or publication. |
| [Recheck live deployment](recheck-live.yml) | Inspect an already deployed version after diagnosing a failed live check. Supply its version ID and recorded source commit. | No build, upload or deployment. |

Exhaustive audits remain separate from routine PR and preview checks; they are not an additional hidden step after a green preview.

## Reading a failure

A failed check **after publication** does not necessarily mean publication failed. Inspect the publication step and the actual assertion shown in the summary. Use **Recheck live deployment** to repeat verification of the existing version, rather than rerunning publication. The original failed run remains recorded.

Cloudflare Bot Fight Mode stays enabled. It can challenge automated browsers on the public domain, so interactive browser checks run against the exact version preview. Live checks verify delivery, redirects, statuses, and matching pages/assets. HTML comparison explicitly accounts for Cloudflare’s added security script; assets must match byte-for-byte. This does not claim automated browser acceptance on the public domain.

PR diagnostics are retained for **14 days**; preview packages, release receipts, audits and recheck evidence for **90 days**.

For implementation detail, see [CI policy](../../docs/ci-policy.md) and [release and recovery](../../conversion/release/README.md).
