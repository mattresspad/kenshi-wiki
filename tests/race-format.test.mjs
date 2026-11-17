import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {normalizeRaceTables} from '../src/lib/race-tables.mjs';
test('race matrix headers preserve spans, values and grouping without adding sort controls',()=>{
 const $=load('<table><tbody><tr><th>Species</th><th colspan="2">Human</th></tr><tr><th></th><th>Green</th><th>Scorch</th></tr><tr><td colspan="3"><b>Blood</b></td></tr><tr><th>Range</th><td>75 - 150</td><td>75 - 150</td></tr><tr><td colspan="3"><b>Movement</b></td></tr><tr><th>Speed</th><td>120</td><td></td></tr></tbody></table>',{},false);
 normalizeRaceTables($);const once=$.html();normalizeRaceTables($);assert.equal($.html(),once);
 assert.equal($('thead tr').length,2);assert.equal($('thead th[scope=colgroup]').attr('colspan'),'2');
 assert.equal($('tbody').length,2);assert.equal($('th[scope=rowgroup]').length,2);
 assert.deepEqual($('td').toArray().map(c=>$(c).text()),['75 - 150','75 - 150','120','']);
 assert.equal($('button,[data-sortable]').length,0);
});
test('race index scaffolding becomes lists while item tables retain captions and units',()=>{
 const $=load('<table><tr><td><ul><li><a href="/human">Human</a></li></ul></td></tr></table><table class="imported-property-table"><caption>Severed arm</caption><tr><td>-Weight</td><td>1kg</td></tr><tr><td colspan="2">Description</td></tr></table>',{},false);
 normalizeRaceTables($);assert.equal($('.race-index a').attr('href'),'/human');assert.equal($('table').length,1);
 assert.equal($('caption').text(),'Severed arm');assert.equal($('th[scope=row]').text(),'-Weight');assert.equal($('td').first().text(),'1kg');
});
