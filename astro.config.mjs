import { defineConfig } from 'astro/config';
import {isIndexablePath} from './src/lib/utility-routes.mjs';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kenshi.wiki',
  output: 'static',
  prerenderConflictBehavior: 'error',
  markdown: { syntaxHighlight: false },
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({filter:page=>isIndexablePath(new URL(page).pathname)} )],
});
