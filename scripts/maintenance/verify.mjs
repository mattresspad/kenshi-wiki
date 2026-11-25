import assert from 'node:assert/strict';
import {verifyDocuments,readLimited} from './documents.mjs';
import {withoutCloudflareDetection,digest} from '../release/live-content.mjs';
export async function verifyMode(base,plan,snapshot,fetcher=fetch) {
 const checks=[];
 const get=async(path,method='GET')=>{
  const r=await fetcher(base+path,{method,redirect:'manual',signal:AbortSignal.timeout(20000)});
  assert.notEqual(r.headers.get('cf-mitigated'),'challenge','Cloudflare challenged verification; leave protection unchanged and inspect manually');return r;
 };
 if(plan.action==='on') {
  for(const path of ['/','/catun?maintenance-check=1','/contact','/nested/maintenance-check-missing'])for(const method of ['GET','HEAD']){
   const r=await get(path,method);assert.equal(r.status,503,path);assert.equal(r.headers.get('x-wiki-maintenance'),'1');
   assert.equal(r.headers.get('retry-after'),'3600');assert.match(r.headers.get('cache-control')??'',/no-store/);assert.equal(r.headers.get('location'),null);
   if(method==='GET')assert.match((await readLimited(r)).toString(),/Kenshi Wiki is temporarily undergoing maintenance/);
   checks.push(method+' '+path+' 503');
  }
  const r=await get('/api/contact','POST');assert.equal(r.status,503);assert.match(r.headers.get('content-type')??'',/application\/json/);checks.push('Contact intake paused');
 }else{
  for(const path of ['/','/catun','/search-titles.json','/pagefind/pagefind.js']){
   const r=await get(path);assert.equal(r.status,200,path);assert.notEqual(r.headers.get('x-wiki-maintenance'),'1');
   if(base==='https://kenshi.wiki'){
    const expected=await fetcher(plan.url+path,{redirect:'error',signal:AbortSignal.timeout(20000)});assert.equal(expected.status,200);
    const a=await readLimited(r),b=await readLimited(expected);
    if(/html/.test(r.headers.get('content-type')??''))assert.equal(digest(withoutCloudflareDetection(a.toString()).html),digest(b));
    else assert.equal(digest(a),digest(b));
   }
   checks.push(path+' restored');
  }
  for(const method of ['GET','HEAD'])assert.equal((await get('/nested/maintenance-check-missing',method)).status,404);
  const redirect=await get('/armor-king?maintenance-check=1');assert.equal(redirect.status,301);
  const location=new URL(redirect.headers.get('location'),base);assert.equal(location.pathname,'/armour-king');assert.equal(location.search,'?maintenance-check=1');checks.push('Alias and genuine 404 restored');
 }
 await verifyDocuments(base,snapshot,fetcher);checks.push('Robots and every sitemap match the saved bytes');return checks;
}
