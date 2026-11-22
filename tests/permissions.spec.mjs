import {test,expect} from '@playwright/test';
import {editBranch} from './edit-target.mjs';
import {editableSource,recordedSource} from '../src/lib/page-source.mjs';

const path='/copyright-and-permissions';
const file='src/content/site/copyright-and-permissions.md';
for(const phone of [false,true])for(const theme of ['light','dark']) {
 test(`permissions guidance and keyboard contact: ${phone?'phone':'desktop'} ${theme}`,async({page})=>{
  await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
  await page.emulateMedia({colorScheme:theme});
  await page.goto('/contributors?theme='+theme+'#licensing');
  await expect(page.locator('#licensing')).toBeInViewport();
  const guidance=page.locator('main a[href="'+path+'"]');
  await guidance.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(path+'$'));
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Copyright and permissions');
  const email=page.locator('main a[href="mailto:admin@kenshi.wiki"]').first();
  await email.focus();await expect(email).toBeFocused();await expect(email).toBeInViewport();
  const section=page.getByRole('heading',{name:'How concerns are reviewed',exact:true});
  if(phone)await page.locator('#toggle-navigation').press('Enter');
  const outline=page.locator('.page-outline').getByRole('link',{name:'How concerns are reviewed',exact:true});
  await outline.focus();await page.keyboard.press('Enter');
  await expect(section).toBeFocused();await expect(section).toBeInViewport();
  await expect(page.locator('footer').getByRole('link',{name:'Copyright',exact:true})).toHaveAttribute('href',path);
  await expect(page.locator('footer').getByRole('link',{name:'Artwork notices',exact:true})).toHaveAttribute('href','/notices/artwork.txt');
  if(phone)await page.locator('#tools > summary').click();
  if(editBranch)await expect(page.locator(phone?'.small-tools':'.wide-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',editableSource(file,editBranch).url);
  else await expect(page.locator(phone?'.small-tools':'.wide-tools').locator('.edit-file code')).toHaveText(file);
  await expect(page.getByRole('link',{name:'Page history',exact:true})).toHaveAttribute('href',recordedSource(file,editBranch||'main').history);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 });
}

test('permissions guidance and contact remain available at 320 pixels without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:844}});
 try{
  const page=await context.newPage();await page.goto(path);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  const email=page.locator('main a[href="mailto:admin@kenshi.wiki"]').first();
  await email.focus();await expect(email).toBeFocused();await expect(email).toBeInViewport();
  await page.locator('#tools > summary').click();
  if(editBranch)await expect(page.locator('.small-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',editableSource(file,editBranch).url);
  else {await page.locator('.small-tools .edit-file > summary').click();await expect(page.locator('.small-tools .edit-file code')).toHaveText(file);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 }finally{await context.close();}
});

test('the updated footer preserves the full desktop homepage fit',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('#frame')).not.toHaveAttribute('data-folded','');
 await expect(page.locator('footer').getByRole('link',{name:'Copyright',exact:true})).toBeInViewport();
 expect(await page.locator('main').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
});
