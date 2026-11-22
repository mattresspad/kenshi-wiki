import test from 'node:test';
import assert from 'node:assert/strict';
import {selectChecks,inventory} from '../scripts/ci/policy.mjs';
import {changedTargets,checkDuplicateIds} from '../scripts/ci/current-core.mjs';
const articles=[{file:'src/content/articles/locations/catun.md',id:'catun',families:['geography']}];
const change=path=>[{path,status:'M'}];
test('documentation keeps required structural checks without building the site',()=>{
 const p=selectChecks({changes:change('README.md'),articles});assert.equal(p.kind,'documentation');assert.equal(p.build,false);assert.equal(p.audit,false);assert.ok(p.catalog.includes('tests/catalog.test.mjs'));assert.deepEqual(p.browser,[]);
});
test('content selects actual registered identities and affected families',()=>{
 const p=selectChecks({changes:change(articles[0].file),articles});assert.equal(p.kind,'content');assert.deepEqual(p.articleIds,['catun']);assert.ok(p.browser.includes('tests/geography.spec.mjs'));assert.ok(p.browser.includes('tests/bookmarks.spec.mjs'));assert.ok(!p.browser.includes('tests/items.spec.mjs'));assert.equal(p.editing,false);
});
test('shared code stays broad; preservation changes retain every test and fixture',()=>{
 const tests=inventory();
 for(const path of ['src/layouts/Frame.astro','src/styles/wiki.css','src/scripts/search.js']){
  const p=selectChecks({changes:change(path),articles});assert.equal(p.kind,'broad');assert.ok(p.browser.includes('tests/search.spec.mjs'));assert.ok(p.catalog.includes('tests/warm-move.test.mjs'));assert.ok(p.editing);assert.ok(!p.catalog.includes('tests/conversion-report.test.mjs'));
 }
 for(const path of ['scripts/conversion/verify.mjs','src/content.config.ts','conversion/gaps/register.json','package-lock.json','.github/workflows/restoration.yml','tests/new.spec.mjs','unmapped.txt']){
  const p=selectChecks({changes:change(path),articles});assert.ok(p.audit,path);assert.deepEqual(p.browser,tests.browser);assert.deepEqual(p.catalog,tests.catalog);
 }
});
test('explicit audits and rehearsals keep exhaustive coverage and unknown impact fails broad',()=>{
 for(const mode of ['audit','release']){const p=selectChecks({mode,changes:change('README.md')});assert.ok(p.audit);assert.ok(p.editing);assert.deepEqual(p.browser,inventory().browser);}
 for(const changes of [[],undefined,[{path:articles[0].file,status:'D'}],change('src/content/articles/new.md')])assert.ok(selectChecks({changes,articles}).audit);
 assert.throws(()=>selectChecks({mode:'anything'}));
});
test('reverse fragment dependencies include unchanged referring pages',()=>{
 const pages=new Map([['/a',{links:[{href:'/b#old'}]}],['/b',{links:[]}],['/c',{links:[{href:'/a'}]}]]);
 assert.deepEqual([...changedTargets(pages,new Set(['/b']),new Map())].sort(),['/a','/b']);
});

test('the complete modes retain the pre-policy browser and catalog inventories',()=>{
 const expectedBrowser='addressing animals bookmarks buildings characters editing events factions gameplay gap-report geography items lore manufacturers modding pr44 races reader remainder restoration search shops technology utilities work'.split(' ').map(x=>'tests/'+x+'.spec.mjs');
 const expectedCatalog='catalog faction-format race-format gaps warm-move animal-format character-format item-format building-format technology-format shop-format gameplay-format event-format lore-format work-index utilities release additions'.split(' ').map(x=>'tests/'+x+'.test.mjs');
 const actual=inventory();for(const f of expectedBrowser)assert.ok(actual.browser.includes(f),f);for(const f of expectedCatalog)assert.ok(actual.catalog.includes(f),f);
});

test('existing site collisions remain open diagnostics; new collisions fail',()=>{
 assert.equal(checkDuplicateIds('/npc-shopping-behavior',['tools','tools'])[0].status,'open');
 assert.equal(checkDuplicateIds('/old-world',['content','content'])[0].status,'open');
 assert.throws(()=>checkDuplicateIds('/catun',['new','new']));
 assert.throws(()=>checkDuplicateIds('/old-world',['content','content','content']));
 assert.deepEqual(checkDuplicateIds('/old-world',['content']),[]);
});
