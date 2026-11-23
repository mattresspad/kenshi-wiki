# Contact forms: configuration and verification

The forms use the existing static wiki frame and a small same-origin Worker handler. Public enablement follows the normal **PR checks → staging preview → Prd approval → publish tested version** workflow. Merging the enablement change does not promote production traffic.

## Reader routes

- `/contact`: questions, corrections and proposed contributions.
- `/contact/copyright`: copyright, permission and removal concerns.
- Both are original utility pages with canonical URLs, title search and sitemap entries. Their explanatory prose is searchable; form controls and result messages are not. Neither enters random article navigation.
- Footer Contact, copyright guidance and contribution guidance link to the forms. Public GitHub corrections remain available.
- With JavaScript or verification unavailable, direct email to `admin@kenshi.wiki` remains usable.

The editable prose is in `src/content/site/contact.md` and `contact-copyright.md`. The explicit Astro routes share `ContactForm.astro` and the existing utility frame.

## Local preview

From the dedicated `contact-forms` worktree, after building:

```powershell
npm run preview:contact -- --host 127.0.0.1 --port 4396
```

Open the two reader routes. The banner says **No email is sent.** The scenario control exercises acceptance, failed verification, unavailable verification and uncertain delivery. All ordinary validation goes through the actual Worker handler. Only external verification and mail delivery are substituted.

The harness runs on loopback only, removes remote mail/secret bindings and is never copied into the deployable bundle. It does not save or print submitted text. Use fictional values for review. A normal `npm run preview` leaves intake disabled.

## Runtime and privacy

Astro remains static. Cloudflare runs the Worker first only for `/api/contact`; ordinary assets keep their static serving path. Other requests reaching the Worker are delegated to `ASSETS.fetch`, preserving redirects and genuine 404 behavior.

The handler accepts same-origin JSON POSTs, rejects unknown fields/uploads, and caps the entire request at 64 KiB. Field limits are: reply email 254 characters, preferred credit 100, affected references 4,000, explanation 10,000, verification token 2,048. The copyright form requires affected references; general contact does not.

Turnstile Siteverify must return success with the exact configured hostname and the expected action (`wiki_contact` or `wiki_copyright`). Expiry or failed requests require fresh verification. A honeypot and the service's token checks provide basic abuse protection. There is no application-level persistent rate limiter or exactly-once guarantee; any additional abuse controls require a separate operational review.

The binding and mail builder fix the recipient to `admin@kenshi.wiki` and sender to `forms@kenshi.wiki`. User input cannot select either. The validated reply address appears only as Reply-To and in the private plain-text message. No HTML email or automatic acknowledgment is generated.

The handler awaits Email Service acceptance before returning HTTP 202. This does not prove arrival, review, a reply or a deadline. If acceptance cannot be confirmed, the result says the message may have been forwarded. There is no automatic retry.

The browser creates an opaque reference so it can show one even when the response is interrupted. The server accepts only the validated UUID format, otherwise generating its own reference. This is a correspondence reference, not an idempotency key. Concurrent clicks are suppressed, but a deliberate fresh submission can create another message.

No application submission copy, browser draft, public issue or private forwarding address is stored. The handler logs only reference, outcome/status and a fixed error code, never raw provider errors or message fields. Provider operational logs are separate from this application policy. Delivered correspondence remains in the maintainer's mailbox under its normal retention.

## Public release configuration

The public sitekey and apex origin live in `src/contact/config.mjs`. Production-target builds enable intake by default; local/staging-target builds stay disabled. `WIKI_CONTACT_ENABLED=false` builds an explicit disabled package. The frontend and package use the same settings, so disabling a build also removes its widget key.

`TURNSTILE_SECRET_KEY` is a GitHub Actions secret for this repository. Only the trusted main preview job's early configuration check and upload step receive it. Builds, PR jobs, artifacts and the publication step do not receive the secret. The upload helper writes only this binding to a restricted temporary JSON file outside the artifact directories, uploads it with the inactive version, and deletes the file in `finally`, including on upload failure. Upload logs redact the supplied secret. The package contains the secret binding declaration, never its value.

The mail binding remains restricted to `admin@kenshi.wiki`, with fixed sender `forms@kenshi.wiki`. The handler accepts only `https://kenshi.wiki` as its request origin and Turnstile hostname. Version-preview pages explain that they cannot send messages; the normal release preview does not accept contact requests. The existing production environment approval still promotes the exact tested version, without rebuilding.

Cloudflare permits [Free-plan sending to verified destination addresses](https://developers.cloudflare.com/email-service/platform/pricing/). No paid activation or submitter acknowledgment is part of this implementation. Do not add the underlying forwarding destination to source, reports, screenshots or issues.

## Controlled verification evidence

On 22 November 2026, the existing handler and policy at `a06fbc49658e7fce97cf3b6761d4f159954081c7` were checked against real Turnstile and the deployed email binding:

- Both `wiki_contact` and `wiki_copyright` succeeded through real Siteverify. Local checks rejected replay, invalid tokens, wrong action and wrong hostname.
- The private inactive test version `fe17e38f-3620-408d-91ec-b49fa803e5c4` used an authenticated, expiring gate and the explicitly allowed test hostname. Its general form delivered through `CONTACT_MAIL`; Prd confirmed inbox receipt. The copyright check used real verification with simulated delivery and sent no second message.
- Deployed invalid-token and wrong-origin checks returned 403. The public endpoint remained disabled with 503, and production remained on `708027c3-6ed9-4a60-885f-61f8bb32a0f5` at 100%.
- The private test version is **not a release candidate and must never be promoted**. No private gate, access key, test hostname or simulation code enters the production package. Ignored local evidence is under `reports/contact-live/`.

These checks establish the verified setup; they do not claim that the new public package is already deployed. The approved release still requires its normal package and HTTPS checks. Timed real-token expiry was not manually waited out; replay rejection and simulated browser expiry recovery are separate evidence.

After promotion, check both public forms, the email alternative and failure behavior. Send further real verification messages only with explicit authorization. For recovery, use the version recorded by the release workflow; before the first public enablement this is the disabled version above. An explicit disabled package can also be prepared through the same approval workflow.

References: [send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/), [Workers email API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/), [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Checks and audit reconciliation

`tests/contact.test.mjs` checks the actual handler, privacy, limits, hostile inputs, origins, fixed recipients, verification and package guards. `tests/contact.spec.mjs` uses the isolated local harness for both palettes and viewports, errors, focus, retries, duplicate clicks, no-JavaScript fallbacks, search scope and static routing.

The existing CI selection policy and exhaustive assertions are retained. PR #57 changed the Guide to Health prose after the frozen conversion. That accepted paragraph is now reconciled through [pinned acceptance evidence](../conversion/accepted-text.md): the audit verifies the exact approved text, then checks the unchanged remainder against the original fixture using an in-memory copy. The article and historical fixture are untouched; no gameplay finding is closed. The full conversion report now passes with zero introduced regressions.

Local logs, the inherited-mismatch evidence and review captures are kept under `reports/contact/` (ignored). Live sending and production promotion still require their separate approval.

### Local validation result — 22 November 2026

- Production build stages (identity, Astro, Pagefind and package): passed. Current-route audit checked 2,395 routes, 198 category indexes and registered search/sitemap agreement. Search contains 2,194 entries; article identities and category memberships are unchanged.
- Initial catalog run: 90 passed, including nine contact-handler groups and the warm-cache fixture; two report-dependent tests were blocked. This historical result is retained. After the explicit PR #57 reconciliation, all 95 catalog tests pass, including the two previously blocked report tests and three new acceptance checks. The full conversion report records zero introduced regressions.
- Browser: 42 distinct focused checks passed across the form and existing reader/navigation, permissions, utility and search suites. The final form pass also checks late verification callbacks, keyboard error links, expired verification and the email fallback. The former assets-only assertion now requires the exact three-module contact Worker and only `/api/contact` in `runWorkerFirst`.
- Cloudflare package dry run: passed with the fixed admin recipient and `CONTACT_ENABLED=false`; no upload.
- Captures: 1440 × 900 and 390 × 844, both palettes, under `reports/contact/captures/`. The loopback preview uses port 4396.

`reports/contact/inherited-build-mismatch.json` demonstrates that the unchanged main article causes the frozen text mismatch: reverting only PR #57's paragraph in memory reproduces the expected fingerprint. No article or preservation fixture was changed. See `reports/contact/README.md` for the individual local evidence files.


### Preview upload follow-up — 22 November 2026

PR #59 merged at `e1751790cf950a7e3bace27ef839f955b45b8c18`. Its [preview run](https://github.com/mattresspad/kenshi-wiki/actions/runs/45051972972) passed package preparation but Cloudflare rejected Worker startup (10021): the pinned cf beta.28 uploader names the entry by its basename, so the nested entry's `../contact/policy.mjs` import became invalid. The publish job was skipped. A successful dry run did not establish remote startup acceptance.

Packaging now emits an `index.mjs` wrapper at the bundle root, preserving the live source modules and their relative imports. The regression test reconstructs the uploader's entry name in the Workers runtime; it reproduced the original error before the fix and checks startup, disabled intake, asset serving, redirects and GET/HEAD 404 responses afterward. It has no mail or verification binding. Source articles, form content and enable settings are unchanged.

This historical startup failure was subsequently resolved and deployed through PR #60. The controlled verification above records the later real-service checks. Public intake remains disabled until the enablement release receives Prd’s production approval.
