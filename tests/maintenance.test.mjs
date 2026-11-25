import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'yaml';
import {maintenanceResponse} from '../src/maintenance/handler.mjs';
import {collectDocuments,readLimited,verifyDocuments} from '../scripts/maintenance/documents.mjs';
import {maintenanceRecord,assertWikiVersion,activeVersion,versionUrl,assertTrustedRun,chooseAction,assertEligible,assertApply} from '../scripts/maintenance/policy.mjs';
import {crawlFiles,fixtureSnapshot,openMaintenance} from './helpers/maintenance.mjs';
import {verifyMode} from '../scripts/maintenance/verify.mjs';
const sha='a'.repeat(40),hash='b'.repeat(64),live='12345678-1234-1234-1234-123456789abc',paused='87654321-1234-1234-1234-123456789abc';
const wiki={id:live,urls:['https://12345678-kenshi-wiki.prds.workers.dev'],annotations:{'workers/message':'FreshWiki '+sha+' package '+hash}};
const maintenance={id:paused,urls:['https://87654321-kenshi-wiki.prds.workers.dev'],annotations:{'workers/message':'FreshWiki maintenance v1 return '+live+' source '+sha+' package '+hash}};
const deployment=id=>({id:'deployment-'+id,versions:[{version_id:id,percentage:100}]});
const source={page:fs.readFileSync('src/maintenance/page.html','utf8'),documents:fixtureSnapshot.documents};
const fetchCrawl=async url=>{const path=new URL(url).pathname;return new Response(crawlFiles[path]??'Missing',{status:crawlFiles[path]?200:404,headers:{'Content-Type':path.endsWith('.xml')?'application/xml':'text/plain'}});};
test('maintenance blocks all ordinary routes and methods without reading bodies or sending mail',async()=>{
 for(const path of ['/','/catun','/catun?x=1','/contact','/contact/copyright','/random','/pagefind/pagefind.js','/unknown/deep','/%3Cscript%3E'])for(const method of ['GET','HEAD','POST','PUT','OPTIONS']){
  const r=maintenanceResponse(new Request('https://kenshi.wiki'+path,{method}),source);assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('retry-after'),'3600');assert.equal(r.headers.get('location'),null);assert.equal(r.headers.get('x-robots-tag'),null);
  const text=await r.text();assert.equal(text,method==='HEAD'?'':source.page);assert.ok(!text.includes('<script'));
 }
 const r=maintenanceResponse(new Request('https://kenshi.wiki/api/contact',{method:'POST',body:'private text should never be read'}),source);assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'Kenshi Wiki is undergoing maintenance. Please email admin@kenshi.wiki.'});
});
test('robots and recursively referenced sitemaps preserve exact bytes and remain crawlable',async()=>{
 const snapshot=await collectDocuments(versionUrl(wiki),fetchCrawl);assert.deepEqual(snapshot,fixtureSnapshot);
 for(const [path,text] of Object.entries(crawlFiles))for(const method of ['GET','HEAD']){
  const r=maintenanceResponse(new Request('https://kenshi.wiki'+path+'?cache=1',{method}),source);assert.equal(r.status,200);assert.equal(await r.text(),method==='HEAD'?'':text);
 }
 await verifyDocuments('https://kenshi.wiki',snapshot,fetchCrawl);
 await assert.rejects(()=>verifyDocuments('https://kenshi.wiki',snapshot,async()=>new Response('wrong')));
 for(const url of ['https://evil.invalid/sitemap.xml','https://kenshi.wiki/contact','https://kenshi.wiki/sitemap.xml?x=1'])await assert.rejects(()=>collectDocuments(versionUrl(wiki),async()=>new Response('Sitemap: '+url,{headers:{'Content-Type':'text/plain'}})));
 await assert.rejects(()=>collectDocuments(versionUrl(wiki),async()=>new Response('not found',{status:404})));
 await assert.rejects(()=>readLimited(new Response('too long'),3));
});
test('live → maintenance → live preserves identity and repeated choices are no-ops',()=>{
 assert.deepEqual(chooseAction('on',deployment(live),wiki),{noop:false,returnVersion:live});
 assert.deepEqual(chooseAction('on',deployment(paused),maintenance),{noop:true,returnVersion:live});
 assert.deepEqual(chooseAction('off',deployment(paused),maintenance),{noop:false,returnVersion:live});
 assert.deepEqual(chooseAction('off',deployment(live),wiki),{noop:true,returnVersion:live});
 assert.throws(()=>chooseAction('invalid',deployment(live),wiki));assert.throws(()=>assertWikiVersion(maintenance));
 assert.throws(()=>maintenanceRecord({...maintenance,annotations:{'workers/message':'FreshWiki maintenance broken'}}));
 assert.throws(()=>assertWikiVersion({...wiki,annotations:{}}));assert.throws(()=>activeVersion({...deployment(live),versions:[{version_id:live,percentage:50}]}));
 assert.throws(()=>activeVersion({...deployment(live),versions:[{version_id:live,percentage:50},{version_id:paused,percentage:50}]}));
 assert.throws(()=>versionUrl({...wiki,urls:['https://evil.invalid']}));
});
test('switching rejects untrusted runs, stale approvals, wrong targets and expired return versions',()=>{
 const env={GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/main',GITHUB_SHA:sha,WIKI_MAINTENANCE_ACTION:'on'};
 assertTrustedRun(env,sha);for(const patch of [{GITHUB_ACTIONS:'false'},{GITHUB_EVENT_NAME:'push'},{GITHUB_REF:'refs/heads/topic'},{GITHUB_SHA:'c'.repeat(40)},{WIKI_MAINTENANCE_ACTION:'invalid'}])assert.throws(()=>assertTrustedRun({...env,...patch},sha));
 assertEligible(live,[wiki]);assert.throws(()=>assertEligible(live,[]));assert.throws(()=>assertEligible(live,[...Array(100).fill(maintenance),wiki]));
 for(const action of ['on','off']){
  const current=deployment(action==='on'?live:paused),target=action==='on'?maintenance:wiki;
  const plan={schema:1,worker:'kenshi-wiki',sourceSha:sha,action,noop:false,previousDeployment:current.id,previousVersion:current.versions[0].version_id,returnVersion:live,targetVersion:target.id,url:versionUrl(target),packageSha256:hash};
  const evidence={sourceSha:sha,action,current,target,recent:[maintenance,wiki]};assertApply(plan,evidence);
  for(const patch of [{worker:'another'},{sourceSha:'c'.repeat(40)},{previousDeployment:'stale'},{previousVersion:'stale'},{targetVersion:'wrong'},{url:'https://evil.invalid'},{noop:true}])assert.throws(()=>assertApply({...plan,...patch},evidence));
  assert.throws(()=>assertApply(plan,{...evidence,recent:[maintenance]}));
 }
});
test('real local Worker package has no static fallthrough and passes maintenance HTTP checks',async()=>{
 const runtime=await openMaintenance('unit');try{
  const base=(await runtime.ready).origin;const checks=await verifyMode(base,{action:'on'},fixtureSnapshot);assert.ok(checks.length>=10);
  const r=await fetch(base+'/sitemap-0.xml');assert.equal(await r.text(),crawlFiles['/sitemap-0.xml']);
 }finally{await runtime.dispose();}
});
test('GitHub requires explicit main dispatch, protected approval, shared deployment lock and exact plan',()=>{
 const w=parse(fs.readFileSync('.github/workflows/maintenance.yml','utf8'));
 assert.deepEqual(Object.keys(w.on),['workflow_dispatch']);assert.deepEqual(w.on.workflow_dispatch.inputs.mode.options,['on','off']);assert.deepEqual(w.permissions,{contents:'read'});
 assert.equal(w.jobs.prepare.if,"github.ref == 'refs/heads/main'");assert.equal(w.jobs.apply.environment.name,'production');assert.equal(w.jobs.apply.needs,'prepare');
 assert.equal(w.jobs.apply.concurrency.group,parse(fs.readFileSync('.github/workflows/release.yml','utf8')).jobs.publish.concurrency.group);assert.equal(w.jobs.apply.concurrency['cancel-in-progress'],false);
 assert.match(w.jobs.apply.env.WIKI_MAINTENANCE_PLAN_SHA256,/needs.prepare.outputs.plan_hash/);
 assert.match(w.jobs.prepare.outputs.artifact_name,/steps.artifact.outputs.name/);
 assert.match(w.jobs.apply.steps.find(s=>s.uses?.startsWith('actions/download-artifact@')).with.name,/needs.prepare.outputs.artifact_name/);
 for(const job of Object.values(w.jobs))for(const step of job.steps){if(step.uses)assert.match(step.uses,/@[a-f0-9]{40}$/);assert.ok(!step['continue-on-error']);}
 const prepare=fs.readFileSync('scripts/maintenance/prepare.mjs','utf8'),apply=fs.readFileSync('scripts/maintenance/apply.mjs','utf8');
 assert.ok(!prepare.includes("'deployments','create'"));assert.ok(!apply.includes("'versions','create'"));assert.ok(!apply.includes('buildMaintenance'));assert.ok(apply.includes('assertApply'));
 assert.ok(!JSON.stringify(w).includes('TURNSTILE_SECRET_KEY'));
 const promote=fs.readFileSync('scripts/release/promote.mjs','utf8');assert.ok(promote.indexOf('assertWikiVersion(call')<promote.indexOf("'deployments','create'"));
});

 test('Off verifies restored pages, assets, redirects, 404s and original crawl bytes',async()=>{
  const returned=async(url,options={})=>{
   const u=new URL(url);if(crawlFiles[u.pathname])return fetchCrawl(url);
   if(u.pathname==='/nested/maintenance-check-missing')return new Response(options.method==='HEAD'?null:'Not found',{status:404});
   if(u.pathname==='/armor-king')return new Response(null,{status:301,headers:{Location:'/armour-king'+u.search}});
   const html=!u.pathname.includes('.');return new Response(html?'<html><body>Original wiki</body></html>':'original asset',{headers:{'Content-Type':html?'text/html':'application/javascript'}});
  };
  const plan={action:'off',url:versionUrl(wiki)};
  const checks=await verifyMode('https://kenshi.wiki',plan,fixtureSnapshot,returned);assert.ok(checks.includes('Alias and genuine 404 restored'));
  await assert.rejects(()=>verifyMode('https://kenshi.wiki',plan,fixtureSnapshot,async(url,options)=>{
   if(url==='https://kenshi.wiki/catun')return new Response('Wrong article',{headers:{'Content-Type':'text/html'}});return returned(url,options);
  }));
  await assert.rejects(()=>verifyMode('https://kenshi.wiki',plan,fixtureSnapshot,async()=>new Response('Challenge',{status:403,headers:{'cf-mitigated':'challenge'}})));
 });


test('both maintenance workflow entrypoints load through npm before enforcing the GitHub guard',async()=>{
 const {spawnSync}=await import('node:child_process');
 const {npm}=await import('../scripts/release/common.mjs');
 const workflow=parse(fs.readFileSync('.github/workflows/maintenance.yml','utf8'));
 const scripts=JSON.parse(fs.readFileSync('package.json','utf8')).scripts;
 for(const phase of ['prepare','apply']){
  const command='maintenance:'+phase;
  assert.equal(scripts[command],'node scripts/maintenance/'+phase+'.mjs');
  assert.ok(workflow.jobs[phase].steps.some(step=>step.run==='npm run '+command));
  const env={...process.env,GITHUB_ACTIONS:'false'};delete env.npm_execpath;
  const run=spawnSync(process.execPath,[npm,'run',command],{env,encoding:'utf8',timeout:30000});
  assert.equal(run.status,1);
  assert.match(run.stderr,/Remote maintenance actions run only in GitHub/);
  assert.doesNotMatch(run.stderr,/MODULE_NOT_FOUND|Cannot find module/);
 }
});
