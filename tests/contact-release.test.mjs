import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parse} from 'yaml';
import {contactSettings,contactSitekey,contactOrigin} from '../src/contact/config.mjs';
import {contactConfiguration} from '../scripts/contact/package.mjs';
import {withContactUploadSecrets,requireContactSecret,redactContactSecret,assertContactVersion} from '../scripts/contact/upload-secret.mjs';
const fakeSecret='0x'+'A'.repeat(32);
test('production enables the verified public configuration; local and explicit-off builds stay disabled',()=>{
 assert.deepEqual(contactSettings({}),{enabled:false,sitekey:'',origin:contactOrigin});
 assert.equal(contactSettings({WIKI_RELEASE_TARGET:'staging'}).enabled,false);
 const p=contactSettings({WIKI_RELEASE_TARGET:'production'});assert.equal(p.enabled,true);assert.equal(p.sitekey,contactSitekey);
 const config=contactConfiguration({WIKI_RELEASE_TARGET:'production'});assert.equal(config.CONTACT_ENABLED.value,'true');assert.equal(config.CONTACT_ORIGIN.value,'https://kenshi.wiki');assert.equal(config.CONTACT_MAIL.destinationAddress,'admin@kenshi.wiki');assert.deepEqual(config.TURNSTILE_SECRET_KEY,{type:'secret'});
 assert.equal(contactSettings({WIKI_RELEASE_TARGET:'production',WIKI_CONTACT_ENABLED:'false'}).sitekey,'');
 for(const value of ['',undefined,'1x0000000000000000000000000000000','0xhas\nnewlines'])assert.throws(()=>requireContactSecret(value));
});
test('upload supplies only the runtime secret in a temporary file and removes it after success or failure',async()=>{
 const config={env:contactConfiguration({WIKI_RELEASE_TARGET:'production'})};
 for(const fail of [false,true]){
  let file;
  const run=()=>withContactUploadSecrets(config,{TURNSTILE_SECRET_KEY:fakeSecret,CONTACT_TEST_ACCESS_KEY:'must-not-copy'},async args=>{
   assert.equal(args[0],'--secrets-file');file=args[1];assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),{TURNSTILE_SECRET_KEY:fakeSecret});
   if(fail)throw Error('simulated upload failure');return 'done';
  });
  if(fail)await assert.rejects(run,/simulated upload failure/);else assert.equal(await run(),'done');
  assert.ok(file);assert.equal(fs.existsSync(file),false);assert.ok(!file.includes('reports'));
 }
 let called=false;await assert.rejects(()=>withContactUploadSecrets(config,{},()=>{called=true}));assert.equal(called,false);
 assert.deepEqual(await withContactUploadSecrets({env:contactConfiguration({})},{},args=>args),[]);
 assert.equal(redactContactSecret('error '+fakeSecret+' '+fakeSecret,fakeSecret),'error [REDACTED] [REDACTED]');
});
test('the trusted preview job alone receives the secret; PRs, build and artifacts do not',()=>{
 const workflow=parse(fs.readFileSync('.github/workflows/release.yml','utf8'));
 assert.equal(workflow.env.TURNSTILE_SECRET_KEY,undefined);
 const steps=workflow.jobs.preview.steps,uses=steps.filter(s=>s.env?.TURNSTILE_SECRET_KEY);
 assert.deepEqual(uses.map(s=>s.name),['Verify contact upload configuration','Upload an inactive preview version']);
 for(const s of uses)assert.equal(s.env.TURNSTILE_SECRET_KEY,'${{ secrets.TURNSTILE_SECRET_KEY }}');
 assert.ok(steps.indexOf(uses[0])<steps.findIndex(s=>s.run==='npm run release:prepare'));
 assert.ok(!JSON.stringify(workflow.jobs.publish).includes('TURNSTILE_SECRET_KEY'));
 assert.ok(!fs.readFileSync('.github/workflows/restoration.yml','utf8').includes('TURNSTILE_SECRET_KEY'));
 const stage=fs.readFileSync('scripts/release/stage.mjs','utf8');assert.ok(stage.includes('env:uploadEnv'));assert.ok(stage.includes('redactContactSecret'));
});


test('uploaded bindings must match the approved origin, recipient and secret type',()=>{
 const config={env:contactConfiguration({WIKI_RELEASE_TARGET:'production'})};
 const details={bindings:[{name:'CONTACT_ENABLED',type:'plain_text',text:'true'},{name:'CONTACT_ORIGIN',type:'plain_text',text:'https://kenshi.wiki'},{name:'CONTACT_MAIL',type:'send_email',destination_address:'admin@kenshi.wiki'},{name:'TURNSTILE_SECRET_KEY',type:'secret_text'}]};
 assert.equal(assertContactVersion(config,details).secretProvisioned,true);
 for(const [name,patch] of [['CONTACT_ENABLED',{text:'false'}],['CONTACT_ORIGIN',{text:'https://example.invalid'}],['CONTACT_MAIL',{destination_address:'another@example.invalid'}],['TURNSTILE_SECRET_KEY',{type:'plain_text'}]])assert.throws(()=>assertContactVersion(config,{bindings:details.bindings.map(b=>b.name===name?{...b,...patch}:b)}));
 assert.throws(()=>assertContactVersion(config,{bindings:[...details.bindings,{name:'CONTACT_TEST_ACCESS_KEY',type:'secret_text'}]}));
});
