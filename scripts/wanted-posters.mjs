// Fandom's Wanted Poster template puts the title and several empty spacers in full-width rows.
export function formatWantedPoster($, table) {
  const rows = $(table).children('tbody').children('tr');
  const title = rows.children('td[colspan="2"][align="center"]:only-child')
    .filter((_, cell) => /^WANTED:\s/.test($(cell).text().trim()));
  if (title.length !== 1 || $(table).children('caption').length) return;

  $(table).prepend($('<caption>').append($('<strong>').append(title.contents())));
  title.parent().remove();
  rows.filter((_, row) => {
    const cell = $(row).children('td[colspan="2"]:only-child');
    return cell.length && cell.html().trim() === '';
  }).remove();
}
