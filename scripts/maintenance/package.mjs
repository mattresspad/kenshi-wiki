import fs from 'node:fs';
import {resolve,join} from 'node:path';
import {writeRootConfig,writeWorkerConfig,getWorkerBundleDir,readBuildOutput} from '@cloudflare/build-output-utils';
import {hashes,sha} from '../release/common.mjs';
export async function buildMaintenance(root,snapshot) {
  // Same Worker and runtime date as the ordinary wiki; no compatibility upgrade.
  // Separate output; never clean or overwrite the ordinary wiki package.
  fs.mkdirSync(root,{recursive:true});
  await writeRootConfig(root,undefined,{isPreview:false});
  const bundle=getWorkerBundleDir(root);fs.mkdirSync(bundle,{recursive:true});
  fs.copyFileSync('src/maintenance/handler.mjs',join(bundle,'handler.mjs'));
  const page=fs.readFileSync('src/maintenance/page.html','utf8');
  fs.writeFileSync(join(bundle,'index.mjs'),"import {maintenanceResponse} from './handler.mjs';\nconst snapshot="+JSON.stringify({page,documents:snapshot.documents})+";\nexport default {fetch(request){return maintenanceResponse(request,snapshot)}};\n");
  await writeWorkerConfig({root,config:{name:'kenshi-wiki',compatibilityDate:'2026-11-07',env:{},observability:{enabled:true,redactQueryString:true,logs:{enabled:true,invocationLogs:false},traces:{enabled:true,headSamplingRate:0.01}}},manifest:{type:'complete',mainModule:'index.mjs',modules:{'index.mjs':{type:'esm'},'handler.mjs':{type:'esm'}}}});
  const {workers}=await readBuildOutput(root);
  if(workers.default.config.assets || Object.keys(workers.default.config.env??{}).length)throw Error('Maintenance must have no asset fallback or application bindings');
  const files=hashes(resolve(root,'.cloudflare/output'));
  return {packageSha256:sha(JSON.stringify(files)),files};
}
