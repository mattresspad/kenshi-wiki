import {snapshot, policy, categoryPath} from '../../src/lib/catalog.mjs';
import geographyRoster from '../../conversion/geography/roster.json' with {type:'json'};
import geographyCheckpoint from '../../conversion/geography/checkpoint.json' with {type:'json'};
import factionRoster from '../../conversion/factions/roster.json' with {type:'json'};
import factionCheckpoint from '../../conversion/factions/checkpoint.json' with {type:'json'};

export const families = {
  geography: {roster:geographyRoster, checkpoint:geographyCheckpoint},
  factions: {roster:factionRoster, checkpoint:factionCheckpoint}
};
export function selectedIds(family) {
  const {roster, checkpoint} = families[family];
  return new Set(roster.batches.slice(0, checkpoint.included).flatMap(batch => batch.ids));
}
export const initialIds = geographyRoster.previouslyTransferred;
export const expectedIds = new Set([...initialIds, ...Object.keys(families).flatMap(name => [...selectedIds(name)])]);
export function expectedRoutes() {
  return new Set(['/', ...policy.reviewedCategories.map(categoryPath), ...policy.reviewedPortals,
    ...snapshot.articles.filter(article => expectedIds.has(article.id)).map(article => article.path)]);
}
export function newestBatch() {
  const current = Object.values(families).filter(family => family.checkpoint.included > 0).at(-1);
  return current?.roster.batches[current.checkpoint.included - 1];
}
