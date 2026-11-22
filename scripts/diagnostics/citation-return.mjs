/** Manual diagnostic: no build, upload, deployment or modification of served assets.
 * Usage: node scripts/diagnostics/citation-return.mjs <existing-preview-url> [output.json]
 * It schedules load completion BETWEEN focus and Enter to expose a native browser
 * race. This is a controlled schedule, not a replay of the original atomic press.
 */
import fs from 'node:fs';
import path from 'node:path';
import {chromium, expect} from '@playwright/test';

const base = new URL(process.argv[2]);
if (!['http:', 'https:'].includes(base.protocol)) throw Error('Expected HTTP(S) preview URL');
const output = process.argv[3] || 'reports/citation/diagnostic.json';
const browser = await chromium.launch();
const report = {base: base.origin, browser: browser.version(), trials: []};
const minimal = `<!doctype html><html><head><title>Native citation control</title>
<script type="module" src="/citation-diagnostic-module.js"></script></head><body>
<sup id="cite_ref-1" tabindex="-1"><a href="#cite_note-1">[1]</a></sup>
<ol><li id="cite_note-1" tabindex="-1"><a href="#cite_ref-1">Return</a> Note</li></ol>
</body></html>`;
try {
  for (const fixture of ['site', 'site-with-noop-scripts', 'minimal-noop']) {
    for (const waitForLoad of [false, true]) for (let repetition = 0; repetition < 3; repetition++) {
      const page = await browser.newPage({viewport: {width: 1440, height: 900}});
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      const trial = {fixture, waitForLoad, repetition};
      report.trials.push(trial);
      try {
        await page.addInitScript(() => {
          window.citationEvents = [];
          for (const type of ['focusin', 'focusout', 'keydown', 'keyup', 'click', 'hashchange', 'DOMContentLoaded', 'load']) {
            addEventListener(type, event => {
              const describe = node => node?.id || (node?.tagName === 'A' ? `a[href="${node.getAttribute('href')}"]` : node?.nodeName);
              window.citationEvents.push({type, key: event.key, target: describe(event.target),
                active: describe(document.activeElement), hash: location.hash,
                ready: document.readyState, time: performance.now()});
            }, true);
          }
        });
        await page.route('**/*', async route => {
          const type = route.request().resourceType();
          if (type === 'script') {
            await gate;
            if (fixture !== 'site') {
              await route.fulfill({status: 200, contentType: 'text/javascript', body: '// Empty deferred module.'});
              return;
            }
          }
          if (fixture === 'minimal-noop' && type === 'document') {
            await route.fulfill({status: 200, contentType: 'text/html', body: minimal});
            return;
          }
          await route.continue();
        });
        await page.goto(new URL('/catun-alpha', base).href, {waitUntil: 'commit'});
        if (waitForLoad) { release(); await page.waitForLoadState('load'); }
        await page.locator('#cite_ref-1 a').press('Enter');
        await expect(page).toHaveURL(/#cite_note-1$/);
        await expect(page.locator('#cite_note-1')).toBeFocused();
        await page.locator('#cite_note-1 a[href="#cite_ref-1"]').focus();
        trial.beforeLoad = await page.evaluate(() => ({active: document.activeElement.outerHTML, ready: document.readyState}));
        release();
        await page.waitForLoadState('load');
        trial.afterLoad = await page.evaluate(() => ({active: document.activeElement.outerHTML, ready: document.readyState}));
        await page.keyboard.press('Enter');
        trial.afterEnter = await page.evaluate(() => ({hash: location.hash, active: document.activeElement.id}));
        trial.returned = trial.afterEnter.hash === '#cite_ref-1' && trial.afterEnter.active === 'cite_ref-1';
      } catch (error) {
        trial.error = error.message;
      } finally {
        release();
        trial.events = await page.evaluate(() => window.citationEvents).catch(() => []);
        await page.unrouteAll({behavior: 'wait'});
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({base: report.base, browser: report.browser,
  trials: report.trials.map(({events, beforeLoad, afterLoad, ...trial}) => trial)}, null, 2));
if (report.trials.some(trial => trial.error)) process.exitCode = 1;
