import assert from 'node:assert/strict';
import {join} from 'node:path';
import {chromium} from '@playwright/test';
import {snapshot} from '../../src/lib/catalog.mjs';

export async function captureBatch(base, batch, output) {
  const articles=new Map(snapshot.articles.map(a=>[a.id,a]));
  const extra={
    'bad-teeth':['bad-teeth#town-overrides','bad-teeth/shek-kingdom'],
    'catun-pilot':batch.ids,
    'spawns-loot-and-citations':batch.ids,
    'bark-overrides':['bark#town-overrides'],
    'geography-indexes':['world-of-kenshi','major-towns']
  };
  const samples=extra[batch.name] ?? [batch.ids[0]];
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
        const url=new URL(article.path,base);url.searchParams.set('theme',theme);if(anchor)url.hash=anchor;
        const res=await page.goto(url.href,{waitUntil:'domcontentloaded'});
        assert.equal(res.status(),200,url.href);
        await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame)});
        const geometry=await page.evaluate(()=>{
          const main=document.querySelector('main');
          return {screen:document.documentElement.scrollWidth-innerWidth,body:main.scrollWidth-main.clientWidth,
            theme:document.documentElement.dataset.theme,id:document.querySelector('article').dataset.articleId};
        });
        assert.equal(geometry.id,id);assert.equal(geometry.theme,theme);
        assert.ok(geometry.screen<=1 && geometry.body<=1,article.path+' '+device+' overflow '+JSON.stringify(geometry));
        if(samples.includes(sample)){
          const file=sample.replaceAll('/','--').replace('#','-')+'-'+device+'-'+theme+'.png';
          await page.screenshot({path:join(output,file),animations:'disabled'});
          shots.push({id,anchor,device,theme,file});
        }
      }
      await context.close();
    }
    assert.deepEqual(errors,[]);
    return shots;
  } finally {await browser.close();}
}
