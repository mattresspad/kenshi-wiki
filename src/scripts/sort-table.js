const collator = new Intl.Collator('en', {numeric: true, sensitivity: 'base'});

for (const table of document.querySelectorAll('table[data-sortable]')) {
  const region = table.closest('.table-scroll');
  region.addEventListener('keydown', event => {
    if (event.target !== region || !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    region.scrollLeft = event.key === 'End' ? region.scrollWidth : 0;
  });
  const headers = Array.from(table.tHead.rows[0].cells);
  const body = table.tBodies[0];

  for (const header of headers) {
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
      const index = header.cellIndex;
      const numeric = header.dataset.sortType === 'number';
      const key = row => {
        const cell = row.cells[index];
        const value = (cell.dataset.sortValue ?? cell.textContent).trim();
        return numeric ? Number.parseFloat(value.replaceAll(',', '')) : value;
      };
      const rows = Array.from(body.rows);
      rows.sort((a, b) => {
        const comparison = numeric ? key(a) - key(b) : collator.compare(key(a), key(b));
        return ascending ? comparison : -comparison;
      });
      body.append(...rows);
      for (const other of headers) other.removeAttribute('aria-sort');
      header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    });
  }
}
