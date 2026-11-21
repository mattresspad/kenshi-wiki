import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dirname} from 'node:path';
import {snapshot} from '../../src/lib/catalog.mjs';
import {articleFiles} from '../article-files.mjs';
import {openSource,factParts} from '../conversion/source.mjs';
import {articleEvidence,hash} from '../geography/evidence.mjs';
const get=p=>JSON.parse(fs.readFileSync(p));
const save=(p,x)=>{fs.mkdirSync(dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n')};
assert.ok(!fs.existsSync('conversion/manufacturers/checkpoint.json'),'One-time intake');
const done=new Set(articleFiles().map(a=>a.data.articleId));
const chosen=get('conversion/remaining-after-modding.json').groups['Manufacturers and historical remainder'].pending.map(r=>snapshot.articles.find(a=>a.id===r.id));
assert.equal(done.size,2138);assert.equal(chosen.length,30);assert.ok(chosen.every(a=>!done.has(a.id)));
const categories=['Manufacturers','Removed Content','Retired Items'];
const all=snapshot.articles.filter(a=>a.categories.some(c=>categories.includes(c)));
const existing=all.filter(a=>done.has(a.id));
assert.ok(existing.some(a=>a.id==='cross'));
const batches=[
{name:'manufacturer-pilots',ids:['catun-scrapmaster-manufacturer','edgewalkers','ancient-manufacturer']},
{name:'historical-structures',ids:['blackened-chain-headwrap','adventurers-guild-alpha','ore-mine']},
{name:'historical-qualifications',ids:['old-eye-blades','shopkeepers-backpack','samurai-lord']}
];
const early=new Set(batches.flatMap(b=>b.ids));
batches.push({name:'remaining-manufacturers-and-history',ids:chosen.filter(a=>!early.has(a.id)).sort((a,b)=>a.title.localeCompare(b.title,'en')||a.id.localeCompare(b.id)).map(a=>a.id)});
const source=openSource('D:/THE-ONLY-KENSHI-WIKI-CHECKOUT-FOLDER-LOCATION/homepage-polish','reports/geography-work/reference-83abc179');
const homes={},layouts={},files={},articles={},facts={},assets={},copied=[],reused=[],media=[],audit=[];
for(const a of chosen){
 const {front,body}=source.document(a.id);
 const kind=a.categories.includes('Manufacturers')?'manufacturer':a.categories.includes('Retired Items')?'item':a.id==='samurai-lord'?'character':a.id==='ore-mine'?'building':a.id==='ore-mining'?'skill':'faction';
 homes[a.id]={manufacturer:'items/manufacturers',item:'items/retired',character:'characters/historical',building:'buildings/historical',skill:'gameplay/technology/historical',faction:'factions/historical'}[kind];
 layouts[a.id]={manufacturer:'item',skill:'technology'}[kind]??kind;
 files[a.id]='src/content/articles/'+homes[a.id]+'/'+a.sourceFile.slice('src/content/wiki/'.length);
 facts[a.id]=front.infobox??null;
 const mode=layouts[a.id];articles[a.id]=articleEvidence(source.html(a.id),true,mode);
 for(const group of front.infobox?.groups??[])for(const row of group.rows)factParts(row[1]);
 for(const [url]of [...articles[a.id].images,...(articles[a.id].factMedia?.images??[])]){
  if(assets[url])continue;
  const bytes=source.pinned('public'+url);assets[url]=hash(bytes);
  if(fs.existsSync('public'+url)){assert.equal(hash(fs.readFileSync('public'+url)),assets[url]);reused.push(url)}
  else{fs.mkdirSync(dirname('public'+url),{recursive:true});fs.writeFileSync('public'+url,bytes);copied.push(url)}
 }
 media.push({id:a.id,referencedImages:[...articles[a.id].images,...(articles[a.id].factMedia?.images??[])].map(a=>a[0]),emptyGallery:articles[a.id].emptyGallery,coverage:'unassessed beyond retained references',note:'Verified inventory artwork does not establish complete original illustrations, portraits or galleries.'});
 audit.push({id:a.id,sourceFile:a.sourceFile,revision:snapshot.revision,sha256:hash(source.pinned(a.sourceFile)),front,body});
}
const expected={headings:Object.values(articles).reduce((n,a)=>n+a.headings.length,0),citationTargets:Object.values(articles).reduce((n,a)=>n+a.ids.filter(i=>/^cite_(ref|note)/.test(i)).length,0),assets:Object.keys(assets).length,redirects:snapshot.redirects.filter(r=>chosen.some(a=>a.path===r.to)).length};
save('conversion/manufacturers/roster.json',{revision:snapshot.revision,baseRevision:'6e12c25842f73b38fa9d8eeca0fbd4dcf98359f9',categories,categoryMembers:Object.fromEntries(categories.map(c=>[c,all.filter(a=>a.categories.includes(c)).map(a=>a.id)])),members:all.map(a=>a.id),newMembers:chosen.map(a=>a.id),existing:existing.map(a=>a.id),reviewExisting:[],homes,layouts,files,batches,expected,expectedPages:[2181,2184,2187,2208]});
save('conversion/manufacturers/reference.json',{articles,assets});save('conversion/manufacturers/source-facts.json',facts);save('conversion/manufacturers/media-coverage.json',media);save('conversion/manufacturers/assets.json',{revision:snapshot.revision,copied,reused,checksums:assets,notice:'Pinned Kenshi item artwork; existing credit and permission status apply.'});
for(const name of ['acceptances','link-changes'])save('conversion/manufacturers/'+name+'.json',[]);
save('conversion/manufacturers/checkpoint.json',{included:0});save('conversion/manufacturers/review.json',{revision:snapshot.revision,articles:[],editorialChanges:[]});save('conversion/manufacturers/baseline-links.json',[...new Set(get('reports/routes.json').temporaryLinks.flatMap(r=>r.to))].sort());
save('reports/manufacturers/source-audit.json',audit);
const resolution='Retain the source wording and qualification. Check a versioned game record or historical build and separately test behavior before proposing a correction.';
const uncertainty='Inherited descriptions and record values are not independently verified gameplay observations.';
const q=(id,only,pattern,finding)=>['manufacturers-'+id,only,pattern,finding,resolution,uncertainty];
save('conversion/manufacturers/questions.json',[
 q('quality',null,'Price:|Damage:|Weight:|quality|stronger|grade','Manufacturer multipliers, displayed rounding and relative quality depend on model and version; retain imported values and qualifications.'),
 q('availability',null,'artifact|scraphouse|craft|research|found|sold|loot','Availability, artifact grades and player-crafted versus found weapons require separate versioned evidence; a research unlock does not establish identical quality or obtainable models.'),
 q('historical-status',null,'version|0\\.[0-9]|removed|unused|never been|retired|old world','Removed, never implemented, historical and surviving-record statuses remain distinct. Source notices do not establish present runtime availability.'),
 q('historical-claims',null,'likely|possible|believ|supposed|unknown|perhaps','Historical identity, precursor theories and removal explanations remain qualified interpretations rather than established facts.'),
 q('old-destinations',['old-eye-blades','metal-purity','truth-two'],'catan|/unknown|catan-scrapmaster','Historical manufacturer links retain their recorded spellings and alias destinations; verify intended identity before inventing or changing an alias.'),
 q('retired-properties',null,'Base value|Avg\\. Price|Nutrition|String id|capacity|Weight|harvest|ingredient','Retired item properties, prices, nutrition and storage/production claims need exact source records and version semantics; preserve blank or incomplete values.'),
 q('historical-relations',null,'Relations|\\(-100\\)|faction|recruit|shopping','Historic faction relations, NPC membership and recruitment behavior are version-dependent; current entities are not substitutes for historical records.'),
 q('media',null,'Gallery|File:|screenshot|image|picture','Missing or unassessed illustrations and empty galleries remain restoration work; verified item icons are not complete media coverage.')
]);
save('conversion/manufacturers/normalization.json',{revision:snapshot.revision,changes:['Reuse established item, faction, character, building and gameplay treatments; retain source text, table order, numerical fields, citations and existing headings.','Keep original non-book captions inside compact facts; preserve historical notices before their descriptions.','No historical status, modifier, price or availability claim is corrected from inference.'],editorial:'Source content and organization reviewed individually; unresolved semantics remain in the gap register.'});
fs.appendFileSync('public/notices/artwork.txt','\nManufacturers and historical restoration: '+Object.keys(assets).length+' distinct referenced item images verified against 83abc179 ('+reused.length+' reused; '+copied.length+' restored unchanged). Existing Kenshi item-art credit and recorded permission status apply. Checksums: conversion/manufacturers/assets.json. Missing illustrations remain unassessed.\n');
console.log(JSON.stringify({new:30,reused:existing.length,categories:Object.fromEntries(categories.map(c=>[c,all.filter(a=>a.categories.includes(c)).length])),...expected,copied:copied.length,reusedImages:reused.length,facts:Object.values(facts).filter(Boolean).length,homes},null,2));
