import {load} from 'cheerio';

// Process Astro's rendered Markdown once at build time for both the outline and the reading surface.
export function prepareArticle(html, data, href) {
  if (typeof html !== 'string') throw Error('Missing rendered Markdown for ' + data.title);
  const $ = load(html, {}, false);
  for (const anchor of $('a[href]').toArray()) {
    const el = $(anchor);
    const target = el.attr('href');
    if (target.startsWith('/') && !target.startsWith('/images/')) el.attr('href', href(target));
  }
  const outline = [];
  for (const heading of $('h2,h3').toArray()) {
    const el = $(heading);
    const generated = el.attr('id');
    if (!generated) throw Error('Heading without a bookmark: ' + el.text());
    const id = data.headingIds[generated] ?? generated;
    el.attr({id, tabindex:'-1'});
    const item = {id, label:el.text(), children:[]};
    if (heading.tagName === 'h2' || !outline.length) outline.push(item);
    else outline.at(-1).children.push(item);
  }
  for (const [old, target] of Object.entries(data.bookmarks)) {
    const node = $('[id]').filter((_,e) => $(e).attr('id') === target);
    if (node.length !== 1) throw Error('Missing bookmark destination: ' + target);
    if ($('[id]').toArray().some(e => $(e).attr('id') === old)) throw Error('Duplicate bookmark: '+old);
    node.before($('<span></span>').attr({id:old,class:'bookmark','aria-hidden':'true'}));
  }
  for (const block of $('pre code').toArray()) $(block).text($(block).text().replace(/\n$/, ''));
  for (const header of $('table thead th').toArray()) $(header).attr('scope','col');
  for (const row of $('table tbody tr').toArray()) {
    const cell = $(row).children('td').first();
    if (cell.length) cell.replaceWith($('<th scope="row"></th>').html(cell.html()));
  }
  const intro = [];
  for (const el of $.root().children().toArray()) {
    if (el.tagName !== 'p') break;
    intro.push($.html(el));
    $(el).remove();
  }
  return {intro:intro.join('\n'), body:$.root().html(), outline};
}
