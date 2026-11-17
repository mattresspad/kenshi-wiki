import {readFileSync} from 'node:fs';
import {snapshot, policy, categoryPath} from '../../src/lib/catalog.mjs';
import roster from '../../conversion/geography/roster.json' with {type:'json'};
import checkpoint from '../../conversion/geography/checkpoint.json' with {type:'json'};

export {roster, checkpoint};
export const batches = roster.batches.slice(0, checkpoint.included);
export const includedIds = new Set(batches.flatMap(batch => batch.ids));
export const geographyIds = new Set(['catun', ...roster.batches.flatMap(batch => batch.ids)]);
export const beforeGeography = ['catun','backpacks','the-holy-nation','modding/blender-plugins','modding/meitou/make-a-saddle-pack'];
export function expectedRoutes() {
  const ids = new Set([...beforeGeography, ...includedIds]);
  return new Set(['/', ...policy.reviewedCategories.map(categoryPath), ...policy.reviewedPortals,
    ...snapshot.articles.filter(article => ids.has(article.id)).map(article => article.path)]);
}
export function frozenEvidence() {
  return JSON.parse(readFileSync(new URL('../../conversion/geography/reference.json', import.meta.url)));
}
