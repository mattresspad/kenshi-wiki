import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readBuildOutput } from '@cloudflare/build-output-utils';
import { Miniflare } from 'miniflare';

const {values} = parseArgs({options: {
  host: {type: 'string', default: '127.0.0.1'},
  port: {type: 'string', default: '4392'}
}});
const root = fileURLToPath(new URL('../', import.meta.url));
const output = await readBuildOutput(root);
const {config, assetsDir} = output.workers.default;
const runtime = new Miniflare({
  host: values.host, port: Number(values.port), cf: false, enableDevRegistry: false, logRequests: false,
  workers: [{
    config: {...config, assets: {...config.assets, directory: assetsDir, hasUserWorker: false}},
    // The simulator requires an event handler even for assets-only routing. Reaching it is an error.
    legacy: {serviceWorkerScript: "addEventListener('fetch', () => { throw Error('Unexpected user Worker request'); });"}
  }]
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => runtime.dispose());
console.log('Static wiki preview at ' + (await runtime.ready).href);
