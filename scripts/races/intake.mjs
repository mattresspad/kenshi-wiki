import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {stringify} from 'yaml';
import {snapshot} from '../../src/lib/catalog.mjs';
import next from '../../conversion/next-families.json' with {type:'json'};
import {openSource} from '../conversion/source.mjs';
import {articleEvidence} from '../geography/evidence.mjs';
import {articleFiles} from '../article-files.mjs';
const [action,repository,directory,batchName]=process.argv.slice(2);
const source=openSource(repository,directory),root='conversion/races';
const records=new Map(snapshot.articles.map(a=>[a.id,a]));
function save(file,body) {
  if(action==='verify-freeze')assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),body,file);
  else{mkdirSync(dirname(file),{recursive:true});writeFileSync(file,body);}
}
const json=(name,data)=>save(join(root,name),JSON.stringify(data,null,2)+'\n');
if(['freeze','verify-freeze'].includes(action)){
  const members=next.races.members, overview=next.races.overview;
  assert.deepEqual(new Set(members),new Set(snapshot.articles.filter(a=>a.categories.includes('Races')).map(a=>a.id)));
  assert.equal(members.length,32);assert.ok(!members.includes(overview));
  const pilot=next.races.pilot,structures=[overview,'how-to-make-a-new-race','whistler'];
  const taken=new Set([...pilot,...structures]),remaining=members.filter(id=>!taken.has(id));
  const batches=[{name:'race-pilots',ids:pilot},{name:'race-structures',ids:structures},
    {name:'race-siblings-1',ids:remaining.slice(0,14)},{name:'race-siblings-2',ids:remaining.slice(14)}];
  const articles={};
  for(const id of batches.flatMap(b=>b.ids)){
    source.document(id);articles[id]=articleEvidence(source.html(id),true,'race');
    assert.deepEqual(articles[id].images,[],id+' requires asset assessment');
  }
  const expected={headings:362,citationTargets:136,assets:0,redirects:1};
  assert.equal(Object.values(articles).reduce((n,p)=>n+p.headings.length,0),expected.headings);
  assert.equal(Object.values(articles).reduce((n,p)=>n+p.ids.filter(i=>/^cite_(ref|note)/.test(i)).length,0),expected.citationTargets);
  json('roster.json',{revision:snapshot.revision,baseRevision:'615b877',members,existing:[],batches,expected});
  json('supporting-pages.json',{revision:snapshot.revision,ids:[overview]});
  save(join(root,'reference.json'),'{\n  "articles": {\n'+Object.entries(articles).map(([id,p])=>'    '+JSON.stringify(id)+': '+JSON.stringify(p)).join(',\n')+'\n  },\n  "assets": {}\n}\n');
  console.log('Frozen 32 race members, overview, 362 headings, 136 citation targets.');
}else if(action==='transfer'){
  const roster=JSON.parse(readFileSync(join(root,'roster.json'))),checkpoint=JSON.parse(readFileSync(join(root,'checkpoint.json')));
  const batch=roster.batches[checkpoint.included];assert.equal(batch?.name,batchName);
  const existing=new Set(articleFiles().map(e=>e.data.articleId));
  for(const id of batch.ids){
    assert.ok(!existing.has(id),id);const {front,body}=source.document(id);
    assert.ok(!front.infobox,id+' has an unexpected fact panel');
    const data={articleId:id,title:front.title,description:front.description??'',categories:front.categories??[],layout:'race'};
    const home=id==='how-to-make-a-new-race'?'modding/guides':'creatures/races';
    const file=join('src/content/articles',home,records.get(id).sourceFile.slice('src/content/wiki/'.length));
    assert.ok(!existsSync(file),file);
    save(file,'---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n');
  }
  const localPaths=new Set([...existing,...batch.ids].map(id=>records.get(id).path));
  const original=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd();
  const covered=new Set(original.split(/\r?\n/).map(l=>l.split(/\s+/)[0]));
  save('public/_redirects',original+'\n\n# Restored redirects from the frozen inventory\n'+snapshot.redirects.filter(r=>localPaths.has(r.to)&&!covered.has(r.from)).map(r=>[r.from,r.to,r.status].join(' ')).join('\n')+'\n');
  const policy=JSON.parse(readFileSync('conversion/category-policy.json'));
  policy.reviewedCategories=[...new Set([...policy.reviewedCategories,'Races'])];
  save('conversion/category-policy.json',JSON.stringify(policy,null,2)+'\n');
  json('checkpoint.json',{included:checkpoint.included+1});
  console.log('Transferred '+batch.name+' · '+batch.ids.length+' articles');
}else throw Error('Expected freeze, verify-freeze or transfer');
