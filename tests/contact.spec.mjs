import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openPreview} from '../scripts/static-preview.mjs';
let runtime,base;
test.beforeAll(async()=>{runtime=await openPreview('127.0.0.1',0,{contact:true});base=(await runtime.ready).origin;fs.mkdirSync('reports/contact/captures',{recursive:true});});
test.afterAll(async()=>{await runtime?.dispose();});
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe('contact '+(phone?'phone':'desktop')+' '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme});
 test('linked forms, validation, confirmation, focus and overflow',async({page})=>{
  for(const [path,kind]of [['/contact','general'],['/contact/copyright','copyright']]){
   await page.goto(base+path+'?theme='+theme);
   await expect(page.locator('.contact-preview-note')).toContainText('No email is sent');
   await expect(page.locator('#contact-send')).toBeEnabled();
   await page.screenshot({path:'reports/contact/captures/'+kind+'-'+(phone?'phone':'desktop')+'-'+theme+'-intro.png'});
   await page.locator('#contact-send').focus();await page.keyboard.press('Enter');
   await expect(page.locator('#contact-result')).toBeFocused();
   await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid','true');
   await page.locator('#contact-result a[href="#contact-email"]').focus();await page.keyboard.press('Enter');await expect(page.locator('#contact-email')).toBeFocused();
   await page.locator('#contact-email').fill('editor@example.invalid');
   await expect(page.locator('#error-email')).toBeHidden();
   await page.locator('#contact-affected').fill('/catun');
   await page.locator('#contact-message').fill('Local preview only. Please check the source credit.');
   await page.locator('#contact-message').scrollIntoViewIfNeeded();
   await page.screenshot({path:'reports/contact/captures/'+kind+'-'+(phone?'phone':'desktop')+'-'+theme+'-form.png'});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
   await page.locator('#contact-send').click();
   await expect(page.locator('#contact-result')).toContainText('does not confirm inbox delivery');
   await expect(page.locator('#contact-result')).toBeFocused();await expect(page.locator('#contact-send')).toBeDisabled();
   await page.evaluate(()=>window.turnstile._ready());await expect(page.locator('#contact-send')).toBeDisabled();
   await page.screenshot({path:'reports/contact/captures/'+kind+'-'+(phone?'phone':'desktop')+'-'+theme+'-accepted.png'});
   if(phone){await page.locator('#toggle-navigation').click();await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused();}
  }
 });
});
test('verification and delivery failures preserve text and permit a fresh attempt',async({page})=>{
 await page.goto(base+'/contact');await page.locator('#contact-email').fill('editor@example.invalid');await page.locator('#contact-message').fill('Keep this draft in the form.');
 for(const scenario of ['verification-failed','verification-unavailable','delivery-unconfirmed']){
  await page.locator('#preview-scenario').selectOption(scenario);await page.locator('#contact-send').click();
  await expect(page.locator('#contact-result')).not.toBeEmpty();await expect(page.locator('#contact-message')).toHaveValue('Keep this draft in the form.');
  await expect(page.locator('#contact-send')).toBeEnabled();
 }
 await expect(page.locator('#contact-result')).toContainText('may have been forwarded');
 await page.locator('#preview-scenario').selectOption('accepted');await page.locator('#contact-send').click();
 await expect(page.locator('#contact-result')).toContainText('Accepted for forwarding');
});
test('duplicate clicks do not send twice; transport failure is explicit',async({page})=>{
 let count=0;
 await page.route('**/api/contact',async route=>{count++;await new Promise(r=>setTimeout(r,350));await route.abort('connectionfailed');});
 await page.goto(base+'/contact');await page.locator('#contact-email').fill('editor@example.invalid');await page.locator('#contact-message').fill('Do not resend automatically.');
 await page.locator('#contact-send').click();await page.locator('#contact-form').dispatchEvent('submit');
 await expect(page.locator('#contact-result')).toContainText('No confirmation reached');expect(count).toBe(1);await expect(page.locator('#contact-result')).toContainText(/Reference: KW-/);await expect(page.locator('#contact-message')).toHaveValue('Do not resend automatically.');
});
test('no JavaScript retains direct email; runtime preserves static routes and 404s',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto(base+'/contact/copyright');await expect(page.locator('noscript a')).toHaveAttribute('href','mailto:admin@kenshi.wiki');await expect(page.locator('noscript a')).toBeVisible();await expect(page.locator('#contact-send')).toBeDisabled();await context.close();
 for(const method of ['get','head'])for(const path of ['/missing-contact-review','/nested/missing-review']){
  expect((await request[method](base+path)).status()).toBe(404);
 }
 expect((await request.get(base+'/catun#missing-section')).status()).toBe(200);
 expect((await request.get(base+'/dog',{maxRedirects:0})).status()).toBe(301);
});
test('search excludes form controls and includes both explanatory pages',async({page})=>{
 const report=JSON.parse(fs.readFileSync('reports/utilities/search-coverage.json'));
 for(const path of ['/contact','/contact/copyright'])expect(report.records.some(r=>r.path===path)).toBe(true);
 await page.goto(base+'/contact');
 const result=await page.evaluate(async()=>{
  const pf=await import('/pagefind/pagefind.js');const r=await pf.search('Reply email');return Promise.all(r.results.map(async x=>(await x.data()).url));
 });expect(result).not.toContain('/contact');expect(result).not.toContain('/contact/copyright');
});

test('expired verification refreshes; blocked verification retains an email fallback',async({page})=>{
 await page.goto(base+'/contact');await expect(page.locator('#contact-send')).toBeEnabled();
 await page.evaluate(()=>window.turnstile._expire());await expect(page.locator('#contact-send')).toBeEnabled();
 await page.route('**/__contact-preview/verification.js',route=>route.abort());await page.reload();
 await expect(page.locator('#contact-send')).toBeDisabled();await expect(page.locator('#contact-availability')).toContainText('could not load',{timeout:15000});
 await expect(page.locator('main a[href="mailto:admin@kenshi.wiki"]').first()).toBeVisible();
});

test('an ordinary preview cannot submit even when the public sitekey is present',async({page})=>{
 await page.route('**/__contact-preview/verification.js',route=>route.abort());
 await page.route('**/contact',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/data-origin="[^"]*"/,'data-origin="https://kenshi.wiki"');
  await route.fulfill({response,body});
 });
 await page.goto(base+'/contact');
 await expect(page.locator('#contact-availability')).toContainText('This preview does not send messages');
 await expect(page.locator('#contact-send')).toBeDisabled();
});
