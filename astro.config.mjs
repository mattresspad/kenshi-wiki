import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kenshi.wiki',
  output: 'static',
  prerenderConflictBehavior: 'error',
  markdown: { syntaxHighlight: false },
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({filter:page=>!new URL(page).pathname.startsWith('/pages-needing-work/')} )],
});
