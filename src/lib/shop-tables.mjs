// Only the imported rule-only stock separator is removed; data cells remain intact.
export function normalizeShopTables($) {
 for(const row of $('table tr').toArray()){
  const el=$(row),cells=el.children('th,td');
  if(cells.length===1 && cells.first().is('th[colspan]') && !el.text().trim() && el.find('hr').length===1 && !el.is('[id]') && !el.find('[id],img,a,input').length && cells.first().children().length===1)el.remove();
 }
 for(const table of $('table').toArray()){
  const el=$(table);if(el.hasClass('shop-normalized'))continue;
  if(el.text().trim().startsWith('The content discussed on this page'))continue;
  const rows=el.children('tbody').children('tr');
  const headers=rows.filter((_,r)=>$(r).children().length&&!$(r).children(':not(th)').length);
  for(const row of headers.toArray())for(const cell of $(row).children().toArray()){
   const c=$(cell);c.attr('scope',Number(c.attr('colspan')??1)>1?'colgroup':'col');
   if(!c.text().trim()&&c.attr('colspan')==='2')c.attr('aria-label','Item');
  }
  const first=rows.first();
  if(headers.length&&first.is(headers.first())&&!el.children('thead').length)first.appendTo($('<thead></thead>').prependTo(el));
  const top=el.children('thead').find('tr'),width=top.first().children().toArray().reduce((n,c)=>n+Number(c.attribs.colspan??1),0);
  const rectangular=rows.toArray().every(r=>$(r).children().toArray().reduce((n,c)=>n+Number(c.attribs.colspan??1),0)===width);
  // Grouped inventories and malformed rows cannot safely be reordered.
  if(el.hasClass('sortable')&&headers.length===1&&top.length===1&&rectangular&&!el.find('[rowspan]:not([rowspan="1"]),[colspan]:not([colspan="1"])').length)el.attr('data-sortable','');
  else el.removeClass('sortable').removeAttr('data-sortable');
  if(headers.length){el.addClass('shop-stock');for(const r of el.children('tbody').children('tr').toArray()){
   const cell=$(r).children('td').filter((_,c)=>$(c).text().trim().length>0).first();if(cell.length&&!cell.attr('colspan')){cell[0].tagName='th';cell.attr('scope','row');}
  }}
  el.addClass('shop-normalized');
 }
 for(const p of $.root().children('p').toArray())if(/^\d+-[\w.]+\.(?:mod|base|quack)$/.test($(p).text().trim()))$(p).addClass('shop-record-id').attr('aria-label','FCS record ID');
}
