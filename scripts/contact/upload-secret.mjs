import assert from 'node:assert/strict';
import {mkdtemp,writeFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
export function requireContactSecret(value){
 if(typeof value!=='string'||!/^0x[A-Za-z0-9_-]{20,100}$/.test(value))throw Error('Configure the real TURNSTILE_SECRET_KEY GitHub Actions secret before preview upload');
 return value;
}
export const redactContactSecret=(text,secret)=>secret?text.split(secret).join('[REDACTED]'):text;
export async function withContactUploadSecrets(config,env,upload){
 if(config.env.CONTACT_ENABLED.value!=='true')return upload([]);
 if(config.env.TURNSTILE_SECRET_KEY?.type!=='secret')throw Error('Missing runtime Turnstile secret binding');
 const value=requireContactSecret(env.TURNSTILE_SECRET_KEY);
 const directory=await mkdtemp(join(tmpdir(),'wiki-contact-secret-'));
 const file=join(directory,'secrets.json');
 try{
  await writeFile(file,JSON.stringify({TURNSTILE_SECRET_KEY:value}),{mode:0o600,flag:'wx'});
  return await upload(['--secrets-file',file]);
 }finally{await unlink(file).catch(e=>{if(e.code!=='ENOENT')throw e});await rmdir(directory);}
}

export function assertContactVersion(config,details){
 assert.ok(Array.isArray(details.bindings),'Uploaded version has no binding metadata');
 const bindings=new Map(details.bindings.map(b=>[b.name,b]));
 for(const name of ['CONTACT_ENABLED','CONTACT_ORIGIN'])assert.equal(bindings.get(name)?.text,config.env[name].value,'Uploaded '+name+' mismatch');
 assert.equal(bindings.get('CONTACT_MAIL')?.type,'send_email');
 assert.equal(bindings.get('CONTACT_MAIL')?.destination_address,'admin@kenshi.wiki');
 if(config.env.CONTACT_ENABLED.value==='true')assert.equal(bindings.get('TURNSTILE_SECRET_KEY')?.type,'secret_text','Missing uploaded Turnstile secret');
 assert.ok(!bindings.has('CONTACT_TEST_ACCESS_KEY'),'Private test access must not enter a release');
 return {enabled:config.env.CONTACT_ENABLED.value==='true',origin:config.env.CONTACT_ORIGIN.value,recipient:'admin@kenshi.wiki',secretProvisioned:bindings.get('TURNSTILE_SECRET_KEY')?.type==='secret_text'};
}
