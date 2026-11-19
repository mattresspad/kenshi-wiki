import {normalizeBuildingTables,takeLeadingBuildingPanel} from '../../src/lib/building-tables.mjs';
import {normalizeShopTables} from '../../src/lib/shop-tables.mjs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {removeImportedChecklist} from '../../src/lib/character-tables.mjs';
import {normalizeFactionTables} from '../../src/lib/faction-tables.mjs';
import {normalizeRaceTables} from '../../src/lib/race-tables.mjs';
import {origin, snapshot} from '../../src/lib/catalog.mjs';

export const hash = value => createHash('sha256').update(value).digest('hex');
const text = value => value.replace(/\s+/gu, ' ').trim();
const redirects = new Map(snapshot.redirects.map(rule => [rule.from, rule.to]));
function destination(href) {
  if (!href) return '';
  if (href.startsWith(origin + '/')) href = href.slice(origin.length);
  if (!href.startsWith('/')) return href;
  const route = href.split(/[?#]/,1)[0];
  return (redirects.get(route) ?? route) + href.slice(route.length);
}
function signature(values) { return hash(JSON.stringify(values)); }
function emptyGallery($) {
  const galleries = $('h2,h3,h4').filter((_, el) => /^gallery$/i.test($(el).text().trim()));
  return galleries.toArray().some(el => {
    const section = $(el).nextUntil('h2,h3,h4');
    return !section.find('img,video,figure').addBack('img,video,figure').length && !section.text().trim();
  });
}
// Fingerprints cover reader-visible content independently of either site's chrome.
export function articleEvidence(html, frozen, faction = false) {
  const doc = load(html);
  const area = frozen ? doc('.mw-parser-output').clone() : doc('<div></div>');
  if (frozen) area.children('.infobox,.fandom-notice').remove();
  else area.append(doc('.lead-text').contents().clone(), '\n', doc('.article-body').contents().clone());
  const $ = load(area.html(), {}, false);
  let buildingPanel=null;
  if(faction==='building'){
    normalizeBuildingTables($);
    const panel=frozen?takeLeadingBuildingPanel($):doc('.building-facts').html();
    const p=load(panel??'',{},false);
    buildingPanel={text:text(p.root().text()),links:p('a[href]').toArray().map(e=>[text(p(e).text()),destination(e.attribs.href)]),cells:p('tr').toArray().map(r=>p(r).children('th,td').toArray().map(c=>[text(p(c).text()),c.attribs.colspan??'1',c.attribs.rowspan??'1'])),ids:p('[id]').toArray().map(e=>e.attribs.id)};
  }
  if(faction==='shop')normalizeShopTables($);
  if (faction === 'character' || faction === 'item') removeImportedChecklist($);
  else if (faction === 'race') normalizeRaceTables($);
  else if (faction && faction !== 'item' && faction !== 'building' && faction !== 'shop') normalizeFactionTables($);
  // This separately checked editorial note qualifies the original imported words.
  $('.source-qualification').remove();
  const headings = $('h2,h3,h4,h5,h6').toArray().map(el => [el.name,$(el).attr('id') ?? null,text($(el).text())]);
  const ids = $('[id]').toArray().map(el => $(el).attr('id'));
  const links = root => root.find('a[href]').toArray().map(el => [text($(el).text()),destination($(el).attr('href'))]);
  const images = $('img[src]').toArray().map(el => [$(el).attr('src'),$(el).attr('alt') ?? '']);
  const inventory = $('table').toArray().filter(el => !$(el).text().trim().startsWith('The content discussed on this page')).map(el =>
    $(el).find('tr').toArray().map(row => $(row).children('th,td').toArray().map(cell =>
      [text($(cell).text()),cell.attribs.colspan ?? '1',cell.attribs.rowspan ?? '1',cell.attribs['data-sort-value'] ?? '',cell.attribs['data-sort-type'] ?? ''])));
  const facts = frozen ? doc('.mw-parser-output > .infobox') : doc('.factbox');
  const factValues = facts.find(frozen ? '.heading,.subheading,dt,dd' : 'h2,h3,dt,dd').toArray().map(el => [
    text(doc(el).text()), doc(el).find('a[href]').toArray().map(a => destination(a.attribs.href))
  ]);
  // Compare text nodes in order. Block/presentation wrappers may add whitespace but cannot replace words.
  const words = text($.root().text()).replace(/\s+/gu,'');
  return {...(faction==='building'?{buildingPanel}:{}), headings, ids, text:hash(words), links:signature(links($.root())), tables:signature(inventory),
    facts:signature(factValues), images, emptyGallery:emptyGallery($), ...(faction === 'item' ? {factMedia:{images:facts.find('img[src]').toArray().map(el=>[el.attribs.src,el.attribs.alt??'']),caption:facts.find(frozen?'.infobox-caption':'.fact-caption').text().replaceAll('\r\n','\n')}} : {})};
}
