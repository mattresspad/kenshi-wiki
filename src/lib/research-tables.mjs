// Research matrices retain rows, merged cells, costs and prerequisite order.
export function normalizeResearchTables($){
 for(const table of $('table').toArray()){const t=$(table);if(t.text().trim().startsWith('This article has been updated'))continue;
 t.removeClass('sortable').removeAttr('data-sortable');
 const rows=t.children('tbody').children('tr');
 if(rows.length&&rows.toArray().every(r=>$(r).children('td,th').toArray().reduce((n,c)=>n+Number(c.attribs.colspan??1),0)===2)){
 t.addClass('research-properties');
 for(const r of rows.toArray()){const cells=$(r).children('td,th');if(cells.length===2&&cells.first().find('b,strong').length){cells[0].tagName='th';cells.first().attr('scope','row');}
 if(cells.length===1&&cells.first().attr('bgcolor'))cells.first().addClass('research-band');
 }
 }
 for(const h of t.find('th').toArray())if(!h.attribs.scope)$(h).attr('scope','col');
 }
}
