import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {Miniflare} from 'miniflare';

export async function openPreview(host,port,{contact=false}={}) {
  if(contact&&!['127.0.0.1','localhost','::1'].includes(host))throw Error('Contact simulation is loopback-only');
  const root=fileURLToPath(new URL('../',import.meta.url));
  const {workers}=await readBuildOutput(root);
  const {config,assetsDir,bundleDir}=workers.default;
  const modules=Object.fromEntries(Object.entries(config.manifest.modules).map(([name,definition])=>[name,{type:definition.type,contents:readFileSync(join(bundleDir,name),'utf8')}]));
  let mainModule=config.manifest.mainModule;
  if(contact){
    mainModule='preview.mjs';
    modules[mainModule]={type:'esm',contents:readFileSync(join(root,'scripts/contact/preview-worker.mjs'),'utf8')};
    modules['preview-widget.js']={type:'text',contents:readFileSync(join(root,'scripts/contact/preview-widget.js'),'utf8')};
  }
  // No remote email or secret bindings in either local mode.
  const localEnv={ASSETS:{type:'assets'},CONTACT_ENABLED:{type:'text',value:'false'},CONTACT_ORIGIN:{type:'text',value:'https://kenshi.wiki'}};
  return new Miniflare({
    host,port,cf:false,enableDevRegistry:false,logRequests:false,
    workers:[{config:{...config,env:localEnv,
      manifest:{mainModule,modulesRoot:bundleDir,modules},
      assets:{...config.assets,directory:assetsDir,hasUserWorker:true,
        ...(contact?{runWorkerFirst:['/api/contact','/contact','/contact/copyright','/__contact-preview/*']}: {})}}}]
  });
}
