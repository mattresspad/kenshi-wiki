import test from 'node:test';
import assert from 'node:assert/strict';
import {handleContact,verifyTurnstile,emailFor} from '../src/worker/contact.mjs';
import {contactConfiguration,packageContact} from '../scripts/contact/package.mjs';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {basename,dirname,join,resolve} from 'node:path';
import {getWorkerBundleDir} from '@cloudflare/build-output-utils';
import {Miniflare} from 'miniflare';
import {buildCatalog} from '../src/lib/catalog.mjs';
import {randomPaths} from '../src/lib/search-policy.mjs';
const sample={kind:'general',topic:'correction',name:'Example contributor',email:'editor@example.invalid',affected:'/catun',message:'Please check the source. <script>test</script>',website:'',token:'valid'};
const env={CONTACT_ENABLED:'true',CONTACT_ORIGIN:'https://kenshi.wiki'};
const req=(data=sample,headers={})=>new Request('https://kenshi.wiki/api/contact',{method:'POST',headers:{origin:'https://kenshi.wiki','content-type':'application/json',...headers},body:typeof data==='string'?data:JSON.stringify(data)});
function services(overrides={}){const mail=[],logs=[];return {mail,logs,options:{verify:async()=>true,deliver:async m=>{mail.push(m);},log:r=>logs.push(r),...overrides}};}
test('private acceptance awaits the service and fixes the recipient/sender',async()=>{
 let finish;const s=services({deliver:()=>new Promise(resolve=>{finish=resolve;})});
 let done=false;const pending=handleContact(req(),env,s.options).then(r=>{done=true;return r});
 while(!finish)await new Promise(r=>setTimeout(r,1));assert.equal(done,false);finish();
 const response=await pending;assert.equal(response.status,202);const body=await response.json();assert.match(body.reference,/^KW-/);assert.match(body.message,/does not confirm inbox delivery/);
 const message=emailFor(sample,body.reference);assert.equal(message.to,'admin@kenshi.wiki');assert.equal(message.from,'forms@kenshi.wiki');assert.equal(message.replyTo,sample.email);assert.ok(message.text.includes(sample.message));assert.equal(message.html,undefined);
 assert.doesNotMatch(JSON.stringify(s.logs)+JSON.stringify(body),/editor@example|Example contributor|<script>/);
 assert.equal(response.headers.get('cache-control'),'no-store');
});
test('server validates required, bounded and unexpected fields without delivery',async()=>{
 const cases=[
  [{...sample,email:'a@example.invalid\r\nBcc: victim@example.invalid'},'email'],
  [{...sample,name:'Someone\nCc: elsewhere'},'name'],
  [{...sample,email:'not-an-email'},'email'],
  [{...sample,kind:'copyright',topic:'removal',affected:''},'affected'],
  [{...sample,topic:'invalid'},'topic'],
  [{...sample,kind:'other'},'form'],
  [{...sample,kind:['general']},'form'],
  [{...sample,email:'a..b@example.invalid'},'email'],
  [{...sample,email:'.name@example.invalid'},'email'],
  [{...sample,message:''},'message'],
  [{...sample,message:'a'.repeat(10001)},'message'],
  [{...sample,affected:'x'.repeat(4001)},'affected'],
  [{...sample,name:'a'.repeat(101)},'name'],
  [{...sample,website:'spam'},'form'],
  [{...sample,token:''},'token'],
  [{...sample,to:'victim@example.invalid'},'form'],
  [{...sample,message:{file:'upload'}},'message'],
  [[], 'form']
 ];
 for(const [data,field]of cases){const s=services();const response=await handleContact(req(data),env,s.options);assert.equal(response.status,422,field);assert.ok((await response.json()).errors[field]);assert.equal(s.mail.length,0);}
});
test('only same-origin JSON POST requests are accepted',async()=>{
 const s=services();
 assert.equal((await handleContact(new Request('https://kenshi.wiki/api/contact'),env,s.options)).status,405);
 assert.equal((await handleContact(req(sample,{origin:'https://evil.invalid'}),env,s.options)).status,403);
 assert.equal((await handleContact(req(sample,{'content-type':'multipart/form-data'}),env,s.options)).status,415);
 assert.equal((await handleContact(req('{broken'),env,s.options)).status,400);
 assert.equal((await handleContact(req(' '.repeat(65537)),env,s.options)).status,413);
 assert.equal((await handleContact(req(sample,{'content-length':'70000'}),env,s.options)).status,413);
 assert.equal(s.mail.length,0);
});
test('failure and unavailable verification are distinguished and private',async()=>{
 for(const verify of [async()=>false,async()=>{throw Error('private token or email');}]){
  const s=services({verify}),r=await handleContact(req(),env,s.options);
  assert.ok([403,503].includes(r.status));assert.equal(s.mail.length,0);
  assert.doesNotMatch(await r.text()+JSON.stringify(s.logs),/private token/);
 }
 const s=services({deliver:async()=>{throw Error('private recipient detail');}});
 const r=await handleContact(req(),env,s.options);assert.equal(r.status,503);const text=await r.text();
 assert.match(text,/may have been forwarded/);assert.doesNotMatch(text+JSON.stringify(s.logs),/private recipient/);
});
test('missing configuration fails safely',async()=>{
 const s=services();assert.equal((await handleContact(req(),{},s.options)).status,503);assert.equal(s.mail.length,0);
 await assert.rejects(verifyTurnstile({token:'x',action:'wiki_contact',hostname:'kenshi.wiki'},{}));
 await assert.rejects(verifyTurnstile({token:'x',action:'wiki_contact',hostname:'kenshi.wiki'},{TURNSTILE_SECRET_KEY:'1x000dummy'}));
});
test('Siteverify requires success, exact hostname and action',async()=>{
 const expected={token:'fake-token',action:'wiki_contact',hostname:'kenshi.wiki'},secret={TURNSTILE_SECRET_KEY:'private-test-secret'};
 for(const result of [{success:false},{success:true,hostname:'other.invalid',action:'wiki_contact'},{success:true,hostname:'kenshi.wiki',action:'wiki_copyright'},{success:true,hostname:'kenshi.wiki'}])
   assert.equal(await verifyTurnstile(expected,secret,async()=>Response.json(result)),false);
 assert.equal(await verifyTurnstile(expected,secret,async(url,options)=>{
   assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');assert.deepEqual(JSON.parse(options.body),{secret:'private-test-secret',response:'fake-token'});
   return Response.json({success:true,hostname:'kenshi.wiki',action:'wiki_contact'});
 }),true);
 await assert.rejects(verifyTurnstile(expected,secret,async()=>new Response('bad',{status:503})));
});
test('packaging rejects simulation and test keys; recipient restriction is fixed',()=>{
 assert.equal(contactConfiguration({}).CONTACT_MAIL.destinationAddress,'admin@kenshi.wiki');
 assert.equal(contactConfiguration({}).CONTACT_ENABLED.value,'false');
 for(const settings of [{WIKI_CONTACT_SIMULATION:'1'},{WIKI_CONTACT_MODE:'simulation'},{PUBLIC_CONTACT_SIMULATION:'true'},{PUBLIC_TURNSTILE_SITE_KEY:'1x00000000000000000000AA'},{WIKI_CONTACT_ENABLED:'true',PUBLIC_TURNSTILE_SITE_KEY:''},{PUBLIC_TURNSTILE_SITE_KEY:'local-preview'}])assert.throws(()=>contactConfiguration(settings));
});
test('contact utilities are registered without article or random identities',()=>{
 const atlas=buildCatalog();
 for(const path of ['/contact','/contact/copyright']){assert.ok(atlas.local.has(path));assert.equal(atlas.searchTitles.filter(([,p])=>p===path).length,1);assert.equal(atlas.articles.has(path),false);assert.ok(!randomPaths(atlas).includes(path));}
});

test('uncertain delivery keeps a safe client reference, never arbitrary header text',async()=>{
 const reference='KW-12345678-1234-4567-89ab-123456789012',s=services({deliver:async()=>{throw Error('not logged');}});
 const r=await handleContact(req(sample,{'X-Contact-Reference':reference}),env,s.options);assert.equal((await r.json()).reference,reference);
 const bad=await handleContact(req(sample,{'X-Contact-Reference':'editor@example.invalid'}),env,s.options);assert.notEqual((await bad.json()).reference,'editor@example.invalid');assert.doesNotMatch(JSON.stringify(s.logs),/editor@example/);
});


test('packaged Worker starts with the CLI upload entry name and keeps intake disabled',async()=>{
 mkdirSync('reports',{recursive:true});
 const root=mkdtempSync(resolve('reports/contact-package-'));
 let runtime;
 try {
  for(const name of ['worker/index.mjs','worker/contact.mjs','contact/policy.mjs']){
   const target=join(root,'src',name);mkdirSync(dirname(target),{recursive:true});copyFileSync(join('src',name),target);
  }
  const manifest=await packageContact(root),bundle=getWorkerBundleDir(root);
  // cf beta.28 uploads the entry under basename(resolvedEntryPointPath).
  // Test that upload shape, not Node's source-file resolution or our local harness.
  const uploadEntry=basename(manifest.mainModule);
  const modules=Object.fromEntries(Object.entries(manifest.modules).map(([name,definition])=>[
   name===manifest.mainModule?uploadEntry:name,
   {type:definition.type,contents:readFileSync(join(bundle,name),'utf8')}
  ]));
  const assets=join(root,'assets');mkdirSync(assets);
  writeFileSync(join(assets,'index.html'),'<h1>Static asset remains available</h1>');
  writeFileSync(join(assets,'404.html'),'<h1>Missing page</h1>');
  writeFileSync(join(assets,'_redirects'),'/old / 301\n');
  const config=contactConfiguration({});
  assert.equal(config.CONTACT_ENABLED.value,'false');
  assert.equal(config.CONTACT_MAIL.destinationAddress,'admin@kenshi.wiki');
  // Deliberately omit mail and verification bindings. Disabled requests must not need them.
  delete config.CONTACT_MAIL;
  runtime=new Miniflare({host:'127.0.0.1',port:0,cf:false,enableDevRegistry:false,logRequests:false,
   workers:[{config:{name:'contact-package-test',compatibilityDate:'2026-11-07',env:config,
    manifest:{mainModule:uploadEntry,modulesRoot:bundle,modules},
    assets:{directory:assets,hasUserWorker:true,runWorkerFirst:['/api/contact'],htmlHandling:'drop-trailing-slash',notFoundHandling:'404-page'}}}]
  });
  await runtime.ready;
  assert.equal((await runtime.dispatchFetch('https://kenshi.wiki/api/contact')).status,405);
  const disabled=await runtime.dispatchFetch('https://kenshi.wiki/api/contact',{method:'POST',headers:{origin:'https://kenshi.wiki','content-type':'application/json'},body:'{}'});
  assert.equal(disabled.status,503);assert.match((await disabled.json()).error,/not accepting messages yet/);
  const home=await runtime.dispatchFetch('https://kenshi.wiki/');assert.equal(home.status,200);assert.match(await home.text(),/Static asset remains available/);
  assert.equal((await runtime.dispatchFetch('https://kenshi.wiki/old',{redirect:'manual'})).status,301);
  for(const method of ['GET','HEAD'])assert.equal((await runtime.dispatchFetch('https://kenshi.wiki/nested/missing',{method})).status,404);
 } finally {await runtime?.dispose();rmSync(root,{recursive:true,force:true});}
});
