import { cleanBuildOutputDir, writeAssets, writeRootConfig, writeWorkerConfig } from '@cloudflare/build-output-utils';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
await cleanBuildOutputDir(root);
await writeRootConfig(root, undefined, { isPreview: false });
await writeWorkerConfig({
  root,
  config: {
    name: 'kenshi-wiki-restoration',
    compatibilityDate: '2026-11-07',
    assets: { htmlHandling: 'drop-trailing-slash', notFoundHandling: 'none' },
  },
});
await writeAssets({ root, sourceDirectory: fileURLToPath(new URL('../dist/', import.meta.url)) });
