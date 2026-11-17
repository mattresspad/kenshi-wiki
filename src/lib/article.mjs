import {load} from 'cheerio';

// Process Astro's rendered Markdown once at build time for both the outline and the reading surface.
export function prepareArticle(html, data, href) {
  if (typeof html !== 'string') throw Error('Missing rendered Markdown for ' + data.title);
  const $ = load(html, {}, false);
  for (const anchor of $('a[href]').toArray()) {
    const el = $(anchor);
    const target = el.attr('href');
    if (target.startsWith('/') && !/^\/(?:images|notices)\//.test(target)) el.attr('href', href(target));
  }
  const outline = [];
  const parents = [];
  for (const heading of $('h2,h3,h4').toArray()) {
    const el = $(heading);
    const generated = el.attr('id');
    if (!generated) throw Error('Heading without a bookmark: ' + el.text());
    const id = data.headingIds[generated] ?? generated;
    el.attr({id, tabindex: '-1'});
    const level = Number(heading.tagName.slice(1));
    while (parents.length && parents.at(-1).level >= level) parents.pop();
    const item = {id, label: el.text(), children: []};
    (parents.at(-1)?.item.children ?? outline).push(item);
    parents.push({level, item});
  }
  for (const target of $('sup[id^=cite_ref],li[id^=cite_note]').toArray()) $(target).attr('tabindex', '-1');
  for (const [old, target] of Object.entries(data.bookmarks)) {
    const node = $('[id]').filter((_,e) => $(e).attr('id') === target);
    if (node.length !== 1) throw Error('Missing bookmark destination: ' + target);
    if ($('[id]').toArray().some(e => $(e).attr('id') === old)) throw Error('Duplicate bookmark: '+old);
    node.before($('<span></span>').attr({id:old,class:'bookmark','aria-hidden':'true'}));
  }
  for (const block of $('pre code').toArray()) $(block).text($(block).text().replace(/\n$/, ''));
  for (const header of $('table thead th').toArray()) $(header).attr('scope','col');
  for (const row of $('table tbody tr').toArray()) {
    const cell = $(row).children().first();
    if (data.layout !== 'geography' && cell.is('td') && !$(row).closest('.relations-table').length) {
      cell[0].tagName = 'th';
      cell.attr('scope', 'row');
    }
  }
  if (data.layout === 'geography') {
    for (const table of $('table').toArray()) {
      const el = $(table);
      // Removed-content notices were imported as two layout cells.
      if (el.find('tr').length === 1 && el.text().trim().startsWith('The content discussed on this page')) {
        const notice = $('<aside class="historical-notice" role="note"></aside>');
        notice.append(el.find('td').last().contents());
        el.replaceWith(notice);
        continue;
      }
      const label = el.prevAll('h2,h3,h4').first().text() || data.title;
      el.wrap($('<div class="table-scroll" role="region" tabindex="0"></div>').attr('aria-label', label + ' table'));
      const first = el.children('tbody').children('tr').first();
      if (el.is('.sortable') && first.children().length && !first.children(':not(th)').length && !first.children('[rowspan]').length) {
        first.children().attr('scope','col');
        first.appendTo($('<thead></thead>').prependTo(el));
        el.attr('data-sortable','');
      }
    }
  }
  const intro = [];
  for (const el of $.root().children().toArray()) {
    const openingTip = intro.length === 0 && $(el).is('.loading-tip');
    const openingFeature = data.layout === 'geography' && $(el).is('figure.quote,.historical-notice');
    if (el.tagName !== 'p' && !openingTip && !openingFeature) break;
    intro.push($.html(el));
    $(el).remove();
  }
  return {intro:intro.join('\n'), body:$.root().html(), outline};
}
