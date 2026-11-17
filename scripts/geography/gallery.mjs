import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {roster, geographyIds} from './batches.mjs';

const read = path => JSON.parse(readFileSync(path));
const base = 'http://127.0.0.1:4392';
const root = 'reports/geography';
const accepted = read('conversion/geography/acceptances.json');
const report = read(join(root, accepted.at(-1).folder, 'routes.json'));
const byId = new Map(report.routes.filter(r=>r.kind==='article').map(r => [r.id,r]));
const byPath = new Map(report.routes.filter(r=>r.kind==='article').map(r => [r.path,r]));
const local = new Set(report.routes.filter(r=>r.status==='preserved locally').map(r=>r.path));
const geoPaths = new Set([...geographyIds].map(id => byId.get(id).path));
const redirects = report.routes.filter(r => r.kind==='redirect' && geoPaths.has(r.to) && local.has(r.path));
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const link = (label,url) => '<a href="'+esc(url)+'">'+esc(label)+'</a>';
const proof = id => link('Pinned source',byId.get(id).evidence.markdown);
const localLink = id => {const row=byId.get(id);return link(row.path,base+row.path)};
const heading = text => '<h2>'+esc(text)+'</h2>';
const list = html => html.length ? '<ul>'+html.map(item=>'<li>'+item+'</li>').join('')+'</ul>' : '<p>None recorded.</p>';
const closedList = (name, html) => '<details><summary>'+esc(name)+' ('+html.length+')</summary>'+list(html)+'</details>';
const cards = [];
let screenshots = 0;
for (const b of accepted) {
  const evidence = read(join(root,b.folder,'evidence.json'));
  const delta = read(join(root,b.folder,'links.json'));
  const samples = new Map();
  for (const shot of evidence.shots) {
    const key=shot.id+(shot.anchor?'#'+shot.anchor:'');
    if(!samples.has(key))samples.set(key,[]);
    samples.get(key).push(shot);
    screenshots++;
  }
  const photos = [...samples].map(([key,shots]) => {
    const article=byId.get(shots[0].id);
    return '<h3>'+link(key,base+article.path+(shots[0].anchor?'#'+shots[0].anchor:''))+'</h3><div class="photos">'+shots.map(shot=>{
      const src=b.folder+'/'+shot.file;
      const label=(shot.device==='phone'?'390 × 844':'1440 × 900')+' · '+shot.theme;
      return '<figure><a href="'+esc(src)+'"><img loading="lazy" src="'+esc(src)+'" alt="'+esc(key+', '+label)+'"></a><figcaption>'+esc(label)+'</figcaption></figure>';
    }).join('')+'</div>';
  }).join('');
  const logLinks=['build','catalog','playwright','cloudflare'].map(name=>link(name,b.folder+'/'+name+'.log')).join(' · ');
  const incoming=roster.batches[b.number-1].ids.map(id=>localLink(id));
  cards.push('<details class="batch" id="batch-'+b.number+'" '+(b.number===1?'open':'')+'><summary>'+esc(b.number+'. '+b.name.replaceAll('-',' '))+'<small>'+b.articles+' articles · '+b.pages+' local pages</small></summary>'+
    photos+closedList('Articles in this batch',incoming)+'<p>Checks · '+logLinks+'</p>'+
    '<p>Live destinations · '+b.links.resolved+' resolved · '+b.links.introduced+' introduced · '+b.links.remaining+' remaining. '+link('Exact paths',b.folder+'/links.json')+'</p>'+
    closedList('Resolved destinations',delta.resolved.map(esc))+closedList('Introduced destinations',delta.introduced.map(esc))+
    '<p>'+link('Route report at this checkpoint',b.folder+'/route-report.md')+'</p></details>');
}
const geo=report.geography;
const reviewed = [...geographyIds].map(id=>byId.get(id)).filter(row=>row.editoriallyReviewed);
const paragraphs = Object.entries(report.editorialExceptions).map(([id,note])=>'<p>'+localLink(id)+' · '+esc(note)+' '+proof(id)+'</p>').join('');
const exceptionLink = row=>link(row.from,base+row.from)+' → <code>'+esc(row.to)+'</code> · '+proof(byPath.get(row.from).id);
const emptyIds = [...new Set([...geo.emptyGalleries, ...report.mediaGaps.filter(g=>g.section==='Gallery' && geographyIds.has(g.articleId)).map(g=>g.articleId)])].sort();
const last=accepted.at(-1);
const reference=link(report.revision.slice(0,8),'https://github.com/mattresspad/kenshi-wiki/tree/'+report.revision);
const baseline=read('conversion/geography/baseline-links.json');
const remaining=read(join(root,last.folder,'links.json')).remaining;
const netResolved=baseline.filter(url=>!remaining.includes(url)), netIntroduced=remaining.filter(url=>!baseline.includes(url));
const summary={revision:report.revision,checkpoints:accepted.length,htmlPages:last.pages,geographyArticles:last.verified+1,geographyRedirects:redirects.length,
  checkedIcons:last.icons,desktopAndPhoneCaptures:screenshots,editoriallyReviewedGeography:reviewed.map(r=>r.path),
  linkChangeSinceStart:{resolved:netResolved,introduced:netIntroduced,remaining},emptyGalleries:emptyIds,missingFragments:geo.fragmentExceptions,unregisteredDestinations:geo.unregisteredDestinations};
writeFileSync(join(root,'summary.json'),JSON.stringify(summary,null,2)+'\n');
const style=':root{color-scheme:light dark;--bg:light-dark(#fbfaf5,#171917);--ink:light-dark(#252721,#edece2);--line:light-dark(#b9b7a7,#5a5a50);--link:light-dark(#215573,#a8d8f3)}*{box-sizing:border-box}body{max-width:74rem;margin:auto;padding:1.5rem clamp(.9rem,3vw,3rem) 4rem;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui}h1,h2{font-family:Georgia,serif;line-height:1.18}h1{font-size:clamp(1.9rem,4vw,3rem);margin:.2rem 0 .5rem}h2{margin:1.8rem 0 .5rem}h3{font-size:1rem}nav{display:flex;gap:1rem;flex-wrap:wrap}a{color:var(--link)}a:focus-visible,summary:focus-visible{outline:2px solid currentColor;outline-offset:3px}details{padding:.35rem 0}summary{cursor:pointer}details.batch{border-top:1px solid var(--line);padding:.7rem 0}summary small{margin-left:.7rem}.photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem;align-items:start}figure{margin:0}figure img{display:block;border:1px solid var(--line);width:100%;height:auto;max-height:17rem;object-fit:contain;object-position:top left}figcaption,small{font-size:.85rem}li,code{overflow-wrap:anywhere}@media(max-width:650px){.photos{grid-template-columns:repeat(2,minmax(0,1fr))}summary small{display:block;margin:0 0 0 1rem}}';
const indexes=['/category/locations','/category/zones','/category/spawning-locations'].filter(path=>local.has(path)).map(path=>link(path.split('/').at(-1).replaceAll('-',' '),base+path)).join(' · ');
const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Geography conversion review · Kenshi Wiki</title><style>'+style+'</style><main>'+
  '<h1>Geography conversion review</h1><p>'+summary.geographyArticles+' geography articles · '+last.pages+' local HTML pages · '+redirects.length+' geography redirects · '+last.icons+' verified item icons. Frozen source '+reference+'.</p>'+
  '<nav>'+link('Pilot','#batch-1')+link('Bad Teeth','#batch-2')+link('Source questions and media','#exceptions')+link('Route ledger','../routes.json')+link('Link changes','summary.json')+'</nav>'+
  '<p>Open the indexes · '+indexes+'</p>'+
  heading('What still needs review').replace('<h2>','<h2 id="exceptions">')+paragraphs+
  '<p>'+reviewed.length+' geography articles have a recorded editorial review. The other transferred articles have been checked against the frozen pages; their factual claims remain open to editorial review.</p>'+
  closedList('Empty imported galleries',emptyIds.map(id=>localLink(id)+' · '+proof(id)))+
  '<p>Other original-media coverage is unassessed. The '+last.icons+' item images referenced by the article bodies match the pinned files. '+link('Artwork credits',base+'/notices/artwork.txt')+'</p>'+
  closedList('Imported links with a missing bookmark on a local destination',geo.fragmentExceptions.map(exceptionLink))+
  closedList('Imported links whose paths are outside the frozen inventory',geo.unregisteredDestinations.map(exceptionLink))+
  heading('Changes to live-wiki links')+'<p>Since the 11-page preview, '+netResolved.length+' earlier destinations have left the fallback list, '+netIntroduced.length+' new ones appear, and '+remaining.length+' distinct destinations remain. Each checkpoint below records the intervening changes.</p>'+
  closedList('Remaining temporary destinations',remaining.map(url=>link(url,'https://kenshi.wiki'+url)))+
  closedList('Geography redirects',redirects.map(r=>link(r.path,base+r.path)+' → '+link(r.to,base+r.to)))+
  heading('Batch previews')+'<p>Each batch includes desktop and phone captures in both palettes. Open a capture to see it at full size.</p>'+cards.join('')+'</main></html>';
writeFileSync(join(root,'index.html'),html);
console.log(accepted.length+' checkpoints, '+screenshots+' captures and '+emptyIds.length+' empty galleries indexed.');
