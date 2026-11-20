import assert from 'node:assert/strict';
// Recognize the imported five-row skill summary; preserve its contents as labeled fields.
export function normalizeGameplay($) {
 for(const table of $('table').toArray()){
  const el=$(table);if(el.hasClass('gameplay-normalized'))continue;
  const rows=el.children('tbody').children('tr');
  if(rows.first().children().first().text().trim()==='Stats Affected:'){
   assert.equal(rows.length,5,'Unknown skill summary row count');
   assert.deepEqual(rows.toArray().map(r=>$(r).children('th,td').length),[2,1,1,1,1],'Unknown skill summary cells');
   assert.equal(rows.eq(0).children().eq(1).attr('rowspan'),'4');
   assert.equal(rows.eq(2).text().trim(),'Ways to Train:');
   assert.equal(rows.eq(4).children().first().attr('colspan'),'2');
   assert.equal(el.find('[id],img,table').length,0,'Skill summary needs explicit nested/anchored support');
   const panel=$('<section class="skill-summary" aria-label="Skill summary"><dl></dl><div class="skill-description"></div><div class="skill-group"></div></section>');
   if(el.attr('id'))panel.attr('id',el.attr('id'));
   for(const [label,value]of [[0,1],[2,3]]){
    const field=$('<div><dt></dt><dd></dd></div>');field.find('dt').append(rows.eq(label).children().first().contents());field.find('dd').append(rows.eq(value).children().first().contents());panel.find('dl').append(field);
   }
   panel.find('.skill-description').append(rows.eq(0).children().eq(1).contents());panel.find('.skill-group').append(rows.eq(4).children().first().contents());el.replaceWith(panel);continue;
  }
  if(el.text().trim().startsWith('The content discussed on this page'))continue;
  let count=0;for(const r of rows.toArray()){if(!$(r).children().length||$(r).children(':not(th)').length)break;count++;}
  if(count){const head=$('<thead></thead>');rows.slice(0,count).appendTo(head);el.children("tbody").first().before(head);head.find('th').each((_,c)=>$(c).attr('scope',Number(c.attribs.colspan??1)>1?'colgroup':'col'));
   const width=r=>$(r).children('td,th').toArray().reduce((n,c)=>n+Number(c.attribs.colspan??1),0),columns=width(rows.eq(count-1));
   const safe=count===1&&rows.toArray().every(r=>width(r)===columns)&&!el.find('[rowspan]:not([rowspan="1"]),[colspan]:not([colspan="1"])').length;
   if(el.hasClass('sortable')&&safe)el.attr('data-sortable','');else el.removeClass('sortable').removeAttr('data-sortable');
   el.addClass('gameplay-comparison').attr('data-columns',columns);if(columns>=5)el.addClass('gameplay-wide');
   for(const row of el.children('tbody').children('tr').toArray()){const first=$(row).children('td,th').first();if(first.is('td')&&first.text().trim()&&!first.attr('colspan')){first[0].tagName='th';first.attr('scope','row');}}
  }else el.removeClass('sortable').removeAttr('data-sortable');
  el.addClass('gameplay-normalized');
 }
 for(const node of $('p,li').toArray())if($(node).text().includes('\\displaystyle'))$(node).addClass('imported-formula');
}
