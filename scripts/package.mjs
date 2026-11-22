import {contactConfiguration,packageContact} from './contact/package.mjs';
import {releaseConfiguration} from './release/config.mjs';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {utilityStage} from '../src/lib/utility-routes.mjs';
import { cleanBuildOutputDir, writeAssets, writeRootConfig, writeWorkerConfig } from '@cloudflare/build-output-utils';
import { fileURLToPath } from 'node:url';

const release=releaseConfiguration();
const root = fileURLToPath(new URL('../', import.meta.url));
const contactEnv=contactConfiguration();
await cleanBuildOutputDir(root);
const contactManifest=await packageContact(root);
await writeRootConfig(root, undefined, { isPreview: false });
await writeWorkerConfig({
  root,
  config: {
    name: release.worker,
    env: contactEnv,
    compatibilityDate: '2026-11-07',
    assets: { runWorkerFirst:['/api/contact'], htmlHandling: 'drop-trailing-slash', notFoundHandling: utilityStage>=4?'404-page':'none' },
  },
  manifest: contactManifest,
});
await writeAssets({ root, sourceDirectory: fileURLToPath(new URL('../dist/', import.meta.url)) });

if(release.target==='staging'){
 const {workers}=await readBuildOutput(root);
 const file=join(workers.default.assetsDir,'_headers');
 const prior=existsSync(file)?readFileSync(file,'utf8'):'';
 writeFileSync(file,prior+'\n/*\n  X-Robots-Tag: noindex, nofollow\n');
}
