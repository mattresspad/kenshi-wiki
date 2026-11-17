// Only presentation scaffolding changes; cell text, spans and ordering remain intact.
export function normalizeRaceTables($) {
  for (const table of $('table').toArray()) {
    const el=$(table), rows=el.find('tr');
    if (el.hasClass('race-normalized')) continue;
    if (rows.length===1 && el.find('ul,ol').length && !el.find('th').length) {
      const list=$('<div class="race-index"></div>');
      for(const cell of rows.children('td').toArray()) list.append($(cell).contents());
      el.replaceWith(list);
      continue;
    }
    if(el.hasClass('imported-property-table')) {
      for(const row of rows.toArray()) {
        const first=$(row).children().first();
        if($(row).children().length===2) {first[0].tagName='th'; first.attr('scope','row');}
      }
    } else if(rows.length && rows.first().children().length && !rows.first().children(':not(th)').length) {
      const headerCount=rows.length>1 && !rows.eq(1).children(':not(th)').length ? 2 : 1;
      const head=$('<thead></thead>');
      rows.slice(0,headerCount).appendTo(head);
      el.prepend(head);
      head.find('th').each((_,cell)=>$(cell).attr('scope',Number(cell.attribs.colspan??1)>1?'colgroup':'col'));
      if(headerCount===2) {
        el.addClass('race-comparison');
        let group=null;
        for(const row of rows.slice(headerCount).toArray()) {
          const cells=$(row).children();
          if(cells.length===1 && Number(cells.first().attr('colspan'))>1) {
            group=$('<tbody></tbody>');el.append(group);
            cells[0].tagName='th';cells.first().attr('scope','rowgroup');
          }
          if(!group){group=$('<tbody></tbody>');el.append(group);}
          group.append(row);
          if(cells.length>1 && cells.first().is('th'))cells.first().attr('scope','row');
        }
        el.children('tbody').filter((_,body)=>!$(body).children().length).remove();
      } else {
        for(const row of rows.slice(headerCount).toArray()) {
          const first=$(row).children().first();
          if(first.is('td') && !first.attr('colspan')) {first[0].tagName='th';first.attr('scope','row');}
        }
      }
    }
    el.addClass('race-normalized');
  }
}
