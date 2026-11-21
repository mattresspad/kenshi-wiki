import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {categoryPath} from '../src/lib/catalog.mjs';
const roster=JSON.parse(fs.readFileSync('conversion/utilities/roster.json'));
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' category completion '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme});
 test('large, small and nested indexes preserve membership and keyboard access',async({page})=>{
  for(const name of roster.pilots){await page.goto(categoryPath(name)+'?theme='+theme);await expect(page.locator('[data-member]')).toHaveCount(roster.members[name].length);await page.locator('[data-member]').last().focus();await expect(page.locator('[data-member]').last()).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);}
  if(phone){await page.locator('#toggle-navigation').press('Enter');await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused();await expect(page.locator('.az-board')).not.toHaveAttribute('data-fit','');}
  await page.emulateMedia({media:'print'});await expect(page.locator('.az-entries').first()).toHaveCSS('max-height','none');
 });
});
import {utilityStage,historicalSourceRedirects} from '../src/lib/utility-routes.mjs';
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' utility source pages '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme});
 test('utility bookmarks, gallery and historical source destinations',async({page,request})=>{
  test.skip(utilityStage<3);
  await page.goto('/about-kenshi?theme='+theme+'#Gallery');await expect(page.locator('#Gallery')).toBeInViewport();await expect(page.locator('article img')).toHaveCount(7);for(const img of await page.locator('article img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true)}
  await page.goto('/contributors?theme='+theme+'#outland');await expect(page.locator('#outland')).toBeInViewport();await expect(page.locator('article')).toContainText('project lead and maintainer');expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  for(const r of historicalSourceRedirects){const response=await request.get(r.from+'?source=review',{maxRedirects:0});expect(response.status()).toBe(301);expect(response.headers().location).toBe(r.to+'?source=review');}
  if(phone){await page.locator('#toggle-navigation').click();await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused()}
 });
});
