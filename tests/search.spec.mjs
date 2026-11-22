import {originalUtilities} from '../src/lib/utility-routes.mjs';
import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {utilityStage,historicalSourceRedirects} from '../src/lib/utility-routes.mjs';
import {snapshot} from '../src/lib/catalog.mjs';
const coverage=()=>JSON.parse(fs.readFileSync('reports/utilities/search-coverage.json'));
test.skip(utilityStage<4,'Search checkpoint not active');
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' search '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme});
 test('title suggestions, full-text pagination and nested canonical paths',async({page})=>{
  await page.goto('/search?theme='+theme);await page.locator('#query').fill('samurai');await expect(page.locator('.full-search [role=option]')).toHaveCount(8);await page.locator('#query').press('ArrowDown');await expect(page.locator('#query')).toHaveAttribute('aria-activedescendant',/title-suggestions/);await page.locator('#query').press('Escape');await expect(page.locator('.full-search [role=listbox]')).toBeHidden();
  await page.goto('/search?q=armour&fulltext=1&theme='+theme);await expect(page.locator('.search-results>li')).toHaveCount(20);await page.getByRole('link',{name:'Next',exact:true}).click();await expect(page.locator('#search-status')).toContainText('page 2');await expect(page.locator('#search-status')).toBeFocused();expect(await page.locator('.search-results').getAttribute('start')).toBe('21');
  await page.goto('/search?q=code&fulltext=1&theme='+theme);await expect(page.locator('.search-results>li').first()).toBeVisible();
  await page.goto('/search?q=  DaMaGe_Limb_Data  &theme='+theme);await expect(page).toHaveURL(/\/search/); // Spaces do not replace the title's slash.
  await page.goto('/search?q=Damage%2FLimb_Data');await expect(page).toHaveURL(/\/damage\/limb-data$/);
  await page.goto('/search?q=%20%20PACK_BULL%20%20');await expect(page).toHaveURL(/\/pack-bull$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  if(phone){await page.locator('#toggle-navigation').click();await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused()}
 });
 test('Turkish body text, empty state, no results and header keyboard selection',async({page})=>{
  await page.goto('/search?q=kütleçekim&fulltext=1&theme='+theme);await expect(page.locator('.search-results a[href="/history-of-kenshi/tr"]')).toBeVisible();
  await page.goto('/search?q=%22zzzxnoarticlexyz%22&fulltext=1');await expect(page.locator('#search-status')).toContainText('No matches');
  await page.goto('/search?q=%20%20');await expect(page.locator('#search-status')).toContainText('Enter a title');
  await page.locator('#wiki-search').fill('Beep');await expect(page.locator('form.search [role=option]').first()).toHaveText('Beep');await page.locator('#wiki-search').press('ArrowDown');await page.locator('#wiki-search').press('Enter');await expect(page).toHaveURL(/\/beep$/);
 });
});
test('failed index loads are explicit and stale searches cannot replace the newer query',async({page})=>{
 await page.route('**/pagefind/**',r=>r.abort());await page.goto('/search?q=armour&fulltext=1');await expect(page.locator('#search-status')).toContainText('could not be loaded');await expect(page.locator('#search-retry')).toBeVisible();await page.unroute('**/pagefind/**');await page.locator('#search-retry').click();await expect(page.locator('.search-results>li')).toHaveCount(20);
 let release;const hold=new Promise(r=>release=r);await page.route('**/pagefind/pagefind.js',async r=>{await hold;await r.continue()});await page.goto('/search?q=armour&fulltext=1');await page.locator('#query').fill('kütleçekim');await page.locator('.full-search button').click();release();await expect(page.locator('.search-results a[href="/history-of-kenshi/tr"]')).toBeVisible();await expect(page.locator('#query')).toHaveValue('kütleçekim');await expect(page.locator('.search-results')).not.toContainText('Samurai Armour');
});
test('random pool is exact and replaces its navigation history entry',async({browser})=>{
 const pool=coverage().random.paths;expect(pool.length).toBe(coverage().indexed-originalUtilities.length===2191?2114:2113);expect(new Set(pool).size).toBe(pool.length);
 for(const value of [0,0.5,0.999999]){const ctx=await browser.newContext();await ctx.addInitScript(v=>{Math.random=()=>v},value);const page=await ctx.newPage();await page.goto('/catun');await page.goto('/random');await expect(page).toHaveURL(new RegExp(pool[Math.floor(value*pool.length)].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));await page.goBack();await expect(page).toHaveURL(/\/catun$/);await ctx.close()}
});
test('404 GET/HEAD status, safe path display, canonical exclusions and every frozen alias',async({page,request})=>{
 test.setTimeout(120000);
 for(const path of ['/unknown-review-page','/nested/review/unknown','/category/pages-with-non-numeric-formatnum-arguments'])for(const method of ['get','head']){const r=await request[method](path);expect(r.status()).toBe(404);if(method==='get'){const html=await r.text();expect(html).toContain('Page not found');expect(html).not.toContain('rel="canonical"')}}
 expect((await request.get('/catun#missing-bookmark')).status()).toBe(200);
 await page.goto('/kenshi?review=1#Gallery');await expect(page).toHaveURL(/\/about-kenshi\?review=1#Gallery$/);await expect(page.locator('#Gallery')).toBeInViewport();
 await page.goto('/nested/%3Cscript%3Ebad%3C/script%3E');await expect(page.locator('#missing-path code')).toContainText('%3Cscript%3E');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');await expect(page.locator('link[rel=canonical]')).toHaveCount(0);
 for(const rule of [...snapshot.redirects,...historicalSourceRedirects]){const r=await request.get(rule.from+'?review=1',{maxRedirects:0});expect(r.status(),rule.from).toBe(rule.status);expect(new URL(r.headers().location,'https://kenshi.wiki').href,rule.from).toBe(new URL(rule.to+'?review=1','https://kenshi.wiki').href)}
 for(const path of ['/search','/random']){const html=await (await request.get(path)).text();expect(html).toContain('noindex,follow');expect(html).toContain('https://kenshi.wiki'+path)}
});
test('search, random and missing pages offer useful navigation with JavaScript disabled',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await ctx.newPage();for(const path of ['/search','/random','/nested/absent']){await page.goto(path);expect(await page.locator('noscript').evaluate(e=>e.textContent)).toContain('JavaScript');await expect(page.locator('noscript p')).toBeVisible();await expect(page.locator('main a[href="/"]')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)}await ctx.close();
});
