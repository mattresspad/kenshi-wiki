import fs from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {save,read} from './common.mjs';
export async function capture(base,folder){
 const routes=read('reports/routes.json'),paths=['/category/unique','/category/custom-character/race','/about-kenshi','/contributors','/search?q=armour&fulltext=1','/review-missing-page','/pages-needing-work'];
 if(routes.transferredArticles.includes('/modding/meitou/code-mod-hooks'))paths.push('/modding/meitou/code-mod-hooks');
 fs.mkdirSync(folder,{recursive:true});const shots=[],browser=await chromium.launch({headless:true,executablePath:process.env.WIKI_CHROME});
 try{for(const [device,width,height]of [['desktop',1440,900],['phone',390,844]])for(const theme of ['light','dark']){
 const ctx=await browser.newContext({viewport:{width,height},colorScheme:theme,hasTouch:device==='phone'}),page=await ctx.newPage();
 for(const path of paths){const url=new URL(path,base);url.searchParams.set('theme',theme);const response=await page.goto(url.href);assert.equal(response.status(),path.includes('missing-page')?404:200);await page.evaluate(()=>document.fonts.ready);if(path.startsWith('/search'))await page.locator('.search-results li').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path);const file=path.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'-'+device+'-'+theme+'.png';await page.screenshot({path:join(folder,file)});shots.push({path,file,device,theme});}await ctx.close();
 }}finally{await browser.close()}
 save(join(folder,'captures.json'),shots);return shots;
}
