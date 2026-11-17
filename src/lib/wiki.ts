import { getCollection } from 'astro:content';
import { buildCatalog } from './catalog.mjs';
export async function readWiki() {
  const entries = await getCollection('articles');
  const catalog = buildCatalog(entries.map(e => ({path:'/'+e.id, ...e.data})));
  return {entries, ...catalog};
}
