import {contactSettings} from '../../src/contact/config.mjs';
import fs from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {read,save} from './common.mjs';
import {isIndexablePath} from '../../src/lib/utility-routes.mjs';
import {editableSource,recordedSource} from '../../src/lib/page-source.mjs';
import {buildCatalog,effectiveSnapshot} from '../../src/lib/catalog.mjs';
import {articleFiles} from '../article-files.mjs';
export async function auditPackage(manifest){
 const {workers}=await readBuildOutput(process.cwd()),{config,assetsDir:root}=workers.default;
 const contact=contactSettings({...process.env,WIKI_RELEASE_TARGET:manifest.target});
 assert.equal(config.env.CONTACT_ENABLED.value,String(contact.enabled));
 assert.equal(config.env.CONTACT_MAIL.destinationAddress,'admin@kenshi.wiki');
 assert.equal(config.env.CONTACT_ORIGIN.value,contact.origin);
 if(contact.enabled)assert.equal(config.env.TURNSTILE_SECRET_KEY.type,'secret');
 assert.equal(config.name,manifest.worker);assert.equal(config.assets.notFoundHandling,'404-page');
 const headers=fs.existsSync(join(root,'_headers'))?fs.readFileSync(join(root,'_headers'),'utf8'):'';
 const globalNoindex=/^\/\*\s*\r?\n\s*X-Robots-Tag:\s*noindex/im.test(headers);
 assert.equal(globalNoindex,manifest.target==='staging','Global indexing policy does not match target');
 const articles=buildCatalog(articleFiles()).articles;
 let html=0,indexable=0,edits=0,sourcePairs=0;
 for(const file of fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'))){
  const path=file==='index.html'?'/':'/'+file.replaceAll('\\','/').slice(0,-5),$=load(fs.readFileSync(join(root,file),'utf8'));html++;
  if(path==='/404'){assert.equal($('link[rel=canonical]').length,0);assert.match($('meta[name=robots]').attr('content')??'',/noindex/);continue;}
  assert.equal($('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+path,path);
  if(['/contact','/contact/copyright'].includes(path)){assert.equal($('#contact-form').attr('data-sitekey'),contact.sitekey);assert.equal($('#contact-form').attr('data-origin'),contact.origin);}
  const robots=$('meta[name=robots]').attr('content')??'';if(isIndexablePath(path)){assert.ok(!robots.includes('noindex'),path);indexable++;}else assert.ok(robots.includes('noindex'),path);
  const edit=$('.wide-tools a').last().attr('href');assert.ok(edit?.startsWith('https://github.com/mattresspad/kenshi-wiki/edit/main/'),path);
  const actual=decodeURIComponent(new URL(edit).pathname.split('/edit/main/')[1]);assert.ok(fs.existsSync(actual),actual);edits++;
  const row=articles.get(path);if(row){const evidence=recordedSource(row.sourceFile,row.sourceRevision,row.historyRevision??effectiveSnapshot.revision);assert.equal(edit,editableSource(row.filePath,'main').url);const hrefs=new Set($('a').map((_,a)=>$(a).attr('href')).get());assert.ok(hrefs.has(evidence.markdown),'source '+path);assert.ok(hrefs.has(evidence.history),'history '+path);sourcePairs++;}
 }
 assert.equal(sourcePairs,manifest.counts.articles);
 const record={sourceSha:manifest.sourceSha,target:manifest.target,worker:manifest.worker,html,indexable,editTargets:edits,pinnedArticleSourcePairs:sourcePairs,globalNoindex};
 save('reports/release/package-audit.json',record);return record;
}
