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
