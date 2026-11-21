import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {chromium} from '@playwright/test';
import {openPreview} from '../static-preview.mjs';
const get=p=>JSON.parse(fs.readFileSync(p)),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const roster=get('conversion/utilities/roster.json'),stage=get('conversion/utilities/checkpoint.json').included,combined=process.argv.includes('--combined');
const folder=combined?'05-pr44-combined':String(stage).padStart(2,'0')+'-'+roster.checkpoints[stage-1],out='reports/utilities/'+folder;
fs.mkdirSync(out,{recursive:true});const npm=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
async function gate(name,args,env={}){const file=out+'/'+name+'.log';if(fs.existsSync(file))fs.copyFileSync(file,file+'.previous');const fd=fs.openSync(file,'w');try{const code=await new Promise((done,reject)=>{const p=spawn(process.execPath,args,{stdio:['ignore',fd,fd],env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',...env}});p.once('error',reject);p.once('close',done)});assert.equal(code,0,name+' failed: '+file)}finally{fs.closeSync(fd)}}
await gate('build',[npm,'run','build']);const runtime=await openPreview('127.0.0.1',0);
try{
 const base=(await runtime.ready).origin,result=await Promise.allSettled([gate('catalog',[npm,'run','test:catalog']),gate('playwright',[npm,'test'],{WIKI_PREVIEW_URL:base}),gate('cloudflare',[npm,'run','package:check'])]);
 const bad=result.filter(r=>r.status==='rejected');assert.equal(bad.length,0,bad.map(r=>r.reason.message).join('\n'));
 const routes=get('reports/routes.json');assert.equal(routes.gaps.introduced,0);assert.equal(routes.transferredArticles.length,combined?2185:2184);assert.equal(routes.memberships,combined?4120:4119);assert.equal(routes.searchTitles,combined?2191:2190);
 const paths=stage<3?['/category/unique','/category/article-stubs','/category/beep','/category/custom-character/race']:stage===3?['/about-kenshi','/contributors','/about-kenshi#Gallery']:['/search?q=armour&fulltext=1','/missing-review-example','/about-kenshi','/contributors',...(combined?['/modding/meitou/code-mod-hooks']:[])];
 const shots=[],browser=await chromium.launch({headless:true,executablePath:process.env.WIKI_CHROME});
 try{for(const [device,width,height]of [['desktop',1440,900],['phone',390,844]])for(const theme of ['light','dark']){const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,hasTouch:device==='phone'}),page=await ctx.newPage();for(const path of paths){const u=new URL(path,base);u.searchParams.set('theme',theme);await page.goto(u.href);await page.evaluate(()=>document.fonts.ready);if(path.startsWith('/search'))await page.locator('.search-results li').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path);const file=path.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'-'+device+'-'+theme+'.png';await page.screenshot({path:out+'/'+file});shots.push({file,path,device,theme})}await ctx.close()}}finally{await browser.close()}
 const records=get('conversion/utilities/acceptances.json'),previous=records.at(-1)?.temporary??[...new Set(get('conversion/remainder/handoff.json').temporaryDestinations)],now=[...new Set(routes.temporaryLinks.flatMap(r=>r.to))].sort();
 const evidence={checkpoint:stage,combined,name:folder,sourceRevision:roster.revision,articles:routes.transferredArticles.length,categories:routes.routes.filter(r=>r.kind==='category'&&r.status==='preserved locally').length,memberships:routes.memberships,titleSearch:routes.searchTitles,gapCounts:routes.gaps.counts,work:get('reports/work-coverage.json'),temporary:now,changes:{resolved:previous.filter(p=>!now.includes(p)),introduced:now.filter(p=>!previous.includes(p))},checks:['production build','catalog','full Playwright','Cloudflare package dry run'],shots};
 save(out+'/evidence.json',evidence);for(const [src,name]of [['reports/routes.json','routes.json'],['reports/route-report.md','route-report.md'],['reports/gaps/register.json','gaps.json']])fs.copyFileSync(src,out+'/'+name);
 if(combined)save('conversion/pr-44/compatibility-utilities.json',evidence);else{records[stage-1]=evidence;save('conversion/utilities/acceptances.json',records)}
 console.log('Accepted '+folder+': '+evidence.categories+' categories; '+evidence.articles+' articles.');
}finally{await runtime.dispose()}
