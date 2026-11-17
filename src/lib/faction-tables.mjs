// Convert imported layout scaffolding while retaining every word and destination.
export function normalizeFactionTables($) {
  for (const table of $('table').toArray().reverse()) {
    const element = $(table);
    const rows = element.children('tbody').children('tr');
    const cells = rows.first().children('td');
    if (rows.length === 3 && cells.length === 1 && cells.attr('colspan') === '2') {
      const labels = rows.eq(1).children('td');
      if (labels.length === 2 && labels.first().text().startsWith('From ') && labels.last().text().startsWith('Towards ')) {
        element.before($('<p></p>').append(cells.contents()));
        rows.first().remove();
        labels.each((_, cell) => { cell.tagName = 'th'; $(cell).attr('scope', 'col'); });
        rows.eq(1).appendTo($('<thead></thead>').prependTo(element));
        element.addClass('relations-table');
      }
      continue;
    }
    if (rows.length !== 1 || !element.closest('details.collapsible').length) continue;
    if (cells.length > 1 && cells.toArray().every(cell => {
      const content = $(cell);
      return content.children().length === 1 && content.children().is('dl') && !content.find('dt').length;
    })) {
      const list = $('<ul class="faction-locations"></ul>');
      for (const entry of cells.children('dl').children('dd').toArray()) list.append($('<li></li>').append($(entry).contents()));
      element.replaceWith(list);
    } else if (cells.length === 1 && !cells.attr('colspan')) {
      element.replaceWith($('<div class="faction-prose"></div>').append(cells.contents()));
    }
  }
}
