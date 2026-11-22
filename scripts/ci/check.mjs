import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {openPreview} from '../static-preview.mjs';
import {gate,npm,cf,clean,save,read,hashes,git} from '../release/common.mjs';
import {createPlan} from './plan.mjs';
import {build} from './build.mjs';
const args=process.argv.slice(2), audit=args.includes('--audit');
const phaseIndex=args.indexOf('--phase'), phase=phaseIndex<0?'all':args[phaseIndex+1];
assert.ok(args.every((a,i)=>a==='--audit'||a==='--phase'||(phaseIndex>=0&&i===phaseIndex+1)),'Unknown check argument');
assert.ok(['all','build','catalog','browser','package','editing','summary'].includes(phase),'Unknown phase');
const plan=phase==='all'?createPlan(audit?'audit':'routine'):read('reports/ci/plan.json');
assert.equal(plan.sourceSha,git('rev-parse','HEAD'),'Coverage plan belongs to another commit');
if(audit&&process.env.GITHUB_ACTIONS)assert.equal(process.env.WIKI_EXPECTED_SHA,plan.sourceSha);
const published={WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'main'};
const required=plan.build?['build','catalog','browser','package',...(plan.editing?['editing']:[])]:['catalog'];
async function browser(files,env,folder){
 const runtime=await openPreview('127.0.0.1',0);
 try{await gate(folder,'browser',[npm,'exec','--','playwright','test',...files],{...env,WIKI_PREVIEW_URL:(await runtime.ready).origin});}
 finally{await runtime.dispose();}
 fs.copyFileSync('reports/release/browser.json',folder+'/browser.json');
 fs.unlinkSync('reports/release/browser.json');
 return read(folder+'/browser.json').stats;
}
async function run(name){
 assert.ok(required.includes(name),'Unselected phase: '+name);
 const state=read('reports/ci/phases.json');assert.equal(state.run,plan.run);
 const started=Date.now();let result={status:'failed'};
 try{
  clean();
  if(name==='build')await build('reports/ci/published',published,{report:plan.audit});
  if(name==='catalog'){
   if(plan.build)await gate('reports/ci/published','affected',['scripts/ci/current.mjs'],published);
   else await gate('reports/ci/structural','identity',['scripts/check-articles.mjs']);
   await gate(plan.build?'reports/ci/published':'reports/ci/structural','catalog',['--test',...plan.catalog],published);
  }
  if(name==='browser')result.stats=await browser(plan.browser,published,'reports/ci/published');
  if(name==='package'){
   await gate('reports/ci/published','cloudflare',[cf,'workers','versions','create','--prebuilt','--dry-run'],published);
   save('reports/ci/package-checksums.json',{sourceSha:plan.sourceSha,scope:'PR validation only',files:hashes(resolve('.cloudflare/output'))});
  }
  if(name==='editing'){
   const local={WIKI_RELEASE_TARGET:'local',WIKI_EDIT_BRANCH:''};
   await build('reports/ci/local',local);
   result.stats=await browser(['tests/editing.spec.mjs'],local,'reports/ci/local');
  }
  clean();result.status='passed';
 }catch(error){result.error=error.message;throw error;}
 finally{result.durationMs=Date.now()-started;state.phases[name]=result;save('reports/ci/phases.json',state);}
}
function summary(){
 const state=read('reports/ci/phases.json');assert.equal(state.run,plan.run);
 const complete=required.every(name=>state.phases[name]?.status==='passed');
 const acceptance={sourceSha:plan.sourceSha,baseSha:plan.baseSha,mode:plan.mode,kind:plan.kind,
  complete,phases:state.phases,local:state.phases.editing?.stats??null,published:state.phases.browser?.stats??null,
  durationMs:Object.values(state.phases).reduce((sum,p)=>sum+p.durationMs,0),productionTrafficChanged:false};
 save('reports/ci/acceptance.json',acceptance);
 const rows=required.map(name=>{const p=state.phases[name];return '| '+name+' | '+(p?.status??'not run')+' | '+(p?(p.durationMs/1000).toFixed(1)+'s':'—')+' |';});
 const text='## PR checks '+(complete?'passed':'incomplete or failed')+'\n\nCommit: `'+plan.sourceSha+'`\n\n| Check | Result | Time |\n| --- | --- | --- |\n'+rows.join('\n')+'\n\nNo preview upload or production deployment occurs in this workflow. After merge, **Preview and publish** creates the review URL and waits for Prd.\n';
 console.log(text);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,text);
 assert.ok(complete,'Selected checks did not all pass; see phase logs');
}
if(phase==='summary')summary();
else if(phase==='all'){try{for(const name of required)await run(name);}finally{summary();}}
else await run(phase);
