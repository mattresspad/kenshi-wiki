import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {articleEvidence, hash} from './evidence.mjs';
import {batches, checkpoint, expectedRoutes, frozenEvidence, includedIds, roster} from './batches.mjs';
import {snapshot} from '../../src/lib/catalog.mjs';
import {load} from 'cheerio';

export function verifyGeography(atlas, assetRedirects) {
  const fixture = frozenEvidence();
  const actual = new Set([...atlas.byId.values()].filter(a=>a.filePath?.endsWith('.md') && fixture.articles[a.id]).map(a=>a.id));
  assert.deepEqual(actual,includedIds,'Incomplete geography batch');
  assert.equal(roster.revision,snapshot.revision);
  const original = new Map(snapshot.articles.map(a=>[a.id,a]));
  const issues = [], unknown=[], emptyGalleries=[], assets=new Set();
  const registered=new Set([...original.values()].map(record=>record.path));
  for(const path of [...snapshot.portals,...snapshot.utilities,...snapshot.endpoints,...snapshot.redirects.map(rule=>rule.from),...[...atlas.categories.values()].map(category=>category.path)]) registered.add(path);
  const otherLocalIds = new Map();
  for (const route of atlas.local) {
    const file='dist/'+(route==='/'?'index':route.slice(1))+'.html';
    const $=load(readFileSync(file));
    otherLocalIds.set(route,new Set($('[id]').toArray().map(e=>e.attribs.id)));
  }
  for(const id of actual) {
    const record=atlas.byId.get(id),file='dist'+record.path+'.html';
    const html=readFileSync(file,'utf8'), $=load(html);
    const expected=fixture.articles[id],actualEvidence=articleEvidence(html,false);
    for(const key of Object.keys(expected)) assert.deepEqual(actualEvidence[key],expected[key],id+' — '+key);
    assert.deepEqual(record.categories,original.get(id).categories,id+' categories');
    assert.equal($('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+record.path);
    const fandom='https://kenshi.fandom.com/wiki/'+encodeURIComponent(record.source.title.replaceAll(' ','_'));
    assert.deepEqual($('.import-history a').toArray().map(a=>a.attribs.href),[
      fandom+'?oldid='+record.source.revision,fandom+'?action=history','https://creativecommons.org/licenses/by-sa/'+record.license+'/'],id+' attribution links');
    assert.ok($('.import-history p').text().includes(record.credit+', under CC BY-SA '+record.license),id+' attribution wording');
    for(const [url] of expected.images) assets.add(url);
    if(expected.emptyGallery) emptyGalleries.push(id);
    for(const a of $('.lead-text a,.article-body a,.factbox a').toArray()){
      const link=a.attribs.href;
      if(!link || !(link.startsWith('/') || link.startsWith('#') || link.startsWith('https://kenshi.wiki/'))) continue;
      const target=new URL(link,'https://kenshi.wiki'+record.path);
      if(!registered.has(target.pathname) && !/^\/(images|icons|notices)\//.test(target.pathname)) unknown.push({from:record.path,to:target.pathname+target.hash});
      if(!target.hash || !atlas.local.has(target.pathname)) continue;
      let fragment;try{fragment=decodeURIComponent(target.hash.slice(1))}catch{fragment=target.hash.slice(1)}
      if(!otherLocalIds.get(target.pathname).has(fragment)) issues.push({from:record.path,to:target.pathname+target.hash});
    }
  }
  for(const url of assets) assert.equal(hash(readFileSync('dist'+url)),fixture.assets[url],url);
  const expectedPages=expectedRoutes();
  // The warm-build fixture may intentionally move a registered URL.
  const originals=new Map(snapshot.articles.map(a=>[a.id,a.path]));
  assert.equal(atlas.local.size,expectedPages.size,'Unexpected local route count');
  for(const id of includedIds) assert.ok(atlas.local.has(originals.get(id)),id);
  const familyPaths=new Set(['catun',...actual].map(id=>atlas.byId.get(id).path));
  const redirects=snapshot.redirects.filter(rule=>familyPaths.has(rule.to));
  for(const rule of redirects) assert.ok(assetRedirects.some(live=>live.from===rule.from && live.to===rule.to && live.status===rule.status),rule.from);
  const proofs=[...actual].map(id=>fixture.articles[id]);
  if(checkpoint.included===roster.batches.length) {
    assert.equal(atlas.local.size,394); assert.equal(assets.size,35); assert.equal(redirects.length,42);
  }
  return {through:batches.at(-1)?.name ?? null, verified:actual.size, familyPages:familyPaths.size, redirects,
    headings:proofs.reduce((n,p)=>n+p.headings.length,0), citationTargets:proofs.reduce((n,p)=>n+p.ids.filter(id=>/^cite_(?:ref|note)/.test(id)).length,0), assets:assets.size,
    emptyGalleries, unregisteredDestinations:[...new Map(unknown.map(e=>[e.from+' '+e.to,e])).values()], fragmentExceptions:[...new Map(issues.map(e=>[e.from+' '+e.to,e])).values()]};
}
