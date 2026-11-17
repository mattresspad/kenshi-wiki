// Read the pinned source tree and its static build. Ordinary site builds never call this tool.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {resolve, join, dirname, basename} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {parse, stringify} from 'yaml';
import {load} from 'cheerio';
import {snapshot} from '../../src/lib/catalog.mjs';
import {articleEvidence, hash} from './evidence.mjs';
import {articleFiles} from '../article-files.mjs';

const [action, repository, referenceRoot, requested] = process.argv.slice(2);
if (!repository || !referenceRoot) throw Error('Expected freeze|transfer, comparison Git checkout and pinned build directory');
const dir = 'conversion/geography';
const ref = resolve(referenceRoot);
const records = new Map(snapshot.articles.map(a => [a.id, a]));
const tree = execFileSync('git',['-C',repository,'ls-tree','-r','-z',snapshot.revision],{maxBuffer:32*1024*1024}).toString().split('\0');
const blobs = new Map(tree.filter(Boolean).map(line => { const [meta,path]=line.split('\t'); return [path,meta.split(' ')[2]]; }));
function pinned(file) {
  let bytes = readFileSync(join(ref,file));
  const blobId = buf => createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
  if (file.endsWith('.md') && blobId(bytes)!==blobs.get(file)) bytes=Buffer.from(bytes.toString().replaceAll('\r\n','\n'));
  assert.equal(blobId(bytes), blobs.get(file), file+' differs from pinned Git');
  return bytes;
}
function document(id) {
  const {sourceFile} = records.get(id);
  const input = pinned(sourceFile).toString().replaceAll('\r\n','\n');
  const match = input.match(/^---\n([\s\S]*?)\n---[ \t]*\n/);
  return {front:parse(match[1]), body:input.slice(match[0].length).replace(/^[ \t]+$/gm,'').trim()};
}
function html(id) {
  return readFileSync(join(ref,'dist',records.get(id).path.slice(1)+'.html'),'utf8');
}
function historicalTowns() {
  const $ = load(html('old-world'));
  const paths = $('#old-world-towns').nextUntil('h2').find('a').toArray().map(a=>$(a).attr('href'));
  const ids = new Map(snapshot.articles.map(a=>[a.path,a.id]));
  return paths.map(path => {assert.ok(ids.has(path),path);return ids.get(path);});
}
const historical = new Set([...historicalTowns(),'small-time','the-forgotten-throne']);
const hubs = ['old-world','world-states','interactive-maps'];
function parentId(id) {
  const key=id.split('/')[0];
  if(records.has(key)) return key;
  const alias=snapshot.redirects.find(rule=>rule.from==='/'+key);
  const parent=snapshot.articles.find(article=>article.path===alias?.to);
  assert.ok(parent,'Unknown settlement parent '+id);
  return parent.id;
}
function section(id) {
  const data = records.get(id);
  if (historical.has(id)) return 'historical';
  if (hubs.includes(id)) return 'reference';
  if (data.categories.includes('Zones')) return 'zones';
  if (data.categories.includes('Spawning Locations') || id==='blood-bandit-camp') return 'camps-and-nests';
  return 'settlements-and-sites';
}
function freeze() {
  const ids = new Set(snapshot.articles.filter(a=>a.categories.some(c=>['Locations','Zones','Spawning Locations'].includes(c))).map(a=>a.id));
  assert.equal(ids.size,362);
  for (const id of [...historical,...hubs,'port-south/empire-peasants','blood-bandit-camp']) ids.add(id);
  assert.equal(ids.size,382);
  const rest = new Set([...ids].filter(id=>id!=='catun'));
  const batches = [];
  function take(name, members) {
    for (const id of members) assert.ok(rest.delete(id),'Duplicate or unknown '+id);
    batches.push({name,ids:members});
  }
  const family = parent => [...rest].filter(id=>id===parent || id.startsWith(parent+'/')).sort();
  take('catun-pilot',['catun/fishmen','catun-alpha','bonefields']);
  take('bad-teeth',family('bad-teeth'));
  take('spawns-loot-and-citations',['boneyard-wolf-den','berserker-village','world-states']);
  take('bark-overrides',family('bark'));
  take('geography-indexes',['world-of-kenshi','major-towns','ancient-locations']);
  const groups = new Map();
  for (const id of [...rest].sort()) {
    const parent = parentId(id);
    const kind = section(parent);
    if (!groups.has(kind)) groups.set(kind,new Map());
    const families = groups.get(kind);
    if (!families.has(parent)) families.set(parent,[]);
    families.get(parent).push(id);
  }
  for (const [name,families] of groups) {
    let members=[], part=1;
    for (const group of families.values()) {
      if (members.length && members.length+group.length>28) {take(name+'-'+part++,members);members=[];}
      members.push(...group);
    }
    if (members.length) take(name+'-'+part,members);
  }
  assert.equal(rest.size,0);
  const fixtures={}, assets={};
  for (const id of [...ids].sort()) {
    if(id==='catun') continue; // Its reviewed section and bookmark fixture predates this family.
    const record = records.get(id);
    document(id);
    const page = html(id);
    const $ = load(page);
    assert.equal($('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+record.path);
    const proof = articleEvidence(page,true);
    for (const [url] of proof.images) {
      assert.ok(url.startsWith('/icons/items/'),url);
      assets[url]=hash(pinned('public'+url));
    }
    fixtures[id]=proof;
  }
  assert.equal(Object.keys(assets).length,35);
  const output = (name,content) => {
    const path=join(dir,name);
    if(action==='verify-freeze') assert.equal(readFileSync(path,'utf8').replaceAll('\r\n','\n'),content,name+' reference changed');
    else writeFileSync(path,content);
  };
  const save = (name,value) => output(name,JSON.stringify(value,null,2)+'\n');
  const baseRevision='6ec3f5cd00239fcb14073fe0b2cf148d630482f6';
  const oldFiles=execFileSync('git',['ls-tree','-r','--name-only',baseRevision,'src/content/articles'],{encoding:'utf8'}).trim().split(/\r?\n/);
  const previouslyTransferred=oldFiles.filter(file=>file.endsWith('.md')).map(file=>{
    const original=execFileSync('git',['show',baseRevision+':'+file],{encoding:'utf8'});
    const id=parse(original.split(/\r?\n---\r?\n/)[0].replace(/^---\r?\n/,'')).articleId;
    assert.ok(records.has(id),file);
    return id;
  }).sort();
  save('roster.json',{revision:snapshot.revision,baseRevision,previouslyTransferred,existing:['catun'],batches});
  // One record per line keeps additions and field changes reviewable without repeating Markdown.
  output('reference.json','{\n  "articles": {\n'+Object.entries(fixtures).map(([id,v])=>'    '+JSON.stringify(id)+': '+JSON.stringify(v)).join(',\n')+'\n  },\n  "assets": '+JSON.stringify(assets,null,2)+'\n}\n');
  console.log('Frozen',ids.size,'articles,',batches.length,'batches and',Object.keys(assets).length,'assets');
}
function factParts(value) {
  const $ = load(value,{},false);
  if (!$.root().contents().length) return [''];
  return $.root().contents().toArray().map(node=>{
    if (node.type==='text') return node.data;
    assert.equal(node.name,'a',value);
    return [$(node).text(),$(node).attr('href')];
  });
}
function editorialFile(id) {
  const file = records.get(id).sourceFile.slice('src/content/wiki/'.length);
  if(id==='world-states') return 'gameplay/'+file;
  if(id==='old-world' || id==='interactive-maps') return 'reference/'+file;
  const parent = parentId(id);
  let kind = section(parent);
  if(kind==='settlements-and-sites'){
    const box = document(parent).front.infobox;
    const type = box?.groups.flatMap(g=>g.rows).find(([key])=>key==='Type')?.[1];
    kind = ['Town','Village'].includes(type) || parent==='catun' ? 'towns' : box ? 'sites' : 'indexes';
  }
  return 'locations/'+kind+'/'+file;
}
function transfer() {
  const roster = JSON.parse(readFileSync(join(dir,'roster.json')));
  const checkpoint = JSON.parse(readFileSync(join(dir,'checkpoint.json')));
  const batch = roster.batches[checkpoint.included];
  assert.equal(batch?.name,requested,'Expected next complete batch');
  const fixture = JSON.parse(readFileSync(join(dir,'reference.json')));
  const existing = new Set(articleFiles().map(entry=>entry.data.articleId));
  const writes=new Map();
  for(const id of batch.ids) {
    assert.ok(!existing.has(id),id+' already transferred');
    const {front,body} = document(id);
    const data={articleId:id,title:front.title,description:front.description??'',categories:front.categories??[],layout:'geography'};
    if(front.infobox) {
      data.factTitle=front.infobox.title;
      data.factGroups=front.infobox.groups.map(({heading,rows})=>({heading:heading??null, rows:rows.map(([label,value])=>[label,...factParts(value)])}));
    }
    const file=join('src/content/articles',editorialFile(id));
    assert.ok(!existsSync(file) && !writes.has(file),file);
    writes.set(file,'---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n');
    for(const [url] of fixture.articles[id].images) {
      const bytes=pinned('public'+url);
      assert.equal(hash(bytes),fixture.assets[url]);
      if(existsSync('public'+url)) assert.equal(hash(readFileSync('public'+url)),fixture.assets[url]);
      else writes.set('public'+url,bytes);
    }
  }
  const localIds=new Set([...existing,...batch.ids]);
  const localPaths=new Set([...localIds].map(id=>records.get(id).path));
  const always=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd();
  const previous=new Set(always.split(/\r?\n/).map(line=>line.split(/\s+/)[0]));
  const aliases=snapshot.redirects.filter(r=>localPaths.has(r.to)&&!previous.has(r.from));
  writes.set('public/_redirects',always+'\n\n# Restored redirects from the frozen inventory\n'+aliases.map(r=>[r.from,r.to,r.status].join(' ')).join('\n')+'\n');
  if(checkpoint.included+1===roster.batches.length){
    const file='conversion/category-policy.json',policy=JSON.parse(readFileSync(file));
    policy.reviewedCategories=[...new Set([...policy.reviewedCategories,'Zones','Spawning Locations'])];
    writes.set(file,JSON.stringify(policy,null,2)+'\n');
  }
  writes.set(join(dir,'checkpoint.json'),JSON.stringify({included:checkpoint.included+1})+'\n');
  for(const [file,content] of writes){mkdirSync(dirname(file),{recursive:true});writeFileSync(file,content);}
  console.log('Transferred',batch.name,batch.ids.length);
}
if(action==='freeze' || action==='verify-freeze') freeze();
else if(action==='transfer') transfer();
else throw Error('Unknown geography intake action');
