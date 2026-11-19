import assert from 'node:assert/strict';
const compact=s=>s.replace(/\s+/gu,'');
function payload($,node){const el=$(node);return {text:compact(el.text()),links:el.find('a').toArray().map(e=>[e.attribs.href,compact($(e).text())]),images:el.find('img').toArray().map(e=>[e.attribs.src,e.attribs.alt??'']),ids:el.find('[id]').addBack('[id]').toArray().map(e=>e.attribs.id)};}
export function normalizeBuildingTables($){
 const changes=[];
 // Recognize the imported title/body wrapper, not arbitrary nested data tables.
 for(const node of $('table').toArray()){
  const el=$(node);if(!node.parent||el.hasClass('building-property'))continue;
  if(el.hasClass('imported-property-table')){el.addClass('building-property');continue;}
  const rows=el.children('tbody').children('tr'),title=rows.eq(0).children('td'),body=rows.eq(1).children('td');
  if(rows.length!==2||title.length!==1||title.attr('colspan')!=='2'||body.length!==2||body.eq(0).text().trim()||!title.children('table').length)continue;
  const detail=body.eq(1).children('table');if(detail.length!==1||!/^Type:/.test(detail.text().trim()))continue;
  const titleLeaf=title.children('table').children('tbody').children('tr').children('td');
  assert.equal(titleLeaf.length,1,'Unsupported building title wrapper');assert.equal(detail.find('table').length,0,'Unsupported nested building facts');
  const before=payload($,el),out=$('<table class="wikitable imported-property-table building-property"></table>');
  out.append($('<caption></caption>').append(titleLeaf.contents().clone()),detail.children().clone());
  assert.deepEqual(payload($,out),before,'Building property flattening lost source content');el.replaceWith(out);changes.push('nested property wrapper');
 }
 for(const detail of $('details').toArray()){
  const outer=$(detail).children('table').first(),headers=outer.children('tbody').children('tr').first().children();
  if(headers.length!==2||headers.eq(0).text().trim()!=='INPUTS'||headers.eq(1).text().trim()!=='ITEMS')continue;
  const output=outer.children('tbody').children('tr').eq(1).children().eq(1);if(output.children('.building-products').length)continue;
  const leaves=output.find('table').filter((_,e)=>!$(e).find('table').length);
  if(!leaves.length)continue;
  const before=payload($,output),list=$('<ul class="building-products"></ul>');
  for(const leaf of leaves.toArray()){
   const rows=$(leaf).children('tbody').children('tr'),cells=rows.children('td');assert.equal(rows.length,1,'Unsupported product rows');assert.equal(cells.length,1,'Unsupported product cells');
   list.append($('<li></li>').append(cells.contents().clone()));
  }
  assert.deepEqual(payload($,list),before,'Recipe output flattening lost source content');output.empty().append(list);changes.push('recipe output wrappers');
 }
 // The Power overview has a three-cell layout wrapper around a navigation disclosure and its legend.
 for(const node of $('table').toArray()){
  const el=$(node),rows=el.children('tbody').children('tr'),cells=rows.children('td');
  if(rows.length===1&&cells.length===3&&!cells.eq(0).text().trim()&&cells.eq(1).children('details').children('summary').text()==='Power'&&cells.eq(2).text().startsWith('Power:')){
   const before=payload($,el),out=$('<div class="building-power-note"></div>').append(cells.eq(1).contents().clone(),cells.eq(2).contents().clone());assert.deepEqual(payload($,out),before);el.replaceWith(out);changes.push('Power overview layout wrapper');
  }
 }
 for(const node of $('table').toArray()){
  const table=$(node);if(table.hasClass('building-normalized'))continue;
  if(table.find('table').length)throw Error('Unrecognized nested building table: '+table.text().trim().slice(0,100));
  const first=table.children('tbody').children('tr').first();
  if(table.hasClass('building-property')){
   table.attr('aria-label',table.children('caption').text()+' building properties');
   for(const row of table.children('tbody').children('tr').toArray()) {const cells=$(row).children();if(cells.length===2){cells.first()[0].tagName='th';cells.first().attr('scope','row');}}
  }else{
   const isRecipe=['INPUTS','OUTPUT','ITEMS'].includes(first.children().first().text().trim());
   if(isRecipe)first.children().each((_,c)=>{c.tagName='th';$(c).attr('scope','col');});
   if(first.children().length&&!first.children(':not(th)').length){first.children().attr('scope','col');first.appendTo($('<thead></thead>').prependTo(table));}
   for(const row of table.children('tbody').children('tr').toArray()) {const cell=$(row).children().first();if(cell.is('td')&&!cell.attr('colspan')){cell[0].tagName='th';cell.attr('scope','row');}}
   if(table.children('thead').find('th').length>=5)table.addClass('building-comparison');
  }
  // Blank accepted-item labels rely on source ordering; do not detach them through sorting.
  table.removeClass('sortable').removeAttr('data-sortable').addClass('building-normalized');
 }
 return changes;
}
export function takeLeadingBuildingPanel($){
 for(const node of $.root().children().toArray()){
  const el=$(node);if(el.is('table.building-property')){const html=$.html(el);el.remove();return html;}
  if(el.is('p,.historical-notice')||el.is('table')&&el.text().trim().startsWith('The content discussed on this page'))continue;
  break;
 }
 return '';
}
