import {normalizeEvents} from './event-tables.mjs';
import {normalizeGameplay} from './gameplay-tables.mjs';
import {normalizeBuildingTables,takeLeadingBuildingPanel} from './building-tables.mjs';
import {normalizeResearchTables} from './research-tables.mjs';
import {normalizeShopTables} from './shop-tables.mjs';
import {load} from 'cheerio';
import {normalizeItemTables} from './item-tables.mjs';
import {normalizeCharacterTables} from './character-tables.mjs';
import {normalizeAnimalTables} from './animal-tables.mjs';
import {normalizeRaceTables} from './race-tables.mjs';
import {normalizeFactionTables} from './faction-tables.mjs';

// Process Astro's rendered Markdown once at build time for both the outline and the reading surface.
export function prepareArticle(html, data, href) {
  if (typeof html !== 'string') throw Error('Missing rendered Markdown for ' + data.title);
  const $ = load(html, {}, false);
  for (const anchor of $('a[href]').toArray()) {
    const el = $(anchor);
    const target = el.attr('href');
    if (target.startsWith('/') && !/^\/(?:images|notices)\//.test(target)) el.attr('href', href(target));
  }
  let buildingPanel='';
  if(data.layout==='event')normalizeEvents($);
  if(data.layout==='gameplay')normalizeGameplay($);
  if(data.layout==='shop')normalizeShopTables($);
  if(data.layout==='building'){normalizeBuildingTables($);buildingPanel=takeLeadingBuildingPanel($);}
  if (data.layout === 'technology') normalizeResearchTables($);
  if (data.layout === 'faction') normalizeFactionTables($);
  if (data.layout === 'race') normalizeRaceTables($);
  if (data.layout === 'animal') normalizeAnimalTables($);
  if (data.layout === 'item') normalizeItemTables($);
  if (data.layout === 'character') normalizeCharacterTables($);
  const imported = ['geography','faction','race','animal','character','item','building','crafting','technology','shop','gameplay','event'].includes(data.layout);
  const outline = [];
  const parents = [];
  for (const heading of $('h2,h3,h4,h5,h6').toArray()) {
    const el = $(heading);
    // Imported table headings can put their existing public fragment on a child span.
    const target = el.attr('id') ? el : el.children('.mw-headline[id]').first();
    const generated = target.attr('id');
    if (!generated) throw Error('Heading without a bookmark: ' + el.text());
    const id = data.headingIds[generated] ?? generated;
    target.attr({id, tabindex: '-1'});
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
  for (const header of $('table thead th:not([scope])').toArray()) $(header).attr('scope','col');
  for (const row of $('table tbody tr').toArray()) {
    const cell = $(row).children().first();
    if (!imported && cell.is('td') && !$(row).closest('.relations-table').length) {
      cell[0].tagName = 'th';
      cell.attr('scope', 'row');
    }
  }
  if (imported) {
    for (const table of $('table').toArray()) {
      const el = $(table);
      // Removed-content notices were imported as two layout cells.
      if (el.find('tr').length === 1 && el.text().trim().startsWith('The content discussed on this page')) {
        const notice = $('<aside class="historical-notice" role="note"></aside>');
        notice.append(el.find('td').last().contents());
        el.replaceWith(notice);
        continue;
      }
      if(['animal','technology'].includes(data.layout) && el.find('tr').length===1 && el.find('td').length===1 && el.text().trim().startsWith('This article has been updated')){
        el.attr("role","presentation").wrap('<aside class="historical-notice" role="note"></aside>');continue;
      }
      if(data.layout==='animal' && el.hasClass('animal-note')){el.wrap('<aside class="animal-care-note" role="note"></aside>');continue;}
      const label = el.find('caption').first().text() || el.prevAll('h2,h3,h4,h5,h6').first().text() || data.title;
      el.wrap($('<div class="table-scroll" role="region" tabindex="0"></div>').attr('aria-label', label + ' table'));
      const first = el.children('tbody').children('tr').first();
      if (el.is('.sortable') && !el.children('thead').length && first.children().length && !first.children(':not(th)').length && !first.children('[rowspan]').length) {
        first.children().attr('scope','col');
        first.appendTo($('<thead></thead>').prependTo(el));
        el.attr('data-sortable','');
      }
    }
  }
  const intro = [];
  for (const el of $.root().children().toArray()) {
    const openingTip = intro.length === 0 && $(el).is('.loading-tip');
    const openingFeature = imported && $(el).is('figure.quote,.historical-notice');
    if (el.tagName !== 'p' && !openingTip && !openingFeature) break;
    intro.push($.html(el));
    $(el).remove();
    if(data.layout==='event' && el.tagName==='p')break;
  }
  return {buildingPanel,intro:intro.join('\n'), body:$.root().html(), outline};
}
