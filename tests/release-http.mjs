import {expect} from '@playwright/test';
export async function verifyHttpResponses(request,mode){
 for(const path of ['/','/catun','/category/locations','/pages-needing-work','/search-titles.json','/pagefind/pagefind.js']){
  const response=await request.get(path);
  expect(response.headers()['cf-mitigated'],path+' received a Cloudflare challenge').not.toBe('challenge');
  expect(response.status(),path).toBe(200);
  if(mode==='preview')expect(response.headers()['x-robots-tag']??'').toContain('noindex');
  if(mode==='live'&&path==='/')expect(response.headers()['x-robots-tag']??'').not.toContain('noindex');
 }
 for(const path of ['/release-smoke-missing','/nested/release-smoke-missing'])for(const method of ['GET','HEAD']){
  const response=await request.fetch(path,{method});expect(response.status()).toBe(404);
  if(method==='GET'){const body=await response.text();expect(body).toContain('Page not found');expect(body).not.toContain('rel="canonical"');}
 }
 const alias=await request.get('/armor-king?release=1',{maxRedirects:0});
 expect(alias.status()).toBe(301);expect(new URL(alias.headers().location,'https://kenshi.wiki').pathname).toBe('/armour-king');
 expect(new URL(alias.headers().location,'https://kenshi.wiki').search).toBe('?release=1');
 expect((await request.get('/catun#nonexistent-fragment')).status()).toBe(200);
}
