import {utilityFiles} from './utility-files.mjs';
import {proseUtilities,originalUtilities,utilitySource,historicalSourceRedirects,utilityStage} from '../src/lib/utility-routes.mjs';
import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {articleFiles, assetRedirects as readRedirects} from './article-files.mjs';
import {recordedSource, correctionLink, portalFiles, repo} from '../src/lib/page-source.mjs';
import review from '../conversion/reviews.json' with {type:'json'};
import {load} from 'cheerio';
import {buildCatalog, categoryPath, origin, policy, snapshot, effectiveSnapshot} from '../src/lib/catalog.mjs';

import {verifyGeography} from './geography/verify.mjs';
import {verifyFactions} from './factions/verify.mjs';
import {verifyFamily} from './conversion/verify.mjs';
import {selectedIds} from './conversion/batches.mjs';
import {reportGaps} from './gaps/report.mjs';
import factionNotes from '../conversion/factions/notes.json' with {type:'json'};
import {includedIds as factionIds, frozenEvidence as factionEvidence} from './factions/batches.mjs';
import geoNotes from '../conversion/geography/notes.json' with {type:'json'};
import {includedIds,geographyIds,frozenEvidence} from './geography/batches.mjs';
import blenderChange from '../conversion/pr-43.json' with {type:'json'};

const transferred = articleFiles();
const assetRedirects = readRedirects('dist/_redirects');
const atlas = buildCatalog(transferred, effectiveSnapshot, assetRedirects);
for (const [id, checks] of Object.entries(review.articles)) {
  if (!atlas.byId.get(id)?.filePath) throw Error('Missing local file for reviewed article ' + id);
  for (const proof of Object.values(checks)) if (!existsSync(proof)) throw Error('Missing conversion evidence ' + proof);
}
for (const gap of review.mediaGaps) if (!atlas.byId.has(gap.articleId)) throw Error('Unknown article for media gap ' + gap.articleId);
const geography = verifyGeography(atlas, assetRedirects);
const factions=verifyFactions(atlas,assetRedirects);
const races=verifyFamily('races',atlas,assetRedirects),raceIds=selectedIds('races');
const animals=verifyFamily('animals',atlas,assetRedirects),animalIds=selectedIds('animals');
const characters=verifyFamily('characters',atlas,assetRedirects),characterIds=selectedIds('characters');
const crafting=verifyFamily('crafting',atlas,assetRedirects),craftingIds=selectedIds('crafting');
const remainder=verifyFamily('remainder',atlas,assetRedirects),remainderIds=selectedIds('remainder');
const remainderSources=JSON.parse(readFileSync('conversion/remainder/reference.json')).articles;
const manufacturers=verifyFamily('manufacturers',atlas,assetRedirects),manufacturerIds=selectedIds('manufacturers');
const manufacturerSources=JSON.parse(readFileSync('conversion/manufacturers/reference.json')).articles;
const pr44=verifyFamily('pr44',atlas,assetRedirects);
const modding=verifyFamily('modding',atlas,assetRedirects),moddingIds=selectedIds('modding');
const moddingSources=JSON.parse(readFileSync('conversion/modding/reference.json')).articles;
const lore=verifyFamily('lore',atlas,assetRedirects),loreIds=selectedIds('lore');
const loreSources=JSON.parse(readFileSync('conversion/lore/reference.json')).articles;
const events=verifyFamily('events',atlas,assetRedirects),eventIds=selectedIds('events');
const eventSources=JSON.parse(readFileSync('conversion/events/reference.json')).articles;
const gameplay=verifyFamily('gameplay',atlas,assetRedirects),gameplayIds=selectedIds('gameplay');
const gameplaySources=JSON.parse(readFileSync('conversion/gameplay/reference.json')).articles;
const shops=verifyFamily('shops',atlas,assetRedirects),shopIds=selectedIds('shops');
const shopSources=JSON.parse(readFileSync('conversion/shops/reference.json')).articles;
const technology=verifyFamily('technology',atlas,assetRedirects),technologyIds=selectedIds('technology');
const technologySources=JSON.parse(readFileSync('conversion/technology/reference.json')).articles;
const craftingSources=JSON.parse(readFileSync('conversion/crafting/reference.json')).articles;
const buildings=verifyFamily('buildings',atlas,assetRedirects),buildingIds=selectedIds('buildings');
const buildingSources=JSON.parse(readFileSync('conversion/buildings/reference.json')).articles;
const items=verifyFamily('items',atlas,assetRedirects),itemIds=selectedIds('items');
const itemSources=JSON.parse(readFileSync('conversion/items/reference.json')).articles;
const characterSources=JSON.parse(readFileSync('conversion/characters/reference.json')).articles;
const animalSources=JSON.parse(readFileSync('conversion/animals/reference.json')).articles;
const geographicalSources=frozenEvidence().articles;
const factionSources=factionEvidence().articles;
const emptyGalleryIds=new Set([...geography.emptyGalleries,...review.mediaGaps.filter(gap=>gap.section==='Gallery').map(gap=>gap.articleId)]);
const workIndex=JSON.parse(readFileSync('dist/pages-needing-work/index.json'));
const workRoutes=workIndex.routes;
for(const route of workRoutes)atlas.local.add(route.path);
const initial=buildCatalog();
const htmlFile = p => path.join('dist', p==='/'?'index.html':p.slice(1)+'.html');
const routes=[];
const external=new Map();
function record(kind,url,details={}) {
  const built=atlas.local.has(url) && existsSync(htmlFile(url));
  routes.push({kind,path:url,status:built?'preserved locally':'awaiting conversion',...details});
}
for (const a of atlas.byId.values()) {
  const original = recordedSource(a.sourceFile, a.sourceRevision, a.historyRevision??snapshot.revision);
  const evidence = {...original, originalCommit:repo+'/commit/'+a.originalCommit,
    license:'https://creativecommons.org/licenses/by-sa/'+a.license+'/', citations:a.evidence ?? [], sourceLinks:a.sourceLinks ?? []};
  if (typeof a.source === 'object') {
    const page = 'https://kenshi.fandom.com/wiki/' + encodeURIComponent(a.source.title.replaceAll(' ', '_'));
    evidence.importRevision = page + '?oldid=' + a.source.revision;
    evidence.contributorHistory = page + '?action=history';
  }
  let articleSources = [];
  if (a.filePath) {
    const $ = load(readFileSync(htmlFile(a.path), 'utf8'));
    if ($('article[data-article-id]').attr('data-article-id') !== a.id) throw Error('Rendered ID differs for '+a.path);
    const editFiles = $('.edit-file code').toArray();
    const edits = $('a').filter((_, el) => $(el).text() === 'Edit on GitHub').toArray();
    if (editFiles.length ? editFiles.some(el => $(el).text() !== a.filePath) :
        !edits.length || edits.some(el => !$(el).attr('href').endsWith('/'+a.filePath.split('/').map(encodeURIComponent).join('/')))) {
      throw Error('Rendered editable path differs for ' + a.id);
    }
    const expectedLinks=[original.markdown,original.history,correctionLink(origin+a.path)];
    const renderedLinks=$('.source-links a').toArray().map(el=>$(el).attr('href'));
    if (renderedLinks.length!==expectedLinks.length || renderedLinks.some((url,i)=>url!==expectedLinks[i])) throw Error('Source history or correction address differs for '+a.id);
    articleSources = $('#source-history').nextUntil('h2').find('a[href]').toArray().map(el=>({
      label:$(el).text(), href:new URL($(el).attr('href'),origin+a.path).href
    }));
  }
  const checks = {...(includedIds.has(a.id) ? {formatCheck:'scripts/geography/verify.mjs'} : {}), ...(factionIds.has(a.id) ? {formatCheck:'scripts/factions/verify.mjs'} : {}), ...(raceIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(animalIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(characterIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(itemIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(buildingIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(craftingIds.has(a.id)||technologyIds.has(a.id)||shopIds.has(a.id)||gameplayIds.has(a.id)||eventIds.has(a.id)||loreIds.has(a.id)||moddingIds.has(a.id)||manufacturerIds.has(a.id)||remainderIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...review.articles[a.id]};
  const media=a.filePath && (geographyIds.has(a.id) || factionIds.has(a.id) || raceIds.has(a.id) || animalIds.has(a.id) || characterIds.has(a.id) || itemIds.has(a.id) || buildingIds.has(a.id) || craftingIds.has(a.id) || technologyIds.has(a.id) || shopIds.has(a.id) || gameplayIds.has(a.id) || eventIds.has(a.id) || loreIds.has(a.id) || moddingIds.has(a.id) || manufacturerIds.has(a.id) || remainderIds.has(a.id)) ? {
    originalMediaComparison:'unassessed',
    emptyImportedGallery:emptyGalleryIds.has(a.id) || factions.emptyGalleries.includes(a.id) || animals.emptyGalleries.includes(a.id) || characters.emptyGalleries.includes(a.id) || items.emptyGalleries.includes(a.id) || buildings.emptyGalleries.includes(a.id) || shops.emptyGalleries.includes(a.id) || gameplay.emptyGalleries.includes(a.id) || events.emptyGalleries.includes(a.id) || lore.emptyGalleries.includes(a.id) || modding.emptyGalleries.includes(a.id) || manufacturers.emptyGalleries.includes(a.id) || remainder.emptyGalleries.includes(a.id),
    verifiedInfoboxImages:itemSources[a.id]?.factMedia?.images??[],
    verifiedBodyItemIcons:[...new Set(((geographicalSources[a.id] ?? factionSources[a.id] ?? animalSources[a.id] ?? characterSources[a.id] ?? itemSources[a.id] ?? buildingSources[a.id] ?? craftingSources[a.id] ?? technologySources[a.id] ?? shopSources[a.id] ?? gameplaySources[a.id] ?? eventSources[a.id] ?? loreSources[a.id] ?? moddingSources[a.id] ?? manufacturerSources[a.id] ?? remainderSources[a.id])?.images ?? []).map(([url])=>url))]
  } : undefined;
  record('article',a.path,{id:a.id,media, editableFile:a.filePath, sourceFile:a.sourceFile, sourceRevision:a.sourceRevision,
    credit:a.credit, license:a.license, source:a.source, contributor:a.contributor, evidence, articleSources, correction:correctionLink(origin+a.path),
    transferred:!!a.filePath, formatChecked:!!checks.formatCheck, editoriallyReviewed:!!checks.editorialReview, checks});
}
for (const g of initial.categories.values()) record('category',g.path,{name:g.name,referenceMembers:g.members.length});
for (const url of snapshot.portals) {
  const source = portalFiles[url] ? {...portalFiles[url], sourceRevision:snapshot.revision,
    evidence:recordedSource(portalFiles[url].sourceFile, snapshot.revision)} : {};
  record('portal',url,source);
}
for (const url of snapshot.utilities) {const definition=proseUtilities.find(p=>p.path===url),entry=definition&&utilityFiles().find(e=>e.data.pageId===definition.id);record(url==='/'?'home':'utility',url,definition?{editableFile:entry?.filePath,sourceFile:definition.sourceFile,sourceRevision:snapshot.revision,evidence:recordedSource(definition.sourceFile,snapshot.revision)}:{});}
for (const definition of originalUtilities) {
  const entry=utilityFiles().find(e=>e.data.pageId===definition.id);
  if(!entry)throw Error('Missing original utility '+definition.id);
  record('utility',definition.path,{provenance:'original',disposition:'Added FreshWiki guidance; outside the frozen restoration inventory',editableFile:entry.filePath,sourceFile:entry.filePath,sourceRevision:'main',license:'4.0',evidence:utilitySource(definition,entry.filePath)});
}
for(const route of workRoutes)record('utility',route.path,{generated:true,noindex:route.path!=='/pages-needing-work'});
routes.push({kind:'endpoint',path:'/pages-needing-work/index.json',status:'preserved locally',generated:true});
for (const r of snapshot.redirects) {
  const present = assetRedirects.some(rule => rule.from === r.from && rule.to === r.to && rule.status === r.status);
  routes.push({kind:'redirect',path:r.from,to:r.to,httpStatus:r.status,status:present?'preserved locally':'awaiting redirect verification'});
}
for(const r of assetRedirects.filter(r=>!snapshot.redirects.some(old=>old.from===r.from)&&!historicalSourceRedirects.some(old=>old.from===r.from)))routes.push({kind:'redirect',path:r.from,to:r.to,httpStatus:r.status,status:'preserved locally',disposition:'retained compatibility alias',evidence:'public/_redirects at rebuild baseline 6f8c6df'});
for (const url of snapshot.endpoints) {const historical=historicalSourceRedirects.find(r=>r.from===url&&assetRedirects.some(a=>a.from===r.from&&a.to===r.to));routes.push({kind:'endpoint',path:url,status:historical||existsSync(path.join('dist',url.slice(1)))?'preserved locally':'awaiting conversion',...(historical?{disposition:'external historical endpoint',to:historical.to,httpStatus:historical.status}:{})});}
for (const url of atlas.local) {
  if (!existsSync(htmlFile(url))) throw Error('Missing approved route '+url);
  const $=load(readFileSync(htmlFile(url),'utf8'));
  for (const a of $('a[href],form[action]').toArray()) {
    const target=$(a).attr('href')||$(a).attr('action');
    if (!target?.startsWith(origin+'/')) continue;
    const u=new URL(target);
    if (atlas.local.has(u.pathname)) throw Error('Reviewed page still links to production: '+url+' -> '+target);
    if (!external.has(url)) external.set(url,new Set());
    external.get(url).add(u.pathname);
  }
}
const exclusions=Object.keys(policy.excluded).map(name=>({
  name, reason:policy.excluded[name],path:categoryPath(name),
  articles:snapshot.articles.filter(a=>a.categories.includes(name)).map(a=>a.path)
}));
const memberships=[...initial.categories.values()].reduce((n,g)=>n+g.members.length,0);
const duplicateCheck=new Set(routes.filter(r=>['article','category','utility','portal','home'].includes(r.kind)).map(r=>r.path));
if(duplicateCheck.size!==effectiveSnapshot.articles.length+initial.categories.size+snapshot.utilities.length+originalUtilities.length+snapshot.portals.length+workRoutes.length) throw Error('Overlapping public page identities');
if(utilityStage>=4){routes.push({kind:'error',path:'/404.html',status:'preserved locally',noindex:true,canonical:null,missingRequestStatus:404});routes.push({kind:'endpoint',path:'/pagefind/pagefind.js',status:existsSync('dist/pagefind/pagefind.js')?'preserved locally':'missing generated index',disposition:'generated Pagefind 1.6.0 assets under reserved /pagefind/'});}
const temporaryLinks=Array.from(external,([from,urls])=>({from,to:[...urls].sort()}));
const articlesAt = state => routes.filter(row=>row.kind==='article' && row[state]).map(row=>row.path);
const gaps=reportGaps(atlas,review.articles);
const searchCoverage=utilityStage>=4?JSON.parse(readFileSync('reports/utilities/search-coverage.json')):null;
if(utilityStage>=4 && temporaryLinks.length)throw Error('Temporary prototype links remain');
const report={searchCoverage:searchCoverage?{indexed:searchCoverage.indexed,random:searchCoverage.random.count,report:'utilities/search-coverage.json'}:null,remainder,manufacturers,pr44,contributions:{baselineArticles:snapshot.articles.length,acceptedAdditions:effectiveSnapshot.articles.length-snapshot.articles.length},modding,lore,events,gameplay,shops,gaps,races,animals,characters,items,buildings,crafting,technology,revision:snapshot.revision,transferredArticles:articlesAt('transferred'),formatCheckedArticles:articlesAt('formatChecked'),reviewedArticles:articlesAt('editoriallyReviewed'),memberships, geography, factions, editorialExceptions:{...geoNotes,...factionNotes}, mediaGaps:review.mediaGaps, searchTitles:atlas.searchTitles.length,
  aliases:policy.aliases,exclusions,temporaryLinks,assetRedirects,blenderChange,routes};
mkdirSync('reports',{recursive:true});
writeFileSync('reports/routes.json',JSON.stringify(report,null,2)+'\n');
const counts=['article','category','portal','home','utility','redirect','endpoint','error'].map(k=>{
  const rows=routes.filter(r=>r.kind===k);
  return '| '+k+' | '+rows.length+' | '+rows.filter(r=>r.status==='preserved locally').length+' |';
});
const pendingTargets=new Set(temporaryLinks.flatMap(r=>r.to));
const lines=['# Restoration route report','','Frozen source '+snapshot.revision+'.','',
  'Immutable baseline: '+snapshot.articles.length+' articles. Separately accepted additions: '+(effectiveSnapshot.articles.length-snapshot.articles.length)+'. Effective registry: '+effectiveSnapshot.articles.length+' articles; addition provenance is retained separately in conversion/additions.json.','',
  'Additional original FreshWiki utilities: '+originalUtilities.length+'. These current pages are recorded separately from the frozen restoration inventory.','',
  '| Route type | Inventoried | Preserved locally |','|---|---:|---:|',...counts,'',
  'The rebuild serves '+atlas.local.size+' HTML pages. The full corpus has '+initial.categories.size+
  ' reader-facing categories and '+memberships.toLocaleString('en-US')+' distinct article memberships.','',
  'WIP has '+initial.categories.get('WIP').members.length+' members, Traders Guild has '+initial.categories.get('Traders Guild').members.length+
  ', Modding has '+initial.categories.get('Modding').members.length+' and Locations has '+initial.categories.get('Locations').members.length+'.','',
  'The excluded Fandom formatting category occurs on '+exclusions[0].articles.length+' retained reference articles.','',
  'There are '+pendingTargets.size+' distinct temporary live-wiki destinations across these pages, including linked topics and search. Each source page and destination appears in routes.json.','',
  'All '+atlas.byId.size.toLocaleString('en-US')+' articles have permanent IDs, canonical paths and pinned original files. '+
    transferred.length+' have editable FreshWiki files, '+routes.filter(r=>r.formatChecked).length+' are format checked, and '+routes.filter(r=>r.editoriallyReviewed).length+' are editorially reviewed. The title index contains '+atlas.searchTitles.length.toLocaleString('en-US')+' entries.','',
  'The JSON ledger includes article-level credits, source and correction evidence, and the four accepted guide edits from PR #43.','',
  '## Geography','',
  geography.familyPages+' geography articles are local, including the previously reviewed Catun. '+geography.redirects.length+' frozen redirects to this family are active.',
  geography.verified+' new articles checked against the pinned rendered source, including '+geography.headings+' headings and '+geography.citationTargets+' citation targets. '+geography.assets+' distinct referenced item icons verified.',
  geography.emptyGalleries.length+' empty imported galleries among the new articles and '+geography.fragmentExceptions.length+' source links to missing local fragments are listed by article in the ledger. '+geography.unregisteredDestinations.length+' article links have destinations outside the frozen route inventory. Other media coverage is unassessed.','',
  ...Object.entries(geoNotes).map(([id,note])=>'- '+atlas.byId.get(id).title+' — '+note),'',
  '## Factions','',
  factions.familyPages+' faction and supporting pages are local, including The Holy Nation. '+factions.redirects.length+' frozen redirects to this family are active.',
  factions.verified+' new articles checked against the pinned rendered source, including '+factions.headings+' headings and '+factions.citationTargets+' citation targets.',
  factions.emptyGalleries.length+' empty imported galleries, '+factions.fragmentExceptions.length+' missing local fragments and '+factions.unregisteredDestinations.length+' unregistered destinations are recorded in routes.json. Other media coverage is unassessed.','',
  ...Object.entries(factionNotes).map(([id,note])=>'- '+atlas.byId.get(id).title+' — '+note),'',
  '## Races','',races.verified+' race and supporting articles checked, '+races.headings+' headings and '+races.citationTargets+' citation targets.','',
  '## Animals','',animals.verified+' new animal and supporting articles checked, '+animals.headings+' headings, '+animals.assets+' referenced item icons. Five existing faction articles are reused without duplicate files.','',
  '## Characters','',characters.verified+' new character articles checked, '+characters.headings+' headings, '+characters.citationTargets+' citation targets and '+characters.assets+' referenced item icons. Forty-two animal articles and World States retain their existing editorial homes.','',
  '## Equipment and Items','',items.verified+' new item articles checked, '+items.headings+' headings, '+items.citationTargets+' citation targets and '+items.assets+' referenced images. Infobox image identity and caption line breaks are checked separately. Existing Backpacks retains its home and review evidence; Technology deferrals are tracked separately from the three Modding records.','',
  '## Buildings','',buildings.verified+' new building articles checked, '+buildings.headings+' headings, '+buildings.citationTargets+' citation targets and '+buildings.assets+' existing item icons verified. Property panels and recipe wrappers preserve their contents. Building making tutorial remains deferred to Modding; Crafting/Construction and Technology retain separate conversion rosters.','',
  '## Crafting / Construction','',crafting.verified+' practical articles checked; '+crafting.headings+' headings preserved.','',
  '## Shops, Residents and Traders','',shops.verified+' new articles checked; '+shops.headings+' headings, '+shops.citationTargets+' citation targets and '+shops.assets+' pinned item icons preserved. Availability is distinct from verified trading behavior.','',
  '## Technology','',technology.verified+' research articles checked; '+technology.headings+' headings and '+technology.redirects.length+' redirects preserved. Costs, prerequisites and unlocks remain imported claims, not gameplay validation.','',
  '## Final baseline articles','',remainder.verified+' final articles checked; '+remainder.headings+' preserved headings and '+remainder.citationTargets+' citation targets. Historical context is separate from the preserved article bodies.','',
  '## Manufacturers and historical remainder','',manufacturers.verified+' articles checked; '+manufacturers.headings+' headings, '+manufacturers.redirects.length+' newly activated redirects and '+manufacturers.assets+' pinned item images. Historical versions, blank values and qualifications remain distinct from verified mechanics.','',
  '## Books and Lore','',lore.verified+' new articles checked; '+lore.headings+' headings and '+lore.citationTargets+' citation targets. Recorded book text and in-world claims retain their source qualifications.','',
  '## Events','',events.verified+' articles checked; '+events.headings+' headings and '+events.citationTargets+' citation targets preserved. Event conditions remain imported claims.','',
  '## Gameplay, Skills and player guides','',gameplay.verified+' new articles checked; '+gameplay.headings+' headings and '+gameplay.citationTargets+' citation targets. Imported formulas and blank values remain qualified.','',
  '## Gap register','',gaps.sourceArticles+' source articles audited. '+gaps.findings+' deduplicated records include pending conversions, inherited defects and claim questions. See gaps/index.html and gaps/register.json for every occurrence. '+gaps.introduced+' introduced regressions.','',
  '## Media restoration','',
  'The original importer omitted images. Coverage is unassessed unless there is separate evidence.','',
  ...review.mediaGaps.map(gap => '- '+atlas.byId.get(gap.articleId).title+' / '+gap.section+' — '+gap.status+'. '+gap.observation+' '+gap.source),'',
  'Milestone requires every inventoried route to have a disposition, every article to pass transfer and format preservation, and every detected gap to be accounted for; substantive editorial review may continue after deployment. Documented inherited gaps may remain open; introduced regressions must be fixed. Apex-domain links are not post-cutover fallbacks. Reconcile public main, verify the recorded MIT licensing boundaries, and review staging and rollback with Prd before separate production approval.',''];
writeFileSync('reports/route-report.md',lines.join('\n'));
console.log(atlas.local.size+' HTML pages; '+memberships+' reference memberships; '+routes.length+' ledger rows.');
