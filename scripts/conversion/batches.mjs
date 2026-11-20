import moddingRoster from '../../conversion/modding/roster.json' with {type:'json'};
import moddingCheckpoint from '../../conversion/modding/checkpoint.json' with {type:'json'};
import {snapshot, policy, categoryPath} from '../../src/lib/catalog.mjs';
import geographyRoster from '../../conversion/geography/roster.json' with {type:'json'};
import geographyCheckpoint from '../../conversion/geography/checkpoint.json' with {type:'json'};
import factionRoster from '../../conversion/factions/roster.json' with {type:'json'};
import factionCheckpoint from '../../conversion/factions/checkpoint.json' with {type:'json'};

import raceRoster from '../../conversion/races/roster.json' with {type:'json'};
import raceCheckpoint from '../../conversion/races/checkpoint.json' with {type:'json'};

import animalRoster from '../../conversion/animals/roster.json' with {type:'json'};
import animalCheckpoint from '../../conversion/animals/checkpoint.json' with {type:'json'};

import characterRoster from '../../conversion/characters/roster.json' with {type:'json'};
import characterCheckpoint from '../../conversion/characters/checkpoint.json' with {type:'json'};

import itemRoster from '../../conversion/items/roster.json' with {type:'json'};
import itemCheckpoint from '../../conversion/items/checkpoint.json' with {type:'json'};
import buildingRoster from '../../conversion/buildings/roster.json' with {type:'json'};
import buildingCheckpoint from '../../conversion/buildings/checkpoint.json' with {type:'json'};
import craftingRoster from '../../conversion/crafting/roster.json' with {type:'json'};
import craftingCheckpoint from '../../conversion/crafting/checkpoint.json' with {type:'json'};
import technologyRoster from '../../conversion/technology/roster.json' with {type:'json'};
import technologyCheckpoint from '../../conversion/technology/checkpoint.json' with {type:'json'};
import shopRoster from '../../conversion/shops/roster.json' with {type:'json'};
import shopCheckpoint from '../../conversion/shops/checkpoint.json' with {type:'json'};
import gameplayRoster from '../../conversion/gameplay/roster.json' with {type:'json'};
import gameplayCheckpoint from '../../conversion/gameplay/checkpoint.json' with {type:'json'};
import eventRoster from '../../conversion/events/roster.json' with {type:'json'};
import eventCheckpoint from '../../conversion/events/checkpoint.json' with {type:'json'};
import loreRoster from '../../conversion/lore/roster.json' with {type:'json'};
import loreCheckpoint from '../../conversion/lore/checkpoint.json' with {type:'json'};
export const families = {
  geography: {roster:geographyRoster, checkpoint:geographyCheckpoint},
  factions: {roster:factionRoster, checkpoint:factionCheckpoint},
  races: {roster:raceRoster, checkpoint:raceCheckpoint},
  animals: {roster:animalRoster, checkpoint:animalCheckpoint},
  characters: {roster:characterRoster, checkpoint:characterCheckpoint},
  items: {roster:itemRoster, checkpoint:itemCheckpoint},
  buildings:{roster:buildingRoster,checkpoint:buildingCheckpoint},
  crafting:{roster:craftingRoster,checkpoint:craftingCheckpoint},
  technology:{roster:technologyRoster,checkpoint:technologyCheckpoint},
  shops:{roster:shopRoster,checkpoint:shopCheckpoint},
  gameplay:{roster:gameplayRoster,checkpoint:gameplayCheckpoint},
  events:{roster:eventRoster,checkpoint:eventCheckpoint},
  lore:{roster:loreRoster,checkpoint:loreCheckpoint},
  modding:{roster:moddingRoster,checkpoint:moddingCheckpoint}
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
