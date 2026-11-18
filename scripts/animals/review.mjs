import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {snapshot} from '../../src/lib/catalog.mjs';
import {selectedIds} from '../conversion/batches.mjs';
import {mergeRegister,discover} from '../gaps/core.mjs';
const get=p=>JSON.parse(readFileSync(p)),save=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const roster=get('conversion/animals/roster.json'),review=get('conversion/animals/review.json'),ledger=get('conversion/reviews.json'),baseline=get('conversion/gaps/source.json'),register=get('conversion/gaps/register.json');
const ids=[...roster.members,'guide-to-animals'],records=new Map(snapshot.articles.map(a=>[a.id,a])),sources=new Map(baseline.pages.map(p=>[p.id,p]));
assert.equal(review.revision,snapshot.revision);
const definitions=[
 ['animal-growth-fields',null,/Growth stages|Stats randomize|current age/, 'Growth stages and randomized attributes are imported FCS-oriented values, not evidence that every instance ages identically.', 'Compare exact creature, race and squad records with a pinned vanilla export, then observe natural and purchased individuals at specified ages.', 'Spawn age, skill multiplier, elapsed days and actual growth may differ, especially for robots and exceptional variants.'],
 ['race-hit-weights',null,/Chance of Hitting/, 'Anatomy hit-chance values are preserved without treating them as percentages.', 'Trace record fields and selection logic before assigning units or normalizing values.', 'The body-part weights do not establish a percent distribution by themselves.'],
 ['animal-movement',null,/Speed:|Speed.*mph|mph.*Speed|Age.*mph/, 'Animal movement ranges and age-to-mph examples need a documented conversion and observed comparison.', 'Record source speed fields, age modifiers, units and transformation; compare a timed walk/run under controlled conditions.', 'Footprint and combat movement multipliers must not be conflated with travel speed.'],
 ['animal-damage-reload',null,/Damage Calculations|racial animal weapons|saving and then reloading|weapon selected randomizes/i, 'Damage formulas and squad/save/reload weapon-quality claims remain imported assertions.', 'Trace the exact animal weapon records and formulas; test unchanged and reordered squads through save/reload with damage resistance controlled.', 'Coefficient precision, pierce/harpoon interpretation and runtime randomization are not verified by conversion.'],
 ['animal-feeding',['bonedog','guide-to-animals'],/225|240 hunger|275 hunger|automatically eat|not stolen|40%|heal speed/i, 'Feeding thresholds, limb play and healing instructions need versioned player-visible tests.', 'Test bag, feeder, ground food and limb behavior at recorded hunger and age; separately test conscious, unconscious and bed healing.', 'The guide qualifies possible bugs; thresholds and the interaction of healing states remain unverified.'],
 ['animal-elder-ages',['beak-thing','elder-beak-thing'],/1\.9|2\.1|1\.10x/, 'Exceptional Beak Thing spawn ages and ordinary Elder growth rows describe different cases.', 'Check squad spawn ages and race growth settings, then compare observed sizes, speed and health at each age.', 'The ordinary 1.10x row does not explain all 1.9–2.1 spawned elders.'],
 ['animal-robot-fields',['cleanser-unit','iron-spider','security-spider','security-spider-ii','crimper','king'],/Growth stages|Hunger rate|Self [Hh]ealing|self healing|renewable|age of/, 'Robot growth, hunger, self-healing and renewable-drop wording need record-level interpretation.', 'Separate unused/default fields from active mechanics and test repair, natural respawn and drops for the exact robot record.', 'An organic-looking growth panel or renewable-resource assertion is not proof of that gameplay behavior.'],
 ['animal-flats-lagoon',['beak-thing','fauna','bonedog','boneyard-wolf','landbat','garru'],/href="\/flats-lagoon"|\]\(\/flats-lagoon\)/, 'Animal region lists link Flats Lagoon to the town address.', 'Compare each zone list against the source region record and intended reader destination; use /flats-lagoon-zone only after verification.', 'The same inherited destination question exists in Bonefields; preserve the current literal links meanwhile.'],
 ['animal-guide-purchase',['guide-to-animals'],/lose 75%|Crab Raiders.*purchase|unbutcherable|\*Needs Testing\*|taming/i, 'The care guide contains purchase-stat penalties, an inventory exploit, building-entry tests and speculative taming history.', 'Test purchase and entry instructions in an isolated versioned save; consult historical sources for proposed taming and preserve the WIP notice.', 'These instructions are not validated by a rendering/content review.'],
 ['animal-fauna-media',['fauna'],/<img/, 'Fauna’s Image column repeats item icons and does not provide complete animal portraits.', 'Compare the original article and asset history; restore missing creature media with provenance and credits where available.', 'All six referenced files are preserved, but the importer’s media coverage remains unassessed.'],
 ['animal-fauna-comparisons',['fauna','pack-beast'],/Pack Beast|Leviathan|Hunger rate/, 'Fauna groups Leviathan under both Aggressive and Passive and reports Pack Beast drops differently from its profile.', 'Check conditional behavior and exact instance records before reconciling overview rows with profile statistics.', 'Different behavior/spawn contexts or incomplete import may explain the apparent discrepancy; preserve both readings.'],
 ['animal-cleanser-origin',['cleanser-unit'],/inspiration taken|renewable/, 'Cleanser Unit design-inspiration and exclusive renewable-AI-Core claims lack verification.', 'Separate the literal robo levi identifier from design intent; compare respawn behavior and other sources of cores.', 'A squad name alone cannot establish the creator’s intent or resource exclusivity.'],
 ['animal-beak-regions',['beak-thing'],/7 core|seven core|migrat/i, 'Beak Thing’s core-region count and possible migration wording need clarification.', 'Reconcile the grouped region list with squad/biome conditions and preserve the migration qualification pending observation.', 'A grouped bullet may name multiple regions; counting bullets alone does not establish a correction.'],
 ['animal-barnabus-scale',['barnabus'],/0\.20|0\.60|660|1,023/, 'Barnabus’s stated spawn age multiplier needs reconciliation with the exceptional size and health ranges.', 'Inspect the tournament squad and actor/race size/age modifiers together; record observed health and size.', 'Do not substitute ordinary Crab growth values for the tournament instance.']
];
definitions.push(...get('conversion/animals/questions.json').map(([key,only,pattern,...rest])=>[key,only,new RegExp(pattern,'i'),...rest]));
const texts=new Map();
for(const id of ids){const original=sources.get(id);let text=readFileSync('reports/geography-work/reference-83abc179/'+original.sourceFile,'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(text).digest('hex'),original.sourceSha256,id+' source');texts.set(id,text.split('\n'));}
for(const [key,only,pattern,finding,resolution,uncertainty] of definitions){
 const occurrences=[],evidence=[];
 for(const id of only??ids){const lines=texts.get(id);if(!lines)continue;const hits=lines.flatMap((line,i)=>pattern.test(line)?[{line:i+1,literal:line}]:[]);if(!hits.length)continue;
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
const available=new Set([...selectedIds('animals'),...roster.existing]);
for(const note of review.articles){assert.ok(ids.includes(note.id));assert.ok(note.existence&&note.content&&note.organization);note.questions=register.findings.filter(r=>r.kind==='claim'&&r.occurrences?.some(o=>o.pageId===note.id)).map(r=>r.id);
 if(available.has(note.id))ledger.articles[note.id]={...ledger.articles[note.id],formatCheck:roster.existing.includes(note.id)?'scripts/factions/verify.mjs':'scripts/conversion/verify.mjs',editorialReview:'conversion/animals/review.json'};
}
if(process.argv.includes('--complete'))assert.deepEqual(new Set(review.articles.map(n=>n.id)),new Set(ids),'Every family and support article needs an individual review');
save('conversion/animals/review.json',review);save('conversion/reviews.json',ledger);console.log(review.articles.length+' individual reviews recorded; claim qualifications preserved.');
