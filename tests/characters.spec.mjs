import {test,expect} from '@playwright/test';
import {load} from 'cheerio';import {readFileSync} from 'node:fs';
import {selectedIds,expectedIds} from '../scripts/conversion/batches.mjs';import {snapshot,origin} from '../src/lib/catalog.mjs';
import roster from '../conversion/characters/roster.json' with {type:'json'};
const included=selectedIds('characters'),proof=JSON.parse(readFileSync('conversion/characters/reference.json'));
test('Characters exact membership, bookmarks, citations and ready redirects agree',async({request})=>{
 test.setTimeout(180000);test.skip(!included.size);
 const $=load(await(await request.get('/category/characters')).text());
 expect($('[data-member]').toArray().map(e=>e.attribs['data-member']).sort()).toEqual(snapshot.articles.filter(a=>roster.members.includes(a.id)).map(a=>a.path).sort());
 for(const a of snapshot.articles.filter(a=>roster.members.includes(a.id)))expect($('[data-member="'+a.path+'"]').attr('href')).toBe((expectedIds.has(a.id)?'':origin)+a.path);
 for(const id of included){const a=snapshot.articles.find(a=>a.id===id),response=await request.get(a.path),html=load(await response.text()),ids=new Set(html('[id]').toArray().map(e=>e.attribs.id));expect(response.status()).toBe(200);for(const fragment of proof.articles[id].ids)expect(ids.has(fragment),id+'#'+fragment).toBe(true);await response.dispose();}
 const paths=new Set(snapshot.articles.filter(a=>included.has(a.id)).map(a=>a.path));for(const r of snapshot.redirects.filter(r=>paths.has(r.to))){const response=await request.get(r.from,{maxRedirects:0});expect(response.status()).toBe(r.status);expect(new URL(response.headers().location,origin).pathname).toBe(r.to);await response.dispose();}
});
for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' characters '+theme,()=>{
 test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone,colorScheme:theme});
 test('pilots preserve statistics, deep outline focus and local journeys',async({page})=>{
  test.skip(!included.has('beep'));
  await page.goto('/samurai?theme='+theme+'#statistics');await expect(page.locator('.character-statistics-warning')).toHaveCount(1);await expect(page.locator('.character-stat-group')).toHaveCount(7);await expect(page.locator('#statistics')).toBeInViewport();
  expect(await page.locator('main').evaluate(e=>e.scrollWidth-e.clientWidth)).toBe(0);
  await page.goto('/armour-king?theme='+theme);const toggle=page.locator('#toggle-navigation');if(phone){await toggle.press('Enter');await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await toggle.press('Enter');}
  const outline=page.locator('.page-outline a[href="#legwear"]');await outline.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});await outline.press('Enter');await expect(page.locator('#legwear')).toBeFocused();if(phone)await expect(page.locator('.rail')).toBeHidden();
  for(const chain of [['/mongrel','/beep'],['/emperor-tengu','/heft'],['/emperor-tengu','/world-states']]){await page.goto(chain[0]+'?theme='+theme);await page.locator('main a[href="'+chain[1]+'"]').first().click();await expect(page).toHaveURL(new RegExp(chain[1]+'$'));}
  if(included.has('unique-recruits')){await page.goto('/beep');await page.locator('main a[href="/unique-recruits"]').first().click();await expect(page.locator('h1')).toHaveText('Unique Recruits');}
 });
 test('character citation reaches its note and returns by keyboard',async({page})=>{
  test.skip(!included.has('agnu'));await page.goto('/agnu?theme='+theme);
  const ref=page.locator('sup[id^="cite_ref"]').first(),id=await ref.getAttribute('id'),link=ref.locator('a').first(),target=await link.getAttribute('href');
  await link.press('Enter');await expect(page.locator(target)).toBeInViewport();
  const back=page.locator(target).locator('a[href="#'+id+'"]').first();await back.press('Enter');await expect(ref).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 });
 test('recruit comparison sorts with keyboard and scrolls to qualifications on phone',async({page})=>{
  test.skip(!included.has('unique-recruits'));await page.goto('/unique-recruits?theme='+theme+'#named-recruits');const table=page.locator('.recruit-comparison'),region=table.locator('..');await expect(table.locator('thead th')).toHaveCount(5);await expect(table.locator('tbody tr')).toHaveCount(44);await expect(table.locator('input')).toHaveCount(0);
  const button=table.getByRole('button',{name:'Sort by Name',exact:true});await button.press('Enter');await expect(table.locator('thead th').first()).toHaveAttribute('aria-sort','ascending');const first=await table.locator('tbody tr').first().innerText();await button.press('Enter');await expect(table.locator('thead th').first()).toHaveAttribute('aria-sort','descending');expect(await table.locator('tbody tr').first().innerText()).not.toBe(first);
  await region.focus();await page.keyboard.press('End');if(phone){expect(await region.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);await page.keyboard.press('Home');await region.scrollIntoViewIfNeeded();const box=await region.boundingBox(),s=await page.context().newCDPSession(page),y=box.y+Math.min(180,box.height/2);await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-25,y}]});for(let x=box.x+box.width-45;x>box.x+25;x-=25)await s.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>region.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);await s.detach();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 });
 test('stock disclosure and removed-content qualification remain accessible',async({page})=>{
  test.skip(!included.has('fish-and-drugs-seller'));await page.goto('/fish-and-drugs-seller?theme='+theme);const detail=page.locator('main details.collapsible'),summary=detail.locator('summary');await expect(detail).toHaveAttribute('open','');await summary.press('Enter');await expect(detail).not.toHaveAttribute('open','');await summary.press('Enter');await expect(detail).toHaveAttribute('open','');await expect(detail).toContainText('c.144');
  if(included.has('crow-face')){await page.goto('/crow-face?theme='+theme);await expect(page.locator('.historical-notice')).toBeVisible();const ordered=await page.locator('main').evaluate(e=>{const n=e.querySelector('.historical-notice'),p=e.querySelector('.lead-text p');return !!(n.compareDocumentPosition(p)&Node.DOCUMENT_POSITION_FOLLOWING)});expect(ordered).toBe(true);}
 });
});
