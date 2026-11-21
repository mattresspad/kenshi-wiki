import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import * as pagefind from 'pagefind';
import {buildCatalog} from '../src/lib/catalog.mjs';
import {articleFiles} from './article-files.mjs';
import {utilityStage} from '../src/lib/utility-routes.mjs';
import {searchCandidates,randomPaths} from '../src/lib/search-policy.mjs';
if(utilityStage>=4){
 const atlas=buildCatalog(articleFiles()),candidates=searchCandidates(atlas),records=[];
 const {index,errors}=await pagefind.createIndex({forceLanguage:'en',keepIndexUrl:true});assert.ok(!errors?.length,JSON.stringify(errors));
 try{for(const [title,path]of candidates){
  const $=load(fs.readFileSync('dist'+path+'.html','utf8'));
  let content=$('article').first().clone();
  if(path==='/pages-needing-work')content=$('<section></section>').append($('.work-page>h1').clone(),$('.work-page>p').first().clone());
  assert.equal(content.length,1,path);
  content.find('.import-history,.article-actions,.source-links,.work-note,.end-categories,.portal-indexes,script,nav').remove();
  const sourceHeading=content.find('#source-history');sourceHeading.nextAll().remove();sourceHeading.remove();
  content.attr('data-pagefind-body','');content.find('h1').first().attr('data-pagefind-meta','title');
  const document=load('<!doctype html><html lang="en"><head></head><body></body></html>');document('head').append(document('<title></title>').text(title));document('body').append(content);
  const html=document.html(),result=await index.addHTMLFile({url:path,content:html});assert.ok(!result.errors?.length,JSON.stringify(result.errors));assert.ok(result.file,path);assert.equal(result.file.url,path);assert.equal(result.file.meta.title,title);
  records.push({title,path,sha256:createHash('sha256').update(html).digest('hex'),uniqueWords:result.file.uniqueWords});
 }
 const written=await index.writeFiles({outputPath:'dist/pagefind'});assert.ok(!written.errors?.length,JSON.stringify(written.errors));
 }finally{await pagefind.close();}
 assert.equal(records.length,atlas.searchTitles.length);
 fs.mkdirSync('reports/utilities',{recursive:true});fs.writeFileSync('reports/utilities/search-coverage.json',JSON.stringify({version:'1.6.0',language:'Shared English-controls index includes Turkish text verbatim; Turkish stemming is not claimed.',indexed:records.length,excluded:['navigation','source controls','maintenance entries and history','categories','Home','search','random','404'],records,random:{count:randomPaths(atlas).length,paths:randomPaths(atlas),excludedCategories:['Removed Content','Candidates for deletion']}},null,2)+'\n');
 console.log('Pagefind indexed '+records.length+' canonical pages.');
}
