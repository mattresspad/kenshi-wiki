import {normalizeShopTables} from './shop-tables.mjs';
export const discussionURL='https://steamcommunity.com/app/233860/discussions/0/2666626816211752074/';
// Events reuse the stock-table treatment. No source-marked sortable table exists in this roster.
export function normalizeEvents($){
 for(const image of $('img').toArray()){
  if(image.attribs.src===discussionURL){
   if(image.attribs.alt!=='SCIENCE')throw Error('Unexpected Tribute Round discussion label');
   $(image).replaceWith($('<a></a>').attr('href',discussionURL).text('SCIENCE'));
  }
 }
 normalizeShopTables($);
 for(const table of $('table').toArray())$(table).removeClass('sortable').removeAttr('data-sortable').addClass('event-table');
}
