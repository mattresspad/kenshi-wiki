import {removeImportedChecklist} from './character-tables.mjs';
// Preserve every source cell and its ordering while exposing table roles and grade groups.
export function normalizeItemTables($){
 removeImportedChecklist($);
 for(const table of $('table').toArray()){
  const el=$(table);if(el.hasClass('item-normalized'))continue;
  const rows=el.children('tbody').children('tr'),first=rows.first(),second=rows.eq(1);
  const grade=/^\[(?:Prototype|Shoddy|Standard|High|Specialist|Masterwork) Grade\]$/.test(second.text().trim()) || (/^\[[^\]]+ class\]$/.test(second.text().trim())&&el.text().includes('[Model #')); 
  if(grade){const model=el.text().match(/\[Model #[^\]]+\]/)?.[0];el.addClass('item-grade-table').attr('aria-label',first.text().trim()+' '+(model??second.text().trim()));}
  if(first.children().length&&!first.children(':not(th)').length&&!el.children('thead').length){
   const head=$('<thead></thead>').prependTo(el);
   for(const row of rows.toArray()){const candidate=$(row);if(!candidate.children().length||candidate.children(':not(th)').length)break;candidate.appendTo(head);}
   head.find('th:not([scope])').each((_,cell)=>$(cell).attr('scope',Number(cell.attribs.colspan??1)>1?'colgroup':'col'));
  }
  for(const row of el.children('tbody').children('tr').toArray()){
   const cells=$(row).children(),cell=cells.filter((i,e)=>$(e).text().trim().length>0).first();
   if(cell.is('td')&&!cell.attr('colspan')&&(el.children('thead').length||grade)){cell[0].tagName='th';cell.attr('scope','row');}
  }
  if(el.hasClass('sortable')&&el.children('thead').find('tr').length===1&&!el.find('[rowspan]:not([rowspan="1"])').length)el.attr('data-sortable','');
  const width=Math.max(0,...el.children('thead').find('tr').toArray().map(r=>$(r).children().toArray().reduce((n,c)=>n+Number(c.attribs.colspan??1),0)));
  if(width>=6)el.addClass('item-comparison');
  el.addClass('item-normalized');
 }
 for(const table of $('.item-grade-table').toArray()){
  const el=$(table);if(el.closest('.item-grade-grid').length)continue;
  const list=[table];let next=el.next();while(next.is('.item-grade-table')){list.push(next[0]);next=next.next();}
  const grid=$('<div class="item-grade-grid"></div>');el.before(grid);for(const item of list)grid.append(item);
 }
}
