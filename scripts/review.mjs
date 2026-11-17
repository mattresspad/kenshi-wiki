import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs';

const base = 'http://127.0.0.1:4392';
const pages = [
  ['home','Home','/'],['catun','Catun','/catun'],['saddle','Make a saddle pack for Meitou','/modding/meitou/make-a-saddle-pack'],
  ['locations','Locations','/category/locations'],['wip','WIP','/category/wip'],['traders-guild','Traders Guild','/category/traders-guild'],
  ['holy-nation','The Holy Nation','/the-holy-nation'], ['backpacks','Backpacks','/backpacks'],
  ['blender','Blender plugins','/modding/blender-plugins'], ['modding','Modding','/modding'],
  ['modding-category','Modding category','/category/modding']
];
const sizes = [
  {id:'wide',width:1920,height:948},{id:'desktop',width:1440,height:900},{id:'phone',width:390,height:844}
];
const palettes=['light','dark'];
const preview=(route,theme)=>base+route+'?theme='+theme;
const file=(id,size,theme)=>'previews/'+id+'-'+size.id+'-'+theme+'.png';
mkdirSync('reports/previews',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.WIKI_CHROME});
const metrics=[];
const errors=[];
const interactions=[];
async function capture(page, section, size, theme, name, caption) {
  const src = 'previews/'+section+'-'+size.id+'-'+theme+'-'+name+'.png';
  await page.screenshot({path:'reports/'+src, animations:'disabled'});
  interactions.push({section, src, caption, width:size.width, height:size.height, theme});
}

async function showOutline(page, size, theme) {
  await page.goto(preview('/the-holy-nation',theme)+'#military-1');
  if (size.id==='phone') await page.locator('#toggle-navigation').click();
  const rail = page.locator('.page-outline');
  for (const name of ['Characters','Generic Characters']) {
    await rail.locator('summary[aria-label="Subsections of '+name+'"]').click();
  }
  const link=rail.locator('a[href="#military-1"]');
  await link.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  assert.ok(await link.evaluate(el => el === document.activeElement));
  await page.mouse.move(1, 1);
  await link.scrollIntoViewIfNeeded();
  await capture(page,'holy-nation',size,theme,'outline','Expanded outline at Characters → Generic Characters → Military');
}

async function showTable(page, size, theme) {
  await page.goto(preview('/backpacks',theme)+'#types-of-backpacks');
  await page.locator('.equipment-comparison img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  const region = page.getByRole('region',{name:'Backpack comparison'});
  if(size.id==='phone') {
    await capture(page,'backpacks',size,theme,'left','Phone table from the backpack names');
    await region.evaluate(el=>el.focus({preventScroll:true}));
    await page.keyboard.press('End');
    const remaining=await region.evaluate(el=>el.scrollWidth-el.clientWidth-el.scrollLeft);
    assert.ok(remaining<=2);
    await capture(page,'backpacks',size,theme,'right','Phone table at the Dodge column');
  } else {
    await capture(page,'backpacks',size,theme,'table','All twelve desktop columns');
  }
}
async function showTips(page, size, theme) {
  const url = preview('/backpacks', theme);
  await page.goto(url);
  await page.evaluate(async () => {
    const icon = new Image();
    icon.src = '/icons/talk.png';
    await Promise.all([icon.decode(), document.fonts.ready]);
  });
  await capture(page, 'backpacks', size, theme, 'opening-tip', 'Food-sharing tip beneath the Backpacks title');
  await page.locator('#loading-screen-tips').evaluate(heading => heading.scrollIntoView({block: 'start'}));
  await capture(page, 'backpacks', size, theme, 'loading-tips', 'Three loading screen tips after the comparison table');
}
try {
  for(const size of sizes)for(const theme of palettes){
    const context=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,colorScheme:theme,hasTouch:size.id==='phone'});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(response.status()+' '+response.url())});
    for(const [id,title,path] of pages){
      const response=await page.goto(preview(path,theme));
      assert.equal(response.status(),200);
      await page.evaluate(async()=>{await document.fonts.ready;await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))});
      const measured=await page.evaluate(()=>{
        const main=document.querySelector('main'), mr=main.getBoundingClientRect(),bar=document.querySelector('.context-row').getBoundingClientRect();
        const lead=document.querySelector('.opening-copy'),facts=document.querySelector('.factbox'),board=document.querySelector('.az-board');
        const fr=facts?.getBoundingClientRect();
        return {viewport:innerWidth, overflow:Math.max(document.documentElement.scrollWidth-innerWidth,main.scrollWidth-main.clientWidth),
          palette:document.documentElement.dataset.theme, title:document.querySelector('h1').textContent,
          assetLoad:[...document.querySelectorAll('#site-links img')].every(img=>img.complete && img.naturalWidth>0),
          factRight:fr?Math.round(mr.left+main.clientWidth-fr.right):null, factTop:fr?Math.round(fr.top-bar.bottom):null,
          factsAfterLead:fr?lead.nextElementSibling===facts && lead.getBoundingClientRect().bottom<=fr.top:null,
          firstScreenFacts:fr?[...lead.querySelectorAll('a')].filter(a=>['Bonefields','United Cities'].includes(a.textContent)).every(a=>a.getBoundingClientRect().bottom<innerHeight)&&fr.bottom<innerHeight:null,
          headingsInPane:board?[...board.querySelectorAll('h2')].every(el=>{const r=el.getBoundingClientRect();return r.top>=bar.bottom-1&&r.bottom<=mr.bottom+1}):null,
          fit:!!board?.hasAttribute('data-fit'), readerOverflow:main.scrollHeight-main.clientHeight,
          formattedFit:[...main.querySelectorAll('pre,table')].every(el=>{const wrapper=el.closest('.table-scroll');const visible=wrapper??el;const r=visible.getBoundingClientRect();return !el.getClientRects().length||(r.left>=mr.left-.5&&r.right<=mr.right+.5&&(wrapper||el.scrollWidth<=el.clientWidth+1))})
        };
      });
      assert.equal(measured.overflow,0,id+' horizontal overflow');assert.equal(measured.palette,theme);assert.equal(measured.assetLoad,true);
      assert.equal(measured.title,id==='home'?'Kenshi Wiki':id==='modding-category'?'Modding':title);assert.ok(measured.formattedFit,id+' formatted element outside reading pane: '+size.id+' '+theme);
      if(id==='catun'){
        if(size.id==='phone'){assert.ok(measured.factsAfterLead);assert.ok(measured.firstScreenFacts);}
        else{assert.equal(measured.factTop,8);assert.ok(measured.factRight>=12&&measured.factRight<=16);}
      }
      if(path.startsWith('/category/')&&size.id!=='phone'){assert.equal(measured.fit,true);assert.equal(measured.readerOverflow,0);assert.equal(measured.headingsInPane,true);}
      await page.screenshot({path:'reports/'+file(id,size,theme),animations:'disabled'});
      metrics.push({id,theme,size:size.id,...measured});
    }
    if(size.id!=='wide') {await showOutline(page,size,theme);await showTable(page,size,theme);await showTips(page,size,theme);}
    await context.close();
  }
  assert.deepEqual(errors,[]);
}finally {await browser.close();}
writeFileSync('reports/viewports.json',JSON.stringify(metrics,null,2)+'\n');
const sections=pages.map(([id,title,path])=>{
  const variants=palettes.map(theme=>'<details '+(theme==='light'?'open':'')+'><summary>'+theme[0].toUpperCase()+theme.slice(1)+'</summary><div class="shots">'+sizes.map(size=>{
    const src=file(id,size,theme);
    return '<figure><a href="'+src+'"><img loading="lazy" width="'+size.width+'" height="'+size.height+'" src="'+src+'" alt="'+title+' in '+theme+' at '+size.width+' pixels"></a><figcaption>'+size.width+' × '+size.height+'</figcaption></figure>';
  }).join('')+'</div></details>').join('');
  const detail = interactions.filter(shot => shot.section === id);
  const isTip = shot => /-(opening-tip|loading-tips)\.png$/.test(shot.src);
  const figures = shots => shots.map(shot => '<figure><a href="'+shot.src+'"><img loading="lazy" width="'+shot.width+'" height="'+shot.height+'" src="'+shot.src+'" alt="'+shot.caption+' in '+shot.theme+'"></a><figcaption>'+shot.caption+' · '+shot.width+' px · '+shot.theme+'</figcaption></figure>').join('');
  const gallery = shots => shots.length ? '<div class="detail-shots">'+figures(shots)+'</div>' : '';
  const quotes = detail.filter(isTip);
  const extra = gallery(detail.filter(shot => !isTip(shot))) + (quotes.length ? '<h3 id="backpack-tips">Backpacks talk quotes</h3>'+gallery(quotes) : '');
  return '<section id="'+id+'"><h2>'+title+'</h2><p><a href="'+preview(path,'light')+'">Open in light</a> · <a href="'+preview(path,'dark')+'">Open in dark</a></p>'+variants+extra+'</section>';
}).join('');
const routeReport=readFileSync('reports/route-report.md','utf8');
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Kenshi Wiki restoration review</title><style>'+
'body{margin:0 auto;max-width:1220px;padding:16px clamp(14px,3vw,40px);background:#faf8f1;color:#282923;font:16px/1.5 "Segoe UI",sans-serif}.detail-shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;margin:12px 0}.detail-shots img{object-fit:contain;max-height:330px;width:auto;max-width:100%}h1{font:600 36px Cambria,Georgia,serif;margin:10px 0}h2{margin:22px 0 5px;border-bottom:1px solid #ada898}nav{display:flex;flex-wrap:wrap;gap:6px 15px}a{color:#244f74}summary{cursor:pointer;font-weight:600;padding-block:4px}figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid #b9b4a6}figcaption{font-size:13px}.shots{display:grid;grid-template-columns:2fr 1.5fr .42fr;gap:12px;align-items:start}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eeece2;padding:12px}a:focus-visible,summary:focus-visible{outline:2px solid #0d6277;outline-offset:2px}@media(max-width:650px){.shots{grid-template-columns:1fr 1fr}.shots figure:last-child{max-width:145px}}'+
'</style></head><body><h1>Kenshi Wiki restoration review</h1><p>Open a page to use the rail and article links. Select a screenshot for the full-size capture.</p><nav>'+pages.map(([id,title])=>'<a href="#'+id+'">'+title+'</a>').join('')+'<a href="#backpack-tips">Backpacks talk quotes</a><a href="#report">Route report</a></nav>'+sections+
'<section id="report"><h2>Route report</h2><p><a href="routes.json">Per-URL ledger</a> · <a href="viewports.json">Browser measurements</a> · <a href="route-report.md">Markdown report</a></p><pre>'+routeReport.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</pre></section></body></html>';
writeFileSync('reports/index.html',html);
console.log(metrics.length+' viewport screenshots and '+interactions.length+' interaction screenshots in reports/previews');
