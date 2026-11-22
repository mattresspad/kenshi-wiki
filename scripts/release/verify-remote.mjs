import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,save,gate,npm} from './common.mjs';
import {assertVersionUrl} from './config.mjs';
const live=process.argv.includes('--live');assert.ok(process.argv.slice(2).every(a=>a==='--live'));
const record=read('reports/release/'+(live?'publication':'staging')+'.json');
assertVersionUrl(record.version,record.url);
const base=live?'https://kenshi.wiki':record.url,phase=live?'live':'preview';
try{
 await gate('reports/release/'+phase,'smoke',[npm,'exec','--','playwright','test','--config=playwright.release.config.mjs'],
  {WIKI_PREVIEW_URL:base,WIKI_RELEASE_VERIFY:phase,WIKI_EDIT_BRANCH:'main',WIKI_RELEASE_TARGET:'production'});
 const stats=read('reports/release/smoke/browser.json').stats;
 assert.equal(stats.unexpected,0);assert.equal(stats.flaky,0);assert.equal(stats.skipped,0);
 save('reports/release/'+phase+'/acceptance.json',{sourceSha:record.sourceSha,worker:'kenshi-wiki',version:record.version,url:base,packageSha256:record.packageSha256,scope:'Focused deployed-site smoke checks',browser:stats,passed:true});
 const message=live?'## Live checks passed\n\n[Open Kenshi Wiki](https://kenshi.wiki)':
  '## Preview ready — awaiting Prd’s approval\n\n[Open the tested preview]('+base+')\n\nUse **Review deployments → production → Approve and deploy** in this GitHub run to publish this exact version.';
 const detail='\n\nCommit: `'+record.sourceSha+'`\n\nVersion: `'+record.version+'`\n\nSmoke checks: '+stats.expected+' passed; no failures, retries or skips.\n';
 console.log(message+detail);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,message+detail);
}catch(error){
 const message='## '+(live?'Live checks failed':'Preview checks failed — publication is blocked')+'\n\n'+(live?'Use the saved rollback version and inspect the failed smoke check.':'The preview link is available for diagnosis, but its acceptance check failed. An isolated passing rerun does not turn this run green.')+'\n';
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,message);
 throw error;
}
