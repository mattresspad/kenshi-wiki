import {test,expect} from '@playwright/test';
const categories=['Article stubs','Locations','United Cities'];
const identity='matrix(1, 0, 0, 1, 0, 0)',rotated='matrix(0, 1, -1, 0, 0, 0)';
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe(`frame refinements ${phone?'phone':'desktop'} ${theme}`,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900}});
 test('footer states, settings indicator and category navigation',async({page},info)=>{
  await page.goto('/catun?theme='+theme);
  const footer=page.locator('footer'),contact=footer.getByRole('link',{name:'Contact',exact:true});
  for(const link of await footer.getByRole('link').all())await expect(link).toHaveCSS('text-decoration-line','none');
  const warm=await footer.evaluate(e=>getComputedStyle(e).getPropertyValue('--heading-link').trim());
  const color=await page.evaluate(value=>{const e=document.createElement('span');e.style.color=value;document.body.append(e);const c=getComputedStyle(e).color;e.remove();return c;},warm);
  const normal=await contact.evaluate(e=>getComputedStyle(e).color);
  await contact.hover();await expect(contact).toHaveCSS('color',color);expect(color).not.toBe(normal);
  await page.mouse.move(0,0);await contact.focus();await expect(contact).toHaveCSS('color',color);await expect(contact).toHaveCSS('outline-style','solid');
  await expect(page.locator('.lead-text a').first()).toHaveCSS('text-decoration-line','underline');
  await page.screenshot({path:info.outputPath('footer.png'),fullPage:!phone});
  const navigation=page.locator('#toggle-navigation');
  if(phone)await navigation.click();
  const button=page.getByRole('button',{name:'Sidebar settings',exact:true}),triangle=button.locator('svg');
  await expect(triangle).toHaveAttribute('aria-hidden','true');await expect(triangle).toHaveCSS('transform',identity);
  await button.focus();await page.keyboard.press('Enter');await expect(button).toHaveAttribute('aria-expanded','true');
  await expect(triangle).toHaveCSS('transform',rotated);await expect(page.locator('#settings-panel input:checked')).toBeFocused();
  await page.screenshot({path:info.outputPath('settings-open.png'),fullPage:false});
  await page.keyboard.press('Escape');await expect(button).toBeFocused();await expect(triangle).toHaveCSS('transform',identity);
  await button.press('Space');await expect(triangle).toHaveCSS('transform',rotated);
  if(phone){await page.locator('#scrim').click({position:{x:350,y:100}});await expect(navigation).toBeFocused();await expect(button).toHaveAttribute('aria-expanded','false');await navigation.click();}
  await button.click();await expect(button).toHaveAttribute('aria-expanded',phone?'true':'false');
  if(phone){await page.keyboard.press('Escape');await page.keyboard.press('Escape');await expect(navigation).toBeFocused();}
  await expect(page.getByRole('navigation',{name:'Page categories',exact:true})).toHaveCount(0);
  const links=phone?page.locator('#article-tools .menu-list a[href^="/category/"]'):page.locator('.context-cats a');
  if(phone)await page.locator('#article-tools > summary').click();
  await expect(links).toHaveText(categories);
  await links.filter({hasText:'Locations'}).click();await expect(page).toHaveURL(/\/category\/locations$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 });
});
for(const width of [1440,1024,390])test(`categories and legacy targets at ${width}px without JavaScript`,async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width,height:900}}),page=await context.newPage();
 try{
  for(const fragment of ['catlinks','mw-normal-catlinks']){
   await page.goto('/catun#'+fragment);
   const target=page.locator('#'+fragment);await expect(target).toHaveCount(1);await expect(target).toBeInViewport();
   expect(await target.evaluate(e=>!!e.closest('.context-row'))).toBe(true);
   await expect(page.getByRole('navigation',{name:'Page categories',exact:true})).toHaveCount(0);
  }
  const compact=width<=1150;if(compact){await page.locator('#article-tools > summary').focus();await page.keyboard.press('Enter');}
  const links=page.locator(compact?'#article-tools .menu-list a[href^="/category/"]':'.context-cats a');await expect(links).toHaveText(categories);
  await links.filter({hasText:'United Cities'}).click();await expect(page).toHaveURL(/\/category\/united-cities$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }finally{await context.close();}
});
test('printed categories retain membership once without duplicate bookmark IDs',async({page},info)=>{
 await page.goto('/catun');await expect(page.locator('.end-categories')).toBeHidden();
 await page.emulateMedia({media:'print'});
 await expect(page.locator('.top')).toBeHidden();await expect(page.locator('.end-categories')).toBeVisible();await expect(page.locator('.end-categories a')).toHaveText(categories);
 for(const id of ['catlinks','mw-normal-catlinks'])await expect(page.locator('#'+id)).toHaveCount(1);
 await page.screenshot({path:info.outputPath('print-categories.png'),fullPage:true});
 await page.goto('/blood-bandit-camp');await expect(page.locator('.end-categories')).toBeHidden();
});
