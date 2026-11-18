import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {normalizeAnimalTables} from '../src/lib/animal-tables.mjs';
import {prepareArticle} from '../src/lib/article.mjs';
test('animal tables retain existing headers, values, spans and captions across normalization',()=>{
 const $=load('<table class="creature-table"><caption>Growth stages</caption><thead><tr><th scope="col">Stage</th><th>Age</th></tr></thead><tbody><tr><td>Elder (1.10x)</td><td>1100 days</td></tr></tbody></table><table><tr><th>Body Part</th><th>Total Health</th><th>Chance of Hitting</th></tr><tr><td>Head</td><td>372-442</td><td>50</td></tr></table>',{},false);
 normalizeAnimalTables($);const once=$.html();normalizeAnimalTables($);assert.equal($.html(),once);
 assert.equal($('thead').length,2);assert.equal($('table').first().find('thead tr').length,1);
 assert.deepEqual($('th[scope=row]').toArray().map(c=>$(c).text()),['Elder (1.10x)','Head']);
 assert.deepEqual($('td').toArray().map(c=>$(c).text()),['1100 days','372-442','50']);
 assert.equal($('caption').text(),'Growth stages');
});
test('animal captions label scroll regions while notices and age qualifications retain their words',()=>{
 const result=prepareArticle('<table><tr><td>This article has been updated for Kenshi version 1.0.68.</td></tr></table><p>Current age changes strength.</p><table class="creature-table"><caption>Attributes</caption><thead><tr><th>Attribute</th><th>Level</th></tr></thead><tbody><tr><td>Strength</td><td>35</td></tr></tbody></table>',{title:'Fauna',layout:'animal',headingIds:{},bookmarks:{}},x=>x);
 const $=load(result.intro+result.body);assert.equal($('aside[role=note]').length,1);assert.equal($('table').length,2);
 assert.equal($('.table-scroll').attr('aria-label'),'Attributes table');assert.match($.text(),/Current age changes strength/);
});

test('single-cell care warnings wrap as notes while retaining their text and source cell',()=>{
 const result=prepareArticle('<p>Care.</p><table><tr><td><b>Bandits May Butcher Animals</b><p>Keep this qualification.</p></td></tr></table>',{title:'Care',layout:'animal',headingIds:{},bookmarks:{}},x=>x),$=load(result.body);
 assert.equal($('aside[role=note]').length,1);assert.equal($('table[role=presentation] td').length,1);assert.equal($('.table-scroll').length,0);assert.match($.text(),/Keep this qualification/);
});
