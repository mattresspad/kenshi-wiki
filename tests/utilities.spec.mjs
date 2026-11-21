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
