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
const source=openSource(repository,directory),root='conversion/animals';
const records=new Map(snapshot.articles.map(a=>[a.id,a]));
function save(file,body){if(action==='verify-freeze')assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),body,file);else{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,body)}}
const json=(name,data)=>save(join(root,name),JSON.stringify(data,null,2)+'\n');
if(['freeze','verify-freeze'].includes(action)){
 const members=next.animals.members,existing=next.animals.alreadyInFactions,support=['guide-to-animals'];
 assert.equal(members.length,49);assert.equal(existing.length,5);
 assert.deepEqual(new Set(members),new Set(snapshot.articles.filter(a=>a.categories.includes('Animals')).map(a=>a.id)));
 const pilots=['bonedog','pack-bull','beak-thing'],structures=['elder-beak-thing','cleanser-unit','cage-beast'],overview=['fauna',...support,'barnabus'];
 const taken=new Set([...existing,...pilots,...structures,...overview]),rest=members.filter(id=>!taken.has(id));assert.equal(rest.length,36);
 const batches=[{name:'animal-pilots',ids:pilots},{name:'animal-structures',ids:structures},{name:'animal-overview-and-care',ids:overview},{name:'animal-siblings-1',ids:rest.slice(0,18)},{name:'animal-siblings-2',ids:rest.slice(18)}];
 const articles={},assets={};
 for(const id of batches.flatMap(b=>b.ids)){
  source.document(id);articles[id]=articleEvidence(source.html(id),true);
  for(const [url] of articles[id].images)assets[url]=hash(source.pinned('public'+url));
 }
 const expected={headings:321,citationTargets:0,assets:6,redirects:2};
 assert.equal(Object.values(articles).reduce((n,p)=>n+p.headings.length,0),321);assert.equal(Object.keys(assets).length,6);
 json('roster.json',{revision:snapshot.revision,baseRevision:'016c23b',members,existing,batches,expected});
 json('supporting-pages.json',{revision:snapshot.revision,ids:support});
 save(join(root,'reference.json'),JSON.stringify({articles,assets},null,2)+'\n');
 console.log('Frozen 49 members, five reused IDs, one support guide, 321 headings and six icons.');
}else if(action==='transfer'){
 const roster=JSON.parse(readFileSync(join(root,'roster.json'))),checkpoint=JSON.parse(readFileSync(join(root,'checkpoint.json'))),fixture=JSON.parse(readFileSync(join(root,'reference.json')));
 const batch=roster.batches[checkpoint.included];assert.equal(batch?.name,batchName);
 const existing=new Set(articleFiles().map(e=>e.data.articleId));
 for(const id of roster.existing)assert.ok(existing.has(id),'Missing reused ID '+id);
 for(const id of batch.ids){
  assert.ok(!existing.has(id),id);const {front,body}=source.document(id);
  const data={articleId:id,title:front.title,description:front.description??'',categories:front.categories??[],layout:'animal'};
  if(front.infobox){data.factTitle=front.infobox.title;data.factGroups=front.infobox.groups.map(g=>({heading:g.heading??null,rows:g.rows.map(([label,value])=>[label,...factParts(value)])}));}
  const file=join('src/content/articles',id==='guide-to-animals'?'gameplay/guides':'creatures/animals',records.get(id).sourceFile.slice('src/content/wiki/'.length));
  assert.ok(!existsSync(file),file);save(file,'---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n');
  for(const [url] of fixture.articles[id].images){const bytes=source.pinned('public'+url);assert.equal(hash(bytes),fixture.assets[url]);if(existsSync('public'+url))assert.equal(hash(readFileSync('public'+url)),fixture.assets[url]);else save('public'+url,bytes);}
 }
 const localPaths=new Set([...existing,...batch.ids].map(id=>records.get(id).path));
 const original=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd(),covered=new Set(original.split(/\r?\n/).map(l=>l.split(/\s+/)[0]));
 save('public/_redirects',original+'\n\n# Restored redirects from the frozen inventory\n'+snapshot.redirects.filter(r=>localPaths.has(r.to)&&!covered.has(r.from)).map(r=>[r.from,r.to,r.status].join(' ')).join('\n')+'\n');
 const policy=JSON.parse(readFileSync('conversion/category-policy.json'));policy.reviewedCategories=[...new Set([...policy.reviewedCategories,'Animals'])];save('conversion/category-policy.json',JSON.stringify(policy,null,2)+'\n');
 json('checkpoint.json',{included:checkpoint.included+1});console.log('Transferred '+batch.name+' · '+batch.ids.length+' articles');
}else throw Error('Expected freeze, verify-freeze or transfer');
