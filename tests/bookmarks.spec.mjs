import {test,expect} from '@playwright/test';
import {load} from 'cheerio';
import evidence from '../conversion/bookmarks/restoration.json' with {type:'json'};
const byId=(page,id)=>page.locator('[id='+JSON.stringify(id)+']');
const fragment=id=>'#'+encodeURIComponent(id);

test('the eleven compatibility aliases are unique and precede the unchanged headings',async({request})=>{
 expect(evidence.cases).toHaveLength(11);
 expect(evidence.cases.flatMap(c=>c.occurrences)).toHaveLength(14);
 for(const c of evidence.cases){
  const response=await request.get(c.path);expect(response.status()).toBe(200);
  const $=load(await response.text()), ids=$('[id]').toArray().map(e=>e.attribs.id);
  expect(new Set(ids).size).toBe(ids.length);
  const alias=$('[id]').filter((_,e)=>e.attribs.id===c.old);
  expect(alias.attr('data-bookmark-target')).toBe(c.target);
  expect(alias.attr('aria-hidden')).toBe('true');
  expect(alias.next().attr('id')).toBe(c.target);
  expect(alias.next().text().trim()).toBe(c.heading);
 }
});

for(const phone of [false,true])for(const theme of ['light','dark'])test((phone?'phone':'desktop')+' '+theme+' old bookmarks and recorded links keep keyboard position',async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
 await page.addInitScript(theme=>localStorage.setItem('wiki-theme',theme),theme);
 for(const c of evidence.cases){
  await page.goto(c.path+fragment(c.old));
  await expect(byId(page,c.target)).toBeFocused();
  await expect(byId(page,c.target)).toBeInViewport();
  expect(decodeURIComponent(new URL(page.url()).hash.slice(1))).toBe(c.old);
  const seen=new Map();
  for(const o of c.occurrences){
   await page.goto(o.path);
   const key=o.path+' '+o.href,index=seen.get(key)??0;seen.set(key,index+1);
   const link=page.locator('.lead-text a[href='+JSON.stringify(o.href)+'],.article-body a[href='+JSON.stringify(o.href)+']').nth(index);
   await link.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
   await link.focus();await link.press('Enter');
   await expect(byId(page,c.target)).toBeFocused();
   await expect(byId(page,c.target)).toBeInViewport();
   expect(decodeURIComponent(new URL(page.url()).hash.slice(1))).toBe(c.old);
   expect(new URL(page.url()).pathname).toBe(c.path);
  }
 }
});

test('same-fragment activation restores focus; normal and malformed hashes remain safe',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/combat-speed#Item_Related');
 const link=page.locator('.article-body a[href="#Item_Related"],.lead-text a[href="#Item_Related"]').first();
 await link.focus();await link.press('Enter');await expect(byId(page,'item-related')).toBeFocused();
 await page.goto('/combat-speed#item-related');await expect(byId(page,'item-related')).toBeInViewport();
 await page.goto('/combat-speed#%E0%A4%A');expect(await page.title()).toContain('Combat Speed');
 expect(errors).toEqual([]);
});

test('all eleven old fragments still navigate with JavaScript disabled',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL,viewport:{width:390,height:844}});
 const page=await context.newPage();
 try {for(const c of evidence.cases){await page.goto(c.path+fragment(c.old));await expect(byId(page,c.target)).toBeInViewport();}}
 finally {await context.close();}
});
