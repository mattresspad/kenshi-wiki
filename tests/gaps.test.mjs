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

import {appendAcceptedResolutions} from '../scripts/gaps/core.mjs';
test('cross-family acceptance preserves original closure evidence and records only new proofs',()=>{
 const old={version:1,records:[{id:'availability:/a',kind:'availability',target:'/a',sourceRevision:'pin',acceptedIn:'races#final',resolution:{method:'exists'}}]};
 const report={revision:'pin',findings:[{id:'availability:/a',kind:'availability',target:'/a',status:'resolved',resolution:{method:'exists'}},{id:'media:/b',kind:'media',target:'/b',status:'resolved',resolution:{method:'sha',sha256:'abc'}}]};
 const next=appendAcceptedResolutions(old,report,'animals#pilot');assert.equal(next.records.length,2);assert.equal(next.records[0].acceptedIn,'races#final');assert.equal(old.records.length,1);
 assert.deepEqual(appendAcceptedResolutions(next,report,'animals#final'),next);
});

// Compatibility anchors may be additive; original IDs and reader content must still match exactly.
import {withoutVerifiedBookmarks} from '../scripts/conversion/bookmarks.mjs';
import {articleEvidence} from '../scripts/geography/evidence.mjs';
test('preservation permits only empty declared aliases beside existing targets',()=>{
 const original='<div class="article-body"><h2 id="current">Section</h2><p>Keep these words.</p></div>';
 const marker='<span id="Legacy" class="bookmark" aria-hidden="true" data-bookmark-target="current"></span>';
 const added=original.replace('<h2',marker+'<h2');
 const normalized=withoutVerifiedBookmarks(added,{Legacy:'current'},['current']);
 assert.deepEqual(articleEvidence(normalized,false),articleEvidence(original,false));
 for(const bad of [added.replace(marker,''),added.replace(marker,marker+marker),added.replace('data-bookmark-target="current"','data-bookmark-target="other"'),added.replace('</span>','Lost words</span>'),added.replace('</span>','</span><p>Moved</p>')]) assert.throws(()=>withoutVerifiedBookmarks(bad,{Legacy:'current'},['current']));
 assert.throws(()=>withoutVerifiedBookmarks(added,{Legacy:'current'},[]));
 assert.throws(()=>withoutVerifiedBookmarks(added,{Legacy:'current'},['Legacy','current']));
 const unexpected=withoutVerifiedBookmarks(added.replace('</p>','</p><span id="Unexpected"></span>'),{Legacy:'current'},['current']);
 assert.notDeepEqual(articleEvidence(unexpected,false).ids,articleEvidence(original,false).ids);
});

import bookmarkEvidence from '../conversion/bookmarks/restoration.json' with {type:'json'};
test('bookmark closure retains every inherited occurrence and independent investigation evidence',()=>{
 const source=JSON.parse(readFileSync('conversion/gaps/source.json'));
 const registry=JSON.parse(readFileSync('conversion/gaps/register.json'));
 const history=JSON.parse(readFileSync('conversion/gaps/resolutions.json')).records;
 const found=discover(source,new Set(source.registeredRoutes),new Map(source.redirects.map(r=>[r.from,r.to])));
 assert.equal(bookmarkEvidence.cases.length,11);
 assert.equal(bookmarkEvidence.cases.flatMap(c=>c.occurrences).length,14);
 for(const c of bookmarkEvidence.cases){
  const row=registry.findings.find(r=>r.id===c.findingId);
  assert.equal(row.origin,'inherited');assert.equal(row.status,'resolved');
  assert.equal(row.resolution.target,c.path+'#'+c.old);
  assert.deepEqual(c.occurrences.map(({path,...rest})=>rest),found.get(c.findingId).occurrences);
  assert.ok(row.evidence.includes('conversion/bookmarks/restoration.json'));
  assert.ok(history.some(r=>r.id===row.id&&r.acceptedIn==='conversion/bookmarks/README.md'&&r.sourceRevision===bookmarkEvidence.sourceRevision));
 }
 assert.equal(registry.findings.find(r=>r.id==='destination:/memo-from-moll').status,'open');
});
