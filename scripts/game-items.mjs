// Read Kenshi's game data and list every item with its stats and icon, for building item infoboxes.
// Usage:
//   node scripts/game-items.mjs <Kenshi data folder> [--icons <folder>] [--meitou <folder>]  writes game-items/items.json
//   node scripts/game-items.mjs --copy-icons                             copies the icons articles use into public/icons/items/
// Icons are named <item>.<material>[.<colour>].png by string id. By default they come from the game's data/icons, the renders it
// caches as it shows items, so an item the install has never shown has none. --icons takes a folder written by MeitouClient's
// `meitou-tools icons`, which draws every item's icon and lists them in icons.json (a weapon once per manufacturer's model).
// --meitou takes the folder MeitouClient's `--wiki-export` writes, whose items.json adds decoded stats to each item (`details`).
// They are Lo-Fi Games' artwork; see public/notices/artwork.txt.
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Base game files in load order: a later file's record changes the fields it lists and keeps the rest.
const dataFiles = ['gamedata.base', 'Newwworld.mod', 'Dialogue.mod', 'rebirth.mod'];
const outDir = 'game-items';
const iconDir = 'public/icons/items';
const articleDir = 'src/content/wiki';

class Reader {
  constructor(buffer) {
    this.buffer = buffer;
    this.at = 0;
  }

  int() {
    const value = this.buffer.readInt32LE(this.at);
    this.at += 4;
    return value;
  }

  float() {
    const value = this.buffer.readFloatLE(this.at);
    this.at += 4;
    return value;
  }

  bool() {
    return this.buffer[this.at++] !== 0;
  }

  string() {
    const length = this.int();
    const value = this.buffer.toString('utf8', this.at, this.at + length);
    this.at += length;
    return value;
  }

  // A count, then that many key and value pairs.
  map(readValue) {
    const entries = [];
    for (let count = this.int(); count > 0; count--) entries.push([this.string(), readValue()]);
    return Object.fromEntries(entries);
  }
}

function skipHeader(reader) {
  const version = reader.int();
  if (version === 17) {
    const size = reader.int();
    reader.at += size;
    return;
  }

  // Version 16: header version, author, description, dependencies, references.
  reader.int();
  for (let i = 0; i < 4; i++) reader.string();
}

function readRecord(reader) {
  reader.int();
  const type = reader.int();
  reader.int();
  const name = reader.string();
  const sid = reader.string();
  reader.int();

  const record = {
    sid,
    name,
    type,
    bool: reader.map(() => reader.bool()),
    float: reader.map(() => reader.float()),
    int: reader.map(() => reader.int()),
    vec3: reader.map(() => [reader.float(), reader.float(), reader.float()]),
    vec4: reader.map(() => [reader.float(), reader.float(), reader.float(), reader.float()]),
    str: reader.map(() => reader.string()),
    file: reader.map(() => reader.string()),
    ref: reader.map(() => reader.map(() => [reader.int(), reader.int(), reader.int()])),
  };
  skipInstances(reader);
  return record;
}

function skipInstances(reader) {
  for (let count = reader.int(); count > 0; count--) {
    reader.string();
    reader.string();
    reader.at += 7 * 4;
    for (let states = reader.int(); states > 0; states--) reader.string();
  }
}

function* readRecords(buffer) {
  const reader = new Reader(buffer);
  skipHeader(reader);
  reader.int();
  for (let count = reader.int(); count > 0; count--) yield readRecord(reader);
}

function mergeRecord(records, record) {
  const merged = records.get(record.sid) ?? { sid: record.sid, type: record.type, ref: {} };
  merged.name = record.name;
  for (const field of ['bool', 'float', 'int', 'vec3', 'vec4', 'str', 'file']) merged[field] = { ...merged[field], ...record[field] };
  for (const [category, refs] of Object.entries(record.ref)) merged.ref[category] = { ...merged.ref[category], ...refs };
  records.set(record.sid, merged);
}

async function loadRecords(data) {
  const records = new Map();
  for (const file of dataFiles) {
    for (const record of readRecords(await readFile(join(data, file)))) mergeRecord(records, record);
  }
  return records;
}

// The plain render: item and its own material, without a colour variant. Otherwise the shortest name for the item.
function iconFor(record, icons) {
  const material = Object.keys(record.ref.material ?? {})[0];
  const plain = material && `${record.sid}.${material}.png`;
  if (plain && icons.has(plain)) return plain;

  const candidates = [...icons].filter((icon) => icon.startsWith(`${record.sid}.`));
  return candidates.sort((a, b) => a.length - b.length)[0] ?? null;
}

// Each item's icon file and, for a weapon, its manufacturers' variants: from the folder's icons.json when it has one, else by name.
async function iconSource(folder) {
  const manifest = join(folder, 'icons.json');
  if (existsSync(manifest)) {
    const entries = JSON.parse(await readFile(manifest, 'utf8'));
    const bySid = new Map(entries.map((entry) => [entry.stringId, entry]));
    return (record) => {
      const entry = bySid.get(record.sid);
      return { icon: entry?.file ?? null, variants: entry?.variants ?? undefined };
    };
  }

  const icons = new Set(await readdir(folder));
  return (record) => ({ icon: iconFor(record, icons) });
}

// Items are the records with a trade value. Icon paths are absolute, so --copy-icons needs no folder.
function itemList(records, iconsOf, folder) {
  const path = (file) => (file ? resolve(folder, file) : null);
  return [...records.values()]
    .filter((record) => 'value' in record.int)
    .map(({ sid, name, type, bool, float, int, str, ref }) => {
      const { icon, variants } = iconsOf({ sid, ref });
      const iconVariants = variants?.map((variant) => ({ ...variant, file: path(variant.file) }));
      return { sid, name, type, icon: path(icon), iconVariants, bool, float, int, str, ref };
    });
}

// Meitou's --wiki-export items.json: each weapon, crossbow, armour, item, backpack and limb record's decoded stats (weapon class and makers,
// armour coverage and modifiers, item category), the benches that make it (`madeAt`) and the research that unlocks it (`blueprint`), by string
// id. Each blueprint gets its research's details from research.json: time, tech level, cost, prerequisites and blueprint value.
async function meitouDetails(folder) {
  if (!folder) return new Map();
  const { entries } = JSON.parse(await readFile(join(folder, 'items.json'), 'utf8'));
  const research = new Map(JSON.parse(await readFile(join(folder, 'research.json'), 'utf8')).entries.map((entry) => [entry.data.record, entry.data]));
  const withResearch = (blueprint) => ({ ...blueprint, details: research.get(blueprint.researchId) });
  return new Map(entries.map(({ data }) => [data.record, { ...data, blueprint: data.blueprint?.map(withResearch) }]));
}

// A weapon shows its best grade: the variant whose model has the highest level among its makers' grades.
function bestVariant(item) {
  const levels = new Map((item.details?.grades ?? []).map((grade) => [grade.model, grade.level]));
  const ranked = (item.iconVariants ?? []).filter((variant) => levels.has(variant.modelName));
  return ranked.sort((a, b) => levels.get(b.modelName) - levels.get(a.modelName))[0]?.file ?? item.icon;
}

async function writeItems(data, folder, meitou) {
  const details = await meitouDetails(meitou);
  const items = itemList(await loadRecords(data), await iconSource(folder), folder).map((item) => {
    const withDetails = { ...item, details: details.get(item.sid) };
    return { ...withDetails, icon: bestVariant(withDetails) };
  });
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'items.json'), JSON.stringify(items, null, 1));
  console.log(`Wrote ${items.length} items, ${items.filter((item) => item.icon).length} with icons, to ${outDir}/items.json.`);
}

// An item's icon file in public/icons/items/: its string id, a space (a few mods' ids have one) as "_" so the URL needs no escaping.
const iconFile = (sid) => `${sid.replaceAll(' ', '_')}.png`;

// Every /icons/items/<file> an article links to.
async function usedIcons() {
  const files = await readdir(articleDir, { recursive: true });
  const used = new Set();
  for (const file of files.filter((name) => name.endsWith('.md'))) {
    const text = await readFile(join(articleDir, file), 'utf8');
    for (const [, name] of text.matchAll(/\/icons\/items\/([^"'\s)]+\.png)/g)) used.add(name);
  }
  return used;
}

async function copyIcons() {
  const items = JSON.parse(await readFile(join(outDir, 'items.json'), 'utf8'));
  const byFile = new Map(items.map((item) => [iconFile(item.sid), item]));
  await mkdir(iconDir, { recursive: true });
  for (const name of await usedIcons()) {
    const icon = byFile.get(name)?.icon;
    if (!icon) throw new Error(`No icon for ${name} in ${outDir}/items.json.`);
    await copyFile(icon, join(iconDir, name));
  }
  console.log(`Copied the icons articles use into ${iconDir}/.`);
}

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
if (args.includes('--copy-icons')) {
  await copyIcons();
} else {
  const data = args.find((arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'));
  if (!data) throw new Error("Pass the path to Kenshi's data folder.");
  await writeItems(data, option('--icons') ?? join(data, 'icons'), option('--meitou'));
}
