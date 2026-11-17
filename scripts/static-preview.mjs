import {fileURLToPath} from 'node:url';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {Miniflare} from 'miniflare';

export async function openPreview(host,port) {
  const root=fileURLToPath(new URL('../',import.meta.url));
  const {workers}=await readBuildOutput(root);
  const {config,assetsDir}=workers.default;
  return new Miniflare({
    host,port,cf:false,enableDevRegistry:false,logRequests:false,
    workers:[{config:{...config,assets:{...config.assets,directory:assetsDir,hasUserWorker:false}},
      legacy:{serviceWorkerScript:"addEventListener('fetch', () => { throw Error('Unexpected user Worker request'); });"}}]
  });
}
