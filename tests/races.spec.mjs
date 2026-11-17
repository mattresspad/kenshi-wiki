import {test,expect} from '@playwright/test';
import {load} from 'cheerio';
import {readFileSync} from 'node:fs';
import {selectedIds} from '../scripts/conversion/batches.mjs';
import {snapshot,origin} from '../src/lib/catalog.mjs';
import roster from '../conversion/races/roster.json' with {type:'json'};
const included=selectedIds('races'),proof=JSON.parse(readFileSync('conversion/races/reference.json'));
test('race category, original bookmarks and all citation links remain registered',async({request})=>{
 test.skip(!included.size);
 const $=load(await(await request.get('/category/races')).text());
 expect($('[data-member]').toArray().map(el=>el.attribs['data-member']).sort()).toEqual(snapshot.articles.filter(a=>roster.members.includes(a.id)).map(a=>a.path).sort());
 for(const article of snapshot.articles.filter(a=>roster.members.includes(a.id)))expect($('[data-member="'+article.path+'"]').attr('href')).toBe((included.has(article.id)?'':origin)+article.path);
 for(const id of included){
   const article=snapshot.articles.find(a=>a.id===id),html=load(await(await request.get(article.path)).text());
   for(const fragment of proof.articles[id].ids)expect(html('[id]').toArray().some(el=>el.attribs.id===fragment),id+'#'+fragment).toBe(true);
   for(const a of html('sup[id^=cite_ref] a[href],li[id^=cite_note] .mw-cite-backlink a[href]').toArray())
     expect(html('[id]').toArray().some(el=>el.attribs.id===a.attribs.href.slice(1)),id+' '+a.attribs.href).toBe(true);
 }
 if(included.has('hive')){const r=await request.get('/hiver',{maxRedirects:0});expect(r.status()).toBe(301);expect(new URL(r.headers().location,origin).pathname).toBe('/hive');}
});
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' races '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone,colorScheme:theme});
 test('pilot anatomy, property captions, focus and direct bookmarks stay readable',async({page})=>{
  test.skip(!included.has('greenlander'));
  for(const id of ['greenlander','hive-worker-drone','skeleton-race']){
   await page.goto('/'+id+'?theme='+theme+'#anatomy');
   await expect(page.locator('#anatomy')).toBeInViewport();
   const anatomy=page.locator('table').filter({has:page.getByRole('columnheader',{name:'Chance of Hitting',exact:true})});
   await expect(anatomy.getByRole('columnheader')).toHaveText(['Body Part','Total Health','Chance of Hitting','Severed Limbs']);
   await expect(anatomy.locator('tbody tr')).toHaveCount(7);
   expect(await anatomy.innerText()).toContain('140');
   if(id!=='skeleton-race'){
    await expect(page.locator('.imported-property-table caption')).toHaveCount(4);
    await expect(page.locator('.imported-property-table').first()).toContainText('1kg');
    await expect(page.locator('.imported-property-table').first()).toContainText('10/10');
   }
   const toggle=page.locator('#toggle-navigation');
   if(phone){await toggle.press('Enter');await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await page.keyboard.press('Enter');}
   const outline=page.locator('.page-outline a[href="#experience-multipliers"]');
   await outline.press('Enter');await expect(page.locator('#experience-multipliers')).toBeFocused();
   if(phone)await expect(page.locator('.rail')).toBeHidden();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
  }
 });
 test('grouped comparison reaches Soldierbot by touch and keyboard without page overflow',async({page})=>{
  test.skip(!included.has('races'));
  await page.goto('/races?theme='+theme);
  const table=page.locator('table.race-comparison'),region=table.locator('..');
  await expect(table.locator('thead tr')).toHaveCount(2);
  await expect(table.locator('thead th[scope=colgroup]')).toHaveText(['Human','Hive','Skeleton']);
  await expect(table.locator('button')).toHaveCount(0);
  await region.evaluate(el=>el.scrollIntoView({block:'start'}));await region.focus();await page.keyboard.press('End');
  await expect(table.getByRole('columnheader',{name:'Soldierbot',exact:true})).toBeInViewport();
  await page.keyboard.press('Home');
  expect(await region.evaluate(el=>el.scrollLeft)).toBe(0);
  if(phone){
   const box=await region.boundingBox();const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-20,y:box.y+80}]});
   for(let x=box.x+box.width-30;x>box.x+20;x-=30)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:box.y+80}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await expect.poll(()=>region.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 });
});

for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' Hive sources '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},colorScheme:theme});
 test('citation goes to its note and returns with keyboard focus',async({page})=>{
  test.skip(!included.has('hive'));
  await page.goto('/hive?theme='+theme+'#cite_ref-1');
  const ref=page.locator('[id="cite_ref-1"]'),note=page.locator('[id="cite_note-1"]');
  await ref.getByRole('link').press('Enter');await expect(note).toBeFocused();await expect(note).toBeInViewport();
  await note.locator('a[href="#cite_ref-1"]').press('Enter');await expect(ref).toBeFocused();await expect(ref).toBeInViewport();
 });
});
