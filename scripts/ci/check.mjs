import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {openPreview} from '../static-preview.mjs';
import {gate,npm,cf,clean,save,read,hashes} from '../release/common.mjs';
import {createPlan} from './plan.mjs';
import {build} from './build.mjs';
assert.ok(process.argv.slice(2).every(a=>a==='--audit'),'Unknown check argument');
const mode=process.argv.includes('--audit')?'audit':'routine';
const started=Date.now();clean();
const plan=createPlan(mode),published={WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'main'};
if(process.env.GITHUB_EVENT_NAME==='workflow_dispatch')assert.equal(process.env.WIKI_EXPECTED_SHA,plan.sourceSha,'Audit SHA must match the selected checkout');
const checks=[];
async function browser(files,env,folder){
 const runtime=await openPreview('127.0.0.1',0);
 try {await gate(folder,'browser',[npm,'exec','--','playwright','test',...files],{...env,WIKI_PREVIEW_URL:(await runtime.ready).origin});}
 finally {await runtime.dispose();}
 fs.copyFileSync('reports/release/browser.json',folder+'/browser.json');
 fs.unlinkSync('reports/release/browser.json');
 return read(folder+'/browser.json').stats;
}
if(!plan.build)await gate('reports/ci/structural','identity',['scripts/check-articles.mjs']);
let local=null;
if(plan.editing){
 const env={WIKI_RELEASE_TARGET:'local',WIKI_EDIT_BRANCH:''};
 await build('reports/ci/local',env);
 local=await browser(['tests/editing.spec.mjs'],env,'reports/ci/local');
 checks.push('local static build and focused editing');clean();
}
let publishedStats=null;
if(plan.build){
 await build('reports/ci/published',published,{report:plan.audit});checks.push('published static build');
 await gate('reports/ci/published','affected',['scripts/ci/current.mjs'],published);checks.push('current route, link and provenance checks');
 const results=await Promise.allSettled([
  gate('reports/ci/published','catalog',['--test',...plan.catalog],published),
  browser(plan.browser,published,'reports/ci/published'),
  gate('reports/ci/published','cloudflare',[cf,'workers','versions','create','--prebuilt','--dry-run'],published)
 ]);
 const failures=results.filter(r=>r.status==='rejected');if(failures.length)throw Error(failures.map(r=>r.reason.message).join('\n'));
 save('reports/ci/package-checksums.json',{sourceSha:plan.sourceSha,scope:'Validation output only; not an approved release',files:hashes(resolve('.cloudflare/output'))});
 publishedStats=results[1].value;checks.push('selected catalog','selected browser','Cloudflare dry run');
 if(plan.audit)checks.push('complete frozen conversion report');
}else{await gate('reports/ci/structural','catalog',['--test',...plan.catalog]);checks.push('identity and structural catalog');}
clean();
save('reports/ci/acceptance.json',{sourceSha:plan.sourceSha,baseSha:plan.baseSha,mode,kind:plan.kind,checks,local,published:publishedStats,durationMs:Date.now()-started,trackedInputsUnchanged:true,productionTrafficChanged:false});
console.log('CI passed; no upload or deployment.');
