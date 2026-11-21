import fs from 'node:fs';
import assert from 'node:assert/strict';
import {request} from '@playwright/test';
import {read,save,gate,npm,sha} from './common.mjs';
import {capture} from './capture.mjs';
const stage=read('reports/release/staging.json'),base=process.env.WIKI_PREVIEW_URL||stage.url;assert.equal(base,stage.url);assert.match(new URL(base).hostname,/^[0-9a-f]{8}-kenshi-wiki-restoration\.prds\.workers\.dev$/);
const env={WIKI_PREVIEW_URL:base,WIKI_RELEASE_TARGET:'staging',WIKI_EDIT_BRANCH:'rebuild/restoration'};
const client=await request.newContext();const checks=[];
try{
 for(const path of ['/','/search-titles.json','/pagefind/pagefind.js','/category/unique','/contributors']){const r=await client.get(base+path);assert.equal(r.status(),200);assert.match(r.headers()['x-robots-tag']??'',/noindex/);checks.push({path,status:r.status(),sha256:sha(await r.body())});await r.dispose();}
 for(const path of ['/missing-release-review','/nested/missing-release-review'])for(const method of ['GET','HEAD']){const r=await client.fetch(base+path,{method});assert.equal(r.status(),404);checks.push({path,method,status:r.status()});await r.dispose();}
}finally{await client.dispose()}
await gate('reports/release/https','browser',[npm,'test'],env);const shots=await capture(base,'reports/release/https/captures');
save('reports/release/https/acceptance.json',{sourceSha:stage.sourceSha,worker:stage.worker,version:stage.version,url:stage.url,checks,browser:read('reports/release/browser.json').stats,shots});
console.log('HTTPS staging acceptance passed: '+base);
