import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {snapshot} from '../../src/lib/catalog.mjs';
import {selectedIds} from '../conversion/batches.mjs';
import {mergeRegister,discover} from '../gaps/core.mjs';
const get=p=>JSON.parse(readFileSync(p)),save=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const family=process.argv[2];assert.ok(['crafting','technology','shops','gameplay','events','lore'].includes(family));
const roster=get('conversion/'+family+'/roster.json'),review=get('conversion/'+family+'/review.json'),ledger=get('conversion/reviews.json'),baseline=get('conversion/gaps/source.json'),register=get('conversion/gaps/register.json');
const ids=[...roster.batches.flatMap(b=>b.ids),...(roster.reviewExisting??[])],records=new Map(snapshot.articles.map(a=>[a.id,a])),sources=new Map(baseline.pages.map(p=>[p.id,p]));
assert.equal(review.revision,snapshot.revision);
const definitions=[];

definitions.push(...get('conversion/'+family+'/questions.json').map(([key,only,pattern,...rest])=>[key,only,new RegExp(pattern,'i'),...rest]));
const texts=new Map();
for(const id of new Set([...ids,...definitions.flatMap(d=>d[1]??[])])){const original=sources.get(id);let text=readFileSync('reports/geography-work/reference-83abc179/'+original.sourceFile,'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(text).digest('hex'),original.sourceSha256,id+' source');texts.set(id,text.split('\n'));}
for(const [key,only,pattern,finding,resolution,uncertainty] of definitions){
 const occurrences=[],evidence=[];
 for(const id of only??ids){const lines=texts.get(id);if(!lines)continue;const hits=lines.flatMap((line,i)=>pattern.test(line.trim())?[{line:i+1,literal:line}]:[]).slice(0,['events','lore'].includes(family)?Infinity:12);if(!hits.length)continue;
  const source=sources.get(id);evidence.push({articleId:id,sourceFile:source.sourceFile,revision:source.sourceRevision,sha256:source.sourceSha256,url:'https://github.com/mattresspad/kenshi-wiki/blob/'+source.sourceRevision+'/'+source.sourceFile});
  for(const hit of hits)occurrences.push({pageId:id,label:hit.literal,literal:hit.literal,line:hit.line,sourceFile:source.sourceFile,revision:source.sourceRevision});
 }
 if(!occurrences.length)continue;
 const old=register.findings.find(r=>r.id==='claim:'+key),first=occurrences[0].pageId;
 const merge=(a,b,identity)=>[...new Map([...a,...b].map(x=>[identity(x),x])).values()];
 const row={id:'claim:'+key,kind:'claim',target:records.get(first).path,classification:'unresolved',origin:'inherited',priority:'P2',verification:'pinned imported claim identified; gameplay and technical semantics unverified',status:'open',finding,proposedResolution:resolution,uncertainty,postCutover:'Serve the registered article with the imported qualification; keep this investigation open. Conversion is not gameplay verification.',...old,
 evidence:merge(old?.evidence??[],evidence,x=>x.articleId),occurrences:merge(old?.occurrences??[],occurrences,x=>x.pageId+':'+(x.line??x.section)+':'+x.label)};
 if(key==='technology-tree-missing-diagram'){row.classification='incomplete import';row.verification='Pinned Markdown and rendered source inspected; diagram absent, original media not yet assessed';row.postCutover='Serve the text article with its original credits and qualified totals; missing diagram remains restoration work.';}
 if(old)register.findings[register.findings.indexOf(old)]=row;else register.findings.push(row);
}
const detected=discover(baseline,new Set(baseline.registeredRoutes),new Map(baseline.redirects.map(r=>[r.from,r.to])));
register.findings=mergeRegister(register.findings,detected,baseline);save('conversion/gaps/register.json',register);
assert.equal(new Set(review.articles.map(n=>n.id)).size,review.articles.length);
const available=new Set([...selectedIds(family),...roster.existing]);
for(const note of review.articles){assert.ok(ids.includes(note.id));assert.ok(note.existence&&note.content&&note.organization);note.questions=register.findings.filter(r=>r.kind==='claim'&&r.occurrences?.some(o=>o.pageId===note.id)).map(r=>r.id);
 if(available.has(note.id))ledger.articles[note.id]={...ledger.articles[note.id],formatCheck:roster.existing.includes(note.id)?(ledger.articles[note.id]?.formatCheck??'scripts/conversion/verify.mjs'):'scripts/conversion/verify.mjs',editorialReview:'conversion/'+family+'/review.json'};
}
if(process.argv.includes('--complete'))assert.deepEqual(new Set(review.articles.map(n=>n.id)),new Set(ids),'Every family and support article needs an individual review');
save('conversion/'+family+'/review.json',review);save('conversion/reviews.json',ledger);console.log(review.articles.length+' individual reviews recorded; claim qualifications preserved.');
