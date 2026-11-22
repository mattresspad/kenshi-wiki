# Contact forms: local review and configuration

This implementation is local review work based on `main` at `d3aa2e8a7f1f98577469d9516a6fd0aa278d1535`. It does not provision Cloudflare resources, send real messages or deploy the site.

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

## Later live configuration — not performed in this review

[Cloudflare's current pricing guidance](https://developers.cloudflare.com/email-service/platform/pricing/) permits Free-plan sending to verified destination addresses, including accounts using only Email Routing. The server-side binding is still necessary; Email Routing is not a browser form endpoint.

Configuration is generated in `scripts/contact/package.mjs`:

| Setting | Purpose |
| --- | --- |
| `WIKI_CONTACT_ENABLED=true` | Explicitly enable the packaged handler; omitted/false is disabled. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public production sitekey, also present during Astro build. |
| `TURNSTILE_SECRET_KEY` | Runtime secret binding; provision separately, never commit or place in artifacts. |
| `CONTACT_MAIL` | Email binding restricted to `admin@kenshi.wiki`. |
| `CONTACT_ORIGIN` | Fixed `https://kenshi.wiki`; no wildcard or caller-selected origin. |

Production packaging rejects simulation settings, local-preview markers and Turnstile dummy sitekeys. Missing enable/sitekey/secret configuration fails closed. The bundle contains only the three live Worker/policy modules.

Before activating intake, a separately approved live verification must establish:

1. The fixed-address email binding is accepted for this account and cannot send to another destination.
2. The fixed sender is eligible on the routing domain.
3. A permitted test actually arrives through the admin forwarding rule.
4. Real Turnstile verification enforces the apex hostname and both form actions, including expiry and failure behavior.
5. A preview-host strategy is explicitly agreed if live integration testing will use a version URL: this implementation deliberately accepts the apex origin only.
6. Operational observability retains no submitted contents or reply addresses.

Do not put the underlying forwarding address into repository code, configuration examples, screenshots or CI artifacts. Do not enable paid services or send tests as part of this local review.

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
