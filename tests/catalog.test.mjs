import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempDisposableSync,mkdirSync,renameSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {articleFiles} from '../scripts/article-files.mjs';
import {recordedSource,editableSource} from '../src/lib/page-source.mjs';
import {snapshot,buildCatalog,displayCategories,letterGroups,categoryPath} from '../src/lib/catalog.mjs';

test('reconcile original raw membership sets independently of the URL generator',()=>{
  const expected=new Map(), rawNames=new Set();
  for (const article of snapshot.articles) for (const tag of article.categories) {
    rawNames.add(tag);
    if(tag==='Pages with non-numeric formatnum arguments') continue;
    let name=tag;
    if(tag.toLowerCase()==='wip') name='WIP';
    if(["Trader's Guild","Traders guild"].includes(tag)) name='Traders Guild';
    if(!expected.has(name)) expected.set(name,new Set());
    expected.get(name).add(article.path);
  }
  const {categories}=buildCatalog();
  assert.equal(snapshot.articles.length,2184);assert.equal(snapshot.redirects.length,263);
  assert.equal(rawNames.size,202);assert.equal(categories.size,198);
  let pairs=0;
  for (const [name,paths] of expected) {
    assert.deepEqual(categories.get(name).members.map(m=>m.path).sort(),[...paths].sort());
    pairs+=paths.size;
  }
  assert.equal(pairs,4119);
  assert.equal(snapshot.articles.filter(a=>a.categories.includes('Pages with non-numeric formatnum arguments')).length,51);
  for (const [name,n] of Object.entries({WIP:81,'Traders Guild':19,Locations:273,Modding:96})) assert.equal(categories.get(name).members.length,n);
  assert.equal(categories.get('Traders Guild').members.filter(m=>m.path==='/samurai-rogue').length,1);
});
test('reviewed destinations, aliases and fragments work as the batch grows',()=>{
  const cat=snapshot.articles.find(a=>a.path==='/catun');
  const atlas=buildCatalog([{id:cat.id,filePath:'src/content/articles/locations/towns/catun.md',data:{articleId:cat.id,title:cat.title,categories:cat.categories}}]);
  assert.equal(atlas.href('/catun#town-override'),'/catun#town-override');
  assert.equal(atlas.href('/admag#history'),'https://kenshi.wiki/admag#history');
  assert.deepEqual(displayCategories(['WIP','Wip',"Trader's Guild",'Traders guild','Traders Guild']),['WIP','Traders Guild']);
  assert.equal(categoryPath('Traders Guild'),'/category/traders-guild');
  assert.deepEqual(letterGroups([{title:'7 towns',path:'/7'}])[0].entries,[{title:'7 towns',path:'/7'}]);
});

test('an editable file can move and its public address can change independently', t => {
  const fixture = mkdtempDisposableSync(join(tmpdir(), 'freshwiki-article-'));
  t.after(() => fixture.remove());
  const root = fixture.path;
  const content = join(root,'src/content/articles');
  mkdirSync(content,{recursive:true});
  const original = join(content,'field-notes.md');
  writeFileSync(original,'---\narticleId: catun\ntitle: Catun\ncategories: [Locations]\n---\nTown.\n');
  const resolve = registry => buildCatalog(articleFiles(root),registry).byId.get('catun');
  const article = resolve(snapshot);
  const frozen = recordedSource(article.sourceFile,article.sourceRevision,snapshot.revision);
  mkdirSync(join(content,'locations/towns'),{recursive:true});
  renameSync(original,join(content,'locations/towns/player-notes.md'));
  const moved = resolve(snapshot);
  assert.equal(moved.path,article.path);
  assert.equal(moved.filePath,'src/content/articles/locations/towns/player-notes.md');
  const changed = structuredClone(snapshot);
  changed.articles.find(a=>a.id===article.id).path='/places/catun';
  changed.redirects.push({from:article.path,to:'/places/catun',status:301});
  const catalog = buildCatalog(articleFiles(root),changed);
  const renamed = catalog.byId.get(article.id);
  assert.equal(renamed.filePath,moved.filePath);
  assert.deepEqual(recordedSource(renamed.sourceFile,renamed.sourceRevision,changed.revision),frozen);
  assert.equal(renamed.path,'/places/catun');
  assert.equal(catalog.href('/catun#history'),'/places/catun#history');
  assert.ok(catalog.categories.get('Locations').members.some(a=>a.path===renamed.path));
  assert.ok(catalog.searchTitles.some(([title,path])=>title==='Catun' && path===renamed.path));
  assert.equal(editableSource(renamed.filePath).url,null);
  assert.equal(editableSource(renamed.filePath,'rebuild/restoration').url,
    'https://github.com/mattresspad/kenshi-wiki/edit/rebuild/restoration/'+moved.filePath);
});

test('unregistered files, duplicate identities and route collisions fail the catalog',()=>{
  const a = snapshot.articles.find(a=>a.id==='catun');
  const entry = {id:a.id,filePath:'src/content/articles/town.md',data:{articleId:a.id,title:a.title,categories:a.categories}};
  assert.throws(()=>buildCatalog([entry,{...entry,filePath:'src/content/articles/copy.md'}]),/Duplicate editable article ID/);
  assert.throws(()=>buildCatalog([{...entry,id:'missing'}]),/Unregistered article ID/);
  for (const path of ['/backpacks','/category/locations','/modding','/random','/search-titles.json','/holy-nation']) {
    const bad = {...snapshot,articles:snapshot.articles.map(record=>record.id===a.id?{...record,path}:record)};
    assert.throws(()=>buildCatalog([],bad),/duplicate/i,path);
  }
  for (const changes of [{id:'backpacks'},{sourceFile:undefined},{path:undefined}]) {
    const bad = {...snapshot,articles:snapshot.articles.map(record=>record.id===a.id?{...record,...changes}:record)};
    assert.throws(()=>buildCatalog([],bad));
  }
});
