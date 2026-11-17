import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {prepareArticle} from '../src/lib/article.mjs';
import {normalizeFactionTables} from '../src/lib/faction-tables.mjs';

test('deep outlines keep h5 and h6 bookmarks and normalization is idempotent',()=>{
  const html='<h2 id="characters">Characters</h2><h5 id="entourage">Entourage</h5><h6 id="bodyguards">Bodyguards</h6>';
  const output=prepareArticle(html,{title:'Fixture',layout:'faction',headingIds:{},bookmarks:{}},value=>value);
  assert.equal(output.outline[0].children[0].children[0].id,'bodyguards');
  assert.equal(load(output.body)('h6#bodyguards').attr('tabindex'),'-1');
  const $=load('<details class="collapsible"><summary>Places</summary><table><tr><td><dl><dd><a href="/heft">Heft</a></dd></dl></td><td><dl><dd>Unresolved settlement</dd></dl></td></tr></table></details>',{},false);
  normalizeFactionTables($);const once=$.html();normalizeFactionTables($);
  assert.equal($.html(),once);assert.deepEqual($('li').toArray().map(el=>$(el).text()),['Heft','Unresolved settlement']);
});
