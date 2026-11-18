import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {snapshot} from '../../src/lib/catalog.mjs';
import {selectedIds} from '../conversion/batches.mjs';
import {mergeRegister,discover} from '../gaps/core.mjs';
const get=p=>JSON.parse(readFileSync(p)),save=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const roster=get('conversion/items/roster.json'),review=get('conversion/items/review.json'),ledger=get('conversion/reviews.json'),baseline=get('conversion/gaps/source.json'),register=get('conversion/gaps/register.json');
const ids=roster.batches.flatMap(b=>b.ids),records=new Map(snapshot.articles.map(a=>[a.id,a])),sources=new Map(baseline.pages.map(p=>[p.id,p]));
assert.equal(review.revision,snapshot.revision);
const definitions=[
 ['item-quality-and-prices',null,/grade|quality|manufacturer|[Pp]rice|[Vv]alue/, 'Item quality, manufacturer and price meanings need their exact source context.', 'Trace item, quality and manufacturer records with regional price multipliers; distinguish base value, purchase cost and sale value.', 'A summary range can differ from displayed quality tables; restoration does not independently verify formulas.'],
 ['item-damage-and-modifiers',null,/damage|resistance|efficiency|multiplier|[Cc]overage|penalty/, 'Damage, protection, coverage and skill modifiers remain imported qualified claims.', 'Trace exact item IDs and formulas and test coverage, absorption, cut efficiency and skill modifiers separately.', 'Percent coverage is not percent damage resistance; signs and quality assumptions must remain attached to their values.'],
 ['item-crafting-and-research',null,/[Cc]rafting|[Rr]ecipe|[Bb]lueprint|[Rr]esearch|[Ii]ngredient/, 'Recipe quantities, required research and crafting conditions need versioned verification.', 'Check station, recipe, blueprint and research records, including quantities, skill assumptions and production times.', 'A research unlock and a blueprint requirement can be distinct; fixed tables are preserved without inferred conversions.'],
 ['item-availability-and-maps',null,/[Uu]nobtainable|[Rr]emoved|[Cc]hance|[Pp]robability|[Rr]evealed|ITEM_PLACEMENT_GROUP/, 'Item availability and map reveal chances need record-specific conditions.', 'Trace placement groups, loot and reveal records; distinguish surviving records, unobtainable items and probability per revealed location.', 'An imported record or percentage does not establish ordinary gameplay availability.'],
 ['item-economy-arm-discrepancy',['economy-arm-left'],/35|100|40|95/, 'Economy Arm (left) summary gives HP 35–100 while the grade tables give 40–95.', 'Compare the exact arm record and grade scaling in a pinned vanilla export and observed game item; preserve both ranges until supported.', 'Neither range is selected as correct by this conversion.'],
 ['item-source-media',null,/image:|caption:/, 'Imported item images and captions do not establish complete original artwork or portrait coverage.', 'Verify the referenced pinned files separately from omitted source images and unresolved Characters empty cells.', 'Restoring item icons must not close missing portraits, blank equipment-cell or gameplay-verification findings.']
];

definitions.push(...get('conversion/items/questions.json').map(([key,only,pattern,...rest])=>[key,only,new RegExp(pattern,'i'),...rest]));
const texts=new Map();
for(const id of ids){const original=sources.get(id);let text=readFileSync('reports/geography-work/reference-83abc179/'+original.sourceFile,'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(text).digest('hex'),original.sourceSha256,id+' source');texts.set(id,text.split('\n'));}
for(const [key,only,pattern,finding,resolution,uncertainty] of definitions){
 const occurrences=[],evidence=[];
 for(const id of only??ids){const lines=texts.get(id);if(!lines)continue;const hits=lines.flatMap((line,i)=>pattern.test(line.trim())?[{line:i+1,literal:line}]:[]).slice(0,12);if(!hits.length)continue;
  const source=sources.get(id);evidence.push({articleId:id,sourceFile:source.sourceFile,revision:source.sourceRevision,sha256:source.sourceSha256,url:'https://github.com/mattresspad/kenshi-wiki/blob/'+source.sourceRevision+'/'+source.sourceFile});
  for(const hit of hits)occurrences.push({pageId:id,label:hit.literal,literal:hit.literal,line:hit.line,sourceFile:source.sourceFile,revision:source.sourceRevision});
 }
 if(!occurrences.length)continue;
 const old=register.findings.find(r=>r.id==='claim:'+key),first=occurrences[0].pageId;
 const merge=(a,b,identity)=>[...new Map([...a,...b].map(x=>[identity(x),x])).values()];
 const row={id:'claim:'+key,kind:'claim',target:records.get(first).path,classification:'unresolved',origin:'inherited',priority:'P2',verification:'pinned imported claim identified; gameplay and technical semantics unverified',status:'open',finding,proposedResolution:resolution,uncertainty,postCutover:'Serve the registered article with the imported qualification; keep this investigation open. Conversion is not gameplay verification.',...old,
 evidence:merge(old?.evidence??[],evidence,x=>x.articleId),occurrences:merge(old?.occurrences??[],occurrences,x=>x.pageId+':'+(x.line??x.section)+':'+x.label)};
 if(old)register.findings[register.findings.indexOf(old)]=row;else register.findings.push(row);
}
const detected=discover(baseline,new Set(baseline.registeredRoutes),new Map(baseline.redirects.map(r=>[r.from,r.to])));
register.findings=mergeRegister(register.findings,detected,baseline);save('conversion/gaps/register.json',register);
assert.equal(new Set(review.articles.map(n=>n.id)).size,review.articles.length);
const available=new Set([...selectedIds('items'),...roster.existing]);
for(const note of review.articles){assert.ok(ids.includes(note.id));assert.ok(note.existence&&note.content&&note.organization);note.questions=register.findings.filter(r=>r.kind==='claim'&&r.occurrences?.some(o=>o.pageId===note.id)).map(r=>r.id);
 if(available.has(note.id))ledger.articles[note.id]={...ledger.articles[note.id],formatCheck:roster.existing.includes(note.id)?'scripts/geography/verify.mjs':'scripts/conversion/verify.mjs',editorialReview:'conversion/items/review.json'};
}
if(process.argv.includes('--complete'))assert.deepEqual(new Set(review.articles.map(n=>n.id)),new Set(ids),'Every family and support article needs an individual review');
save('conversion/items/review.json',review);save('conversion/reviews.json',ledger);console.log(review.articles.length+' individual reviews recorded; claim qualifications preserved.');
