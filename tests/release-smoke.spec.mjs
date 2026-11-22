import {test,expect} from '@playwright/test';
import {load} from 'cheerio';

test('deployed assets, aliases and genuine 404 responses',async({request})=>{
 for(const path of ['/','/catun','/category/locations','/pages-needing-work','/search-titles.json','/pagefind/pagefind.js']){
  const response=await request.get(path);expect(response.status(),path).toBe(200);
  if(process.env.WIKI_RELEASE_VERIFY==='preview')expect(response.headers()['x-robots-tag']??'').toContain('noindex');
  if(process.env.WIKI_RELEASE_VERIFY==='live'&&path==='/')expect(response.headers()['x-robots-tag']??'').not.toContain('noindex');
 }
 for(const path of ['/release-smoke-missing','/nested/release-smoke-missing'])for(const method of ['GET','HEAD']){
  const response=await request.fetch(path,{method});expect(response.status()).toBe(404);
  if(method==='GET'){const body=await response.text();expect(body).toContain('Page not found');expect(body).not.toContain('rel="canonical"');}
 }
 const alias=await request.get('/armor-king?release=1',{maxRedirects:0});
 expect(alias.status()).toBe(301);expect(new URL(alias.headers().location,'https://kenshi.wiki').pathname).toBe('/armour-king');
 expect(new URL(alias.headers().location,'https://kenshi.wiki').search).toBe('?release=1');
 expect((await request.get('/catun#nonexistent-fragment')).status()).toBe(200);
});

for(const phone of [false,true])for(const theme of ['light','dark'])test('deployed reader journey '+(phone?'phone':'desktop')+' '+theme,async({page},info)=>{
 await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
 await page.addInitScript(theme=>localStorage.setItem('wiki-theme',theme),theme);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/category/locations');
 await expect(page.locator('[data-member="/catun"]')).toHaveAttribute('href','/catun');
 await page.locator('[data-member="/catun"]').click();await page.waitForLoadState('load');
 await expect(page.locator('h1')).toHaveText('Catun');
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://kenshi.wiki/catun');
 await expect(page.locator('.factbox')).toContainText('Bonefields');
 await expect(page.getByRole('link',{name:'Recorded Markdown'})).toHaveAttribute('href',/github\.com\/mattresspad\/kenshi-wiki\/blob\/[a-f0-9]{40}\//);
 if(process.env.WIKI_EDIT_BRANCH){if(phone){await page.locator('#tools > summary').click();await expect(page.locator('.small-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',/\/edit\/main\/src\/content\/articles\/locations\/towns\/catun\.md$/);await page.keyboard.press('Escape');}
 else await expect(page.locator('.wide-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',/\/edit\/main\/src\/content\/articles\/locations\/towns\/catun\.md$/);}
 if(phone){await page.locator('#toggle-navigation').click();await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused();}
 await page.screenshot({path:info.outputPath('catun-'+theme+'.png')});
 await page.locator('[data-work-note] a').click();await page.waitForLoadState('load');
 await expect(page.locator('article:target')).toBeVisible();
 if(process.env.WIKI_EDIT_BRANCH)await expect(page.locator('article:target').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',/\/edit\/main\/src\/content\/articles\//);
 await page.goto('/catun-alpha');
 await page.locator('#cite_ref-1 a').press('Enter');await expect(page.locator('#cite_note-1')).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.locator('#cite_note-1 a[href="#cite_ref-1"]')).toBeFocused();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#cite_ref-1$/);await expect(page.locator('#cite_ref-1')).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 expect(errors).toEqual([]);
});

test('deployed title search, full-text index and random navigation',async({page,request})=>{
 await page.goto('/search');
 await page.locator('#query').fill('Beep');await expect(page.locator('.full-search [role=option]').first()).toHaveText('Beep');
 await page.locator('#query').press('ArrowDown');await page.locator('#query').press('Enter');await expect(page).toHaveURL(/\/beep$/);
 await page.goto('/search?q=armour&fulltext=1');await expect(page.locator('.search-results>li')).toHaveCount(20);
 const random=load(await(await request.get('/random')).text()),pool=JSON.parse(random('#random-pool').text());
 expect(pool.length).toBeGreaterThan(2000);expect(new Set(pool).size).toBe(pool.length);
 await page.goto('/random');await expect(page).not.toHaveURL(/\/random$/);
 expect(pool).toContain(new URL(page.url()).pathname);
});
