# Checks, preview, approval and publication

The GitHub release path is **PR checks â†’ Staging preview â†’ Prd's approval â†’ publish the tested version**. Each stage has a named job and a summary. The production environment requires Prd's review and disables administrator bypass.

## Routine PR checks

The required check is **PR checks**. Every PR targeting main reports it, including documentation-only changes. There are no PR path filters and no duplicate push-validation run.

| Change | Validation |
| --- | --- |
| Repository documentation | Registry/identity and structural tests; no site build or browser claim. |
| Registered article | Production-mode build, affected routes and inbound links, provenance, category/search/sitemap consistency, relevant family browsers and bookmark/navigation checks. |
| Shared layouts, scripts, styles, dependencies, schemas, preservation machinery or uncertain impact | Broad current-state catalog/browser checks, warm-cache fixture, production package dry run and focused local-editing checks. |

GitHub shows coverage selection, build, catalog/routes, browser behavior, packaging, local editing and the summary as separate steps. The summary reports actual phase times, failures and steps not run. A failed or incomplete phase cannot be reported as accepted. The full browser suite runs once in published mode; a separate local build runs only the editing-specific tests.

The complete frozen conversion report and its report-dependent tests are **not** run as part of routine PRs. No assertions have been removed: those tests remain in the explicit audit inventory. New test files join the inventories automatically. Unknown impact receives broad current-state checks; it is never treated as documentation.

## After merge

**Preview and publish** builds one final production package from main, checks its current routes and package, uploads an inactive version to `kenshi-wiki`, and performs focused HTTPS smoke checks. Its summary links the immutable preview and identifies the commit, version and package manifest checksum. Uploading a version does not change production traffic.

The next job, **Approve and publish tested version**, waits at GitHub's protected production environment. Prd can open the preview and then use **Review deployments** in the same run. Publication selects that existing version; it neither builds nor uploads again. Live HTTP delivery and content-parity checks follow. Browser interactions remain covered on the exact immutable version; the protected apex may challenge automated Chromium. A failed preview blocks the approval job. A changed main commit or active deployment blocks publication until a new preview is reviewed.

The immutable preview's Cloudflare-level noindex header is separate from the production package's indexing policy. Using an inactive version of the production Worker is what allows preview and publication to use identical bytes. The optional staging alias is convenient, but approval and tests use the immutable URL.

## Exhaustive audits stay separate

Dispatch **Exhaustive audits** on main with its exact SHA:

- **audit** runs the full frozen conversion/source report, every catalog and browser test, historical fixtures, local editing checks and package validation.
- **release** adds comprehensive captures, all-page package checks and reproducibility checks.

Run an audit when reviewing changes to importers, normalization, source evidence or preservation rules. It is also available for deliberate full release rehearsals. Neither mode uploads or deploys, and neither receives Cloudflare credentials. Commands remain `npm run audit:check` and `WIKI_EXPECTED_SHA=<sha> npm run release:check`. For local routine coverage use `WIKI_CI_BASE_SHA=<base> npm run ci:check`.

## Evidence and controls

Routine diagnostics last 14 days. Preview packages, smoke captures, publication receipts and explicit audit evidence last 90 days. The preview artifact stores packaged assets once, alongside checksums and reports; it does not duplicate dist. Publication stores only its receipt and live-check evidence.

PR checks receive read-only repository permissions and no deployment credentials. Only trusted main can upload. Production publication requires the environment approval, unchanged main and current deployment, a matching immutable version, exact source SHA/package annotation, and an available rollback version. Main keeps strict required checks, administrator enforcement and the existing review policy. Changing a workflow does not authorize an agent to approve production.

The detailed local gap report and all pending editorial findings remain intact. Current-route validation blocks introduced regressions; it does not certify imported gameplay claims or close sourcing questions.

## Measurements

The earlier run [44943932928](https://github.com/mattresspad/kenshi-wiki/actions/runs/44943932928) took 493 seconds including setup; validation itself took 432.56 seconds. Its published browser phase was 207.89 seconds. Those are historical Ubuntu measurements, not a controlled estimate for this patch.

Previously, a green PR run was followed by separately invoked exhaustive rehearsal/upload/HTTPS steps. This change makes the release continuation visible in GitHub and uses a focused six-test preview/live smoke suite instead of repeating every family test remotely. Every existing family test remains available in routine broad coverage and explicit audits. New run summaries and artifacts report measured timings; no speedup is claimed before those measurements exist.

## Public-domain bot challenges

Bot Fight Mode is enabled on kenshi.wiki. The first publication in run [44976997567](https://github.com/mattresspad/kenshi-wiki/actions/runs/44976997567/job/137069618397) succeeded, but five automated-browser checks received Cloudflare challenge pages; the HTTP check passed. That failed run and its diagnostic artifact remain evidence, not a passing release receipt.

Keep all six preview tests, including desktop/phone browser interactions. After publication, run explicit live HTTP checks and compare seven representative HTML pages plus their script/style/index assets with the approved immutable version. HTML comparison removes only the final recognized Cloudflare JS Detection bootstrap and records that normalization. Other changes fail comparison; assets must match byte-for-byte. This does not claim automated browser acceptance on the apex or alter Cloudflare security settings.

**Recheck live deployment** is a manual, read-only recovery check. Supply the active Worker version and its recorded source SHA. It verifies the deployment and source annotation, performs the scoped live checks, and confirms traffic did not change. It does not rebuild, upload or publish; the verification code SHA is recorded separately from the deployed source SHA. Use it after diagnosing a post-publication failure, rather than rerunning the publication job.

Failures print the underlying smoke log and GitHub summary. Successful rechecks do not erase the original failure or its limited coverage.
