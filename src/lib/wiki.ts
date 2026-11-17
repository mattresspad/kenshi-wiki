import { getCollection } from 'astro:content';
import { buildCatalog } from './catalog.mjs';

export async function readWiki() {
  const entries = await getCollection('articles');
  return {entries, ...buildCatalog(entries)};
}
