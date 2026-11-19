import assert from 'node:assert/strict';
import {join} from 'node:path';
import {chromium} from '@playwright/test';
import {snapshot} from '../../src/lib/catalog.mjs';
import {families} from '../conversion/batches.mjs';

export async function captureBatch(base, batch, output, family='geography') {
  const {roster}=families[family];
  const articles=new Map(snapshot.articles.map(a=>[a.id,a]));
  const extra={
    'shop-pilots':batch.ids,'shop-structures':batch.ids,'historical-vendors':batch.ids,'vendor-tutorials':batch.ids,'trading-directories':batch.ids,
    'crafting-construction':batch.ids,
    'technology-pilots':batch.ids,
    'technology-structures':batch.ids,
    'building-pilots':batch.ids,
    'building-siblings-2':['cooking-stove','defensive-gates','defensive-walls'],
    'building-variants':batch.ids,
    'building-conditions':batch.ids,
    'building-overviews':batch.ids,
    'item-pilots':['katana#variations','samurai-armour','economy-arm-left','basic-first-aid-kit','building-materials'],
    'item-structures':batch.ids,
    'item-comparisons':batch.ids,
    'item-qualifications':batch.ids,
    'character-pilots':['beep#statistics','armour-king#equipment','emperor-tengu#world-states','samurai#statistics'],
    'recruit-indexes':['unique-recruits#named-recruits','generic-recruits','slave-recruits'],
    'varied-statistics-and-stock':['drifter#statistics','fish-and-drugs-seller','alpha-gurgler'],
    'removed-characters':['crow-face'],
    'animal-pilots':['bonedog#stats','pack-bull#anatomy','beak-thing#movement'],
    'animal-structures':['elder-beak-thing','cleanser-unit','cage-beast'],
    'animal-overview-and-care':['fauna#aggressive','guide-to-animals#purchasable-animals','barnabus'],
    'animal-siblings-1':['crab#anatomy','garru','king'],
    'animal-siblings-2':['swamp-turtle','titus','category/animals'],
    'race-pilots':['greenlander#anatomy','hive-worker-drone#anatomy','skeleton-race#experience-multipliers'],
    'race-structures':['races','how-to-make-a-new-race','whistler'],
    'race-siblings-1':['hive#cite_note-1','hive-queen','deadhive-prince'],
    'race-siblings-2':['shek/health#anatomy','skeleton','category/races'],
    'major-factions':batch.ids,
    'infobox-variants':batch.ids,
    'historical-factions':batch.ids,
    'overview-and-guides':['factions','guide-to-faction-relations#after-harming-relations','hostile-factions'],
    'bad-teeth':['bad-teeth#town-overrides','bad-teeth/shek-kingdom'],
    'catun-pilot':batch.ids,
    'spawns-loot-and-citations':batch.ids,
    'bark-overrides':['bark#town-overrides'],
    'geography-indexes':['world-of-kenshi','major-towns']
  };
  const samples=[...(extra[batch.name] ?? [batch.ids[0]])];
  if (family==='geography' && batch.name===roster.batches.at(-1).name) samples.push('catun/fishmen','catun-alpha','bonefields','bad-teeth#town-overrides','old-world#old-world-towns','category/zones','category/spawning-locations');
  if(family==='factions' && batch.name===roster.batches.at(-1).name) samples.push('category/factions','united-cities#emperor-tengus-entourage','guide-to-faction-relations#after-harming-relations');
  if(family==='characters' && batch.name===roster.batches.at(-1).name)samples.push('category/characters','unique-recruits#named-recruits','samurai#statistics','beep#statistics','armour-king#equipment','emperor-tengu#world-states','skeleton-bandit');
  if(family==='items' && batch.name===roster.batches.at(-1).name)samples.push('category/items','katana','samurai-armour','economy-arm-left','robot-limbs','light-armour','map-of-the-united-cities-extended-territories','weapons/damage','weapons/modifiers','fabrics#used-in','robotics-components#used-in');
  if(family==='buildings' && batch.name===roster.batches.at(-1).name)samples.push('category/buildings','small-shack','stone-processor','weapon-smithing-bench','wind-generator','medical-workbench','cactus-farm','oil-drill','storage','clothing-bench');
  if(family==='technology'&&batch.name===roster.batches.at(-1).name)samples.push('category/technology','technology','tech-tree','tech-level-tech','crafting-tech','basic-weapon-smithing-tech','hiver-skeleton-arms-tech','advanced-battery-capacity-tech#advanced-battery-capacity-6');
  if(family==='shops'&&batch.name===roster.batches.at(-1).name)samples.push('category/town-residents','category/traders','category/vendors','adventurer-bar','armour-kings-shop#vendor-list','bakery','holy-nation-bar','hiver-merchant-caravan','traders#trading-with-an-unconscious-squad-member');
  const shots=[], errors=[];
  const browser=await chromium.launch({headless:true,executablePath:process.env.WIKI_CHROME});
  try {
    for (const [device,width,height] of [['desktop',1440,900],['phone',390,844]]) for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height},colorScheme:theme,hasTouch:device==='phone'});
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',res=>{if(res.status()>=400 && res.url().startsWith(base)) errors.push(res.status()+' '+res.url());});
      // Every incoming article gets both widths; save both palettes for the representatives.
      const checks=theme==='light' ? [...new Set([...samples,...batch.ids])] : samples;
      for(const sample of checks){
        const [id,anchor]=sample.split('#'),article=articles.get(id);
        const route=article?.path ?? '/'+id;
        const url=new URL(route,base);url.searchParams.set('theme',theme);if(anchor)url.hash=anchor;
        const res=await page.goto(url.href,{waitUntil:'domcontentloaded'});
        assert.equal(res.status(),200,url.href);
        await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame)});
        const geometry=await page.evaluate(()=>{
          const main=document.querySelector('main');
          return {screen:document.documentElement.scrollWidth-innerWidth,body:main.scrollWidth-main.clientWidth,
            theme:document.documentElement.dataset.theme,id:document.querySelector('article[data-article-id]')?.dataset.articleId,
            canonical:document.querySelector('link[rel="canonical"]').href};
        });
        if(article)assert.equal(geometry.id,id);
        assert.equal(geometry.canonical,'https://kenshi.wiki'+route);assert.equal(geometry.theme,theme);
        assert.ok(geometry.screen<=1 && geometry.body<=1,route+' '+device+' overflow '+JSON.stringify(geometry));
        if(samples.includes(sample)){
          if(family==='factions' && id==='united-cities' && anchor) {
            const outline=page.locator('.page-outline a[href="#'+anchor+'"]');
            await outline.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
            if(device==='phone')await page.locator('#toggle-navigation').press('Enter');
            await outline.scrollIntoViewIfNeeded();
            const expanded='united-cities-outline-'+device+'-'+theme+'.png';
            await page.screenshot({path:join(output,expanded),animations:'disabled'});
            shots.push({id,anchor,device,theme,file:expanded});
            if(device==='phone')await page.keyboard.press('Escape');
          }
          if(id==='races') {await page.locator('table.race-comparison').locator('..').evaluate(el=>el.scrollIntoView({block:'start'}));}
          if(id==='guide-to-faction-relations') {
            const region=page.locator('.article-body .table-scroll');
            await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('Home');
          }
          const file=sample.replaceAll('/','--').replace('#','-')+'-'+device+'-'+theme+'.png';
          await page.screenshot({path:join(output,file),animations:'disabled'});
          shots.push({id,anchor,device,theme,file});
          if(family==='shops'&&['adventurer-bar','armour-kings-shop','holy-nation-bar','hiver-merchant-caravan'].includes(id)&&device==='phone'){const region=page.locator('.shop-stock').first().locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');const right=id+'-stock-right-phone-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});}
          if(family==='buildings' && ['weapon-smithing-bench','storage'].includes(id) && device==='phone'){const region=page.locator('.building-comparison').first().locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');const right=id+'-right-phone-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});}
          if(family==='items' && ['robot-limbs','light-armour','weapons/damage','weapons/modifiers'].includes(id) && device==='phone'){const region=page.locator('.item-comparison').first().locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');const right=id.replaceAll('/','--')+'-right-phone-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});}
          if(id==='unique-recruits' && device==='phone') {
            const region=page.locator('.recruit-comparison').locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');
            const right='recruits-right-phone-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});
          }
          if(id==='fauna' && device==='phone') {
            const region=page.locator('.fauna-comparison').first().locator('..');await region.scrollIntoViewIfNeeded();await region.focus();await page.keyboard.press('End');
            const right='fauna-right-phone-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});
          }
          if(id==='races' && device==='phone') {
            const region=page.locator('table.race-comparison').locator('..');await region.focus();await page.keyboard.press('End');
            const right='race-comparison-right-'+device+'-'+theme+'.png';await page.screenshot({path:join(output,right),animations:'disabled'});shots.push({id,device,theme,file:right});
          }
          if(id==='guide-to-faction-relations' && device==='phone') {
            const region=page.locator('.article-body .table-scroll');
            await region.focus();await page.keyboard.press('End');
            const right='pacifier-costs-right-'+device+'-'+theme+'.png';
            await page.screenshot({path:join(output,right),animations:'disabled'});
            shots.push({id,anchor,device,theme,file:right});
          }
        }
      }
      await context.close();
    }
    assert.deepEqual(errors,[]);
    return shots;
  } finally {await browser.close();}
}
