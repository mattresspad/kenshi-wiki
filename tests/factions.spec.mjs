import {test,expect} from '@playwright/test';
import {load} from 'cheerio';
import {snapshot,origin} from '../src/lib/catalog.mjs';
import {includedIds,roster,checkpoint} from '../scripts/factions/batches.mjs';

async function reveal(page,link) {
  const parents=await link.evaluate(el=>{const out=[];for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open)out.unshift(p.querySelector(':scope > summary').textContent);return out;});
  for(const label of parents)await page.locator('main summary').filter({hasText:label}).first().press('Enter');
}
async function tabTo(page,target) {
  for(let i=0;i<180;i++) {if(await target.evaluate(el=>el===document.activeElement))return;await page.keyboard.press('Tab');}
  throw Error('Cannot reach '+await target.textContent());
}

test('the faction index keeps every registered member and activates incoming aliases',async({request})=>{
  test.skip(!includedIds.size);
  const $=load(await(await request.get('/category/factions')).text());
  const expected=snapshot.articles.filter(a=>roster.members.includes(a.id));
  expect($('[data-member]').toArray().map(a=>a.attribs['data-member']).sort()).toEqual(expected.map(a=>a.path).sort());
  const local=new Set(['the-holy-nation',...includedIds]);
  for(const record of expected)expect($('[data-member="'+record.path+'"]').attr('href')).toBe((local.has(record.id)?'':origin)+record.path);
  const paths=new Set(snapshot.articles.filter(a=>local.has(a.id)).map(a=>a.path));
  for(const rule of snapshot.redirects.filter(rule=>paths.has(rule.to))) {
    const res=await request.get(rule.from,{maxRedirects:0});
    expect(res.status()).toBe(rule.status);expect(new URL(res.headers().location,origin).pathname).toBe(rule.to);
  }
  if(checkpoint.included===roster.batches.length)expect($('[data-member][href^="https://kenshi.wiki"]').length).toBe(0);
});

for(const phone of [false,true])for(const theme of ['light','dark'])test.describe((phone?'phone':'desktop')+' factions '+theme,()=>{
  test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone,colorScheme:theme});
  test('settlements lead through each major faction to another settlement',async({page})=>{
    test.skip(!includedIds.has('united-cities'));
    for(const [start,faction,end] of [
      ['catun','united-cities','heft'],['admag','shek-kingdom','last-stand'],
      ['black-scratch','tech-hunters','worlds-end'],['eyesocket','slave-traders','port-south']
    ]) {
      await page.goto('/'+start+'?theme='+theme);
      const first=page.locator('main a[href="/'+faction+'"]').first();
      await reveal(page,first);await first.press('Enter');
      await expect(page).toHaveURL(new RegExp('/'+faction+'$'));
      const next=page.locator('main a[href="/'+end+'"]').first();
      await reveal(page,next);await next.press('Enter');
      await expect(page).toHaveURL(new RegExp('/'+end+'$'));
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
    }
  });
  test('fifth-level outline, drawer focus, citation return and relationship disclosure work by keyboard',async({page})=>{
    test.skip(!includedIds.has('united-cities'));
    await page.goto('/united-cities?theme='+theme);
    const toggle=page.locator('#toggle-navigation');
    if(phone){await toggle.press('Enter');await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await page.keyboard.press('Enter');}
    const rail=page.locator('.page-outline');
    await rail.locator('#article-outline > summary').focus();
    for(const label of ['Characters','Generic Characters:','Military Units:']) {
      const summary=rail.locator('summary[aria-label="Subsections of '+label+'"]');
      await tabTo(page,summary);await page.keyboard.press('Enter');
    }
    await tabTo(page,rail.locator('a[href="#emperor-tengus-entourage"]'));await page.keyboard.press('Enter');
    const heading=page.locator('h5#emperor-tengus-entourage');
    await expect(heading).toBeFocused();await expect(heading).toBeInViewport();
    if(phone)await expect(page.locator('.rail')).toBeHidden();
    const ref=page.locator('sup[id^="cite_ref"]').first();
    const id=await ref.getAttribute('id');
    const link=ref.getByRole('link'),note=(await link.getAttribute('href')).slice(1);
    await link.press('Enter');await expect(page.locator('[id="'+note+'"]')).toBeFocused();
    await page.locator('[id="'+note+'"] a[href="#'+id+'"]').press('Enter');await expect(ref).toBeFocused();
    const summary=page.locator('main summary').filter({hasText:'FACTION RELATIONS'});
    const table=summary.locator('..').getByRole('table');
    await expect(table).toBeVisible();await summary.press('Enter');await expect(table).toBeHidden();
    await summary.press('Enter');
    await expect(table.getByRole('columnheader')).toHaveText(['From United Cities','Towards United Cities']);
    await expect(table).toContainText('(+60)');await expect(table).toContainText('(-100)');await expect(table).toContainText('(truce)');
    await summary.press('Enter');await expect(table).toBeHidden();
  });
  test('pacifier costs retain six columns and their negative thresholds',async({page})=>{
    test.skip(!includedIds.has('guide-to-faction-relations'));
    await page.goto('/guide-to-faction-relations?theme='+theme+'#faction-pacifiers');
    const table=page.locator('.article-body table');
    const region=table.locator('..');
    await expect(table.locator('tr').first().locator('th')).toHaveText(['Factions','<-80','<-60','<-40','<-20','<-10']);
    await expect(table.locator('tr').nth(1).locator('td')).toHaveText([
      'Shek Kingdom, Slave Traders, The Holy Nation, Traders Guild, United Cities','100,000','75,000','55,000','35,000','15,000']);
    await expect(table.locator('tr').nth(2).locator('td')).toHaveText([
      'Anti Slavers, Flotsam Ninjas, Hounds','50,000','40,000','30,000','20,000','10,000']);
    await region.focus();await page.keyboard.press('End');
    expect(await region.evaluate(el=>el.scrollWidth-el.clientWidth-el.scrollLeft)).toBeLessThanOrEqual(2);
    await expect(table.locator('tr').first().locator('th').last()).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
    await page.keyboard.press('Home');
  });
});

test('unresolved HQ stays unlinked and hostile races retain separate lines',async({page})=>{
  test.skip(!includedIds.has('grayflayers'));
  await page.goto('/grayflayers');
  const hq=page.locator('.factbox dd').filter({hasText:'Shark (override) Grayflayer'});
  await expect(hq).toHaveText('Shark (override) Grayflayer');await expect(hq.locator('a')).toHaveCount(0);
  await page.goto('/skeleton-bandits');
  const races=page.locator('.factbox dd').filter({hasText:'Hive Prince'});
  expect((await races.innerText()).split(/\n/).map(t=>t.trim()).filter(Boolean)).toEqual(
    ['Hive Prince','Hive Soldier Drone','Hive Worker Drone','Shek','Greenlander','Scorchlander']);
});

test('historical notices precede the alpha descriptions',async({page})=>{
  test.skip(!includedIds.has('factions-alpha'));
  for(const id of ['factions-alpha','free-traders-alpha']) {
    await page.goto('/'+id);
    const notice=page.locator('.lead-text > .historical-notice:first-child');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('The content discussed on this page');
    await expect(notice.locator('+ p')).not.toBeEmpty();
  }
});
