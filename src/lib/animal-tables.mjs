// Preserve cell order and contents while exposing headers to assistive technology.
export function normalizeAnimalTables($) {
 for(const table of $('table').toArray()) {
  const el=$(table);if(el.hasClass('animal-normalized'))continue;
  const rows=el.find('tr');
  if(rows.length && rows.first().children().length && !rows.first().children(':not(th)').length) {
   let head=el.children('thead');
   if(!head.length){head=$('<thead></thead>').prependTo(el);rows.first().appendTo(head);}
   head.find('th:not([scope])').attr('scope','col');
   for(const row of el.children('tbody').children('tr').toArray()){
    const first=$(row).children().first();
    if(first.is('td') && !first.attr('colspan')){first[0].tagName='th';first.attr('scope','row');}
   }
  }
  if(el.find('thead th').toArray().map(c=>$(c).text().trim()).join('|').startsWith('Name|Image|Drops|Spawn Area'))el.addClass('fauna-comparison');
  el.addClass('animal-normalized');
 }
}
