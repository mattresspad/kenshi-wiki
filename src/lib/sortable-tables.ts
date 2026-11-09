// Click-to-sort for data tables, as MediaWiki's tablesorter does it: a header cell sorts its column, ascending and
// then descending. Every `sortable` table qualifies, and so does any other wiki or Markdown table in an article that has
// a header row and at least two rows below it, unless it lays out other tables. Cells may give a `data-sort-value`, and header cells a `data-sort-type` of "number" or "text";
// otherwise a column whose every value reads as a number sorts numerically. `unsortable` headers and `sortbottom` rows
// stay where they are.

type Direction = 'ascending' | 'descending';

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const numberPattern = /^[-+−]?\$?[\d,]*\.?\d+(\s*[a-z%]{0,3}\.?)?$/i;

const span = (cell: HTMLTableCellElement) => Math.max(cell.colSpan, 1);
const isHeaderRow = (row: HTMLTableRowElement) => [...row.cells].every((cell) => cell.tagName === 'TH');

function headerRows(table: HTMLTableElement) {
  const rows = [...table.rows];
  const count = rows.findIndex((row) => !isHeaderRow(row));
  return rows.slice(0, count === -1 ? rows.length : count);
}

// The rows to sort: everything below the header, without `sortbottom` rows.
function bodyRows(table: HTMLTableElement) {
  const header = new Set(headerRows(table));
  return [...table.rows].filter((row) => !header.has(row) && !row.classList.contains('sortbottom'));
}

// Lay rows out on a grid so each cell knows its column, allowing for cells that span rows or columns.
function grid(rows: HTMLTableRowElement[]) {
  const layout: HTMLTableCellElement[][] = rows.map(() => []);
  rows.forEach((row, y) => {
    let x = 0;
    for (const cell of row.cells) {
      while (layout[y][x]) x++;
      for (let dy = 0; dy < Math.max(cell.rowSpan, 1) && y + dy < rows.length; dy++) {
        for (let dx = 0; dx < span(cell); dx++) layout[y + dy][x + dx] = cell;
      }
      x += span(cell);
    }
  });
  return layout;
}

// A cell spanning several body rows is copied into each of them, so every row can move on its own.
function splitRowSpans(rows: HTMLTableRowElement[]) {
  const layout = grid(rows);
  rows.forEach((row, y) => {
    let previous: HTMLTableCellElement | null = null;
    for (const cell of new Set(layout[y].filter(Boolean))) {
      if (cell.parentElement !== row) {
        const copy = cell.cloneNode(true) as HTMLTableCellElement;
        copy.rowSpan = 1;
        row.insertBefore(copy, previous ? previous.nextSibling : row.firstChild);
        previous = copy;
      } else {
        previous = cell;
      }
    }
  });
  for (const row of rows) for (const cell of row.cells) cell.rowSpan = 1;
}

const sortKey = (cell: HTMLTableCellElement | undefined) => (cell?.dataset.sortValue ?? cell?.textContent ?? '').trim();
const toNumber = (key: string) => parseFloat(key.replace(/[,$]/g, '').replace('−', '-'));

function compareBy(keys: Map<HTMLTableRowElement, string>, numeric: boolean, direction: Direction) {
  const sign = direction === 'ascending' ? 1 : -1;
  return (a: HTMLTableRowElement, b: HTMLTableRowElement) => {
    const [first, second] = [keys.get(a)!, keys.get(b)!];
    // Empty cells go last either way.
    if (!first || !second) return Number(!first) - Number(!second);
    if (!numeric) return sign * collator.compare(first, second);
    const [x, y] = [toNumber(first), toNumber(second)];
    if (Number.isNaN(x) || Number.isNaN(y)) return Number(Number.isNaN(x)) - Number(Number.isNaN(y));
    return sign * (x - y);
  };
}

// A header spanning several columns sorts by the first of them that has any values, skipping spacer columns.
function columnKeys(rows: HTMLTableRowElement[], columns: number[]) {
  const layout = grid(rows);
  const keysOf = (column: number) => new Map(rows.map((row, y) => [row, sortKey(layout[y][column])]));
  const all = columns.map(keysOf);
  return all.find((keys) => [...keys.values()].some(Boolean)) ?? all[0];
}

function sortColumn(table: HTMLTableElement, header: HTMLTableCellElement, columns: number[], direction: Direction) {
  const rows = bodyRows(table);
  splitRowSpans(rows);
  const keys = columnKeys(rows, columns);
  const values = [...keys.values()].filter(Boolean);
  const type = header.dataset.sortType;
  const numeric = type ? type === 'number' : values.length > 0 && values.every((value) => numberPattern.test(value));

  const sorted = [...rows].sort(compareBy(keys, numeric, direction));
  const parent = rows[0]?.parentElement;
  const bottom = [...table.rows].filter((row) => row.classList.contains('sortbottom'));
  if (parent) parent.append(...sorted, ...bottom);
}

function showDirection(table: HTMLTableElement, header: HTMLTableCellElement, direction: Direction) {
  for (const cell of table.querySelectorAll<HTMLTableCellElement>('th[aria-sort]')) cell.removeAttribute('aria-sort');
  header.setAttribute('aria-sort', direction);
}

function onActivate(table: HTMLTableElement, header: HTMLTableCellElement, columns: number[]) {
  return (event: Event) => {
    if (event.target instanceof Element && event.target.closest('a')) return;
    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
    }
    const direction = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    sortColumn(table, header, columns, direction);
    showDirection(table, header, direction);
  };
}

// Each column sorts from the lowest header cell above it; a header cell gets every column it is the lowest one over.
function sortHeaders(table: HTMLTableElement) {
  const layout = grid(headerRows(table));
  const headers = new Map<HTMLTableCellElement, number[]>();
  const columns = Math.max(0, ...layout.map((row) => row.length));
  for (let x = 0; x < columns; x++) {
    const cell = layout.map((row) => row[x]).reverse().find(Boolean);
    if (cell && !cell.classList.contains('unsortable')) headers.set(cell, [...(headers.get(cell) ?? []), x]);
  }
  return headers;
}

const isLayout = (table: HTMLTableElement) => Boolean(table.parentElement?.closest('table') || table.querySelector('table'));

function makeSortable(table: HTMLTableElement) {
  if (!table.classList.contains('sortable') && isLayout(table)) return;
  if (!headerRows(table).length || bodyRows(table).length < 2) return;
  table.classList.add('jquery-tablesorter');
  for (const [header, columns] of sortHeaders(table)) {
    header.classList.add('headerSort');
    header.tabIndex = 0;
    header.title = 'Sort';
    const activate = onActivate(table, header, columns);
    header.addEventListener('click', activate);
    header.addEventListener('keydown', activate);
  }
}

export function setUpSortableTables(root: ParentNode = document) {
  const tables = 'table.sortable, .mw-parser-output table.wikitable, .mw-parser-output table:not([class])';
  root.querySelectorAll<HTMLTableElement>(tables).forEach(makeSortable);
}
