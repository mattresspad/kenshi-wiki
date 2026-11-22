import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {getWorkerBundleDir} from '@cloudflare/build-output-utils';
import {CONTACT_RECIPIENT} from '../../src/contact/policy.mjs';
export function contactConfiguration(env=process.env){
  if(env.WIKI_CONTACT_SIMULATION||env.WIKI_CONTACT_MODE==='simulation'||env.PUBLIC_CONTACT_SIMULATION)throw Error('Contact simulation is allowed only in the local preview harness, never in a package');
  if(env.PUBLIC_TURNSTILE_SITE_KEY&&(/^[123]x0/.test(env.PUBLIC_TURNSTILE_SITE_KEY)||env.PUBLIC_TURNSTILE_SITE_KEY==='local-preview'))throw Error('Turnstile test keys cannot be packaged');
  if(env.WIKI_CONTACT_ENABLED&&!['true','false'].includes(env.WIKI_CONTACT_ENABLED))throw Error('Invalid contact enable setting');
  const enabled=env.WIKI_CONTACT_ENABLED==='true';
  if(enabled&&!env.PUBLIC_TURNSTILE_SITE_KEY?.trim())throw Error('Live intake requires a production Turnstile sitekey');
  return {
    ASSETS:{type:'assets'},CONTACT_MAIL:{type:'send-email',destinationAddress:CONTACT_RECIPIENT},
    CONTACT_ORIGIN:{type:'text',value:'https://kenshi.wiki'},
    CONTACT_ENABLED:{type:'text',value:enabled?'true':'false'},
    ...(enabled?{TURNSTILE_SECRET_KEY:{type:'secret'}}:{})
  };
}
export async function packageContact(root){
  const modules={'worker/index.mjs':{type:'esm'},'worker/contact.mjs':{type:'esm'},'contact/policy.mjs':{type:'esm'}};
  for(const name of Object.keys(modules)){
    const destination=join(getWorkerBundleDir(root),name);await mkdir(dirname(destination),{recursive:true});
    await copyFile(join(root,'src',name),destination);
  }
  // cf uploads the entry using its basename. Keep that entry at the bundle root
  // so the source modules retain their directory-relative imports.
  await writeFile(join(getWorkerBundleDir(root),'index.mjs'),"export {default} from './worker/index.mjs';\n");
  modules['index.mjs']={type:'esm'};
  return {type:'complete',mainModule:'index.mjs',modules};
}
