import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {normalizeCharacterTables} from '../src/lib/character-tables.mjs';
const stats='<table><tr><th>Attributes</th><th>Level</th></tr><tr><td>Strength</td><td>-9 – 11</td></tr></table>';
test('unlabeled character groups retain values and order without invented race associations',()=>{
 const $=load('<h2 id="statistics">Statistics</h2>'+stats+'<p>Stats randomize by 10</p>'+stats,{},false);
 normalizeCharacterTables($);const once=$.html();normalizeCharacterTables($);assert.equal($.html(),once);
 assert.equal($('.character-stat-group').length,2);assert.equal($('.character-statistics-warning').length,1);
 assert.deepEqual($('td').toArray().map(e=>$(e).text()),['-9 – 11','-9 – 11']);assert.match($.text(),/randomize by 10/);assert.equal($('h2').attr('id'),'statistics');
 assert.equal($('th[scope=row]').length,2);assert.equal($('thead').length,2);assert.doesNotMatch($('.character-stat-label').text(),/Greenlander|Shek/);
});
test('inert recruit checklist is removed without changing information cells or bookmark targets',()=>{
 const $=load('<table class="sortable"><tr><th class="table-progress-tracking-header"></th><th>Name</th><th>Cost</th><th>Noteworthy Because</th></tr><tr><td class="table-progress-checkbox-cell"><input id="checkbox-0-1" disabled type="checkbox"></td><td><a href="/beep">Beep</a></td><td>Free</td><td>Qualification.</td></tr></table>',{},false);
 normalizeCharacterTables($);assert.equal($('input').length,0);assert.equal($('thead th').length,3);assert.equal($('#checkbox-0-1').length,1);assert.equal($('a').attr('href'),'/beep');assert.equal($('tbody tr').children().length,3);assert.equal($('table[data-sortable]').length,1);
 const once=$.html();normalizeCharacterTables($);assert.equal($.html(),once);
});

import {factParts} from '../scripts/conversion/source.mjs';
test('struck infobox labels preserve source meaning and their links',()=>{
 assert.deepEqual(factParts('<s><a href="/skeleton">Skeleton</a></s> <a href="/human">Human</a>'),[{strike:true,text:'Skeleton',href:'/skeleton'},' ',['Human','/human']]);
 assert.deepEqual(factParts('<s>Removed</s><br>Present'),[{strike:true,text:'Removed'},{break:true},'Present']);
 assert.throws(()=>factParts('<script>unsafe()</script>'),/Unexpected fact markup/);
});
