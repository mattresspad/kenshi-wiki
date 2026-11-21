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
