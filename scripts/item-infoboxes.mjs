// Rebuild item infoboxes from the game data in game-items/items.json (see scripts/game-items.mjs).
// Usage: node scripts/item-infoboxes.mjs
// An article is paired with its item by scripts/item-pairs.json (article path -> string id), else by its infobox's "String id"
// row. Run scripts/game-items.mjs --copy-icons afterwards to copy the icons the infoboxes show.
import * as cheerio from 'cheerio';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';

const articleDir = 'src/content/wiki';
const pairsFile = 'scripts/item-pairs.json';

// Record types (FcsRecordType numbers).
const types = { weapon: 2, armour: 3, item: 4, backpack: 46, nestItem: 86, mapItem: 102, crossbow: 107, limb: 111 };

const number = (value) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
const multiplier = (value) => `${value.toFixed(2)}x`;
const signed = (value) => (value > 0 ? `+${number(value)}` : number(value));
const percent = (value) => `${Math.round(value * 100)}%`;
const change = (mult) => `${signed(Math.round((mult - 1) * 100))}%`;
const grid = (item, name) => `${item.int[`${name} width`]}x${item.int[`${name} height`]}`;
// Inventory footprint as the articles' prose writes it, height first (a katana is "1x7").
const footprint = (item) => `${item.int['inventory footprint height']}x${item.int['inventory footprint width']}`;
const price = (value) => `c. ${number(value)}`;
// An item's icon file, as scripts/game-items.mjs --copy-icons names it (a space in the string id as "_").
const iconFile = (sid) => `${sid.replaceAll(' ', '_')}.png`;
const link =(href, text) => `<a href="${href}">${text}</a>`;
const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// A value at the worst and the best grade, one if they are equal.
const graded = (worst, best, format = number) => (worst === best ? format(worst) : `${format(worst)} → ${format(best)}`);

// Rows whose value is null are left out; a group left without rows is dropped.
const group = (heading, rows) => ({ heading, rows: rows.filter((row) => row[1] !== null && row[1] !== undefined) });
const when = (condition, value) => (condition ? value : null);

// Weight, value and footprint. The value is the record's: the game scales what traders ask by the item's kind and the town. A weapon's
// or armour's weight and value are its base, which makers and grades scale ("Base").
function basics(item, base = false) {
  return [
    [base ? 'Base weight' : 'Weight', `${number(item.float['weight kg'] ?? 0)} kg`],
    ['Base value', price(item.int.value ?? 0)],
    ['Size in inventory', footprint(item)],
  ];
}

const weaponClassPages = {
  Katana: '/katanas', Sabre: '/sabres', Blunt: '/blunt-weapons', 'Heavy weapon': '/heavy-weapons', Hacker: '/hackers', Polearm: '/polearms',
};

function weaponGroups(item) {
  const d = item.details;
  const page = weaponClassPages[d.class];
  return [
    group(null, [['Class', page ? link(page, d.class) : d.class], ...basics(item, true)]),
    group('Combat', [
      ['Cut damage', multiplier(d.cutMult)],
      ['Blunt damage', multiplier(d.bluntMult)],
      ['Pierce damage', when(d.pierceMult > 0, multiplier(d.pierceMult ?? 0))],
      ['Bleed', multiplier(d.bleedMult)],
      ['Armour penetration', `${d.armourPenetration > 0 ? '+' : ''}${percent(d.armourPenetration)}`],
      ['Attack', signed(d.attackMod)],
      ['Defence', signed(d.defenceMod)],
      ['Indoors', when(d.indoorsMod !== 0, signed(d.indoorsMod))],
      ['Reach', number(d.length)],
      ['Can block', when(!d.canBlock, 'No')],
    ]),
    group('Damage against', [
      ['Humans', when(d.humanMult !== 1, change(d.humanMult))],
      ['Animals', when(d.animalMult !== 1, change(d.animalMult))],
      ['Robots', when(d.robotMult !== 1, change(d.robotMult))],
      ...(d.raceDamagePct ?? []).map((race) => [race.race, `${signed(race.pct - 100)}%`]),
    ]),
    group(null, [['Manufacturers', d.makers?.map((maker) => maker.maker).join(', ') || null]]),
  ];
}

const armourSlots = {
  head: ['/headgear', 'Head'], 'body armour': ['/body-armour', 'Body armour'], legs: ['/legwear', 'Legs'], shirt: ['/shirts', 'Shirt'],
  feet: ['/footwear', 'Feet'],
};
const armourClasses = { Cloth: '/clothing', Light: '/light-armour', Medium: '/medium-armour', Heavy: '/heavy-armour' };
const armourMaterials = { Cloth: 'Cloth', Leather: 'Leather', Chain: 'Chain', MetalPlate: 'Plate' };

// Armour modifiers as the export names them: [label, format].
const armourModifiers = {
  combatSkillBonus: ['Combat skills', signed], combatAttackBonus: ['Attack', signed], combatDefenceBonus: ['Defence', signed],
  unarmedBonus: ['Martial arts', signed], perceptionBonus: ['Perception', signed], dodge: ['Dodge', multiplier],
  dexterity: ['Dexterity', multiplier], damageOutput: ['Damage output', multiplier], athletics: ['Athletics', multiplier],
  combatSpeed: ['Combat speed', multiplier], stealth: ['Stealth', multiplier], rangedSkill: ['Ranged skill', multiplier],
  assassination: ['Assassination', multiplier], fistInjury: ['Fist injury', multiplier], cutIntoStun: ['Cut into stun', percent],
  weatherProtection: ['Weather protection', percent],
};

function armourGroups(item) {
  const d = item.details;
  const [slotPage, slotName] = armourSlots[d.slotName] ?? [null, capitalise(d.slotName)];
  const classPage = armourClasses[d.class];
  const modifiers = Object.entries(d.modifiers ?? {}).filter(([key]) => armourModifiers[key]);
  return [
    group(null, [
      ['Slot', slotPage ? link(slotPage, slotName) : slotName],
      ['Class', classPage ? link(classPage, d.class) : d.class],
      ['Material', armourMaterials[d.material] ?? d.material],
      ...basics(item, true),
    ]),
    group('Protection', [
      ...(d.coverage ?? []).map((part) => [part.part, `${part.pct}% covered`]),
      // The record's bonus on top of the class and material's resistance: none at the lowest grade, all of it at the highest.
      ['Extra cut resistance', when(d.cutDefBonus !== 0, `up to +${percent(d.cutDefBonus)}`)],
      ['Extra blunt resistance', when(d.bluntDefBonus !== 0, `up to +${percent(d.bluntDefBonus)}`)],
      ['Pierce resistance', when(d.pierceDefMult !== 1, multiplier(d.pierceDefMult))],
    ]),
    group('Modifiers', modifiers.map(([key, value]) => [armourModifiers[key][0], armourModifiers[key][1](value)])),
  ];
}

// A food's nutrition as its tooltip shows it: half its charges (a single charge stays 1), as the 17 food articles' old Fandom
// rows have it against the records.
const nutrition = (charges) => `${number(charges > 1 ? charges / 2 : charges)} nu`;

// What an ITEM's charges show as, by its category.
const chargeRows = {
  food: ['Nutrition', nutrition], 'special food': ['Nutrition', nutrition], 'first aid kit': ['Charges', number], 'splint kit': ['Charges', number],
  ammunition: ['Shots', number],
};

function itemGroups(item) {
  const d = item.details ?? {};
  const [label, format] = chargeRows[d.category] ?? [];
  return [
    group(null, [
      ['Type', d.category ? capitalise(d.category) : null],
      ...basics(item),
      [label, when(label && d.charges > 0, format?.(d.charges))],
      ['Artifact', when(d.artifact, 'Yes')],
    ]),
  ];
}

// A crossbow's damage, range and shot speed are not shown: the record's numbers are not what the game's tooltip derives from them.
// Its tooltip weight is half the record's (all seven crossbow articles' cards).
function crossbowGroups(item) {
  const d = item.details;
  const range = (min, max, unit = '') => `${number(min)}–${number(max)}${unit}`;
  return [
    group(null, [
      ['Class', link('/crossbows', 'Crossbow')],
      ['Weight', `${number(d.weightKg / 2)} kg`],
      ['Base value', graded(d.value, d.value_1, price)],
      ['Ammunition', d.ammo?.join(', ') || null],
      ['Size in inventory', footprint(item)],
    ]),
    group('Combat (range across grades)', [
      ['Reload time', graded(range(d.reload_time_min, d.reload_time_max, ' s'), range(d.reload_time_min_1, d.reload_time_max_1, ' s'), (x) => x)],
      ['Spread at skill 0', graded(d.accuracy_deviation_at_0_skill, d.accuracy_deviation_at_0_skill_1)],
      ['Perfect aim at skill', number(d.accuracy_perfect_skill)],
      ['Shots', when(d.num_shots > 1, number(d.num_shots ?? 1))],
    ]),
    group('Damage against', [
      ['Humans', when(d.human_damage_mult !== 1, change(d.human_damage_mult))],
      ['Animals', when(d.animal_damage_mult !== 1, change(d.animal_damage_mult))],
      ['Robots', when(d.robot_damage_mult !== 1, change(d.robot_damage_mult))],
    ]),
  ];
}

const limbSlots = { 50: 'Left arm', 51: 'Right arm', 52: 'Left leg', 53: 'Right leg' };

// Limb stats with a worst- and best-grade value: [label, field, format].
const limbStats = [
  ['HP', 'HP', number], ['Strength', 'strength mult', multiplier], ['Dexterity', 'dexterity mult', multiplier],
  ['Athletics', 'athletics mult', multiplier], ['Swimming', 'swimming mult', multiplier], ['Stealth', 'stealth mult', multiplier],
  ['Thievery', 'thievery mult', multiplier], ['Ranged', 'ranged mult', multiplier], ['Unarmed damage', 'unarmed damage bonus', signed],
];

function limbGroups(item) {
  const value = (field) => item.float[field] ?? item.int[field] ?? 0;
  const best = (field) => item.float[`${field} 1`] ?? item.int[`${field} 1`] ?? value(field);
  const neutral = (format) => (format === multiplier ? 1 : 0);
  const changes = limbStats.filter(([label, field, format]) => label === 'HP' || value(field) !== neutral(format) || best(field) !== neutral(format));
  return [
    group(null, [
      ['Slot', link('/robot-limbs', limbSlots[item.int.slot] ?? 'Limb')],
      ['Weight', `${number(item.float['weight kg'] ?? 0)} kg`],
      ['Base value', graded(item.int.value ?? 0, item.int['value 1'] ?? item.int.value ?? 0, price)],
      ['Size in inventory', footprint(item)],
    ]),
    group('Stats (range across grades)', changes.map(([label, field, format]) => [label, graded(value(field), best(field), format)])),
  ];
}

function backpackGroups(item) {
  const { float, int } = item;
  return [
    group(null, [
      ['Slot', link('/backpacks', 'Backpack')],
      ['Weight reduction', percent(1 - float['encumbrance effect'])],
      ['Weight', `${number(float['weight kg'])} kg`],
      ['Base value', price(int.value)],
    ]),
    group('Storage', [
      ['Backpack grid', grid(item, 'storage size')],
      ['Stack minimum', `${int['stackable bonus minimum']}x`],
      ['Stack multiplier', `${number(float['stackable bonus mult'])}x`],
      ['Size in inventory', footprint(item)],
    ]),
    group('Combat', [
      ['Combat skills', signed(int['combat skill bonus'])],
      ['Combat speed', multiplier(float['combat speed mult'])],
      ['Athletics', multiplier(float['athletics mult'])],
      ['Stealth and dodge', multiplier(float['stealth mult'])],
    ]),
  ];
}

const plainGroups = (item) => [group(null, basics(item))];

// Each type's layout; weapons, armour and crossbows need Meitou's decoded details.
const layouts = {
  [types.weapon]: (item) => item.details && weaponGroups(item),
  [types.armour]: (item) => item.details && armourGroups(item),
  [types.crossbow]: (item) => item.details && crossbowGroups(item),
  [types.item]: itemGroups,
  [types.backpack]: backpackGroups,
  [types.limb]: limbGroups,
  [types.mapItem]: plainGroups,
  [types.nestItem]: plainGroups,
};

// Rows of the research that unlocks the item, which Fandom gave many armour articles in place of an item infobox; they are
// kept under "Research" only for an item the game data names no research for, since the Crafting section shows it
// (scripts/crafting-sections.mjs).
const researchLabels = new Set(['Estimated Time', 'Tech Level', 'Costs', 'Requirements', 'New Building(s)', 'New Item(s)', 'Required For']);

function researchRows(lines) {
  return lines
    .map((line) => line.match(/^ {8}- (\[.*\])$/)?.[1])
    .filter(Boolean)
    .map((row) => JSON.parse(row))
    .filter(([label]) => researchLabels.has(label));
}

function infobox(title, item, research) {
  const groups = layouts[item.type]?.(item);
  if (!groups) return null;
  groups.push(group('Research', research));
  groups.push(group(null, [['String id', `<span>${item.sid}</span>`]]));
  return {
    title,
    image: item.icon ? `/icons/items/${iconFile(item.sid)}` : undefined,
    caption: item.str.description?.trim() || undefined,
    groups: groups.filter((g) => g.rows.length > 0),
  };
}

function infoboxYaml(box) {
  const lines = ['infobox:', `  title: ${JSON.stringify(box.title)}`];
  if (box.image) lines.push(`  image: ${JSON.stringify(box.image)}`);
  if (box.caption) lines.push(`  caption: ${JSON.stringify(box.caption)}`);
  lines.push('  groups:');
  for (const g of box.groups) {
    lines.push(`    - heading: ${JSON.stringify(g.heading)}`, '      rows:');
    for (const row of g.rows) lines.push(`        - ${JSON.stringify(row)}`);
  }
  return lines;
}

// The frontmatter's lines without its infobox: the `infobox:` line and every indented line after it.
function withoutInfobox(lines) {
  const start = lines.indexOf('infobox:');
  if (start < 0) return lines;

  let end = start + 1;
  while (end < lines.length && lines[end].startsWith(' ')) end++;
  return [...lines.slice(0, start), ...lines.slice(end)];
}

// The article's frontmatter lines, its body, its title and the string id its infobox names.
function parseArticle(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  const [, frontmatter, body] = match;
  const sid = frontmatter.match(/\["String id","<span>([^<]+)<\/span>"\]/)?.[1];
  const title = JSON.parse(frontmatter.match(/^title: (".*")$/m)[1]);
  return { lines: frontmatter.split(/\r?\n/), body, sid, title };
}

// The in-game stat card Fandom put above an item article's text (a table with a "Slot:" row or "-Weight" rows): the infobox
// replaces it. Only cards before the first heading go; the grade, crafting and blueprint tables below are kept.
const statCard = /^<table class="wikitable">.*(<td>Slot:<\/td>|<td>-Weight<\/td>)/;

function withoutStatCard(body) {
  const lines = body.split('\n');
  const heading = lines.findIndex((line) => line.startsWith('#'));
  const lead = heading < 0 ? lines.length : heading;
  const kept = lines.filter((line, i) => i >= lead || !statCard.test(line));
  return { body: kept.join('\n').replace(/^(\s*\n){2,}/, '\n'), removed: lines.length - kept.length };
}

async function rebuild(file, id, items, pairs) {
  const article = parseArticle(await readFile(file, 'utf8'));
  const item = article && items.get(pairs[id] ?? article.sid);
  const research = item?.details?.blueprint?.length ? [] : researchRows(article.lines);
  const box = item && infobox(article.title, item, research);
  if (!box) return null;

  const lines = [...withoutInfobox(article.lines), ...infoboxYaml(box)];
  const { body, removed } = withoutStatCard(article.body);
  await writeFile(file, `---\n${lines.join('\n')}\n---\n${body}`);
  return { removed };
}

// A table icon: weapon renders are long and thin, so theirs get a wide box.
function iconImage(item) {
  const src = `/icons/items/${iconFile(item.sid)}`;
  return weaponTypes.includes(item.type)
    ? `<img class="item-icon item-icon-wide" src="${src}" alt="" width="96" height="24">`
    : `<img class="item-icon" src="${src}" alt="" width="40" height="40">`;
}

const weaponTypes = [types.weapon, types.crossbow];

// The items whose names get an icon in the tables listing them.
const listedTypes = [...weaponTypes, types.armour];

// Each paired article's link (/katana) to its item's table icon, for the items of record types `only` (all when omitted).
function iconsByLink(items, pairs, only) {
  const icons = new Map();
  for (const [id, sid] of Object.entries(pairs)) {
    const item = items.get(sid);
    if (item?.icon && (!only || only.includes(item.type))) icons.set(`/${id}`, iconImage(item));
  }
  return icons;
}

const imageColumnTable = /^<table class="wikitable[^"]*">.*<th[^>]*>(Image|Icon)<\/th>/;
const isImageColumn = (text) => text === 'Image' || text === 'Icon';

// The cell of a row's Image or Icon column, when it is empty and the row links to an item with an icon: [cell, icon].
function emptyImageCell($, row, column, icons) {
  const cell = $(row).children('td').eq(column);
  if (!cell.length || cell.text().trim() || cell.find('img').length) return null;

  const href = $(row).find('a[href]').toArray().map((a) => $(a).attr('href')).find((link) => icons.has(link));
  return href ? [cell, icons.get(href)] : null;
}

// Fandom's tables with an Image or Icon column lost their images in the import: each empty cell gets the icon of the item its row links to.
function fillImageColumn(line, icons) {
  if (!imageColumnTable.test(line)) return { line, filled: 0 };

  const $ = cheerio.load(line, null, false);
  const rows = $('table').first().children('tbody').children('tr');
  const column = rows.first().children('th').toArray().findIndex((th) => isImageColumn($(th).text().trim()) && !$(th).attr('colspan'));
  if (column < 0) return { line, filled: 0 };

  let filled = 0;
  rows.slice(1).each((_, row) => {
    const found = emptyImageCell($, row, column, icons);
    if (!found) return;
    found[0].html(found[1]);
    filled++;
  });
  return { line: filled ? $.html() : line, filled };
}

// Weapon and armour names in a table get an icon only when the table lists at least this many: a list, not a mention.
const listMinimum = 3;

// The cells that start with a link to a weapon or armour and have no icon yet: [cell, icon].
function nameCells($, icons) {
  return $('td').toArray().flatMap((td) => {
    const first = $(td).contents().toArray().find((node) => node.type !== 'text' || node.data.trim());
    const href = first?.name === 'a' ? $(first).attr('href') : null;
    return href && icons.has(href) && !$(td).find('img').length ? [[$(td), icons.get(href)]] : [];
  });
}

// Tables listing weapons, crossbows or armour without an icon column: each name gets the item's icon before it, as the Backpacks table has.
function addNameIcons(line, icons) {
  if (!/^<(table|details)/.test(line)) return { line, filled: 0 };

  const $ = cheerio.load(line, null, false);
  const cells = nameCells($, icons);
  if (cells.length < listMinimum || $('img.item-icon').length) return { line, filled: 0 };

  for (const [cell, image] of cells) cell.prepend(`${image} `);
  return { line: $.html(), filled: cells.length };
}

async function fillTableIcons(file, icons, listedIcons) {
  const text = await readFile(file, 'utf8');
  // A line's carriage return is kept out of the HTML parser, which would turn it into a line break.
  const results = text.split('\n').map((line) => {
    const [html, end] = line.endsWith('\r') ? [line.slice(0, -1), '\r'] : [line, ''];
    const images = fillImageColumn(html, icons);
    const names = addNameIcons(images.line, listedIcons);
    return { line: names.line + end, filled: images.filled + names.filled };
  });
  const filled = results.reduce((sum, result) => sum + result.filled, 0);
  if (filled) await writeFile(file, results.map((result) => result.line).join('\n'));
  return filled;
}

async function main() {
  const items = new Map(JSON.parse(await readFile('game-items/items.json', 'utf8')).map((item) => [item.sid, item]));
  const pairs = JSON.parse(await readFile(pairsFile, 'utf8'));
  const icons = iconsByLink(items, pairs);
  const listedIcons = iconsByLink(items, pairs, listedTypes);
  const files = (await readdir(articleDir, { recursive: true })).filter((name) => name.endsWith('.md'));
  let rebuilt = 0;
  let cards = 0;
  let images = 0;
  for (const file of files) {
    const id = file.replace(/\.md$/, '').split(sep).join('/');
    images += await fillTableIcons(join(articleDir, file), icons, listedIcons);
    const result = await rebuild(join(articleDir, file), id, items, pairs);
    if (!result) continue;

    rebuilt++;
    cards += result.removed;
    if (result.removed > 1) console.log(`  ${id}: removed ${result.removed} stat cards`);
  }
  console.log(`Rebuilt ${rebuilt} item infoboxes; removed ${cards} stat cards above the articles' text; added ${images} table icons.`);
}

await main();
