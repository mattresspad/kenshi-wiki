import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {readFileSync} from 'node:fs';
import {snapshot,origin,policy,categoryPath} from '../src/lib/catalog.mjs';
import {expectedRoutes} from '../scripts/conversion/batches.mjs';
import baseline from './article-baseline.json' with {type:'json'};
import ribbon from '../src/data/ribbon.json' with {type:'json'};

const saddle='/modding/meitou/make-a-saddle-pack';
async function settled(page) {
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));});
}
async function tabTo(page,selector) {
  for (let i=0;i<40;i++) {
    if(await page.evaluate(s=>document.activeElement.matches(s),selector))return;
    await page.keyboard.press('Tab');
  }
  throw Error('Not reachable by Tab: '+selector);
}
async function heading(page,id,focused=true) {
  await expect(page).toHaveURL(new RegExp('#'+id+'$'));
  const node=page.locator('#'+id);
  if(focused)await expect(node).toBeFocused();
  const rect=await node.boundingBox();
  const top=await page.locator('.context-row').boundingBox();
  expect(rect.y).toBeGreaterThanOrEqual(top.y+top.height-1);
  expect(rect.y+rect.height).toBeLessThanOrEqual(page.viewportSize().height+1);
}

for (const font of ['loaded','blocked']) test('all sixteen destinations fit or move exactly once with the font '+font,async({page})=>{
  let fontRequests=0;
  await page.route('**/fonts/*.woff2',route=>{fontRequests++;return font==='blocked'?route.abort():route.continue()});
  await page.goto('/catun');
  for(const width of [1920,1440,390,820,1920]){
    await page.setViewportSize({width,height:900});await settled(page);
    expect(await page.locator('#site-band a').evaluateAll(xs=>xs.map(a=>a.href))).toEqual(ribbon.map(l=>l.href));
    if(width===1920)await expect(page.locator('#site-links a')).toHaveCount(16);
    const overflow=page.locator('#more-links a'), inline=page.locator('#site-links a');
    if(await overflow.count())await page.locator('#site-more > summary').click();
    for(const item of ribbon) await expect(page.locator('#site-band').getByRole('link',{name:item.label,exact:true})).toBeVisible();
    for(const name of ['X','Facebook','Instagram']){
      const a=page.locator('#site-band').getByRole('link',{name,exact:true});
      if(await a.evaluate(e=>e.parentElement.id==='site-links'))await expect(a.locator('.chip-caption')).toBeHidden();
      else await expect(a.locator('.chip-caption')).toBeVisible();
    }
    if(await overflow.count())await page.keyboard.press('Escape');
    expect(await inline.count()+await overflow.count()).toBe(16);
  }
  expect(fontRequests).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.fonts.check('13px "Exo 2"'))).toBe(font==='loaded');
});

for(const width of [1440,390]) test('article outline, source credits and evidence at '+width,async({page})=>{
  const mobile=width<761;await page.setViewportSize({width,height:mobile?844:900});
  for(const route of ['/catun',saddle]){
    await page.goto(route);
    const ids=await page.locator('main[id],main [id]').evaluateAll(xs=>xs.map(x=>x.id));
    expect(new Set(ids).size).toBe(ids.length);
    for(const id of baseline.bookmarks[route])expect(ids).toContain(id);
    const href=await page.getByRole('link',{name:'Suggest a correction',exact:true}).getAttribute('href');
    expect(new URL(href).searchParams.get('article')).toBe(origin+route);
    if(mobile){
      await page.locator('#toggle-navigation').focus();await page.keyboard.press('Enter');
      expect((await page.locator('.rail').boundingBox()).width).toBe(240);
      await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused();
      await page.keyboard.press('Enter');
    }
    await page.locator('#article-outline > summary').focus();
    const id=route==='/catun'?'town-override':'hand-the-zip-to-a-player';
    await tabTo(page,'.page-outline a[href="#'+id+'"]');await page.keyboard.press('Enter');await heading(page,id);
    if(mobile)await expect(page.locator('.rail')).toBeHidden();
    if(route==='/catun'){
      await expect(page.locator('main')).not.toContainText('King Gurgler');
      await expect(page.locator('.factbox')).toContainText('33-gamedata.quack');
      await expect(page.locator('main a[href*="oldid=93167"]')).toHaveCount(1);
      await expect(page.locator('main a[href*="action=history"]')).toHaveCount(1);
      await page.goto('/catun#fcs-values-priority-1');await heading(page,'fcs-values-priority-1',false);
    }else{
      const blocks=await page.locator('pre code').allTextContents();
      expect(blocks.map(t=>createHash('sha256').update(t).digest('hex'))).toEqual(baseline.blockHashes);
      expect(JSON.parse(blocks[0]).mounts[0].animalRecordIds).toEqual(['47929-rebirth.mod']);
      await page.goto(saddle+'#turn-save-and-reload');await heading(page,'turn-save-and-reload',false);
      await page.getByRole('link',{name:'See the recorded result'}).focus();await page.keyboard.press('Enter');await heading(page,'recorded-playtest');
      await page.goBack();await heading(page,'turn-save-and-reload',false);
      await page.getByRole('link',{name:'See the recorded result'}).click();await page.getByRole('link',{name:'Back to the save-and-reload step'}).click();
      await heading(page,'turn-save-and-reload');await expect(page.locator('main')).toContainText('Mu returned on foot beside the same bull and successfully remounted');
      await page.locator('figure img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()})));
      for(const match of ['1ce0ec1','LICENSING.md','/by-sa/4.0/'])expect(await page.locator('main a[href*="'+match+'"]').count()).toBeGreaterThan(0);
    }
  }
});

test('restored indexes match independent membership sets and link to reviewed pages or the live wiki',async({page})=>{
  const sets=Object.fromEntries(policy.reviewedCategories.map(name=>[categoryPath(name).slice(10),[name,...Object.keys(policy.aliases).filter(alias=>policy.aliases[alias]===name)]]));
  const local=expectedRoutes();
  for(const [slug,labels] of Object.entries(sets)){
    await page.goto('/category/'+slug);
    const expected=snapshot.articles.filter(a=>a.categories.some(k=>labels.includes(k))).map(a=>a.path).sort();
    const actual=await page.locator('[data-member]').evaluateAll(as=>as.map(a=>[a.dataset.member,a.getAttribute('href')]));
    expect(actual.map(row=>row[0]).sort()).toEqual(expected);
    for(const [path,href] of actual)expect(href).toBe(local.has(path)?path:origin+path);
    await expect(page.locator('main')).not.toContainText('formatnum');
  }
  await page.goto('/catun');
  await expect(page.locator('.article-context')).toHaveText('Article: Catun');
  await expect(page.locator('.context-cats a')).toHaveText(['Article stubs','Locations','United Cities']);
  await page.locator('.context-cats').getByRole('link',{name:'Locations'}).click();await expect(page).toHaveURL(/\/category\/locations$/);
  await page.getByRole('link',{name:'Catun',exact:true}).click();await expect(page).toHaveURL(/\/catun$/);
});
test('long letters retain keyboard access, focus and a flowing phone and print layout',async({page,browser,baseURL})=>{
  await page.goto('/category/locations');await expect(page.locator('.az-board')).toHaveAttribute('data-fit','');
  const pane=page.locator('.az-entries[role="region"]').first();await pane.focus();await page.keyboard.press('End');
  await expect.poll(()=>pane.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  const last=pane.getByRole('link').last();const path=await last.getAttribute('data-member');await last.focus();await expect(last).toBeInViewport();
  await page.locator('#toggle-navigation').click();await settled(page);
  const target=page.locator('[data-member="'+path+'"]');await target.focus();
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.az-board')).not.toHaveAttribute('data-fit','');
  await expect(target).toBeFocused();await expect(page.locator('.az-entries[tabindex]')).toHaveCount(0);
  await page.setViewportSize({width:1440,height:900});await settled(page);await expect(target).toBeFocused();
  expect(await page.locator('main').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
  await page.emulateMedia({media:'print'});await expect(page.locator('.az-entries').first()).toHaveCSS('max-height','none');
  await expect(page.locator('[data-member]')).toHaveCount(273);
  const ctx=await browser.newContext({javaScriptEnabled:false,baseURL});try {
    const plain=await ctx.newPage();await plain.goto('/category/locations');
    await expect(plain.locator('[data-member]')).toHaveCount(273);await expect(plain.locator('.az-board')).not.toHaveAttribute('data-fit','');
    await plain.locator('#site-more summary').click();await expect(plain.locator('#more-links a')).toHaveCount(16);
  }finally{await ctx.close()}
});
test('all locally accepted canonical pages and the sitemap agree; excluded and pending routes return 404 locally',async({request})=>{
  // This corpus-wide check grows with each accepted family, beyond a single-page test.
  test.setTimeout(120000);
  const paths=[...expectedRoutes()];
  const xml=await (await request.get('/sitemap-0.xml')).text();
  const urls=Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g),m=>m[1]);expect(urls.sort()).toEqual(paths.map(p=>origin+p).sort());
  for(const p of paths){const response=await request.get(p);try{expect(response.status(),p).toBe(200);const tags=load(await response.text())('link[rel=canonical]');expect(tags.length).toBe(1);expect(tags.attr('href')).toBe(origin+p);}finally{await response.dispose();}}
  expect(await(await request.get('/robots.txt')).text()).toContain(origin+'/sitemap-index.xml');
  for(const p of ['/category/pages-with-non-numeric-formatnum-arguments','/unreviewed-test-path'])expect((await request.get(p)).status()).toBe(404);
  const config=JSON.parse(readFileSync('.cloudflare/output/v0/workers/default/worker.config.json','utf8'));
  assert.equal(config.manifest,undefined);expect(config.assets.htmlHandling).toBe('drop-trailing-slash');
});
