import {test,expect} from '@playwright/test';
import {load} from 'cheerio';
import {verifyHttpResponses} from './release-http.mjs';
import {digest,withoutCloudflareDetection} from '../scripts/release/live-content.mjs';
import {save} from '../scripts/release/common.mjs';
test('live HTTP assets, aliases, indexability and genuine 404s',async({request})=>{
 await verifyHttpResponses(request,'live');
});
test('live content and assets match the approved immutable version',async({request})=>{
 const version=process.env.WIKI_VERSION_URL;
 expect(version).toMatch(/^https:\/\/[a-f0-9]{8}-kenshi-wiki\.prds\.workers\.dev\/?$/);
 const htmlPaths=['/','/catun','/catun-alpha','/category/locations','/search','/random','/pages-needing-work'];
 const assets=new Set(['/search-titles.json','/pagefind/pagefind.js','/pages-needing-work/index.json']);
 const evidence=[];
 for(const path of htmlPaths){
  const [live,pinned]=await Promise.all([request.get(path),request.get(new URL(path,version).href)]);
  expect(live.headers()['cf-mitigated'],path+' received a Cloudflare challenge').not.toBe('challenge');
  expect(live.status(),path).toBe(200);expect(pinned.status(),path).toBe(200);
  const original=await pinned.text(),actual=withoutCloudflareDetection(await live.text());
  expect(digest(actual.html),path+' content differs from approved version').toBe(digest(original));
  const $=load(original);
  for(const el of $('script[src],link[rel=stylesheet][href]').toArray()){
   const target=$(el).attr('src')??$(el).attr('href');if(target.startsWith('/')&&!target.startsWith('//'))assets.add(target);
  }
  evidence.push({path,contentSha256:digest(original),cloudflareJsDetectionRemoved:actual.removed});
 }
 for(const path of assets){
  const [live,pinned]=await Promise.all([request.get(path),request.get(new URL(path,version).href)]);
  expect(live.status(),path).toBe(200);expect(pinned.status(),path).toBe(200);
  const expected=digest(await pinned.body());expect(digest(await live.body()),path).toBe(expected);
  evidence.push({path,sha256:expected});
 }
 save('reports/release/live/content-comparison.json',{versionUrl:version,scope:'HTTP delivery and content parity; apex browser interactions are not claimed',evidence});
});
