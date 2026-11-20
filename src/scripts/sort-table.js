import {numericKey,numericColumn} from '../lib/table-numbers.mjs';
const collator = new Intl.Collator('en', {numeric: true, sensitivity: 'base'});

for (const region of document.querySelectorAll('.table-scroll,.code-scroll')) {
  region.addEventListener('keydown', event => {
    if (event.target !== region || !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    region.scrollLeft = event.key === 'End' ? region.scrollWidth : 0;
  });
}

for (const table of document.querySelectorAll('table[data-sortable]')) {
  const headers = Array.from(table.tHead.rows[0].cells);
  const body = table.tBodies[0];
  // Shared cells couple rows: keep the original equipment group together.
  if (!body || [...body.rows].some(row => [...row.cells].some(cell => cell.rowSpan !== 1))) continue;

  for (const header of headers) {
    if(header.classList.contains('unsortable'))continue;
    const name = header.innerText.replace(/\s+/g, ' ').trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Sort by ' + name);
    const mark = document.createElement('span');
    mark.className = 'sort-mark';
    mark.setAttribute('aria-hidden', 'true');
    // A linked column name remains a normal article link with a separate sort button.
    if (!header.querySelector('a')) {
      button.append(...header.childNodes);
    }
    button.append(mark);
    header.append(button);

    button.addEventListener('click', () => {
      const ascending = header.getAttribute('aria-sort') !== 'ascending';
      const index = headers.slice(0,header.cellIndex).reduce((columns, prior) => columns + prior.colSpan, 0);
      const key = row => {
        let column = 0;
        const cells = [...row.cells].filter(cell => {
          const start = column; column += cell.colSpan;
          return start < index + header.colSpan && column > index;
        });
        return cells.map(cell => (cell.dataset.sortValue ?? cell.textContent).trim()).filter(Boolean).join(' ');
      };
      const rows = Array.from(body.rows);
      const numeric=numericColumn(rows.map(key),header.dataset.sortType);
      rows.sort((a, b) => {
        const left = key(a), right = key(b);
        const x = numericKey(left), y = numericKey(right);
        const comparison = numeric && x!==null && y!==null ? x - y : collator.compare(left, right);
        return ascending ? comparison : -comparison;
      });
      body.append(...rows);
      for (const other of headers) other.removeAttribute('aria-sort');
      header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    });
  }
}
