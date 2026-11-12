// Handles the two animal templates left as raw HTML by the Fandom Markdown importer.
// Run directly to update an existing checkout offline: node scripts/creature-tables.mjs
import { load } from 'cheerio';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const articleDir = 'src/content/wiki';
const creatureTable = /^<table class="wikitable">\s*<tbody>\s*<tr>\s*<td colspan="[24]"[^>]*>\s*<b>(Statistics|Death Items)<\/b>[\s\S]*?<\/table>/gm;
const contents = cell => cell.html().trim();
const plain = cell => cell.text().trim();
const labels = cells => cells?.map(plain).join('|');

function table(caption, columns, rows) {
  const headings = columns.map(name => `<th scope="col">${name}</th>`).join('');
  const body = rows.map(values => `<tr>${values.map(value => `<td>${value}</td>`).join('')}</tr>`);
  return [
    '<table class="wikitable creature-table">',
    `<caption>${caption}</caption>`,
    `<thead><tr>${headings}</tr></thead>`,
    '<tbody>', ...body, '</tbody></table>',
  ].join('\n');
}

function statistics(rows) {
  const divider = rows.findIndex(cells => cells.length === 1 && contents(cells[0]) === '');
  if (labels(rows[1]) !== 'Attributes|Level' || divider < 3) return;

  const attributes = rows.slice(2, divider);
  let randomization = '';
  const last = attributes.at(-1);
  if (last.length === 1 && /^Stats randomize by\b/i.test(plain(last[0]))) {
    randomization = contents(attributes.pop()[0]);
  }
  const growth = rows.slice(divider + 1, -1);
  const footnote = rows.at(-1);
  if (!attributes.length || !attributes.every(cells => cells.length === 2)) return;
  const stages = ['Teen (', 'Adult (', 'Elder ('];
  if (growth.length !== stages.length || !growth.every((cells, i) => cells.length === 2 && plain(cells[0]).startsWith(stages[i]))) return;
  if (footnote.length !== 1 || !footnote[0].find('a[href="/forgotten-construction-set"]').length) return;

  const explanation = contents(footnote[0]).replace(/^<br\s*\/?>\s*/i, '');
  return [
    '<div class="creature-stats">',
    '<div>', table('Attributes', ['Attribute', 'Level'], attributes.map(cells => cells.map(contents))),
    ...(randomization ? [`<p class="creature-table-note">${randomization}</p>`] : []), '</div>',
    table('Growth stages', ['Stage', 'Age'], growth.map(cells => cells.map(contents))),
    '</div>',
    `<p class="creature-table-note">${explanation}</p>`,
  ].join('\n');
}

function deathItems(rows) {
  const [, warning, divider, header, ...items] = rows;
  if (warning?.length !== 1 || !/Removing these items/.test(plain(warning[0]))
      || divider?.length !== 1 || contents(divider[0]) !== '<hr>'
      || labels(header) !== 'Item|Quantity|Average Price'
      || !items.length || !items.every(cells => cells.length === 4)) return;

  const data = items.map(([icon, item, quantity, price]) => [
    [contents(icon), contents(item)].filter(Boolean).join(' '), contents(quantity), contents(price),
  ]);
  return [
    '<div class="creature-drops">', table('Death Items', ['Item', 'Quantity', 'Average price'], data),
    `<p class="creature-table-note">${contents(warning[0])}</p>`, '</div>',
  ].join('\n');
}

export function normalizeCreatureTables(markdown) {
  const newline = markdown.includes('\r\n') ? '\r\n' : '\n';
  return markdown.replace(creatureTable, (original, title) => {
    const $ = load(original, null, false);
    const rows = $('table > tbody > tr').toArray().map(row => $(row).children().toArray().map(cell => $(cell)));
    const html = title === 'Statistics' ? statistics(rows) : deathItems(rows);
    // Keep an unfamiliar variant intact for an editor rather than dropping part of a row.
    return html ? html.replace(/\r?\n/g, newline) : original;
  });
}

if (import.meta.main) {
  let changed = 0;
  for (const file of await readdir(articleDir, { recursive: true })) {
    if (!file.endsWith('.md')) continue;
    const path = join(articleDir, file);
    const before = await readFile(path, 'utf8');
    const after = normalizeCreatureTables(before);
    if (before !== after) {
      await writeFile(path, after);
      changed++;
    }
  }
  console.log(`Updated creature tables in ${changed} articles.`);
}
