import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {discover,extractPage,mergeRegister,regressions,targetOf} from '../scripts/gaps/core.mjs';
const a={id:'a',path:'/a',ids:['firstHeading'],links:[{href:'/missing#one',element:1},{href:'/missing#one',element:2},{href:'/b#Missing',element:3}],media:[],labels:[],emptySections:[]};
const b={...a,id:'b',path:'/b',ids:['firstHeading','present'],links:[{href:'/missing#one',element:1}]};
const baseline={pages:[a,b],assets:{}};
test('source audit covers every registered article and normalization retains investigation notes',()=>{
 const source=JSON.parse(readFileSync('conversion/gaps/source.json'));
 const registry=JSON.parse(readFileSync('conversion/gaps/register.json'));
 const mappings=new Map(JSON.parse(readFileSync('conversion/reference.json')).articles.map(a=>[a.id,a]));
 const articles=source.pages.filter(p=>!p.id.startsWith('route:'));
 assert.equal(articles.length,2184);assert.equal(new Set(articles.map(a=>a.id)).size,2184);
 for(const article of articles){assert.equal(article.sourceRevision,mappings.get(article.id).sourceRevision);assert.match(article.sourceSha256,/^[a-f0-9]{64}$/);assert.ok(article.sourceFile.endsWith('.md'));}
 const found=discover(source,new Set(source.registeredRoutes),new Map(source.redirects.map(r=>[r.from,r.to])));
 const once=mergeRegister(registry.findings,found,source);
 assert.deepEqual(mergeRegister(once,found,source),once);
 assert.equal(once.find(r=>r.id==='destination:/memo-from-moll').classification,'omitted article');
 assert.equal(once.find(r=>r.id==='destination:/memo-from-moll').status,'open');
 assert.ok(once.find(r=>r.id==='destination:/memo-from-moll').evidence.length>=2);
});
test('shared destinations retain repeated occurrences and distinct fragments',()=>{
 const found=discover(baseline,new Set(['/a','/b']),new Map());
 assert.equal(found.get('destination:/missing').occurrences.length,3);
 assert.deepEqual(found.get('destination:/missing').occurrences.map(o=>o.pageId),['a','a','b']);
 assert.ok(found.has('fragment:/b#Missing'));
 const old=[{id:'destination:/missing',finding:'Manually investigated',evidence:['pinned note']}];
 const merged=mergeRegister(old,found,baseline);
 assert.equal(merged.find(r=>r.id==='destination:/missing').finding,'Manually investigated');
 assert.deepEqual(merged.find(r=>r.id==='destination:/missing').evidence,['pinned note']);
});
test('a broken link is inherited only when this source occurrence was already broken',()=>{
 const current={...a,links:[...a.links,{href:'/new-hole',element:4},{href:'/b#present',element:5}]};
 const problems=regressions(current,a,[a,b],new Set(['/a','/b']),new Map(),new Map([['/b',{...b,ids:['firstHeading']}]]),()=>false);
 assert.equal(problems.filter(r=>r.origin==='inherited').length,3);
 assert.deepEqual(problems.filter(r=>r.origin==='introduced').map(r=>r.target),['/new-hole','/b#present']);
});
test('URL normalization retains exact fragments, follows aliases and rejects cycles',()=>{
 assert.deepEqual(targetOf('/old/?x=1#Case_Name','/a',new Map([['/old','/b']])),{path:'/b',fragment:'#Case_Name',target:'/b#Case_Name'});
 assert.equal(targetOf('https://example.com/a','/a'),null);
 assert.throws(()=>targetOf('/a','/',new Map([['/a','/b'],['/b','/a']])) ,/cycle/);
});
test('empty sections exclude parent headings with real nested content; repeated source links keep exact ordinals',()=>{
 const page=extractPage('<main><h2 id="parent">Parent</h2><h3 id="child">Child</h3><p>Text <a href="/x">X</a> <a href="/x">X</a></p><h2 id="gallery">Gallery</h2></main>',{path:'/a',markdown:'[X](/x)\n[X](/x)'});
 assert.deepEqual(page.emptySections,[{section:'gallery',label:'Gallery'}]);
 assert.equal(page.links.length,2);assert.notEqual(page.links[0].element,page.links[1].element);assert.equal(page.links[0].line,null);
});

import {validateResolution} from '../scripts/gaps/core.mjs';
test('closed findings need evidence and missing targets cannot be declared resolved',()=>{
 const row={id:'fragment:/a#missing',kind:'fragment',status:'resolved',evidence:['source pin'],resolution:{method:'manual assertion'}};
 assert.throws(()=>validateResolution(row,false),/Unsupported resolved/);
 assert.doesNotThrow(()=>validateResolution(row,true));
 assert.throws(()=>validateResolution({...row,evidence:[]},true),/evidence required/);
 assert.throws(()=>validateResolution({...row,kind:'claim'},false),/Investigation proof/);
 assert.doesNotThrow(()=>validateResolution({...row,kind:'claim',resolution:{method:'controlled test',evidence:'checked-in test record',verifiedBy:'reviewer'}},false));
});
