import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {articleFiles, assetRedirects as readRedirects} from './article-files.mjs';
import {recordedSource, correctionLink, moddingPortalFiles, repo} from '../src/lib/page-source.mjs';
import review from '../conversion/reviews.json' with {type:'json'};
import {load} from 'cheerio';
import {buildCatalog, categoryPath, origin, policy, snapshot} from '../src/lib/catalog.mjs';

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
const atlas = buildCatalog(transferred, snapshot, assetRedirects);
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
const items=verifyFamily('items',atlas,assetRedirects),itemIds=selectedIds('items');
const itemSources=JSON.parse(readFileSync('conversion/items/reference.json')).articles;
const characterSources=JSON.parse(readFileSync('conversion/characters/reference.json')).articles;
const animalSources=JSON.parse(readFileSync('conversion/animals/reference.json')).articles;
const geographicalSources=frozenEvidence().articles;
const factionSources=factionEvidence().articles;
const emptyGalleryIds=new Set([...geography.emptyGalleries,...review.mediaGaps.filter(gap=>gap.section==='Gallery').map(gap=>gap.articleId)]);
const initial=buildCatalog();
const htmlFile = p => path.join('dist', p==='/'?'index.html':p.slice(1)+'.html');
const routes=[];
const external=new Map();
function record(kind,url,details={}) {
  const built=atlas.local.has(url) && existsSync(htmlFile(url));
  routes.push({kind,path:url,status:built?'preserved locally':'awaiting conversion',...details});
}
for (const a of atlas.byId.values()) {
  const original = recordedSource(a.sourceFile, a.sourceRevision, snapshot.revision);
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
  const checks = {...(includedIds.has(a.id) ? {formatCheck:'scripts/geography/verify.mjs'} : {}), ...(factionIds.has(a.id) ? {formatCheck:'scripts/factions/verify.mjs'} : {}), ...(raceIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(animalIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(characterIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...(itemIds.has(a.id)?{formatCheck:'scripts/conversion/verify.mjs'}:{}), ...review.articles[a.id]};
  const media=a.filePath && (geographyIds.has(a.id) || factionIds.has(a.id) || raceIds.has(a.id) || animalIds.has(a.id) || characterIds.has(a.id) || itemIds.has(a.id)) ? {
    originalMediaComparison:'unassessed',
    emptyImportedGallery:emptyGalleryIds.has(a.id) || factions.emptyGalleries.includes(a.id) || animals.emptyGalleries.includes(a.id) || characters.emptyGalleries.includes(a.id) || items.emptyGalleries.includes(a.id),
    verifiedInfoboxImages:itemSources[a.id]?.factMedia?.images??[],
    verifiedBodyItemIcons:[...new Set(((geographicalSources[a.id] ?? factionSources[a.id] ?? animalSources[a.id] ?? characterSources[a.id] ?? itemSources[a.id])?.images ?? []).map(([url])=>url))]
  } : undefined;
  record('article',a.path,{id:a.id,media, editableFile:a.filePath, sourceFile:a.sourceFile, sourceRevision:a.sourceRevision,
    credit:a.credit, license:a.license, source:a.source, contributor:a.contributor, evidence, articleSources, correction:correctionLink(origin+a.path),
    transferred:!!a.filePath, formatChecked:!!checks.formatCheck, editoriallyReviewed:!!checks.editorialReview, checks});
}
for (const g of initial.categories.values()) record('category',g.path,{name:g.name,referenceMembers:g.members.length});
for (const url of snapshot.portals) {
  const source = url === '/modding' ? {...moddingPortalFiles, sourceRevision:snapshot.revision,
    evidence:recordedSource(moddingPortalFiles.sourceFile, snapshot.revision)} : {};
  record('portal',url,source);
}
for (const url of snapshot.utilities) record(url==='/'?'home':'utility',url);
for (const r of snapshot.redirects) {
  const present = assetRedirects.some(rule => rule.from === r.from && rule.to === r.to && rule.status === r.status);
  routes.push({kind:'redirect',path:r.from,to:r.to,httpStatus:r.status,status:present?'preserved locally':'awaiting redirect verification'});
}
for (const url of snapshot.endpoints) routes.push({kind:'endpoint',path:url,status:existsSync(path.join('dist',url.slice(1)))?'preserved locally':'awaiting conversion'});
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
if(duplicateCheck.size!==snapshot.articles.length+initial.categories.size+snapshot.utilities.length+snapshot.portals.length) throw Error('Overlapping public page identities');
const temporaryLinks=Array.from(external,([from,urls])=>({from,to:[...urls].sort()}));
const articlesAt = state => routes.filter(row=>row.kind==='article' && row[state]).map(row=>row.path);
const gaps=reportGaps(atlas,review.articles);
const report={gaps,races,animals,characters,items,revision:snapshot.revision,transferredArticles:articlesAt('transferred'),formatCheckedArticles:articlesAt('formatChecked'),reviewedArticles:articlesAt('editoriallyReviewed'),memberships, geography, factions, editorialExceptions:{...geoNotes,...factionNotes}, mediaGaps:review.mediaGaps, searchTitles:atlas.searchTitles.length,
  aliases:policy.aliases,exclusions,temporaryLinks,assetRedirects,blenderChange,routes};
mkdirSync('reports',{recursive:true});
writeFileSync('reports/routes.json',JSON.stringify(report,null,2)+'\n');
const counts=['article','category','portal','home','utility','redirect','endpoint'].map(k=>{
  const rows=routes.filter(r=>r.kind===k);
  return '| '+k+' | '+rows.length+' | '+rows.filter(r=>r.status==='preserved locally').length+' |';
});
const pendingTargets=new Set(temporaryLinks.flatMap(r=>r.to));
const lines=['# Restoration route report','','Frozen source '+snapshot.revision+'.','',
  '| Route type | Inventoried | Preserved locally |','|---|---:|---:|',...counts,'',
  'The rebuild serves '+atlas.local.size+' HTML pages. The full corpus has '+initial.categories.size+
  ' reader-facing categories and '+memberships.toLocaleString('en-US')+' distinct article memberships.','',
  'WIP has '+initial.categories.get('WIP').members.length+' members, Traders Guild has '+initial.categories.get('Traders Guild').members.length+
  ', Modding has '+initial.categories.get('Modding').members.length+' and Locations has '+initial.categories.get('Locations').members.length+'.','',
  'The excluded Fandom formatting category occurs on '+exclusions[0].articles.length+' retained reference articles.','',
  'There are '+pendingTargets.size+' distinct temporary live-wiki destinations across these pages, including linked topics and search. Each source page and destination appears in routes.json.','',
  'All '+atlas.byId.size.toLocaleString('en-US')+' articles have permanent IDs, canonical paths and pinned original files. '+
    transferred.length+' have editable FreshWiki files, '+routes.filter(r=>r.formatChecked).length+' are format checked, and '+routes.filter(r=>r.editoriallyReviewed).length+' are editorially reviewed. The title index contains '+atlas.searchTitles.length.toLocaleString('en-US')+' entries.','',
  'The JSON ledger includes article-level credits, source and correction evidence, and the four deferred guide edits from PR #43.','',
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
  '## Equipment and Items','',items.verified+' new item articles checked, '+items.headings+' headings, '+items.citationTargets+' citation targets and '+items.assets+' referenced images. Infobox image identity and caption line breaks are checked separately. Existing Backpacks retains its home and review evidence; eleven Technology/Modding records remain deferred.','',
  '## Gap register','',gaps.sourceArticles+' source articles audited. '+gaps.findings+' deduplicated records include pending conversions, inherited defects and claim questions. See gaps/index.html and gaps/register.json for every occurrence. '+gaps.introduced+' introduced regressions.','',
  '## Media restoration','',
  'The original importer omitted images. Coverage is unassessed unless there is separate evidence.','',
  ...review.mediaGaps.map(gap => '- '+atlas.byId.get(gap.articleId).title+' / '+gap.section+' — '+gap.status+'. '+gap.observation+' '+gap.source),'',
  'Milestone requires every inventoried route to have a disposition, every article to receive an existence/content/organization review, and every detected gap to be accounted for. Documented inherited gaps may remain open; introduced regressions must be fixed. Apex-domain links are not post-cutover fallbacks. Reconcile public main, settle the software license, and review staging and rollback with Prd before separate production approval.',''];
writeFileSync('reports/route-report.md',lines.join('\n'));
console.log(atlas.local.size+' HTML pages; '+memberships+' reference memberships; '+routes.length+' ledger rows.');
