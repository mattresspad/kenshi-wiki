import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {buildCatalog,effectiveSnapshot,origin,categoryPath} from '../../src/lib/catalog.mjs';
import {articleFiles,assetRedirects} from '../article-files.mjs';
import {recordedSource,editableSource} from '../../src/lib/page-source.mjs';
import {isIndexablePath,contactEndpoints} from '../../src/lib/utility-routes.mjs';
import {targetOf,regressions} from '../gaps/core.mjs';
import {changedTargets,checkDuplicateIds} from './current-core.mjs';
import {read,save} from '../release/common.mjs';

const plan=read('reports/ci/plan.json'),atlas=buildCatalog(articleFiles(),effectiveSnapshot,assetRedirects('public/_redirects'));
const redirects=new Map(effectiveSnapshot.redirects.map(r=>[r.from,r.to]));
const source=[...read('conversion/gaps/source.json').pages,...read('conversion/pr-44/gap-source.json').pages];
const sourceById=new Map(source.map(p=>[p.id,p]));
const findings=new Map([...read('conversion/gaps/register.json').findings,...read('conversion/pr-44/gap-findings.json').findings,...read('conversion/utilities/gap-findings.json').findings].map(f=>[f.id,f]));
const local=new Map(),documents=new Map();
const file=path=>'dist/'+(path==='/'?'index':path.slice(1))+'.html';
const exists=path=>fs.existsSync('dist/'+decodeURIComponent(path.slice(1)))||fs.existsSync(file(path));
for(const path of atlas.local){
 const $=load(fs.readFileSync(file(path),'utf8'));documents.set(path,$);
 const links=$('main a[href]').toArray().map(e=>({href:e.attribs.href}));
 const media=$('main img[src],main source[src],main video[poster]').toArray().map(e=>({url:e.attribs.src??e.attribs.poster}));
 const ids=$('[id]').toArray().map(e=>e.attribs.id);
 local.set(path,{id:atlas.articles.get(path)?.id??'route:'+path,path,ids,links,media});
}
const changed=new Set(plan.kind==='broad'?[...atlas.local]:plan.articleIds.map(id=>atlas.byId.get(id).path));
const affected=changedTargets(local,changed,redirects),registered=new Set([...atlas.local,...effectiveSnapshot.endpoints,...contactEndpoints]);
const inherited=[],duplicateIds=[];
for(const path of affected){
 const page=local.get(path),$=documents.get(path),article=atlas.articles.get(path);
 duplicateIds.push(...checkDuplicateIds(path,page.ids));
 assert.equal($('link[rel=canonical]').attr('href'),origin+path,path);
 if(article){
  assert.equal($('article[data-article-id]').attr('data-article-id'),article.id);
  const hrefs=new Set($('a[href]').map((_,a)=>a.attribs.href).get());
  assert.ok(hrefs.has(editableSource(article.filePath,'main').url),'Edit '+path);
  const recorded=recordedSource(article.sourceFile,article.sourceRevision,article.historyRevision??effectiveSnapshot.revision);
  assert.ok(hrefs.has(recorded.markdown),'Recorded source '+path);
  assert.ok(hrefs.has(recorded.history),'History '+path);
 }
 for(const problem of regressions(page,sourceById.get(page.id),source,registered,redirects,local,exists)){
  const f=findings.get(problem.kind+':'+(problem.kind==='destination'?targetOf(problem.href,path,redirects).path:problem.target));
  assert.equal(problem.origin,'inherited','Introduced '+problem.kind+' '+path+' '+problem.href);
  assert.ok(f&&f.status!=='resolved','Unrecorded or falsely resolved '+path+' '+problem.target);
  inherited.push({path,...problem});
 }
 for(const item of page.media){const target=targetOf(item.url,path,redirects);if(target)assert.ok(exists(target.path),'Missing asset '+path+' '+item.url);}
}
const categories=plan.kind==='broad'?[...atlas.categories.values()]:[...atlas.categories.values()].filter(c=>c.members.some(a=>changed.has(a.path)));
for(const category of categories){
 const $=documents.get(category.path);
 assert.deepEqual($('[data-member]').map((_,e)=>e.attribs['data-member']).get().sort(),category.members.map(m=>m.path).sort(),category.path);
 for(const el of $('[data-member]').toArray())assert.equal(el.attribs.href,el.attribs['data-member']);
}
assert.deepEqual(read('dist/search-titles.json'),atlas.searchTitles);
const xml=fs.readFileSync('dist/sitemap-0.xml','utf8');
const sitemap=[...xml.matchAll(/<loc>https:\/\/kenshi\.wiki([^<]*)<\/loc>/g)].map(m=>m[1]||'/').sort();
assert.deepEqual(sitemap,[...atlas.local].filter(isIndexablePath).sort(),'Sitemap/registered path agreement');
save('reports/ci/current.json',{sourceSha:plan.sourceSha,scope:'Current affected routes and inbound links; not a full frozen-source preservation sign-off',changed:[...changed],affected:[...affected],categories:categories.length,articles:atlas.byId.size,search:atlas.searchTitles.length,inherited,duplicateIds,productionTrafficChanged:false});
console.log('Checked '+affected.size+' affected routes, '+categories.length+' category indexes and all registered search/sitemap paths.');
