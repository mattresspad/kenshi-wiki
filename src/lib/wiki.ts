import { getCollection } from 'astro:content';
import { buildCatalog } from './catalog.mjs';

async function loadWiki() {
  const entries = await getCollection('articles');
  return {entries, ...buildCatalog(entries)};
}

// All prerendered routes see the same collection during one production build.
let building: ReturnType<typeof loadWiki> | undefined;
export function readWiki() {
  if (import.meta.env.DEV) return loadWiki();
  return building ??= loadWiki();
}
