# Maintenance mode

**Live wiki → maintenance page → the same live wiki.** This is a precautionary operator control, not a scheduled shutdown. Merging this feature does not activate it.

## Turn maintenance on

1. In GitHub **Actions**, select **Maintenance mode → Run workflow**, branch **main**, mode **on**.
2. **Prepare and check maintenance choice** records the actual live version and copies its robots file and all linked sitemap XML from that version's immutable URL. It packages only the small maintenance Worker, without building the Astro article corpus, and uploads an inactive version. HTTP checks and desktop/phone captures run before approval.
3. Open the preview link in the run summary. Check the current, target and saved return version IDs.
4. Choose **Review deployments → production → Approve and deploy**. The protected job switches to that tested version and checks live responses. There is no second build or upload after approval.

The action requires current main. A changed main or deployment invalidates a waiting plan. A repeated **on** request while already in maintenance reports the state without uploading or changing traffic.

## Turn maintenance off

Run the same workflow on **main**, choose **off**, then approve its protected production job after the checks pass. Off reads the saved return version from the active maintenance version's annotation, verifies its immutable preview and eligibility, and restores that exact version. No source rebuild or package upload occurs.

This restores the wiki that was live when maintenance began, not whichever commit is now newest on main. Publish newer work through the ordinary preview/approval workflow after reopening. An **off** request while already serving the wiki is a no-op.

The return pointer lives with the Cloudflare maintenance version, independently of GitHub artifact retention. The run also retains the plan, crawl-file checksums, captures and recovery receipt for 90 days.

## Reader and search behavior

- Article addresses, query strings and browser fragments stay in place. There is no redirect to a maintenance URL.
- Ordinary GET/HEAD requests return the branded page with **503**, **Retry-After: 3600**, and **Cache-Control: no-store**. The retry value asks clients to try later; it is not a promised reopening time.
- The recorded `robots.txt`, sitemap index and every linked sitemap retain their exact bytes and return **200**. They are not replaced by maintenance HTML or rewritten to contain only the homepage.
- Contact/API requests return an unavailable response. The maintenance Worker has no mail handler or asset fallback, reads no submission body and performs no outbound request. Direct email remains available.
- The page needs no JavaScript, external font or image. It follows the device's light/dark preference. The message lives in `src/maintenance/page.html` and is reviewed through ordinary PRs.
- We do not add `noindex` or block robots on the live maintenance page. Cloudflare may independently mark immutable preview URLs noindex, as it does for regular previews.

Use full-site maintenance for short interruptions. Google recommends informational 503 responses for interruptions of roughly one or two days; prolonged or frequent unavailability can harm indexing. Sitemap preservation does not remove that risk. See [Google's guidance](https://developers.google.com/search/docs/crawling-indexing/pause-online-business).

## Safety and recovery

Both directions require the existing **production** environment approval. They share the `wiki-production` concurrency group with ordinary publishing. Normal publication explicitly rejects an active maintenance version; it cannot silently reopen the wiki. Ordinary preview uploads may still run. Restore the wiki, then prepare a fresh release if its prior preview recorded the maintenance deployment.

No workflow changes DNS, routes, branch names, email configuration or Cloudflare protection. Version changes propagate gradually; the switch job retries only read-only smoke checks for a short period. Cloudflare can preserve unused secret bindings in a version upload; the maintenance code never reads the environment and declares no email binding.

A failure **before** the switch leaves production unchanged. A failure **after** the switch does not automatically undo an intentional shutdown. Read `maintenance-receipt-…`, especially `receipt.json` and `recovery.json`, and inspect the live state. Do not blindly rerun a switch to retry a smoke test.

If a switch succeeded but a response check failed, the receipt contains the previous version and exact recovery command. After checking the current deployment and obtaining recovery approval, an operator can select that existing version through Cloudflare or use:

```sh
cf workers deployments create --worker kenshi-wiki --strategy percentage --versions '[{"version_id":"RECORDED_RECOVERY_VERSION","percentage":100}]'
```

Confirm the intended status, Home, a nested article, contact availability, robots and sitemap after recovery. A security challenge is reported as a verification failure; protection is not relaxed to make a check pass.

Cloudflare allows deployment/rollback only among the 100 most recent versions. The workflow checks both the target and saved wiki against that list before switching. Avoid generating large numbers of preview versions during an extended shutdown. If the saved version is unavailable or no longer eligible, stop and use its retained release package through an explicitly reviewed recovery procedure. Never substitute a different version silently. See [Cloudflare version limits](https://developers.cloudflare.com/workers/versions-and-deployments/).

## Local review and tests

```sh
node --test tests/maintenance.test.mjs tests/release.test.mjs tests/contact-release.test.mjs
# Skip the ordinary wiki web server; this test starts its own isolated Worker.
WIKI_PREVIEW_URL=http://127.0.0.1:1 npm exec -- playwright test tests/maintenance.spec.mjs
```

PowerShell: set `$env:WIKI_PREVIEW_URL='http://127.0.0.1:1'` before running the Playwright command. The fixture generates a local package under `reports/maintenance/`, and uses no Cloudflare credentials or remote bindings. The test browser captures desktop 1440 × 900 and phone 390 × 844 in both palettes, including keyboard focus with JavaScript disabled.

Remote prepare/apply scripts reject local execution and non-main/non-dispatch GitHub events. PR checks have no deployment credentials. Their existing selection policy automatically includes these new tests for broad changes; exhaustive conversion audits remain separate.

The initial PR is local validation only: production On/Off has not been exercised. The first deliberate use must complete the real immutable-preview and protected switch checks; a local simulation is not evidence of a live traffic switch.
