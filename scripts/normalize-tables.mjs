// Repair presentation-only artifacts from the Fandom import. Used by the importer and this offline migration.
// node scripts/normalize-tables.mjs [--check] [--report path.json]
import { load } from 'cheerio';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const statNames = new Set(['Attributes', 'Weapon Skills', 'Combat Skills', 'Ranged Skills',
  'Thievery Skills', 'Athletic Skills', 'Science Skills', 'Trade Skills']);
const text = ($, node) => $(node).text().replace(/\s+/g, ' ').trim();
const rowsOf = ($, table) => $(table).children('thead, tbody, tfoot').children('tr').add($(table).children('tr')).toArray();
const cellsOf = ($, row) => $(row).children('th, td').toArray();
const span = ($, cell, attribute) => Number($(cell).attr(attribute) ?? 1);

// A genuinely blank data value can be significant. Only these very plain cells qualify as spacers.
function emptySpacer($, cell) {
  return !text($, cell) && !$(cell).find('*:not(br)').length
    && Object.keys(cell.attribs).every(name => ['colspan', 'rowspan', 'align', 'valign', 'width', 'height'].includes(name))
    && $(cell).contents().toArray().every(node => node.type === 'text' || node.name === 'br');
}

function trimBoundaries($, table, report) {
  // Recompute after each deletion so rowspan coordinates continue to refer to the current table.
  let removed;
  do {
    removed = false;
    const rows = rowsOf($, table);
    for (const index of [...new Set([0, rows.length - 1])]) {
      const row = rows[index];
      if (!row || Object.keys(row.attribs).length) continue;
      const cells = cellsOf($, row);
      if (!cells.length || !cells.every(cell => emptySpacer($, cell) && span($, cell, 'rowspan') === 1)) continue;
      const crossed = rows.slice(0, index).some((earlier, y) => cellsOf($, earlier)
        .some(cell => span($, cell, 'rowspan') === 0 || y + span($, cell, 'rowspan') > index));
      if (crossed) continue;
      $(row).remove();
      report.spacerRows++;
      removed = true;
      break;
    }
  } while (removed);
}

function normalizeStats($, table, report) {
  if ($(table).find('table').length) return;
  const [heading, ...body] = rowsOf($, table);
  if (!heading || !body.length) return;
  const heads = cellsOf($, heading);
  if (heads.length !== 2 || heads.some(cell => cell.name !== 'th')
      || !statNames.has(text($, heads[0])) || text($, heads[1]) !== 'Level'
      || span($, heads[0], 'colspan') !== 2 || span($, heads[1], 'colspan') !== 1) return;
  if (!body.every(row => {
    const cells = cellsOf($, row);
    return cells.length === 3 && cells.every(cell => span($, cell, 'colspan') === 1 && span($, cell, 'rowspan') === 1)
      && emptySpacer($, cells[0]);
  })) return;
  $(heads[0]).removeAttr('colspan');
  for (const row of body) $(cellsOf($, row)[0]).remove();
  report.statTables++;
}

function limbCard($, table) {
  if ($(table).find('table').length) return;
  const rows = rowsOf($, table), cells = rows.map(row => cellsOf($, row));
  if (rows.length !== 6 || cells[0].length !== 1 || cells[5].length !== 1
      || !/^Severed\s/.test(text($, cells[0][0]))
      || span($, cells[0][0], 'colspan') !== 2 || span($, cells[5][0], 'colspan') !== 2) return;
  const fields = ['Weight', 'Value', 'Sell value', 'Charges'];
  if (!cells.slice(1, 5).every((row, i) => row.length === 2 && text($, row[0]).replace(/^-\s*/, '') === fields[i])) return;
  return cells[0][0];
}

function normalizeLimbGrid($, table, report) {
  if (!$(table).find('table').length || $(table).is('.sortable, [id], [name]')) return;
  const cards = [];
  for (const row of rowsOf($, table)) {
    if (Object.keys(row.attribs).length) return;
    for (const cell of cellsOf($, row)) {
      if (emptySpacer($, cell)) continue;
      if (Object.keys(cell.attribs).some(name => !['colspan', 'align', 'valign', 'width', 'height'].includes(name))) return;
      const children = $(cell).children('table').toArray();
      if (children.length !== 1 || $(cell).contents().toArray().some(node => node !== children[0] && (node.type !== 'text' || node.data.trim()))) return;
      const title = limbCard($, children[0]);
      if (!title) return;
      cards.push({ table: children[0], title });
    }
  }
  if (cards.length < 2) return;
  const grid = $('<div class="imported-item-grid">');
  for (const card of cards) {
    const copy = $(card.table).clone().addClass('imported-property-table');
    const title = cellsOf($, rowsOf($, copy)[0])[0];
    copy.prepend($('<caption>').append($(title).contents()));
    $(title).parent().remove();
    grid.append(copy);
  }
  $(table).replaceWith(grid);
  report.limbGrids++;
}

function normalizeBuilding($, table, report) {
  if ($(table).is('.sortable, [id], [name]')) return;
  const rows = rowsOf($, table), cells = rows.map(row => cellsOf($, row));
  if (rows.length !== 3 || cells[0].length !== 1 || cells[1].length !== 2 || cells[2].length !== 1
      || !emptySpacer($, cells[1][0])) return;
  const titleTable = $(cells[0][0]).children('table'), properties = $(cells[1][1]).children('table');
  if (titleTable.length !== 1 || properties.length !== 1 || titleTable.find('table').length || properties.find('table').length) return;
  const titleRows = rowsOf($, titleTable), data = rowsOf($, properties);
  if (titleRows.length !== 1 || cellsOf($, titleRows[0]).length !== 1 || !data.length) return;
  const title = cellsOf($, titleRows[0])[0];
  if (!text($, title) || text($, cellsOf($, data[0])[0]) !== 'Type:'
      || !data.some(row => text($, cellsOf($, row)[0]) === 'Materials cost:')
      || !data.some(row => text($, cellsOf($, row)[0]) === 'Estimated build time:')) return;
  // Leave unusual wrappers with anchors or additional prose intact.
  const retained = [$(title).html(), properties.html(), $(cells[2][0]).html()].join('');
  const original = $(table).clone();
  original.find('table').remove();
  if (text($, original) !== text($, cells[2][0]) || original.find('[id], [name], a, img, svg').length
      || rows.some(row => Object.keys(row.attribs).length)
      || cells.flat().some(cell => Object.keys(cell.attribs).some(name => !['colspan', 'align', 'valign', 'width', 'height'].includes(name)))) return;
  if (!retained) return;
  const flat = properties.clone().addClass('imported-property-table');
  flat.prepend($('<caption>').append($(title).contents().clone()));
  flat.append($('<tfoot>').append($('<tr>').append($('<td colspan="2">').append($(cells[2][0]).contents().clone()))));
  $(table).replaceWith(flat);
  report.buildingCards++;
}

function fingerprint($) {
  const texts = [];
  function visit(node) {
    if (node.type === 'text') {
      const value = node.data.replace(/\s+/g, ' ').trim();
      if (value) texts.push(value);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit($.root()[0]);
  const attributes = ['id', 'name', 'href', 'src', 'srcset', 'data-sort-value'];
  const references = $('*').toArray().flatMap(node => attributes.filter(key => node.attribs[key] != null).map(key => [key, node.attribs[key]]));
  return JSON.stringify({ texts, references });
}

// Keep source offsets intact while excluding frontmatter and Markdown code examples from HTML matching.
function maskCode(markdown) {
  const mask = value => value.replace(/[^\r\n]/g, ' ');
  let masked = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, mask);
  let fence;
  masked = masked.replace(/[^\r\n]*(?:\r?\n|$)/g, line => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !line.slice(marker[0].length).trim()) fence = undefined;
      return mask(line);
    }
    if (marker) { fence = marker[1]; return mask(line); }
    return /^( {4}|\t)/.test(line) ? mask(line) : line;
  });
  return masked.replace(/(`+)[^`]*?\1/g, mask);
}

export function normalizeImportedTables(markdown) {
  const report = { statTables: 0, spacerRows: 0, limbGrids: 0, buildingCards: 0, retainedNested: [] };
  const $ = load(maskCode(markdown), { sourceCodeLocationInfo: true }, false);
  const edits = [];
  for (const table of $('table').filter((_, table) => !$(table).parents('table').length).toArray()) {
    const location = table.sourceCodeLocation;
    if (!location?.endTag) continue;
    const original = markdown.slice(location.startOffset, location.endOffset);
    const fragment = load(original, null, false);
    const before = fingerprint(fragment);
    const count = report.statTables + report.spacerRows + report.limbGrids + report.buildingCards;
    for (const child of fragment('table').toArray().reverse()) {
      trimBoundaries(fragment, child, report);
      normalizeStats(fragment, child, report);
      normalizeLimbGrid(fragment, child, report);
      normalizeBuilding(fragment, child, report);
    }
    if (fragment('table table').length) report.retainedNested.push(text(fragment, fragment('table').first()).slice(0, 100));
    if (count === report.statTables + report.spacerRows + report.limbGrids + report.buildingCards) continue;
    if (fingerprint(fragment) !== before) throw new Error('Table normalization would change text or references near: ' + text($, table).slice(0, 100));
    const html = fragment.html().replace(/\r?\n/g, markdown.includes('\r\n') ? '\r\n' : '\n');
    edits.push({ start: location.startOffset, end: location.endOffset, html });
  }
  for (const edit of edits.reverse()) markdown = markdown.slice(0, edit.start) + edit.html + markdown.slice(edit.end);
  return { markdown, report };
}

if (import.meta.main) {
  const check = process.argv.includes('--check');
  const reportPath = process.argv[process.argv.indexOf('--report') + 1];
  const articles = [];
  for (const file of await readdir('src/content/wiki', { recursive: true })) {
    if (!file.endsWith('.md')) continue;
    const path = join('src/content/wiki', file), before = await readFile(path, 'utf8');
    const { markdown, report } = normalizeImportedTables(before);
    if (before !== markdown && !check) await writeFile(path, markdown);
    articles.push({ file, changed: before !== markdown, ...report });
  }
  const totals = Object.fromEntries(['statTables', 'spacerRows', 'limbGrids', 'buildingCards'].map(key => [key, articles.reduce((sum, article) => sum + article[key], 0)]));
  if (process.argv.includes('--report')) await writeFile(reportPath, JSON.stringify({ totals, articles }, null, 2) + '\n');
  console.log(JSON.stringify({ mode: check ? 'check' : 'apply', changed: articles.filter(article => article.changed).length, ...totals,
    retainedNestedPages: articles.filter(article => article.retainedNested.length).length }));
}
