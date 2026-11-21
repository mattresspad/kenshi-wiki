import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {openPreview} from '../static-preview.mjs';
import {gate,npm,cf,git,clean,save,read,hashes} from './common.mjs';
import {capture} from './capture.mjs';
import {manifest} from './manifest.mjs';
import {assertRehearsal} from './config.mjs';
import {auditPackage} from './audit-package.mjs';

const routine=process.argv.includes('--routine');
const staging=process.argv.includes('--staging');
assert.ok(process.argv.slice(2).every(arg=>['--routine','--staging'].includes(arg))&&!(routine&&staging),'Unknown or incompatible validation argument');
const started=Date.now(),sourceSha=git('rev-parse','HEAD');clean();
if(!routine){
 assertRehearsal(process.env,sourceSha);
 if(process.env.GITHUB_ACTIONS){
  const response=await fetch('https://api.github.com/repos/mattresspad/kenshi-wiki/git/ref/heads/main',{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json'}});
  assert.ok(response.ok,'Cannot verify current main');assert.equal((await response.json()).object.sha,sourceSha,'Main changed; select the new candidate explicitly');
 }
}
const local={WIKI_RELEASE_TARGET:'local',WIKI_EDIT_BRANCH:''};
const published={WIKI_RELEASE_TARGET:staging?'staging':'production',WIKI_EDIT_BRANCH:'main',WIKI_CANDIDATE_BRANCH:'main'};
async function browser(env,folder,focused){
 const runtime=await openPreview('127.0.0.1',0);
 try{const base=(await runtime.ready).origin;await gate(folder,focused?'editing':'browser',[npm,'exec','--','playwright','test',...(focused?['tests/editing.spec.mjs']:[])],{...env,WIKI_PREVIEW_URL:base});}
 finally{await runtime.dispose()}
 fs.copyFileSync('reports/release/browser.json',folder+'/browser.json');
 return read(folder+'/browser.json').stats;
}
await gate('reports/release/local','build',[npm,'run','build'],local);
const localStats=await browser(local,'reports/release/local',true);clean();
save('reports/release/local/acceptance.json',{sourceSha,mode:'local',checks:['build','focused editing browser tests'],browser:localStats});
await gate('reports/release/published','build',[npm,'run','build'],published);
const results=await Promise.allSettled([
 gate('reports/release/published','catalog',[npm,'run','test:catalog'],published),
 browser(published,'reports/release/published',false),
 gate('reports/release/published','cloudflare',[cf,'workers','versions','create','--prebuilt','--dry-run'],published)
]);
const failures=results.filter(r=>r.status==='rejected');if(failures.length)throw Error(failures.map(r=>r.reason.message).join('\n'));
clean();
const checks=[published.WIKI_RELEASE_TARGET+' build','catalog','full Playwright','Cloudflare package dry run'];
const acceptance={sourceSha,mode:published.WIKI_RELEASE_TARGET,editBranch:'main',checks:[...checks],browser:results[1].value};
save('reports/release/published/acceptance.json',acceptance);
if(!routine){
 const before=hashes(resolve('.cloudflare/output'));
 await gate('reports/release/reproducibility','build',[npm,'run','build'],published);
 const after=hashes(resolve('.cloudflare/output'));assert.deepEqual(after,before,'Repeated production package changed');
 save('reports/release/reproducibility/acceptance.json',{sourceSha,identical:true,files:Object.keys(after).length});
 checks.push('repeated package checksums');clean();
 const runtime=await openPreview('127.0.0.1',0);
 try{await capture((await runtime.ready).origin,'reports/release/captures');}finally{await runtime.dispose()}
 checks.push('representative desktop and phone captures');
}
Object.assign(process.env,published);
const candidate=await manifest({checks,validation:{routine,local:localStats,published:acceptance.browser}});
await auditPackage(candidate);checks.push('all-page package audit');
await manifest({checks,validation:{routine,local:localStats,published:acceptance.browser}});
save('reports/release/acceptance.json',{sourceSha,routine,checks:[...checks,'focused local editing tests','tracked inputs unchanged'],durationMs:Date.now()-started,local:localStats,published:acceptance.browser});
clean();console.log('Validation passed; no upload or deployment performed.');
