import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {stringify} from 'yaml';
import {snapshot} from '../../src/lib/catalog.mjs';
import next from '../../conversion/next-families.json' with {type:'json'};
import {openSource,factParts} from '../conversion/source.mjs';
import {articleEvidence,hash} from '../geography/evidence.mjs';
import {articleFiles} from '../article-files.mjs';
const [action,repository,directory,batchName]=process.argv.slice(2);
const source=openSource(repository,directory),root='conversion/characters';
const records=new Map(snapshot.articles.map(a=>[a.id,a]));
function save(file,body){if(action==='verify-freeze')assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),body,file);else{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,body)}}
const json=(name,data)=>save(join(root,name),JSON.stringify(data,null,2)+'\n');
if(['freeze','verify-freeze'].includes(action)){
 const handoff=JSON.parse(readFileSync('conversion/animals/characters-handoff.json'));
 const members=handoff.members,existing=handoff.reused.map(a=>a.id),support=[];
 assert.equal(members.length,504);assert.equal(existing.length,43);
 assert.deepEqual(new Set(members),new Set(snapshot.articles.filter(a=>a.categories.includes('Characters')).map(a=>a.id)));
 const batches=[{name:'character-pilots',ids:handoff.pilot},{name:'recruit-indexes',ids:['unique-recruits','generic-recruits','slave-recruits']},{name:'varied-statistics-and-stock',ids:['drifter','fish-and-drugs-seller','alpha-gurgler']},{name:'removed-characters',ids:['crow-face']}];
 const taken=new Set([...existing,...batches.flatMap(b=>b.ids)]),groups={recruits:[],traders:[],bosses:[],npcs:[]};
 for(const id of members){if(taken.has(id))continue;const c=records.get(id).categories;const group=c.includes('Playable')?'recruits':c.includes('Traders')?'traders':c.some(n=>['Bosses','Superbosses','Nobles','Leaders'].includes(n))?'bosses':'npcs';groups[group].push(id);}
 assert.deepEqual(Object.values(groups).map(a=>a.length),[93,24,60,273]);
 for(const [name,ids] of Object.entries(groups)){const count=Math.ceil(ids.length/25),size=Math.floor(ids.length/count),extra=ids.length%count;let offset=0;for(let i=0;i<count;i++){const length=size+(i<extra?1:0);batches.push({name:name+'-'+(i+1),ids:ids.slice(offset,offset+=length)});}}
 const articles={},assets={};
 for(const id of batches.flatMap(b=>b.ids)){
  source.document(id);articles[id]=articleEvidence(source.html(id),true,'character');
  for(const [url] of articles[id].images)assets[url]=hash(source.pinned('public'+url));
 }
 const expected={headings:1508,citationTargets:175,assets:83,redirects:16};
 assert.equal(Object.values(articles).reduce((n,p)=>n+p.headings.length,0),1508);assert.equal(Object.keys(assets).length,83);
 json('roster.json',{revision:snapshot.revision,baseRevision:'355889e',members,existing,batches,expected});
 json('supporting-pages.json',{revision:snapshot.revision,ids:support});
 save(join(root,'reference.json'),JSON.stringify({articles,assets},null,2)+'\n');
 console.log('Frozen 504 members, 43 reused IDs, 461 additions, 1508 headings and 83 icons.');
}else if(action==='transfer'){
 const roster=JSON.parse(readFileSync(join(root,'roster.json'))),checkpoint=JSON.parse(readFileSync(join(root,'checkpoint.json'))),fixture=JSON.parse(readFileSync(join(root,'reference.json')));
 const batch=roster.batches[checkpoint.included];assert.equal(batch?.name,batchName);
 const existing=new Set(articleFiles().map(e=>e.data.articleId));
 for(const id of roster.existing)assert.ok(existing.has(id),'Missing reused ID '+id);
 for(const id of batch.ids){
  assert.ok(!existing.has(id),id);const {front,body}=source.document(id);
  const data={articleId:id,title:front.title,description:front.description??'',categories:front.categories??[],layout:'character'};
  if(front.infobox){data.factTitle=front.infobox.title;data.factGroups=front.infobox.groups.map(g=>({heading:g.heading??null,rows:g.rows.map(([label,value])=>[label,...factParts(value)])}));}
  const file=join('src/content/articles','characters',records.get(id).sourceFile.slice('src/content/wiki/'.length));
  assert.ok(!existsSync(file),file);save(file,'---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n');
  for(const [url] of fixture.articles[id].images){const bytes=source.pinned('public'+url);assert.equal(hash(bytes),fixture.assets[url]);if(existsSync('public'+url))assert.equal(hash(readFileSync('public'+url)),fixture.assets[url]);else save('public'+url,bytes);}
 }
 const localPaths=new Set([...existing,...batch.ids].map(id=>records.get(id).path));
 const original=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd(),covered=new Set(original.split(/\r?\n/).map(l=>l.split(/\s+/)[0]));
 save('public/_redirects',original+'\n\n# Restored redirects from the frozen inventory\n'+snapshot.redirects.filter(r=>localPaths.has(r.to)&&!covered.has(r.from)).map(r=>[r.from,r.to,r.status].join(' ')).join('\n')+'\n');
 const policy=JSON.parse(readFileSync('conversion/category-policy.json'));policy.reviewedCategories=[...new Set([...policy.reviewedCategories,'Characters'])];save('conversion/category-policy.json',JSON.stringify(policy,null,2)+'\n');
 json('checkpoint.json',{included:checkpoint.included+1});console.log('Transferred '+batch.name+' · '+batch.ids.length+' articles');
}else throw Error('Expected freeze, verify-freeze or transfer');
