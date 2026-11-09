// Write every item article's Crafting section from the game data in game-items/items.json (see scripts/game-items.mjs; it needs
// MeitouClient's --wiki-export for `madeAt` and `blueprint`).
// Usage: node scripts/crafting-sections.mjs
// The section opens with a generated block: a table of what one item takes at each bench or refinery that makes it (a weapon's
// benches with the grades each makes), then the research and blueprints that unlock it. Fandom's INPUTS/OUTPUT tables, its
// "[Research Blueprint]" cards and the sentences that only said where an item is crafted are replaced; the rest of Fandom's text
// stays below. An article without a Crafting section gets one when its item can be made. Fandom's input amounts are checked against
// the game's and any difference is listed. Re-run it after scripts/import-fandom.mjs.
import * as cheerio from 'cheerio';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { pageSlug } from '../src/lib/wiki.js';

const articleDir = 'src/content/wiki';
const pairsFile = 'scripts/item-pairs.json';
const redirectsFile = 'public/_redirects';
const blockStart = '<div class="crafting">';

// Sections a new Crafting section goes before; without one of them it goes at the end.
const laterSections = ['Blueprints', 'Blueprint', 'Blueprint Locations', 'Trivia', 'Trivia/Notes', 'History', 'Tips', 'Notes', 'Gallery', 'See also'];

// Fandom's sentences that only say where or whether an item is crafted, which the generated block says from the data.
const replacedSentences = [
  /^This item can be crafted in various qualities using different levels of \[Weapon Smithing Bench\]\(\/weapon-smithing-bench\)( after learning the appropriate \[blueprint\]\(\/blueprints\))?\.$/,
  /^(It is not possible to craft this item|This item cannot be crafted|Cannot be crafted)\.$/,
  /^([\w' ()]+ can be (crafted|made)|It can be crafted) (on|in|at|using) (a|the) \[[^\]]+\]\([^)]+\)\.$/,
];

const number = (value) => value.toLocaleString('en-US', { maximumFractionDigits: 3 });
const plural = (count, word) => `${count} ${word}${count === 1 || word.endsWith('s') ? '' : 's'}`;

// --- Links: an article's path for a title, through Fandom's redirects; null when the wiki has no such page.

async function linker(pairs) {
  const redirects = new Map((await readFile(redirectsFile, 'utf8')).split(/\r?\n/).filter((line) => line.startsWith('/')).map((line) => line.split(/\s+/)));
  const articleOf = new Map(Object.entries(pairs).map(([id, sid]) => [sid, id]));
  const resolve = (title) => {
    const path = redirects.get(`/${pageSlug(title)}`) ?? `/${pageSlug(title)}`;
    return existsSync(`${articleDir}${path}.md`) ? path : null;
  };
  const link = (path, text) => (path ? `<a href="${path}">${text}</a>` : text);
  return {
    item: (sid, name) => link(articleOf.has(sid) ? `/${articleOf.get(sid)}` : resolve(name), name),
    page: (name, text = name) => link(resolve(name), text),
    research: (name) => link(resolve(`${name} tech`) ?? resolve(name), name),
  };
}

// --- The generated block.

// The places that make an item, those with the same grades and inputs in one column: [buildings, models, inputs].
function columns(madeAt) {
  const merged = new Map();
  for (const place of madeAt) {
    const key = JSON.stringify([place.models, place.inputs]);
    merged.set(key, { ...place, buildings: [...(merged.get(key)?.buildings ?? []), place.building] });
  }
  return [...merged.values()];
}

function gradeRange(models) {
  if (!models.length) return null;
  const [first, last] = [models[0].model, models.at(-1).model];
  return first === last ? first : `${first} – ${last}`;
}

// A table with a column per bench: the grades it makes a weapon in, then each input per item made.
function inputTable(madeAt, links) {
  const places = columns(madeAt);
  const head = places.map((place) => `<th class="unsortable">${place.buildings.map((name) => links.page(name)).join('<br>')}</th>`).join('');
  const inputs = [...new Map(places.flatMap((place) => place.inputs.map((input) => [input.itemId, input]))).values()];
  const grades = places.some((place) => place.models.length)
    ? `<tr><th scope="row">Grades</th>${places.map((place) => `<td>${gradeRange(place.models) ?? '–'}</td>`).join('')}</tr>`
    : '';
  const rows = inputs.map((input) => {
    const cells = places.map((place) => place.inputs.find((own) => own.itemId === input.itemId)?.perItem);
    return `<tr><th scope="row">${links.item(input.itemId, input.item)}</th>${cells.map((cell) => `<td>${cell === undefined ? '–' : number(cell)}</td>`).join('')}</tr>`;
  });
  return `<table class="wikitable crafting-table"><tbody><tr><th class="unsortable">Per item</th>${head}</tr>${grades}${rows.join('')}</tbody></table>`;
}

// One research or blueprint that unlocks the item: its time, tech level, cost, prerequisites, and for a blueprint its value.
function unlockLine(blueprint, links) {
  const research = blueprint.details;
  const name = research?.blueprintOnly ? `${blueprint.research} blueprint` : `${links.research(blueprint.research)} research`;
  if (!research) return `<li>${name}</li>`;

  const level = blueprint.repetition > 0 ? ` (its level ${blueprint.repetition + 1})` : '';
  const parts = [`${plural(research.hours, 'hour')} at tech level ${research.level}`];
  if (research.cost.length) parts.push(`costs ${research.cost.map((cost) => links.page(cost.item, plural(cost.count, cost.item))).join(', ')}`);
  if (research.requires.length) parts.push(`needs ${research.requires.map((need) => links.research(need.name)).join(', ')}`);
  if (research.money) parts.push(`the blueprint is worth c. ${number(research.money)}`);
  return `<li>${name}${level}: ${parts.join('; ')}.</li>`;
}

function craftingBlock(item, links) {
  const madeAt = item.details?.madeAt ?? [];
  if (!madeAt.length) return `${blockStart}<p>It can't be crafted.</p></div>`;

  const unlocks = item.details.blueprint ?? [];
  const list = unlocks.length ? `<p>Unlocked by:</p><ul>${unlocks.map((blueprint) => unlockLine(blueprint, links)).join('')}</ul>` : '';
  return `${blockStart}${inputTable(madeAt, links)}${list}</div>`;
}

// --- Fandom's section: what stays, and its input tables to check against.

const isReplacedTable = (line) => /^<(details|table)\b/.test(line) && /INPUTS|greenprint-table/.test(line);

function keptLines(body) {
  const lines = body.split('\n').filter((line) => !line.startsWith(blockStart) && !isReplacedTable(line));
  const kept = lines.filter((line) => !replacedSentences.some((sentence) => sentence.test(line.trim())));
  return kept.join('\n').replace(/^\s+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

// Each of Fandom's INPUTS/OUTPUT tables in the section: its inputs and the amount of each per item.
function fandomInputs(body) {
  const $ = cheerio.load(body, null, false);
  return $('table').toArray().filter((table) => $(table).text().includes('INPUTS')).map((table) => {
    const inputs = $(table).find('td').toArray().map((td) => [$(td).children('a').first().text().trim(), $(td).text().match(/\(([\d.]+) required\)/)?.[1]]);
    return inputs.filter(([name, amount]) => name && amount).map(([name, amount]) => [name.toLowerCase(), Number(amount)]);
  });
}

// Fandom tables whose inputs no bench of the game's matches within rounding.
function fandomDifferences(id, body, item) {
  const ours = (item.details?.madeAt ?? []).map((place) => place.inputs.map((input) => [input.item.toLowerCase(), input.perItem]));
  const same = (theirs, mine) => theirs.length === mine.length && theirs.every(([name, amount]) => mine.some(([own, value]) => own === name && Math.abs(value - amount) < 0.011));
  return fandomInputs(body).filter((theirs) => !ours.some((mine) => same(theirs, mine))).map((theirs) => `${id}: Fandom has ${JSON.stringify(theirs)}, the game ${JSON.stringify(ours)}`);
}

// --- Articles.

function sectionBounds(lines) {
  const start = lines.findIndex((line) => line === '## Crafting');
  if (start < 0) return null;
  const next = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  return [start, next < 0 ? lines.length : next];
}

function insertionPoint(lines) {
  const later = lines.findIndex((line) => laterSections.some((title) => line === `## ${title}`));
  return later < 0 ? lines.length : later;
}

async function writeSection(id, item, links, report) {
  const file = `${articleDir}/${id}.md`;
  const text = await readFile(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const bounds = sectionBounds(lines);
  if (!bounds && !item.details?.madeAt?.length) return false;

  const body = bounds ? lines.slice(bounds[0] + 1, bounds[1]).join('\n') : '';
  report.push(...fandomDifferences(id, body, item));
  const kept = keptLines(body);
  const section = ['## Crafting', '', craftingBlock(item, links), '', ...(kept ? [kept, ''] : [])];
  const at = bounds ? bounds[0] : insertionPoint(lines);
  const gap = !bounds && lines[at - 1] !== '' ? [''] : [];
  lines.splice(at, bounds ? bounds[1] - bounds[0] : 0, ...gap, ...section);

  const updated = lines.join(eol).replace(/(\r?\n){3,}/g, `${eol}${eol}`);
  if (updated === text) return false;
  await writeFile(file, updated);
  return true;
}

async function main() {
  const items = new Map(JSON.parse(await readFile('game-items/items.json', 'utf8')).map((item) => [item.sid, item]));
  const pairs = JSON.parse(await readFile(pairsFile, 'utf8'));
  const links = await linker(pairs);
  const report = [];
  let written = 0;
  for (const [id, sid] of Object.entries(pairs)) {
    if (items.get(sid)?.details && (await writeSection(id, items.get(sid), links, report))) written++;
  }
  console.log(`Wrote ${written} Crafting sections.`);
  if (report.length) console.log(`Fandom's inputs differ from the game's in ${report.length} tables:\n  ${report.join('\n  ')}`);
}

await main();
