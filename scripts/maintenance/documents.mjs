import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {createHash} from 'node:crypto';
export const digest = bytes=>createHash('sha256').update(bytes).digest('hex');
export async function readLimited(response, limit=2*1024*1024) {
  assert.ok(Number(response.headers.get('content-length') || 0) <= limit, 'Response exceeds snapshot limit');
  const reader = response.body.getReader(); const chunks=[]; let size=0;
  try {while(true) {const {done,value}=await reader.read(); if(done)break; size+=value.length; assert.ok(size<=limit,'Response exceeds snapshot limit'); chunks.push(Buffer.from(value));}}
  finally {await reader.cancel(); reader.releaseLock();}
  return Buffer.concat(chunks);
}
function sitemapPath(value) {
  const u=new URL(value); assert.equal(u.origin,'https://kenshi.wiki','External sitemap cannot be copied');
  assert.equal(u.search,''); assert.equal(u.hash,''); assert.equal(u.username,''); assert.equal(u.password,'');
  assert.match(u.pathname,/^\/[a-zA-Z0-9_/-]+\.xml$/, 'Unexpected sitemap address');
  return u.pathname;
}
export async function collectDocuments(base, fetcher=fetch) {
  const documents={}, hashes={}; let total=0;
  async function capture(path,type) {
    const r=await fetcher(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
    assert.equal(r.status,200,'Cannot preserve '+path); assert.notEqual(r.headers.get('cf-mitigated'),'challenge');
    assert.match(r.headers.get('content-type') ?? '',type==='robots'?/text\/plain/i:/xml/i);
    const bytes=await readLimited(r); total+=bytes.length; assert.ok(total<=5*1024*1024,'Combined crawl files too large');
    documents[path]={base64:bytes.toString('base64'),type:type==='robots'?'text/plain; charset=utf-8':'application/xml; charset=utf-8'};
    hashes[path]=digest(bytes);return bytes.toString('utf8');
  }
  const robots=await capture('/robots.txt','robots');
  const queue=[...robots.matchAll(/^\s*Sitemap:\s*(\S+)/gmi)].map(m=>sitemapPath(m[1]));
  assert.ok(queue.length,'Live robots.txt has no sitemap reference');
  while(queue.length) {
    assert.ok(Object.keys(documents).length<=32,'Too many sitemap files');
    const path=queue.shift(); if(Object.hasOwn(documents,path))continue;
    const text=await capture(path,'xml');
    assert.ok(!/<!DOCTYPE|<!ENTITY/i.test(text),'Unsupported XML declarations');
    const $=load(text,{xmlMode:true}); const root=$.root().children().first();
    assert.ok(['sitemapindex','urlset'].includes(root[0]?.name),'Invalid sitemap XML');
    if(root[0].name==='sitemapindex') for(const item of $('sitemap > loc').toArray())queue.push(sitemapPath($(item).text().trim()));
  }
  return {documents,hashes};
}
export async function verifyDocuments(base,snapshot,fetcher=fetch) {
  for(const [path,expected] of Object.entries(snapshot.hashes)) {
    const r=await fetcher(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
    assert.equal(r.status,200,path);assert.notEqual(r.headers.get('cf-mitigated'),'challenge');
    assert.equal(digest(await readLimited(r)),expected,'Crawl file changed: '+path);
  }
}
