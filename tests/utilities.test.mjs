import {expectEditable} from './edit-target.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCatalog,snapshot,policy,categoryPath} from '../src/lib/catalog.mjs';
const roster=JSON.parse(fs.readFileSync('conversion/utilities/roster.json'));
test('all restored category indexes preserve frozen memberships and explicit exclusions',()=>{
 const catalog=buildCatalog([],snapshot);assert.equal(catalog.categories.size,198);assert.equal(Object.keys(roster.members).length,198);assert.equal(roster.pendingCategories.length,162);
 for(const [name,ids]of Object.entries(roster.members)){const expected=ids.map(id=>catalog.byId.get(id).path).sort();const group=catalog.categories.get(name);assert.equal(group.path,categoryPath(name));assert.deepEqual(group.members.map(a=>a.path).sort(),expected);assert.equal(new Set(expected).size,expected.length);}
 assert.equal(catalog.categories.get('WIP').members.length,81);assert.equal(catalog.categories.get('Traders Guild').members.length,19);assert.ok(!catalog.categories.has('Pages with non-numeric formatnum arguments'));
});
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {utilityStage,historicalSourceRedirects} from '../src/lib/utility-routes.mjs';
import {originalUtilities,utilitySource} from '../src/lib/utility-routes.mjs';
import {utilityFiles} from '../scripts/utility-files.mjs';
const sources=JSON.parse(fs.readFileSync('conversion/utilities/sources.json'));
test('utility provenance, bookmarks, editable paths and image bytes are independent of the prototype',()=>{
 if(utilityStage<3)return;
 for(const record of sources.pages){const $=load(fs.readFileSync('dist'+record.path+'.html')),entry=utilityFiles().find(e=>e.data.pageId===record.path.slice(1));assert.equal($('[data-utility-id]').attr('data-utility-id'),entry.data.pageId);for(const id of record.bookmarks)assert.equal($('[id]').filter((_,e)=>$(e).attr('id')===id).length,1,id);expectEditable($,entry.filePath);assert.ok($('.source-links a').first().attr('href').endsWith('/'+record.sourceRevision+'/'+record.sourceFile));}
 for(const asset of sources.assets)assert.equal(createHash('sha256').update(fs.readFileSync('public'+asset.path)).digest('hex'),asset.sha256);
 assert.equal(sources.assets.length,7);
});
import {randomPaths,searchCandidates,normalizeTitle,titleSuggestions} from '../src/lib/search-policy.mjs';
import {articleFiles} from '../scripts/article-files.mjs';
test('final local destinations, search scope and random exclusions use registered identities',()=>{
 if(utilityStage<4)return;
 const atlas=buildCatalog(articleFiles()),coverage=JSON.parse(fs.readFileSync('reports/utilities/search-coverage.json'));assert.deepEqual(coverage.records.map(a=>[a.title,a.path]),searchCandidates(atlas));assert.deepEqual(coverage.random.paths,randomPaths(atlas));assert.equal(coverage.indexed,atlas.searchTitles.length);assert.equal(coverage.random.count,atlas.byId.size-71);assert.equal(coverage.version,'1.6.0');
 for(const a of atlas.byId.values())assert.equal(randomPaths(atlas).includes(a.path),!a.categories.some(c=>['Removed Content','Candidates for deletion'].includes(c)));
 assert.equal(atlas.href('/unwritten-book#chapter'),'/unwritten-book#chapter');assert.equal(atlas.href('https://kenshi.wiki/catun?q=1#town-override'),'/catun?q=1#town-override');assert.equal(normalizeTitle(' PACK_BULL '),'pack bull');assert.equal(titleSuggestions(atlas.searchTitles,'samurai').length,8);
 for(const target of ['/pagefind','/pagefind/pagefind.js','/404']){const bad=structuredClone(snapshot);bad.articles[0].path=target;assert.throws(()=>buildCatalog([],bad),/collid|duplicate/)}
 const sitemap=fs.readFileSync('dist/sitemap-0.xml','utf8');for(const path of ['/search','/random','/404'])assert.ok(!sitemap.includes('<loc>https://kenshi.wiki'+path+'</loc>'));for(const p of atlas.local)if(p.startsWith('/category/'))assert.ok(sitemap.includes('<loc>https://kenshi.wiki'+p+'</loc>'));
});

test('original guidance is additive, searchable and excluded from article identities and random navigation',()=>{
 const atlas=buildCatalog(articleFiles()),path='/copyright-and-permissions';
 assert.equal(atlas.byId.size,2185);
 assert.equal(atlas.categories.size,198);
 assert.equal([...atlas.categories.values()].reduce((n,c)=>n+c.members.length,0),4120);
 assert.ok(!snapshot.utilities.includes(path));
 assert.ok(atlas.local.has(path));
 assert.deepEqual(searchCandidates(atlas).filter(([,p])=>p===path),[['Copyright and permissions',path]]);
 assert.ok(!randomPaths(atlas).includes(path));
 assert.equal(atlas.searchTitles.length,2191+originalUtilities.length);
 const collision=structuredClone(snapshot);collision.articles[0].path=path;
 assert.throws(()=>buildCatalog([],collision),/duplicate/i);
 const aliasCollision=structuredClone(snapshot);aliasCollision.redirects.push({from:path,to:'/catun',status:301});
 assert.throws(()=>buildCatalog([],aliasCollision),/duplicate/i);
});

test('original guidance has its own current source history and working contact and license destinations',()=>{
 const definition=originalUtilities.find(p=>p.id==='copyright-and-permissions');
 const entry=utilityFiles().find(e=>e.data.pageId===definition.id),$=load(fs.readFileSync('dist'+definition.path+'.html'));
 const current=utilitySource(definition,entry.filePath);
 assert.ok(current.markdown.endsWith('/main/'+entry.filePath));
 assert.ok(current.history.endsWith('/main/'+entry.filePath));
 assert.deepEqual($('.source-links a').slice(0,2).map((_,a)=>a.attribs.href).get(),[current.markdown,current.history]);
 assert.ok(!$('.import-history').text().includes('adaptation of the prototype'));
 assert.equal($('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+definition.path);
 expectEditable($,entry.filePath);
 assert.equal($('footer a').filter((_,a)=>$(a).text()==='Copyright').attr('href'),definition.path);
 assert.ok($('a[href="mailto:admin@kenshi.wiki"]').length>0);
 for(const file of ['CC-BY-SA-3.0.txt','CC-BY-SA-4.0.txt','FreshWiki-MIT.txt','artwork.txt']) {
  assert.ok($('a[href="/notices/'+file+'"]').length>0);
  assert.ok(fs.existsSync('dist/notices/'+file));
 }
 assert.ok(fs.readFileSync('dist/sitemap-0.xml','utf8').includes('<loc>https://kenshi.wiki'+definition.path+'</loc>'));
 const contributors=load(fs.readFileSync('dist/contributors.html'));
 for(const id of ['licensing','outland','typography','artwork'])assert.equal(contributors('[id="'+id+'"]').length,1);
 assert.ok(contributors('a[href="'+definition.path+'"]').length>0);
});
