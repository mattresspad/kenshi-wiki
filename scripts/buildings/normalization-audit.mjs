import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {load} from 'cheerio';
import {snapshot} from '../../src/lib/catalog.mjs';
import {normalizeBuildingTables,takeLeadingBuildingPanel} from '../../src/lib/building-tables.mjs';
import {hash} from '../geography/evidence.mjs';
const roster=JSON.parse(readFileSync('conversion/buildings/roster.json')),reference=new Map(snapshot.articles.map(a=>[a.id,a]));
const rows=[];
for(const id of roster.batches.flatMap(b=>b.ids)){
 const a=reference.get(id),html=readFileSync('reports/geography-work/reference-83abc179/dist'+a.path+'.html','utf8'),doc=load(html),area=doc('.mw-parser-output').clone();area.children('.infobox,.fandom-notice').remove();const $=load(area.html(),{},false);
 const before={tables:$('table').length,lineBreaks:$('br').length},changes=normalizeBuildingTables($),panel=takeLeadingBuildingPanel($),normalized=load(panel+$.root().html(),{},false);
 assert.equal(normalized('br').length,before.lineBreaks,id+' normalization line breaks');
 const once=$.root().html();normalizeBuildingTables($);assert.equal($.root().html(),once,id+' repeat normalization');
 const rendered=load(readFileSync('dist'+a.path+'.html','utf8')),fresh=load((rendered('.building-facts').html()??'')+(rendered('.lead-text').html()??'')+(rendered('.article-body').html()??''),{},false);
 assert.equal(fresh('br').length,before.lineBreaks,id+' rendered line breaks');
 const captions=q=>q('caption').toArray().map(e=>q(e).text().replace(/\s+/gu,' ').trim());assert.deepEqual(captions(fresh),captions(normalized),id+' captions');
 rows.push({id,sourceFile:a.sourceFile,revision:snapshot.revision,sourceSha256:hash(readFileSync('reports/geography-work/reference-83abc179/'+a.sourceFile,'utf8').replaceAll('\r\n','\n')),renderedSourceSha256:hash(html),transformations:changes,leadingPanelMoved:!!panel,sourceTableCount:before.tables,normalizedTableCount:normalized('table').length,lineBreaksPreserved:before.lineBreaks,captions:captions(normalized),repeatedNormalization:'unchanged'});
}
const output=JSON.stringify({revision:snapshot.revision,articles:rows},null,2)+'\n';writeFileSync('conversion/buildings/normalization.json',output);writeFileSync('reports/buildings/normalization.json',output);console.log(rows.length+' building structures, captions and line breaks checked; normalization is repeatable.');
