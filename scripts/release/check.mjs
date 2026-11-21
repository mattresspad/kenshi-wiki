import fs from 'node:fs';
import {resolve,join} from 'node:path';
import {openPreview} from '../static-preview.mjs';
import {gate,npm,cf,git,clean,save,read} from './common.mjs';
import {capture} from './capture.mjs';
import {manifest} from './manifest.mjs';
clean();
const branch=process.env.WIKI_CANDIDATE_BRANCH||git('branch','--show-current');if(!branch)throw Error('A candidate branch must be configured for published edit links');
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7);if(only&&!['local','published'].includes(only))throw Error('Unknown check mode');
for(const mode of only?[only]:['local','published']){
 const folder='reports/release/'+mode,env={WIKI_RELEASE_TARGET:mode==='local'?'local':'staging',WIKI_EDIT_BRANCH:mode==='local'?'':branch,WIKI_CANDIDATE_BRANCH:branch};
 await gate(folder,'build',[npm,'run','build'],env);const runtime=await openPreview('127.0.0.1',0);
 try{const base=(await runtime.ready).origin;const checks=await Promise.allSettled([gate(folder,'catalog',[npm,'run','test:catalog'],env),gate(folder,'browser',[npm,'test'],{...env,WIKI_PREVIEW_URL:base}),gate(folder,'cloudflare',[cf,'workers','versions','create','--prebuilt','--dry-run'],env)]);const failures=checks.filter(r=>r.status==='rejected');if(failures.length)throw Error(failures.map(r=>r.reason.message).join('\n'));await capture(base,folder+'/captures');}
 finally{await runtime.dispose()}
 for(const [file,name]of [['reports/routes.json','routes.json'],['reports/work-coverage.json','work-coverage.json'],['reports/release/browser.json','browser.json'],['reports/gaps/register.json','gaps.json']])fs.copyFileSync(file,folder+'/'+name);
 clean();save(folder+'/acceptance.json',{mode,sourceSha:git('rev-parse','HEAD'),branch,checks:['build','catalog','browser','cloudflare'],browser:read(folder+'/browser.json').stats});
 if(mode==='published'){Object.assign(process.env,env);await manifest();}
}
clean();console.log('Release checks passed; tracked inputs unchanged.');
