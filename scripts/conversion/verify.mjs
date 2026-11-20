import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {load} from 'cheerio';
import {articleEvidence, hash} from '../geography/evidence.mjs';
import {families, selectedIds, expectedIds, expectedRoutes} from './batches.mjs';
import {snapshot,effectiveSnapshot} from '../../src/lib/catalog.mjs';

const fragmentIndexes=new WeakMap();
export function verifyFamily(name, atlas, assetRedirects) {
  const {roster,checkpoint}=families[name];
  const included=selectedIds(name);
  const fixture=JSON.parse(readFileSync('conversion/'+name+'/reference.json'));
  const actual=new Set([...atlas.byId.values()].filter(a=>a.filePath?.endsWith('.md') && fixture.articles[a.id]).map(a=>a.id));
  assert.deepEqual(actual,included,'Incomplete '+name+' batch');
  assert.equal(roster.revision,snapshot.revision);
  assert.deepEqual(new Set([...atlas.byId.values()].filter(a=>a.filePath).map(a=>a.id)),expectedIds,'Unexpected transferred IDs');
  assert.deepEqual(atlas.local,expectedRoutes(),'Unexpected local routes');
  const original=new Map(effectiveSnapshot.articles.map(a=>[a.id,a]));
  const issues=[],unknown=[],emptyGalleries=[],assets=new Set();
  const registered=new Set([...original.values()].map(record=>record.path));
  for(const path of [...snapshot.portals,...snapshot.utilities,...snapshot.endpoints,...snapshot.redirects.map(rule=>rule.from),...[...atlas.categories.values()].map(category=>category.path)]) registered.add(path);
  let otherLocalIds=fragmentIndexes.get(atlas);
  if(!otherLocalIds){otherLocalIds=new Map();
  for(const route of atlas.local) {
    const file='dist/'+(route==='/'?'index':route.slice(1))+'.html';
    const $=load(readFileSync(file));
    otherLocalIds.set(route,new Set($('[id]').toArray().map(e=>e.attribs.id)));
  }
  fragmentIndexes.set(atlas,otherLocalIds);}
  for(const id of actual) {
    const record=atlas.byId.get(id),html=readFileSync('dist'+record.path+'.html','utf8'),$=load(html);
    let comparableHtml=html;
    if(name==='modding' && id==='modding/meitou' && record.filePath && atlas.byId.get('modding/meitou/code-mod-hooks')?.filePath){
      const incoming=$('[data-contribution="pr-44"]');assert.equal(incoming.length,1);assert.equal(incoming.find('a').attr('href'),'/modding/meitou/code-mod-hooks');
      const copy=load(html);copy('[data-contribution="pr-44"]').remove();comparableHtml=copy.html();
    }
    const expected=fixture.articles[id],proof=articleEvidence(comparableHtml,false,roster.layouts?.[id]??(name==='items'?'item':name==='buildings'?'building':name==='shops'?'shop':name==='gameplay'?'gameplay':name==='events'?'event':name==='lore'?'lore':['modding','pr44'].includes(name)?'modding':false));
    for(const key of Object.keys(expected)) assert.deepEqual(proof[key],expected[key],id+' — '+key);
    assert.deepEqual(record.categories,original.get(id).categories,id+' categories');
    assert.equal($('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+record.path);
    if(record.source==='original'){assert.ok($('.import-history').text().includes(record.credit));assert.ok($('.import-history a').toArray().some(a=>a.attribs.href==='https://github.com/mattresspad/kenshi-wiki/blob/'+record.originalCommit+'/'+record.sourceFile));assert.ok($('.import-history a').toArray().some(a=>a.attribs.href==='https://creativecommons.org/licenses/by-sa/'+record.license+'/'));}else{
    const fandom='https://kenshi.fandom.com/wiki/'+encodeURIComponent(record.source.title.replaceAll(' ','_'));
    assert.deepEqual($('.import-history a').toArray().map(a=>a.attribs.href),[
      fandom+'?oldid='+record.source.revision,fandom+'?action=history','https://creativecommons.org/licenses/by-sa/'+record.license+'/'],id+' attribution links');
    assert.ok($('.import-history p').text().includes(record.credit+', under CC BY-SA '+record.license),id+' attribution wording');}
    for(const [url] of [...expected.images,...(expected.factMedia?.images??[])])assets.add(url);
    if(expected.emptyGallery)emptyGalleries.push(id);
    for(const a of $('.lead-text a,.article-body a,.factbox a,.building-facts a').toArray()) {
      const link=a.attribs.href;
      if(!link || !(link.startsWith('/') || link.startsWith('#') || link.startsWith('https://kenshi.wiki/')))continue;
      const target=new URL(link,'https://kenshi.wiki'+record.path);
      if(!registered.has(target.pathname) && !/^\/(images|icons|notices)\//.test(target.pathname))unknown.push({from:record.path,to:target.pathname+target.hash});
      if(!target.hash || !atlas.local.has(target.pathname))continue;
      let fragment;try{fragment=decodeURIComponent(target.hash.slice(1))}catch{fragment=target.hash.slice(1)}
      if(!otherLocalIds.get(target.pathname).has(fragment))issues.push({from:record.path,to:target.pathname+target.hash});
    }
  }
  for(const url of assets)assert.equal(hash(readFileSync('dist'+url)),fixture.assets[url],url);
  const existing=name==='geography'?['catun']:roster.existing;
  const familyPaths=new Set([...existing,...actual].map(id=>atlas.byId.get(id).path));
  const redirects=snapshot.redirects.filter(rule=>(['lore','modding','manufacturers'].includes(name)?new Set([...actual].map(id=>atlas.byId.get(id).path)):familyPaths).has(rule.to));
  for(const rule of redirects)assert.ok(assetRedirects.some(live=>live.from===rule.from && live.to===rule.to && live.status===rule.status),rule.from);
  const proofs=[...actual].map(id=>fixture.articles[id]);
  const headings=proofs.reduce((n,p)=>n+p.headings.length,0);
  const citationTargets=proofs.reduce((n,p)=>n+p.ids.filter(id=>/^cite_(?:ref|note)/.test(id)).length,0);
  if(checkpoint.included===roster.batches.length) {
    assert.equal(assets.size,roster.expected?.assets ?? (name==='geography'?35:0));
    assert.equal(redirects.length,roster.expected?.redirects ?? (name==='geography'?42:5));
    assert.equal(headings,roster.expected?.headings ?? (name==='geography'?1421:639));
    assert.equal(citationTargets,roster.expected?.citationTargets ?? (name==='geography'?307:453));
  }
  const unique=rows=>[...new Map(rows.map(row=>[row.from+' '+row.to,row])).values()];
  return {through:roster.batches[checkpoint.included-1]?.name??null,verified:actual.size,familyPages:familyPaths.size,redirects,headings,citationTargets,assets:assets.size,
    emptyGalleries,unregisteredDestinations:unique(unknown),fragmentExceptions:unique(issues)};
}
