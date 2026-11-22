import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'yaml';
import {releaseConfiguration,assertStaging,assertRehearsal,assertReleaseRun,assertProductionPackage,assertVersionUrl,assertPromotion} from '../scripts/release/config.mjs';
import {correctionLink} from '../src/lib/page-source.mjs';
test('release targets reject unknown targets, absent edit branches and production staging uploads',()=>{
 assert.equal(releaseConfiguration({}).target,'local');assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'anything'}));assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'staging'}));assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'rebuild/restoration'}));
 const stage=releaseConfiguration({WIKI_RELEASE_TARGET:'staging',WIKI_EDIT_BRANCH:'main'});assert.doesNotThrow(()=>assertStaging(stage,stage));assert.throws(()=>assertStaging(releaseConfiguration({WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'main'}),stage));assert.throws(()=>assertStaging(stage,{...stage,worker:'kenshi-wiki'}));
});
test('software scope and correction form retain the approved license boundaries and article prefill',()=>{
 assert.equal(fs.readFileSync('LICENSE','utf8'),fs.readFileSync('public/notices/FreshWiki-MIT.txt','utf8'));assert.match(fs.readFileSync('LICENSING.md','utf8'),/does not relicense article prose/);
 const template=parse(fs.readFileSync('.github/ISSUE_TEMPLATE/article-correction.yml','utf8'));assert.ok(template.body.some(f=>f.id==='article'&&f.type==='input'));const url=new URL(correctionLink('https://kenshi.wiki/catun#town-override'));assert.equal(url.searchParams.get('template'),'article-correction.yml');assert.equal(url.searchParams.get('article'),'https://kenshi.wiki/catun#town-override');
});


test('PR checks report each phase without push runs or deployment credentials',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/restoration.yml','utf8'));
 assert.equal(workflow.name,'PR checks');assert.equal(workflow.on.push,undefined);
 assert.deepEqual(workflow.on.pull_request.branches,['main']);
 assert.equal(workflow.on.pull_request.paths,undefined);assert.equal(workflow.on.pull_request['paths-ignore'],undefined);
 const job=workflow.jobs.checks;assert.equal(job.name,'PR checks');assert.equal(job['runs-on'],'ubuntu-24.04');
 const steps=job.steps;
 for(const phase of ['build','catalog','browser','package','editing','summary'])assert.ok(steps.some(s=>s.run==='npm run ci:check -- --phase '+phase),phase);
 assert.equal(steps.find(s=>s.name==='Summarize results').if,'always()');
 assert.ok(!JSON.stringify(workflow).includes('CLOUDFLARE_API_TOKEN'));
 assert.deepEqual(workflow.permissions,{contents:'read'});
 assert.equal(steps[0].with['fetch-depth'],0);assert.equal(steps[0].with['persist-credentials'],false);
 const artifact=steps.find(s=>s.uses?.startsWith('actions/upload-artifact@'));
 assert.equal(artifact.with['retention-days'],14);assert.ok(!artifact.with.path.includes('.cloudflare/output'));
});

test('preview precedes required environment approval and publication never rebuilds',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/release.yml','utf8'));
 assert.deepEqual(workflow.on.push.branches,['main']);assert.equal(workflow.on.pull_request,undefined);
 const {preview,publish}=workflow.jobs;
 assert.equal(preview.name,'Staging preview');assert.equal(publish.needs,'preview');
 assert.equal(publish.environment.name,'production');assert.equal(publish.environment.url,'${{ needs.preview.outputs.url }}');
 assert.equal(publish.if,"github.ref == 'refs/heads/main'");
 const commands=preview.steps.map(s=>s.run).filter(Boolean);
 for(const cmd of ['npm run release:prepare','npm run release:stage','npm run release:verify'])assert.ok(commands.includes(cmd));
 assert.ok(commands.indexOf('npm run release:stage')<commands.indexOf('npm run release:verify'));
 const publication=publish.steps.map(s=>s.run).filter(Boolean);
 assert.ok(publication.includes('npm run release:publish'));assert.ok(publication.includes('npm run release:verify -- --live'));
 assert.ok(!publication.some(c=>/release:(prepare|stage)|npm run build/.test(c)));
 assert.ok(![...preview.steps,...publish.steps].some(s=>s['continue-on-error']));
 assert.equal(publish.concurrency['cancel-in-progress'],false);
 assert.equal(preview.steps.find(s=>s.uses?.startsWith('actions/upload-artifact@')).with['retention-days'],90);
 const script=fs.readFileSync('scripts/release/stage.mjs','utf8');
 assert.ok(!script.includes("'deployments','create'"));assert.ok(script.includes("'versions','create'"));
 assert.ok(script.includes("assert.deepEqual(hashes(resolve('.cloudflare/output')),candidate.packageFiles"));
 assert.ok(script.includes('assert.deepEqual(after.versions,before.versions)'));
 const promote=fs.readFileSync('scripts/release/promote.mjs','utf8');
 assert.ok(promote.includes("'deployments','create'"));assert.ok(!promote.includes("'versions','create'"));assert.ok(!promote.includes('await build'));
});

test('exhaustive checks remain independently dispatchable and Actions stay pinned',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/audits.yml','utf8'));
 assert.deepEqual(Object.keys(workflow.on),['workflow_dispatch']);
 assert.deepEqual(workflow.on.workflow_dispatch.inputs.mode.options,['audit','release']);
 const steps=workflow.jobs.audit.steps;
 assert.ok(steps.some(s=>s.run==='npm run audit:check'));assert.ok(steps.some(s=>s.run==='npm run release:check'));
 assert.ok(!JSON.stringify(workflow).includes('CLOUDFLARE_API_TOKEN'));
 const artifact=steps.find(s=>s.uses?.startsWith('actions/upload-artifact@'));assert.equal(artifact.with['retention-days'],90);assert.ok(artifact.with.path.includes('.cloudflare/output'));assert.ok(!artifact.with.path.split('\n').includes('dist'));
 for(const file of ['restoration','release','audits']){
  const w=parse(fs.readFileSync('.github/workflows/'+file+'.yml','utf8'));
  for(const job of Object.values(w.jobs))for(const step of job.steps)if(step.uses)assert.match(step.uses,/@[a-f0-9]{40}$/);
 }
 const sha='a'.repeat(40);assert.throws(()=>assertRehearsal({},sha));assert.doesNotThrow(()=>assertRehearsal({WIKI_EXPECTED_SHA:sha},sha));
 const env={WIKI_EXPECTED_SHA:sha,GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/main',GITHUB_SHA:sha};
 assert.doesNotThrow(()=>assertRehearsal(env,sha));
 for(const change of [{GITHUB_REF:'refs/heads/topic'},{GITHUB_EVENT_NAME:'pull_request'},{WIKI_EXPECTED_SHA:'b'.repeat(40)},{GITHUB_SHA:'b'.repeat(40)}])assert.throws(()=>assertRehearsal({...env,...change},sha));
});

test('promotion rejects stale commits, changed traffic, wrong versions and package substitutions',()=>{
 const sourceSha='a'.repeat(40),versionId='12345678-1234-1234-1234-123456789abc',rollback='87654321-1234-1234-1234-123456789abc';
 const url='https://12345678-kenshi-wiki.prds.workers.dev/',hash='d'.repeat(64);
 const env={WIKI_EXPECTED_SHA:sourceSha,GITHUB_SHA:sourceSha,GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/main',WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'main',WIKI_VERSION:versionId,WIKI_VERSION_URL:url,WIKI_PACKAGE_SHA256:hash,WIKI_ROLLBACK_VERSION:rollback,WIKI_PREVIOUS_DEPLOYMENT:'deployment'};
 const evidence={sourceSha,head:sourceSha,current:{id:'deployment',versions:[{version_id:rollback,percentage:100}]},version:{id:versionId,urls:[url],annotations:{'workers/message':'FreshWiki '+sourceSha+' package '+hash}}};
 assert.doesNotThrow(()=>assertPromotion(env,evidence));
 for(const change of [{GITHUB_ACTIONS:undefined},{GITHUB_EVENT_NAME:'pull_request'},{GITHUB_REF:'refs/heads/topic'},{WIKI_EXPECTED_SHA:'b'.repeat(40)},{WIKI_EDIT_BRANCH:'topic'},{WIKI_RELEASE_TARGET:'staging'},{WIKI_PACKAGE_SHA256:'e'.repeat(64)},{WIKI_VERSION:rollback},{WIKI_VERSION_URL:'https://12345678-kenshi-wiki-restoration.prds.workers.dev/'},{WIKI_ROLLBACK_VERSION:versionId},{WIKI_PREVIOUS_DEPLOYMENT:'another'}])assert.throws(()=>assertPromotion({...env,...change},evidence),JSON.stringify(change));
 for(const change of [{head:'b'.repeat(40)},{current:{...evidence.current,versions:[{version_id:rollback,percentage:50}]}},{version:{...evidence.version,annotations:{}}}])assert.throws(()=>assertPromotion(env,{...evidence,...change}));
 assert.doesNotThrow(()=>assertProductionPackage({target:'production',worker:'kenshi-wiki',editBranch:'main',packageSha256:hash}));
 assert.throws(()=>assertProductionPackage({target:'staging',worker:'kenshi-wiki-restoration',editBranch:'main',packageSha256:hash}));
 assert.throws(()=>assertVersionUrl(versionId,url+'?other=1'));
 assert.throws(()=>assertReleaseRun({},sourceSha,{githubOnly:true}));
});

import {assertLiveRecheck} from '../scripts/release/config.mjs';
import {digest,withoutCloudflareDetection} from '../scripts/release/live-content.mjs';
test('live content comparison removes only the final recognized Cloudflare detection bootstrap',()=>{
 const script="(function(){function c(){var b=a.contentDocument;window.__CF$cv$params={r:'ray'};var u='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.createElement('iframe');}})();";
 const original='<html><head><script>app()</script></head><body><main>Catun</main></body></html>';
 const protectedHtml=original.replace('</body>','<script>'+script+'</script></body>');
 assert.deepEqual(withoutCloudflareDetection(protectedHtml),{html:original,removed:1});
 assert.deepEqual(withoutCloudflareDetection(original),{html:original,removed:0});
 assert.notEqual(digest(withoutCloudflareDetection(protectedHtml.replace('Catun','Wrong page')).html),digest(original));
 for(const inserted of ['<script>appChanged()</script>','<script>window.__CF$cv$params={};</script>','<div>unexpected</div>']){
  const changed=original.replace('</body>',inserted+'</body>');
  assert.equal(withoutCloudflareDetection(changed).html,changed);
 }
});
test('read-only rechecks require the exact active version and source annotation',()=>{
 const source='a'.repeat(40),id='12345678-1234-1234-1234-123456789abc';
 const env={WIKI_EXPECTED_SHA:source,WIKI_VERSION:id};
 const current={id:'deployment',versions:[{version_id:id,percentage:100}]};
 const version={id,urls:['https://12345678-kenshi-wiki.prds.workers.dev'],annotations:{'workers/message':'FreshWiki '+source+' package '+'b'.repeat(64)}};
 assert.equal(assertLiveRecheck(env,{current,version}).sourceSha,source);
 assert.throws(()=>assertLiveRecheck({...env,WIKI_EXPECTED_SHA:'c'.repeat(40)},{current,version}));
 assert.throws(()=>assertLiveRecheck(env,{current:{...current,versions:[{version_id:id,percentage:50}]},version}));
 assert.throws(()=>assertLiveRecheck({...env,GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'pull_request',GITHUB_REF:'refs/heads/main'},{current,version}));
 const script=fs.readFileSync('scripts/release/recheck-live.mjs','utf8');
 assert.ok(!script.includes("'deployments','create'"));assert.ok(!script.includes("'versions','create'"));assert.ok(!script.includes('await build'));
});
test('live recheck is an explicit trusted-main inspection with no publish step',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/recheck-live.yml','utf8'));
 assert.deepEqual(Object.keys(workflow.on),['workflow_dispatch']);
 assert.equal(workflow.jobs.verify.if,"github.ref == 'refs/heads/main'");
 const commands=workflow.jobs.verify.steps.map(s=>s.run).filter(Boolean);
 assert.deepEqual(commands,['npm ci','npm run release:recheck']);
 assert.equal(workflow.jobs.verify.environment,undefined);
 for(const step of workflow.jobs.verify.steps)if(step.uses)assert.match(step.uses,/@[a-f0-9]{40}$/);
 const config=fs.readFileSync('playwright.release.config.mjs','utf8');assert.ok(config.includes("'release-live.pw.mjs':'release-smoke.spec.mjs'"));
});
