// Turn the in-game stat cards Fandom lists once per armour grade (Prototype to Masterwork, one table each) into one table: a
// column per grade, a row per stat, and one merged cell where every grade has the same value.
// Usage: node scripts/grade-tables.mjs
// Re-run it after scripts/import-fandom.mjs, which brings the cards back.
import * as cheerio from 'cheerio';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const articleDir = 'src/content/wiki';
const cardStart = '<table class="wikitable"><tbody><tr><td colspan="2" align="left">';
const isCard = (line) => line.startsWith(cardStart) && line.includes('Grade]</span>');

// The game lists value and sell value after the weather protections, under no heading of their own: they belong with weight.
const generalLabels = ['Value', 'Sell value'];

const bracketless = (text) => text.replace(/ /g, ' ').trim().replace(/^\[(.*)\]$/, '$1');

// A card's rows: its item, grade, armour class and material, then label and value rows under [Heading] rows. A lone empty
// cell is a spacer.
function parseCard(line) {
  const $ = cheerio.load(line, null, false);
  const [title, grade, kind, ...rows] = $('tr').toArray().map((tr) => $(tr).children('td').toArray().map((td) => $(td)));
  const sections = [{ heading: null, rows: [] }];
  for (const cells of rows) {
    if (cells.length === 1 && cells[0].attr('colspan')) sections.push({ heading: bracketless(cells[0].text()), rows: [] });
    if (cells.length !== 2) continue;

    const label = cells[0].text().trim().replace(/^-/, '');
    const section = generalLabels.includes(label) ? sections[0] : sections.at(-1);
    section.rows.push([label, cells[1].html().trim()]);
  }
  return {
    name: title[0].text().trim(),
    grade: bracketless(grade[0].text()).replace(/ Grade$/, ''),
    kind: kind.map((cell) => bracketless(cell.text())).filter(Boolean),
    sections,
  };
}

// Labels in the order the cards give them; a label only some grades have goes after the one before it in the first card that
// has it.
function mergeLabels(lists) {
  const merged = [];
  for (const labels of lists) {
    labels.forEach((label, i) => {
      if (merged.includes(label)) return;
      merged.splice(i ? merged.indexOf(labels[i - 1]) + 1 : 0, 0, label);
    });
  }
  return merged;
}

// Each section heading with its labels and each label's value per grade (null where a grade lacks it).
function mergeSections(cards) {
  const headings = mergeLabels(cards.map((card) => card.sections.map((section) => section.heading)));
  return headings.map((heading) => {
    const sectionOf = (card) => card.sections.find((section) => section.heading === heading)?.rows ?? [];
    const labels = mergeLabels(cards.map((card) => sectionOf(card).map(([label]) => label)));
    const values = labels.map((label) => cards.map((card) => sectionOf(card).find(([own]) => own === label)?.[1] ?? null));
    return { heading, rows: labels.map((label, i) => [label, values[i]]) };
  }).filter((section) => section.rows.length);
}

function valueCells(values) {
  if (values.every((value) => value === values[0])) return `<td colspan="${values.length}">${values[0] ?? '–'}</td>`;
  return values.map((value) => `<td>${value ?? '–'}</td>`).join('');
}

function gradeTable(cards) {
  const grades = cards.map((card) => `<th class="unsortable grade grade-${card.grade.toLowerCase()}">${card.grade}</th>`).join('');
  const head = `<tr><th class="unsortable">${cards[0].kind.join(' · ')}</th>${grades}</tr>`;
  const body = mergeSections(cards).map(({ heading, rows }) => {
    const title = heading ? `<tr><th colspan="${cards.length + 1}">${heading}</th></tr>` : '';
    return title + rows.map(([label, values]) => `<tr><th scope="row">${label}</th>${valueCells(values)}</tr>`).join('');
  });
  return `<table class="wikitable grade-table"><tbody>${head}${body.join('')}</tbody></table>`;
}

// Runs of card lines, with only blank lines between them: [first line, last line].
function cardRuns(lines) {
  const runs = [];
  lines.forEach((line, i) => {
    if (!isCard(line)) return;
    const last = runs.at(-1);
    const gap = last && lines.slice(last[1] + 1, i);
    if (gap && gap.every((between) => !between.trim())) last[1] = i;
    else runs.push([i, i]);
  });
  return runs;
}

async function convert(file) {
  const text = await readFile(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const runs = cardRuns(lines);
  for (const [first, last] of runs.reverse()) {
    const cards = lines.slice(first, last + 1).filter(isCard).map(parseCard);
    // A version note after a name ("Armoured Rags (1.0.9)") is the same item.
    if (new Set(cards.map((card) => card.name.replace(/ \(.*\)$/, ''))).size > 1) throw new Error(`${file}: cards of more than one item in a row`);
    lines.splice(first, last - first + 1, gradeTable(cards));
  }
  if (runs.length) await writeFile(file, lines.join(eol));
  return runs.length;
}

let tables = 0;
for (const file of (await readdir(articleDir, { recursive: true })).filter((name) => name.endsWith('.md'))) {
  tables += await convert(join(articleDir, file));
}
console.log(`Merged ${tables} runs of grade cards into tables.`);
