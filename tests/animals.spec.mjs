import {test,expect} from '@playwright/test';
import {load} from 'cheerio';
import {readFileSync} from 'node:fs';
import {selectedIds,expectedIds} from '../scripts/conversion/batches.mjs';
import {snapshot,origin} from '../src/lib/catalog.mjs';
import roster from '../conversion/animals/roster.json' with {type:'json'};
const included=selectedIds('animals'),proof=JSON.parse(readFileSync('conversion/animals/reference.json'));
test('Animals membership, original bookmarks, reused IDs and redirects agree',async({request})=>{
 test.skip(!included.size);
 const $=load(await(await request.get('/category/animals')).text());
 expect($('[data-member]').toArray().map(e=>e.attribs['data-member']).sort()).toEqual(snapshot.articles.filter(a=>roster.members.includes(a.id)).map(a=>a.path).sort());
 for(const article of snapshot.articles.filter(a=>roster.members.includes(a.id)))expect($('[data-member="'+article.path+'"]').attr('href')).toBe((expectedIds.has(article.id)?'':origin)+article.path);
 for(const id of included){const article=snapshot.articles.find(a=>a.id===id),html=load(await(await request.get(article.path)).text()),ids=html('[id]').toArray().map(e=>e.attribs.id);for(const fragment of proof.articles[id].ids)expect(ids,id+'#'+fragment).toContain(fragment);}
 for(const [from,to,id] of [['/dog','/bonedog','bonedog'],['/land-bats','/landbat','landbat']])if(included.has(id)){const r=await request.get(from,{maxRedirects:0});expect(r.status()).toBe(301);expect(new URL(r.headers().location,origin).pathname).toBe(to);}
});
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' animals '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone,colorScheme:theme});
 test('pilot panels, anatomy, formulas and outline focus are usable',async({page})=>{
  test.skip(!included.has('bonedog'));
  for(const id of ['bonedog','pack-bull','beak-thing']){
   await page.goto('/'+id+'?theme='+theme+'#anatomy');await expect(page.locator('#anatomy')).toBeInViewport();
   const anatomy=page.locator('table').filter({has:page.getByRole('columnheader',{name:'Chance of Hitting',exact:true})});
   await expect(anatomy.getByRole('columnheader')).toHaveText(['Body Part','Total Health','Chance of Hitting']);await expect(anatomy.locator('tbody tr')).toHaveCount(7);
   await expect(page.locator('.creature-table caption')).toHaveText(['Attributes','Growth stages','Death Items']);
   await expect(page.locator('.creature-table-note').filter({hasText:'current age'})).toHaveCount(1);
   const toggle=page.locator('#toggle-navigation');if(phone){await toggle.press('Enter');await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await toggle.press('Enter');}
   await page.locator('.page-outline a[href="#damage-calculations"]').press('Enter');await expect(page.locator('#damage-calculations')).toBeFocused();
   if(phone)await expect(page.locator('.rail')).toBeHidden();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
   expect(await page.locator('main').evaluate(el=>el.scrollWidth-el.clientWidth)).toBe(0);
  }
 });
 test('Fauna comparison keeps its rows, artwork and right edge accessible',async({page})=>{
  test.skip(!included.has('fauna'));await page.goto('/fauna?theme='+theme);
  const tables=page.locator('.fauna-comparison');await expect(tables).toHaveCount(3);
  for(const [i,count] of [13,5,7].entries())await expect(tables.nth(i).locator('tbody tr')).toHaveCount(count);
  const region=tables.first().locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');
  if(phone){expect(await region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);await page.keyboard.press('Home');
   const box=await region.boundingBox(),session=await page.context().newCDPSession(page);const y=box.y+Math.min(box.height/2,180);
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-30,y}]});
   for(let x=box.x+box.width-50;x>box.x+30;x-=30)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);await session.detach();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
  for(const image of await tables.locator('img').all())expect(await image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
 });
 test('animal reader journeys stay local when their destinations arrive',async({page})=>{
  test.skip(!included.has('fauna'));
  for(const chain of [['/fauna','/bonedog','/wolves'],['/bonefields','/beak-thing','/elder-beak-thing'],['/modding/meitou/make-a-saddle-pack','/pack-bull','/nomads']]){
   await page.goto(chain[0]+'?theme='+theme);
   for(const destination of chain.slice(1)) {await page.locator('main a[href="'+destination+'"]').first().click();await expect(page).toHaveURL(new RegExp(destination.replaceAll('/','\/')+'$'));}
  }
 });
});
