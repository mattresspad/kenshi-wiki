import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
// This local investigation report contains thousands of findings; retain action
// traces without serializing its entire DOM between every filter interaction.
test.use({trace:{mode:'retain-on-failure',snapshots:false,screenshots:false}});
const report=JSON.parse(readFileSync('reports/gaps/register.json'));
test('gap backlog filters by family and finds an affected source beyond the visible excerpt',async({page})=>{
 await page.goto(pathToFileURL(resolve('reports/gaps/index.html')).href);
 await page.locator('#family').selectOption('races');
 await page.locator('#kind').selectOption('all');
 await expect.poll(()=>page.locator('article:not([hidden])').count()).toBeGreaterThan(0);
 const distant=report.findings.find(r=>r.status==='open'&&r.occurrences.length>8&&r.occurrences.slice(8).some(o=>!r.occurrences.slice(0,8).some(first=>first.pageId===o.pageId)));
 const occurrence=distant.occurrences.slice(8).find(o=>!distant.occurrences.slice(0,8).some(first=>first.pageId===o.pageId));
 await page.locator('#family').selectOption('all');await page.locator('#query').fill(occurrence.pageId);
 await expect(page.locator('article').filter({has:page.getByRole('heading',{name:distant.target,exact:true})}).first()).toBeVisible();
 await page.locator('#query').fill('');await page.locator('#status').selectOption('resolved');
 await expect.poll(()=>page.locator('article:not([hidden])').count()).toBeGreaterThan(0);
 await expect(page.locator('article:not([hidden])').first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
});
