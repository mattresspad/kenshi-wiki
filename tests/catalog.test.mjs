import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(snapshot.articles.length,2183);assert.equal(snapshot.redirects.length,263);
  assert.equal(rawNames.size,202);assert.equal(categories.size,198);
  let pairs=0;
  for (const [name,paths] of expected) {
    assert.deepEqual(categories.get(name).members.map(m=>m.path).sort(),[...paths].sort());
    pairs+=paths.size;
  }
  assert.equal(pairs,4118);
  assert.equal(snapshot.articles.filter(a=>a.categories.includes('Pages with non-numeric formatnum arguments')).length,51);
  for (const [name,n] of Object.entries({WIP:81,'Traders Guild':19,Locations:273})) assert.equal(categories.get(name).members.length,n);
  assert.equal(categories.get('Traders Guild').members.filter(m=>m.path==='/samurai-rogue').length,1);
});
test('reviewed destinations, aliases and fragments work as the batch grows',()=>{
  const cat=snapshot.articles.find(a=>a.path==='/catun');
  const atlas=buildCatalog([cat]);
  assert.equal(atlas.href('/catun#town-override'),'/catun#town-override');
  assert.equal(atlas.href('/admag#history'),'https://kenshi.wiki/admag#history');
  assert.deepEqual(displayCategories(['WIP','Wip',"Trader's Guild",'Traders guild','Traders Guild']),['WIP','Traders Guild']);
  assert.equal(categoryPath('Traders Guild'),'/category/traders-guild');
  assert.deepEqual(letterGroups([{title:'7 towns',path:'/7'}])[0].entries,[{title:'7 towns',path:'/7'}]);
});
