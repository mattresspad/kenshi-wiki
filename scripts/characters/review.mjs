import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {snapshot} from '../../src/lib/catalog.mjs';
import {selectedIds} from '../conversion/batches.mjs';
import {mergeRegister,discover} from '../gaps/core.mjs';
const get=p=>JSON.parse(readFileSync(p)),save=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const roster=get('conversion/characters/roster.json'),review=get('conversion/characters/review.json'),ledger=get('conversion/reviews.json'),baseline=get('conversion/gaps/source.json'),register=get('conversion/gaps/register.json');
const ids=[...roster.batches.flatMap(b=>b.ids),'world-states'],records=new Map(snapshot.articles.map(a=>[a.id,a])),sources=new Map(baseline.pages.map(p=>[p.id,p]));
assert.equal(review.revision,snapshot.revision);
const definitions=[
 ['character-stat-associations',null,/^Statistics$/, 'Repeated imported statistics groups have lost reliable associations to their race labels.', 'Recover the exact tab/panel mapping from the cited Fandom revision or its archived template expansion; retain numbered original groups until established.', 'Neither adjacent race lists nor numerical resemblance proves which race owns a group.'],
 ['character-fcs-statistics',null,/Stats randomize|racial multiplier|non-player characters also level/, 'Imported NPC statistics, randomization, racial multipliers and negative bounds need versioned record interpretation.', 'Trace exact character and race IDs through a pinned vanilla export; distinguish generated ranges, defaults, multipliers and observed NPC leveling.', 'The conversion preserves numbers and qualifications; negative exported ranges are not independently verified runtime skill values.'],
 ['character-recruitment',null,/recruit|buying slaves|rescuing slaves|escape|enslaved/i, 'Recruitment, escape and dialogue conditions remain imported instructions with varying certainty.', 'Test the named recruit or squad with recorded relations, personality, imprisonment state, player composition and game version; preserve exceptions.', 'A recruitment possibility does not guarantee a spawn, dialogue branch or permanent join.'],
 ['character-equipment-probability',null,/chance|manufactured|Meitou grade|armour grading/i, 'Equipment quality, item rolls and percentages require their original conditional context.', 'Compare character equipment lists, quantity and quality distributions and squad overrides; test probability denominators separately from chance to spawn.', 'Equipment choices and grade rolls may be independent; rounded percentages need not total exactly 100.'],
 ['character-world-state-conditions',null,/dead|kidnapped|imprisoned|world state|cease to spawn|no longer trigger/i, 'Character death, captivity, override priorities and retaliation claims require exact state predicates.', 'Trace the named world-state records and affected settlements/events, including overlapping alive, dead and imprisonment conditions; test priority order.', 'The source may use death as shorthand even where imprisonment is relevant. Preserve its qualifications pending verification.'],
 ['character-stock-shopping',null,/stock|shopping|restock|purchase|sells|merchant/i, 'Shop inventory, prices, refresh and shopping behavior remain imported descriptions.', 'Trace shop and item records, regional price modifiers, timing and player-visible transactions for the tested version.', 'Stock availability, average price and an NPC purchase preference describe different mechanisms.'],
 ['character-historical-lore',null,/speculat|likely|perhaps|rumou?r|seems|assum|implied|theor|unclear|not elaborated/i, 'Character backstory and motive interpretations include qualified or speculative material.', 'Retain speaker attribution and separate dialogue quotations from interpretation; seek the cited dialogue or developer source before strengthening a claim.', 'A character claim or inference is not independently established historical fact.'],
 ['character-removed-content',null,/content discussed on this page|removed|0\.93\.14|out of date|incomplete information/i, 'Historical and incomplete character pages need their version and availability qualifications.', 'Compare the cited historical patch or FCS record with current data, keeping removed NPCs separate from present-day spawn or recruitment instructions.', 'A surviving record does not demonstrate a character currently spawns.']
];
const texts=new Map();
for(const id of ids){const original=sources.get(id);let text=readFileSync('reports/geography-work/reference-83abc179/'+original.sourceFile,'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(text).digest('hex'),original.sourceSha256,id+' source');texts.set(id,text.split('\n'));}
for(const [key,only,pattern,finding,resolution,uncertainty] of definitions){
 const occurrences=[],evidence=[];
 for(const id of only??ids){const lines=texts.get(id);if(!lines)continue;if(key==='character-stat-associations'&&lines.filter(l=>l.trim()==='Statistics').length<2)continue;const hits=lines.flatMap((line,i)=>pattern.test(line.trim())?[{line:i+1,literal:line}]:[]).slice(0,12);if(!hits.length)continue;
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
const available=new Set([...selectedIds('characters'),...roster.existing]);
for(const note of review.articles){assert.ok(ids.includes(note.id));assert.ok(note.existence&&note.content&&note.organization);note.questions=register.findings.filter(r=>r.kind==='claim'&&r.occurrences?.some(o=>o.pageId===note.id)).map(r=>r.id);
 if(available.has(note.id))ledger.articles[note.id]={...ledger.articles[note.id],formatCheck:roster.existing.includes(note.id)?'scripts/geography/verify.mjs':'scripts/conversion/verify.mjs',editorialReview:'conversion/characters/review.json'};
}
if(process.argv.includes('--complete'))assert.deepEqual(new Set(review.articles.map(n=>n.id)),new Set(ids),'Every family and support article needs an individual review');
save('conversion/characters/review.json',review);save('conversion/reviews.json',ledger);console.log(review.articles.length+' individual reviews recorded; claim qualifications preserved.');
