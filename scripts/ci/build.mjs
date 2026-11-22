import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {gate} from '../release/common.mjs';
const require=createRequire(import.meta.url);
export async function build(folder,env,{report=false}={}){
 await gate(folder,'identity',['scripts/check-articles.mjs'],env);
 await gate(folder,'astro',[join(dirname(require.resolve('astro/package.json')),'bin/astro.mjs'),'build'],env);
 await gate(folder,'search',['scripts/search.mjs'],env);
 await gate(folder,'package',['scripts/package.mjs'],env);
 if(report)await gate(folder,'conversion-report',['scripts/report.mjs'],env);
}
