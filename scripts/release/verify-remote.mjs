import fs from 'node:fs';
import assert from 'node:assert/strict';
import {read,save,gate,npm} from './common.mjs';
import {assertVersionUrl} from './config.mjs';
const live=process.argv.includes('--live');assert.ok(process.argv.slice(2).every(a=>a==='--live'));
const record=read('reports/release/'+(live?'publication':'staging')+'.json');
assertVersionUrl(record.version,record.url);
const base=live?'https://kenshi.wiki':record.url,phase=live?'live':'preview';
const scope=live?'Live HTTP delivery and content parity with the approved version; browser interactions covered by the immutable preview':'Immutable preview browser and HTTP smoke checks';
try{
 await gate('reports/release/'+phase,'smoke',[npm,'exec','--','playwright','test','--config=playwright.release.config.mjs'],
  {WIKI_PREVIEW_URL:base,WIKI_RELEASE_VERIFY:phase,WIKI_VERSION_URL:record.url,WIKI_EDIT_BRANCH:'main',WIKI_RELEASE_TARGET:'production'});
 const stats=read('reports/release/smoke/browser.json').stats;
 assert.equal(stats.unexpected,0);assert.equal(stats.flaky,0);assert.equal(stats.skipped,0);
 save('reports/release/'+phase+'/acceptance.json',{sourceSha:record.sourceSha,worker:'kenshi-wiki',version:record.version,url:base,packageSha256:record.packageSha256,scope,browserInteractionsVerified:!live,checks:stats,passed:true});
 const message=live?'## Live HTTP/content checks passed\n\n[Open Kenshi Wiki](https://kenshi.wiki)\n\nBrowser interactions were checked on the immutable version preview. Cloudflare Bot Fight Mode remains enabled on the public domain. This result does not claim automated browser acceptance on the apex.':
  '## Preview ready — awaiting Prd’s approval\n\n[Open the tested preview]('+base+')\n\nUse **Review deployments → production → Approve and deploy** in this GitHub run to publish this exact version.';
 const detail='\n\nCommit: `'+record.sourceSha+'`\n\nVersion: `'+record.version+'`\n\nSmoke checks: '+stats.expected+' passed; no failures, retries or skips.\n';
 console.log(message+detail);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,message+detail);
}catch(error){
 const log='reports/release/'+phase+'/smoke.log';
 const diagnostic=fs.existsSync(log)?fs.readFileSync(log,'utf8').slice(-16000):error.message;
 console.error(diagnostic);
 const message='## '+(live?'Published, but live verification failed':'Preview checks failed — publication is blocked')+'\n\n'+(live?'Do not rerun publication just to retry verification. Inspect the failure below and the saved rollback receipt. Use **Recheck live deployment** for the existing version after diagnosis.':'The preview remains available for diagnosis; a passing isolated rerun does not turn this failed run green.')+'\n\n<details><summary>Smoke-test failure</summary>\n\n```text\n'+diagnostic.slice(-12000).replaceAll('```','~~~')+'\n```\n</details>\n';
 console.error(message.split('<details>')[0]);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,message);
 throw error;
}
