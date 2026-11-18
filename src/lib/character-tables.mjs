// Only inert Fandom progress controls are omitted; article facts remain in source order.
export function removeImportedChecklist($) {
 for(const header of $('.table-progress-tracking-header').toArray()) {
  const table=$(header).closest('table');
  table.find('.table-progress-checkbox-cell').each((i,cell)=>{for(const input of $(cell).find('[id]').toArray())$(cell).closest('tr').children().eq(1).prepend($('<span class="bookmark" aria-hidden="true"></span>').attr('id',input.attribs.id));});
  table.find('.table-progress-checkbox-cell,.table-progress-tracking-header').remove();
 }
}
export function normalizeCharacterTables($) {
 removeImportedChecklist($);
 const starts=$('table').filter((i,t)=>$(t).find('tr').first().children().toArray().map(c=>$(c).text().trim()).join('|')==='Attributes|Level').toArray();
 if(starts.length>1&&!$('.character-statistics-warning').length)$(starts[0]).before('<aside class="source-qualification character-statistics-warning" role="note">The imported statistics contain several groups without reliable race labels. Their original order and values are preserved below; a group number does not identify a race.</aside>');
 for(const [i,start] of starts.entries()){
  const first=$(start);if(first.closest('.character-stat-grid').length)continue;
  const tables=[start];let next=first.next();
  while(next.is('table')&&tables.length<8){const cells=next.find('tr').first().children();if(cells.length!==2||cells.last().text().trim()!=='Level')break;tables.push(next[0]);next=next.next();}
  const group=$('<section class="character-stat-group"></section>').attr('aria-label',starts.length>1?'Imported statistics group '+(i+1):'Character statistics');first.before(group);
  if(starts.length>1)group.append('<p class="source-qualification character-stat-label">Imported statistics group '+(i+1)+'</p>');
  const grid=$('<div class="character-stat-grid"></div>').appendTo(group);for(const table of tables)grid.append(table);
 }
 for(const table of $('table').toArray()){
  const el=$(table);if(el.hasClass('character-normalized'))continue;
  const rows=el.children('tbody').children('tr');const first=rows.first();
  if(first.children().length&&!first.children(':not(th)').length&&!el.children('thead').length)first.appendTo($('<thead></thead>').prependTo(el));
  el.children('thead').find('th:not([scope])').attr('scope','col');
  if(el.children('thead').length){for(const row of el.children('tbody').children('tr').toArray()){const cell=$(row).children().filter((i,e)=>$(e).text().trim().length>0).first();if(cell.is('td')&&!cell.attr('colspan')){cell[0].tagName='th';cell.attr('scope','row');}}}
  if(el.is('.sortable')&&el.children('thead').find('tr').length===1&&!el.children('thead').find('[rowspan]:not([rowspan="1"])').length)el.attr('data-sortable','');
  const labels=el.children('thead').text();if(labels.includes('Noteworthy Because'))el.addClass('recruit-comparison');
  el.addClass('character-normalized');
 }
}
