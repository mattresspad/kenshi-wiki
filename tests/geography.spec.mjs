import {test,expect} from '@playwright/test';
import {snapshot, origin} from '../src/lib/catalog.mjs';
import {includedIds, geographyIds, checkpoint, roster} from '../scripts/geography/batches.mjs';
import {load} from 'cheerio';

test('geography aliases and public paths resolve on the static server',async({request})=>{
  const accepted = new Set(['catun',...includedIds]);
  const paths = new Set(snapshot.articles.filter(a=>accepted.has(a.id)).map(a=>a.path));
  const rules=snapshot.redirects.filter(r=>paths.has(r.to));
  for(const rule of rules){
    const res=await request.get(rule.from,{maxRedirects:0});
    expect(res.status(),rule.from).toBe(rule.status);
    expect(new URL(res.headers().location,origin).pathname).toBe(rule.to);
  }
  if(checkpoint.included===roster.batches.length) {
    expect(geographyIds.size).toBe(382);
    expect(rules).toHaveLength(42);
    for(const [route,count] of [['zones',72],['spawning-locations',18]]) {
      const $=load(await(await request.get('/category/'+route)).text());
      const links=$('[data-member]').toArray();
      expect(links).toHaveLength(count);
      expect(links.every(a=>a.attribs.href===a.attribs['data-member'])).toBe(true);
    }
    const $=load(await(await request.get('/blood-bandit-camp')).text());
    expect($('.end-categories a')).toHaveLength(0);
  }
});

for(const phone of [false,true]) test('Catun journey and original geography bookmarks '+(phone?'on phone':'on desktop'),async({page})=>{
  test.skip(!includedIds.has('catun/fishmen'));
  await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
  await page.goto('/category/locations');
  await page.locator('[data-member="/catun/fishmen"]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/catun\/fishmen$/);
  await expect(page.locator('.factbox')).toContainText('1533709-__world reactions Slavers.mod');
  await expect(page.locator('.lead-text')).toContainText('Every building is destroyed');
  await page.locator('.lead-text a[href="/catun"]').click();
  await page.locator('.lead-text a[href="/bonefields"]').first().click();
  await expect(page.locator('.opening-copy .quote figcaption')).toContainText('Skeleton');
  await expect(page.locator('.factbox a')).toHaveCount(9);
  await page.locator('.article-body a[href="/catun"]').first().click();
  await page.locator('main a[href="/catun-alpha"]').click();
  await expect(page.locator('.historical-notice')).toBeVisible();
  await expect(page.locator('.lead-text')).toContainText('0.90.0');
  await page.locator('#cite_ref-1 a').press('Enter');
  await expect(page).toHaveURL(/#cite_note-1$/);
  await page.locator('#cite_note-1 a[href="#cite_ref-1"]').press('Enter');
  await expect(page).toHaveURL(/#cite_ref-1$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
});

test('keyboard sorts loot prices across the two-column item heading',async({page})=>{
  test.skip(!includedIds.has('berserker-village'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/berserker-village');
  const table=page.locator('.article-body table[data-sortable]').first();
  const header=table.getByRole('columnheader',{name:/Price each/});
  const button=header.getByRole('button',{name:'Sort by Price each'});
  for(const direction of ['ascending','descending']){
    await button.press('Enter');
    await expect(header).toHaveAttribute('aria-sort',direction);
    const prices=await table.locator('tbody tr').evaluateAll(rows=>rows.map(row=>Number(row.cells[row.cells.length-1].dataset.sortValue)));
    expect(new Set(prices).size).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a,b)=>direction==='ascending'?a-b:b-a));
  }
});

test('Bad Teeth retains its five override destinations in source priority order',async({page})=>{
  test.skip(!includedIds.has('bad-teeth'));
  await page.goto('/bad-teeth#town-overrides');
  const rule=page.locator('#town-overrides ~ ul').first().getByRole('link');
  expect(await rule.evaluateAll(as=>as.map(a=>a.getAttribute('href')))).toEqual(
    ['half-destroyed','destroyed','shek-kingdom','krals-chosen','united-cities'].map(s=>'/bad-teeth/'+s));
  await rule.nth(2).press('Enter');
  await expect(page.locator('h1')).toHaveText('Bad Teeth/Shek Kingdom');
});
