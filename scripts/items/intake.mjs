import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {stringify} from 'yaml';
import {snapshot} from '../../src/lib/catalog.mjs';
import {openSource,factParts} from '../conversion/source.mjs';
import {articleEvidence,hash} from '../geography/evidence.mjs';
import {articleFiles} from '../article-files.mjs';
const [action,repository,directory,batchName]=process.argv.slice(2);
const source=openSource(repository,directory),root='conversion/items';
const records=new Map(snapshot.articles.map(a=>[a.id,a]));
function save(file,body){if(action==='verify-freeze')assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),body,file);else{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,body)}}
const json=(name,data)=>save(join(root,name),JSON.stringify(data,null,2)+'\n');
if(['freeze','verify-freeze'].includes(action)){
 const categories=['Items','Equipment','Weapons','Armour','Clothing','Crossbows','Backpacks','Robot Limbs','Map items'];
 const candidates=snapshot.articles.filter(a=>a.categories.some(c=>categories.includes(c))),deferred=candidates.filter(a=>a.categories.some(c=>['Technology','Modding'].includes(c))).map(a=>a.id);
 assert.equal(deferred.length,11);const members=candidates.filter(a=>!deferred.includes(a.id)).map(a=>a.id),existing=['backpacks'];assert.equal(members.length,391);
 const batches=[{name:'item-pilots',ids:['katana','samurai-armour','economy-arm-left','basic-first-aid-kit','building-materials']},{name:'item-structures',ids:['tooth-pick','small-backpack','map-of-the-united-cities-extended-territories']},{name:'item-comparisons',ids:['robot-limbs','crossbows','light-armour']},{name:'item-qualifications',ids:['ancient-samurai-boots','faulty-prisoner-shackles','the-holy-flame']}];
 const taken=new Set([...existing,...batches.flatMap(b=>b.ids)]),groups={weapons:[],crossbows:[],armour:[],limbs:[],backpacks:[],items:[],maps:[]};
 for(const id of members){if(taken.has(id))continue;const c=records.get(id).categories;const group=c.includes('Map items')?'maps':c.includes('Crossbows')?'crossbows':c.includes('Robot Limbs')?'limbs':c.includes('Backpacks')?'backpacks':c.includes('Armour')||c.includes('Clothing')?'armour':c.includes('Weapons')?'weapons':'items';groups[group].push(id);}
 assert.deepEqual(Object.values(groups).map(a=>a.length),[43,10,139,19,12,137,16]);
 for(const [name,ids] of Object.entries(groups)){const count=Math.ceil(ids.length/25),size=Math.floor(ids.length/count),extra=ids.length%count;let offset=0;for(let i=0;i<count;i++){const length=size+(i<extra?1:0);batches.push({name:name+'-'+(i+1),ids:ids.slice(offset,offset+=length)});}}
 assert.equal(batches.length,22);
 const baselineAssets=new Set(execFileSync('git',['-c','safe.directory=D:/NeoEcosystem/FreshWiki/site','ls-tree','-r','--name-only','3dbcdf1','public'],{encoding:'utf8'}).trim().split(/\r?\n/).map(p=>p.slice('public'.length)));
 const articles={},assets={};
 for(const id of batches.flatMap(b=>b.ids)){
  source.document(id);articles[id]=articleEvidence(source.html(id),true,'item');
  for(const [url] of [...articles[id].images,...articles[id].factMedia.images])assets[url]=hash(source.pinned('public'+url));
 }
 const expected={headings:1160,citationTargets:23,assets:354,redirects:45};
 assert.equal(Object.values(articles).reduce((n,p)=>n+p.headings.length,0),1160);assert.equal(Object.keys(assets).length,354);
 json('roster.json',{revision:snapshot.revision,baseRevision:'3dbcdf1',categories,members,existing,deferred,batches,expected});
 json('supporting-pages.json',{revision:snapshot.revision,ids:[]});
 save(join(root,'reference.json'),JSON.stringify({articles,assets},null,2)+'\n');
 json('asset-intake.json',{revision:snapshot.revision,assets:Object.entries(assets).map(([url,sha256])=>({url,sha256,alreadyPresent:baselineAssets.has(url)}))});
 console.log('Frozen 391 members, 390 additions, 1160 headings and 354 images.');
}else if(action==='transfer'){
 const roster=JSON.parse(readFileSync(join(root,'roster.json'))),checkpoint=JSON.parse(readFileSync(join(root,'checkpoint.json'))),fixture=JSON.parse(readFileSync(join(root,'reference.json')));
 const batch=roster.batches[checkpoint.included];assert.equal(batch?.name,batchName);
 const existing=new Set(articleFiles().map(e=>e.data.articleId));
 for(const id of roster.existing)assert.ok(existing.has(id),'Missing reused ID '+id);
 for(const id of batch.ids){
  const {front,body}=source.document(id);
  const data={articleId:id,title:front.title,description:front.description??'',categories:front.categories??[],layout:'item'};
  if(front.infobox){data.factTitle=front.infobox.title;data.factGroups=front.infobox.groups.map(g=>({heading:g.heading??null,rows:g.rows.map(([label,value])=>[label,...factParts(value)])}));}
  if(front.infobox?.image)data.factImage={src:front.infobox.image,alt:fixture.articles[id].factMedia.images[0][1]};
  if(front.infobox?.caption)data.factCaption=front.infobox.caption;
  const file=join('src/content/articles','items',records.get(id).sourceFile.slice('src/content/wiki/'.length));
  const output='---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n';
  // Resume a partial transfer only when its files exactly match this pinned transformation.
  if(existing.has(id)){assert.ok(existsSync(file),'Existing ID has a different editable home: '+id);assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),output,'Refuse to overwrite edited transfer '+id);}else{assert.ok(!existsSync(file),file);save(file,output);}
  for(const [url] of [...fixture.articles[id].images,...fixture.articles[id].factMedia.images]){const bytes=source.pinned('public'+url);assert.equal(hash(bytes),fixture.assets[url]);if(existsSync('public'+url))assert.equal(hash(readFileSync('public'+url)),fixture.assets[url]);else save('public'+url,bytes);}
 }
 const localPaths=new Set([...existing,...batch.ids].map(id=>records.get(id).path));
 const original=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd(),covered=new Set(original.split(/\r?\n/).map(l=>l.split(/\s+/)[0]));
 save('public/_redirects',original+'\n\n# Restored redirects from the frozen inventory\n'+snapshot.redirects.filter(r=>localPaths.has(r.to)&&!covered.has(r.from)).map(r=>[r.from,r.to,r.status].join(' ')).join('\n')+'\n');
 const policy=JSON.parse(readFileSync('conversion/category-policy.json'));policy.reviewedCategories=[...new Set([...policy.reviewedCategories,...roster.categories])];save('conversion/category-policy.json',JSON.stringify(policy,null,2)+'\n');
 json('checkpoint.json',{included:checkpoint.included+1});console.log('Transferred '+batch.name+' · '+batch.ids.length+' articles');
}else throw Error('Expected freeze, verify-freeze or transfer');
