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
 for(const record of sources.pages){const $=load(fs.readFileSync('dist'+record.path+'.html')),entry=utilityFiles().find(e=>e.data.pageId===record.path.slice(1));assert.equal($('[data-utility-id]').attr('data-utility-id'),entry.data.pageId);for(const id of record.bookmarks)assert.equal($('[id]').filter((_,e)=>$(e).attr('id')===id).length,1,id);assert.equal($('.wide-tools .edit-file code').text(),entry.filePath);assert.ok($('.source-links a').first().attr('href').endsWith('/'+record.sourceRevision+'/'+record.sourceFile));}
 for(const asset of sources.assets)assert.equal(createHash('sha256').update(fs.readFileSync('public'+asset.path)).digest('hex'),asset.sha256);
 assert.equal(sources.assets.length,7);
});
