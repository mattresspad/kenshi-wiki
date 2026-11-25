import {test,expect} from '@playwright/test';
import {openMaintenance} from './helpers/maintenance.mjs';
let runtime,base;
test.beforeAll(async({},info)=>{base=process.env.WIKI_MAINTENANCE_PREVIEW_URL;if(!base){runtime=await openMaintenance('browser-'+info.workerIndex);base=(await runtime.ready).origin;}});
test.afterAll(async()=>{await runtime?.dispose();});
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe('maintenance '+(phone?'phone':'desktop')+' '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme,javaScriptEnabled:false});
 test('branded page, direct article URL, email focus and no overflow',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+'/catun?review=1#town-override');expect(response.status()).toBe(503);
  await expect(page.getByRole('heading',{level:1})).toContainText('maintenance');
  await expect(page).toHaveURL(base+'/catun?review=1#town-override');
  await expect(page.locator('form,script,link[rel=canonical],meta[name=robots]')).toHaveCount(0);
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'admin@kenshi.wiki'})).toBeFocused();
  await expect(page.getByRole('link',{name:'admin@kenshi.wiki'})).toHaveAttribute('href','mailto:admin@kenshi.wiki');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  expect(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(theme==='dark'?'rgb(19, 19, 16)':'rgb(249, 247, 239)');
  await page.screenshot({path:info.outputPath('maintenance-'+(phone?'phone':'desktop')+'-'+theme+'.png'),fullPage:true});expect(errors).toEqual([]);
 });
});
