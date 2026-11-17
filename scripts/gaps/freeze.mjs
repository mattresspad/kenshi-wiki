import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {snapshot,buildCatalog} from '../../src/lib/catalog.mjs';
import {openSource} from '../conversion/source.mjs';
import {digest,extractPage,targetOf} from './core.mjs';
const [action,repository,directory]=process.argv.slice(2);
assert.ok(['freeze','verify'].includes(action)&&repository&&directory,'Expected freeze|verify comparison-checkout pinned-build');
const source=openSource(repository,directory),atlas=buildCatalog(),pages=[],assets={};
const redirects=new Map(snapshot.redirects.map(r=>[r.from,r.to]));
const registered=new Set([...atlas.articles.keys(),...[...atlas.categories.values()].map(c=>c.path),...snapshot.portals,...snapshot.utilities,...snapshot.endpoints]);
for(const record of snapshot.articles){
  const bytes=source.pinned(record.sourceFile),html=source.html(record.id);
  pages.push({id:record.id,path:record.path,sourceFile:record.sourceFile,sourceRevision:record.sourceRevision,
    sourceSha256:digest(bytes),renderedSha256:digest(html),...extractPage(html,{path:record.path,markdown:bytes.toString()})});
}
const extra=[...atlas.categories.values()].map(c=>c.path).concat(snapshot.portals,snapshot.utilities);
for(const path of extra){
  const file=join(directory,'dist',path==='/'?'index.html':path.slice(1)+'.html');
  if(!existsSync(file))continue;
  const html=readFileSync(file,'utf8');
  pages.push({id:'route:'+path,path,sourceFile:null,sourceRevision:snapshot.revision,renderedSha256:digest(html),...extractPage(html,{path})});
}
for(const page of pages){
  for(const item of [...page.media.map(m=>m.url),...page.links.map(l=>l.href)]){
    const t=targetOf(item,page.path,redirects);if(!t||registered.has(t.path)||Object.hasOwn(assets,t.path))continue;
    if(!page.media.some(m=>m.url===item)&&!/^\/(?:images|icons|notices|downloads|sources)\//.test(t.path)&&!/\.(?:png|webp|jpg|jpeg|gif|svg|zip|pdf|mp4|webm|json|txt)$/i.test(t.path))continue;
    const file=join(directory,'public',t.path.slice(1));const exists=existsSync(file);
    assets[t.path]={exists,sourceFile:'public'+t.path,sha256:exists?digest(readFileSync(file)):null};
  }
}
const result={version:1,revision:snapshot.revision,articleCount:snapshot.articles.length,registeredRoutes:[...registered].sort(),redirects:snapshot.redirects,pages,assets};
assert.equal(result.articleCount,2184);
const output='conversion/gaps/source.json';
const {pages:sourcePages,...header}=result;
const body=JSON.stringify(header,null,2).slice(0,-2)+',\n  "pages": [\n'+sourcePages.map(page=>'    '+JSON.stringify(page)).join(',\n')+'\n  ]\n}\n';
if(action==='verify')assert.equal(readFileSync(output,'utf8'),body,'Frozen gap evidence changed');
else{mkdirSync('conversion/gaps',{recursive:true});writeFileSync(output,body);}
console.log('Verified '+result.articleCount+' source articles, '+pages.length+' rendered pages, '+Object.keys(assets).length+' local media/resource targets.');
