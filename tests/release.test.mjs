import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'yaml';
import {releaseConfiguration,assertStaging,assertRehearsal} from '../scripts/release/config.mjs';
import {correctionLink} from '../src/lib/page-source.mjs';
test('release targets reject unknown targets, absent edit branches and production staging uploads',()=>{
 assert.equal(releaseConfiguration({}).target,'local');assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'anything'}));assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'staging'}));assert.throws(()=>releaseConfiguration({WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'rebuild/restoration'}));
 const stage=releaseConfiguration({WIKI_RELEASE_TARGET:'staging',WIKI_EDIT_BRANCH:'main'});assert.doesNotThrow(()=>assertStaging(stage,stage));assert.throws(()=>assertStaging(releaseConfiguration({WIKI_RELEASE_TARGET:'production',WIKI_EDIT_BRANCH:'main'}),stage));assert.throws(()=>assertStaging(stage,{...stage,worker:'kenshi-wiki'}));
});
test('software scope and correction form retain the approved license boundaries and article prefill',()=>{
 assert.equal(fs.readFileSync('LICENSE','utf8'),fs.readFileSync('public/notices/FreshWiki-MIT.txt','utf8'));assert.match(fs.readFileSync('LICENSING.md','utf8'),/does not relicense article prose/);
 const template=parse(fs.readFileSync('.github/ISSUE_TEMPLATE/article-correction.yml','utf8'));assert.ok(template.body.some(f=>f.id==='article'&&f.type==='input'));const url=new URL(correctionLink('https://kenshi.wiki/catun#town-override'));assert.equal(url.searchParams.get('template'),'article-correction.yml');assert.equal(url.searchParams.get('article'),'https://kenshi.wiki/catun#town-override');
});

test('routine and manual CI preserve required coverage without push or deployment jobs',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/restoration.yml','utf8'));assert.equal(workflow.on.push,undefined);assert.deepEqual(workflow.on.pull_request.branches,['main']);assert.equal(workflow.on.pull_request.paths,undefined);assert.equal(workflow.on.pull_request['paths-ignore'],undefined);
 assert.deepEqual(workflow.on.workflow_dispatch.inputs.mode.options,['release','audit']);assert.deepEqual(Object.keys(workflow.jobs),['check-and-stage']);const steps=workflow.jobs['check-and-stage'].steps;assert.ok(steps.some(s=>s.run==='npm run ci:check'));assert.ok(steps.some(s=>s.run==='npm run audit:check'));assert.equal(steps[0].with['fetch-depth'],0);assert.equal(steps[0].with['persist-credentials'],false);assert.ok(steps.some(s=>s.run==='npm run release:check'));assert.ok(!JSON.stringify(workflow).includes('CLOUDFLARE_API_TOKEN'));
 const uploads=steps.filter(s=>s.uses?.startsWith('actions/upload-artifact@'));assert.deepEqual(uploads.map(s=>s.with['retention-days']),[14,90]);assert.ok(uploads.every(s=>!s.with.path.split('\n').includes('dist')));assert.ok(!uploads[0].with.path.includes('.cloudflare/output'));assert.ok(uploads[1].with.path.includes('.cloudflare/output'));
 const sha='a'.repeat(40);assert.throws(()=>assertRehearsal({},sha));assert.doesNotThrow(()=>assertRehearsal({WIKI_EXPECTED_SHA:sha},sha));
 const env={WIKI_EXPECTED_SHA:sha,GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/main',GITHUB_SHA:sha};assert.doesNotThrow(()=>assertRehearsal(env,sha));for(const change of [{GITHUB_REF:'refs/heads/topic'},{GITHUB_EVENT_NAME:'pull_request'},{WIKI_EXPECTED_SHA:'b'.repeat(40)},{GITHUB_SHA:'b'.repeat(40)}])assert.throws(()=>assertRehearsal({...env,...change},sha));
});
