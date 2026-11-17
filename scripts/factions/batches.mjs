import {readFileSync} from 'node:fs';
import {families, selectedIds} from '../conversion/batches.mjs';
export const {roster, checkpoint} = families.factions;
export const includedIds = selectedIds('factions');
export const factionIds = new Set(roster.members);
export function frozenEvidence() {
  return JSON.parse(readFileSync(new URL('../../conversion/factions/reference.json', import.meta.url)));
}
