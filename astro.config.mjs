import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { isIndexablePath } from './src/lib/indexing.js';
import cloudflareStatic from './scripts/cloudflare-static.mjs';
import searchIndex from './scripts/search-index.mjs';

export default defineConfig({
  site: 'https://kenshi.wiki',
  output: 'static',
  // Package the static assets after both indexes have been written.
  integrations: [
    sitemap({ filter: (url) => isIndexablePath(new URL(url).pathname) }),
    searchIndex(),
    cloudflareStatic(),
  ],
  // Kenshi.html rather than Kenshi/index.html, so pages live at /Kenshi like wiki URLs.
  build: {
    format: 'file',
  },
});
