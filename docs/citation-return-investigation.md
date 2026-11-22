# Catun Alpha citation-return investigation

PR #51 merged as `dc91dfba1c25b25e8c78e6448e284df535c1b158`. This investigation changes tests and diagnostic documentation only. It does not change application code, content, gap resolutions, the production package or traffic.

## Finding

Completing deferred scripts can reapply native fragment focus after an early keyboard navigation. If that completion falls between focusing the citation return link and dispatching Enter, focus returns to the note (`#cite_note-1`). Enter is then sent to a list item rather than its return link, leaving the URL unchanged.

A controlled experiment reproduced this on both the inactive candidate and the currently live version. Replacing every site script with an empty module produced the same result. A minimal document containing only the two citation anchors and one empty deferred module also reproduced it. The app's bookmark handler is not required for the failure.

This is a browser loading/focus interaction predating the bookmark patch, rather than an introduced content or bookmark-handler regression. The original failure did not capture DOM keyboard/focus events, so the controlled experiment explains its symptom and timing without claiming an event-for-event replay. The experiment deliberately separates focus from Enter to control the loading boundary; the original test used `locator.press('Enter')`.

## Original evidence

The first HTTPS suite on the candidate reported **249 passed, one failed, two skipped**. That result remains recorded as a failure; subsequent passing checks do not rewrite it.

The original trace shows:

- Catun Alpha's citation was activated while its stylesheet was still loading (first press approximately 168095–168103 ms; stylesheet completed approximately 168118 ms).
- The note became focused, then the test attempted the return press approximately 168151–168186 ms while deferred imports were still completing.
- The fragment remained `#cite_note-1`; the failure capture shows the note itself focused.

The early direct-navigation probe waited for page load and passed 25 round trips on each version. Forty later local CSS/font/script-delay trials also passed; those negative results did not establish a fix. Holding deferred modules explicitly until after return-link focus exposed the reproducible boundary.

## Controlled comparisons

Chromium **149.0.7827.55**, three repetitions of each case on each immutable URL:

| Response presented to the browser | Enter straddles deferred completion | Round trip starts after load |
| --- | --- | --- |
| Candidate, actual site scripts | 3/3 focus resets | 3/3 returns succeed |
| Candidate, empty replacement modules | 3/3 focus resets | 3/3 returns succeed |
| Minimal two-anchor document, empty module | 3/3 focus resets | 3/3 returns succeed |
| Live version, actual site scripts | 3/3 focus resets | 3/3 returns succeed |
| Live version, empty replacement modules | 3/3 focus resets | 3/3 returns succeed |
| Minimal control on live origin | 3/3 focus resets | 3/3 returns succeed |

The logged order is return-link focus → DOMContentLoaded → native note focus → load → Enter on the note. No served file is changed by these experiments; Playwright intercepts responses inside each diagnostic browser context.

The compact results, input hashes and minimal event timelines are checked in as [citation-return-evidence.json](citation-return-evidence.json). Full diagnostic logs remain under `reports/citation/`. The manual reproducer is [scripts/diagnostics/citation-return.mjs](../scripts/diagnostics/citation-return.mjs):

```sh
node scripts/diagnostics/citation-return.mjs https://ab6be59c-kenshi-wiki.prds.workers.dev reports/citation/candidate-control.json
node scripts/diagnostics/citation-return.mjs https://46e70484-kenshi-wiki.prds.workers.dev reports/citation/live-baseline-control.json
```

The reproducer records what the browser does; it does not require future Chromium versions to retain this behavior. It is an explicit diagnostic, not an added full-suite step.

## Test change and verification

The geography journey now waits for the destination's `load` event after following Catun → Catun (Alpha), before beginning its keyboard citation round trip. All existing URL, focus and overflow assertions remain. There are no sleeps, retries or relaxed assertions.

Four additional cases hold the destination scripts until its visible DOM has arrived, then complete loading and exercise citation → note → **Tab** to return link → **Enter** back to citation. They cover desktop 1440 × 900 and phone 390 × 844 in light and dark, including focus, viewport, overflow and page-error checks.

The two existing journeys and four delayed-script cases each passed three times on the unchanged candidate URL: **18/18 passed**, two workers, no retries, 16.4 seconds. These are focused investigation checks, not a rerun or relabeling of the original full HTTPS suite. Required PR validation is recorded separately by its check run.

Playwright distinguishes navigation commitment from resource loading, and its default `goto` waits for load. This distinction explains why the earlier direct-navigation probe did not exercise the same window. See [Playwright navigation lifecycle](https://playwright.dev/docs/navigations#navigation-events).

## Release boundary

- Candidate source: `d8bd6e1def09007a28201b1a5fe25727c8614104`.
- Worker: `kenshi-wiki`; inactive version: `ab6be59c-38d3-4cc1-8f8b-9c12f9067ada`.
- Candidate URL: <https://ab6be59c-kenshi-wiki.prds.workers.dev>.
- Package SHA-256: `2d449277afb47e777871d661c1cad8ac0f8ea86390cfad67fe187617d979714e`.
- Live version remains `46e70484-2705-4aea-8a5f-8f1c165ccae9` at 100%.
- Preserved live/rollback package SHA-256 remains `b87b1a7adc72fdda32230579916266b0f6c543735da226c1eef5865543fa0a5c`.

Read-only metadata checks after merging #51 confirmed candidate and rollback availability, unchanged production deployment/domain references, and both unchanged package hashes. Main's new CI-only commit is recorded separately from the candidate's source; it was not substituted for that source.

No build, upload or promotion of the candidate occurred during this investigation. A test fix does not remove the browser's early-loading window for people interacting before load; no claim is made that every possible browser/network timing has been eliminated. Loaded-page citation behavior is covered, and no candidate-specific regression was found. Other site diagnostics and inherited editorial findings remain open. Production promotion still requires Prd's explicit approval of the exact inactive version.
