import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {load} from 'cheerio';
import {snapshot} from '../../src/lib/catalog.mjs';
const family=process.argv[2];assert.ok(['crafting','technology','shops','gameplay','events','lore','modding','manufacturers','remainder'].includes(family));
const roster=JSON.parse(readFileSync('conversion/'+family+'/roster.json')),baseline=JSON.parse(readFileSync('conversion/gaps/source.json'));
const sources=new Map(baseline.pages.map(p=>[p.id,p])),records=new Map(snapshot.articles.map(a=>[a.id,a]));
const batch=process.argv[3]==='reused-reviews'?{name:'reused-reviews',ids:roster.reviewExisting??[]}:roster.batches.find(b=>b.name===process.argv[3]);assert.ok(batch,'Specify a frozen batch');
const rows=[];for(const id of batch.ids){
 const a=records.get(id),s=sources.get(id),raw=readFileSync('reports/geography-work/reference-83abc179/'+a.sourceFile,'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(raw).digest('hex'),s.sourceSha256,id);
 const $=load(readFileSync('reports/geography-work/reference-83abc179/dist'+a.path+'.html','utf8')),area=$('.mw-parser-output').clone();area.children('.infobox,.fandom-notice').remove();
 const headings=area.find('h2,h3,h4,h5,h6').toArray().map(e=>({id:e.attribs.id,title:$(e).text()}));
 const tables=area.find('table').toArray().map(e=>({headers:$(e).find('tr').first().text(),rows:$(e).find('tr').length}));
 const stats=area.children('p').filter((i,e)=>$(e).text().trim()==='Statistics').length;
 area.find('table,.references').remove();area.find('p').filter((i,e)=>/^Statistics$|^Stats randomize|^The Statistics here are taken/.test($(e).text().trim())).remove();
 const caption=$('.infobox-caption').text();
 const prose=area.text().replace(/\s+/gu,' ').trim();
 rows.push({id,sourceFile:a.sourceFile,revision:a.sourceRevision,sha256:s.sourceSha256,headings,tables,stats,caption,prose});
 console.log(id+' | '+headings.length+' headings; '+tables.length+' tables; '+stats+' stats groups\n'+prose+'\nCaption: '+caption+'\n');
 }
mkdirSync('reports/'+family+'/reviews',{recursive:true});writeFileSync('reports/'+family+'/reviews/'+batch.name+'.json',JSON.stringify(rows,null,2)+'\n');
