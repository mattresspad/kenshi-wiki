import fs from 'node:fs';
import {join} from 'node:path';
const get=file=>JSON.parse(fs.readFileSync(file));
const root='reports/factions',accepted=get('conversion/factions/acceptances.json'),last=accepted.at(-1);
const report=get(join(root,last.folder,'routes.json'));
const base='http://127.0.0.1:4392';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const link=(text,url)=>'<a href="'+esc(url)+'">'+esc(text)+'</a>';
const details=(title,items)=>'<details><summary>'+esc(title)+' ('+items.length+')</summary><ul>'+items.map(item=>'<li>'+item+'</li>').join('')+'</ul></details>';
const byId=new Map(report.routes.filter(r=>r.kind==='article').map(r=>[r.id,r]));
const byPath=new Map([...byId.values()].map(r=>[r.path,r]));
const article=id=>link(byId.get(id)?.path??'/'+id,base+(byId.get(id)?.path??'/'+id));
const proof=path=>link('Pinned source',byPath.get(path).evidence.markdown);
const baseline=get('conversion/factions/baseline-links.json'),remaining=get(join(root,last.folder,'links.json')).remaining;
const resolved=baseline.filter(p=>!remaining.includes(p)),introduced=remaining.filter(p=>!baseline.includes(p));
let count=0;
const blocks=accepted.map(batch=>{
  const evidence=get(join(root,batch.folder,'evidence.json')),delta=get(join(root,batch.folder,'links.json'));
  count+=evidence.shots.length;
  const shots=evidence.shots.map(shot=>{
    const url=batch.folder+'/'+shot.file,caption=shot.id+(shot.file.includes('outline')?' · expanded outline':shot.file.includes('right')?' · table right edge':'')+' · '+shot.device+' · '+shot.theme;
    return '<figure>'+link(caption,url)+'<a href="'+esc(url)+'"><img loading="lazy" src="'+esc(url)+'" alt="'+esc(caption)+'"></a></figure>';
  }).join('');
  return '<details class="batch" '+(batch.number===1||batch.number===8?'open':'')+' id="batch-'+batch.number+'"><summary>'+esc(batch.number+'. '+batch.name)+' — '+batch.articles+' articles, '+batch.pages+' pages</summary><div class="photos">'+shots+'</div><p>Checks: '+['build','catalog','playwright','cloudflare'].map(name=>link(name,batch.folder+'/'+name+'.log')).join(' · ')+'</p><p>Destinations: '+batch.links.resolved+' resolved, '+batch.links.introduced+' introduced, '+batch.links.remaining+' remaining. '+link('Exact paths',batch.folder+'/links.json')+'</p>'+details('New temporary paths',delta.introduced.map(esc))+details('Resolved paths',delta.resolved.map(esc))+'</details>';
}).join('');
const totalUnknown=[...report.geography.unregisteredDestinations,...report.factions.unregisteredDestinations];
const summary={revision:report.revision,htmlPages:491,transferredArticles:482,factions:95,supporting:2,batches:accepted.length,captures:count,
  preservedHeadings:report.factions.headings,preservedCitationTargets:report.factions.citationTargets,globalRedirects:report.assetRedirects.length,frozenRedirects:report.routes.filter(row=>row.kind==='redirect'&&row.status==='preserved locally').length,
  links:{resolved,introduced,remaining},missingLocalFragments:report.factions.fragmentExceptions,geographyMissingBookLinks:report.geography.unregisteredDestinations,
  newMissingBookLinks:report.factions.unregisteredDestinations,newEmptyGalleries:report.factions.emptyGalleries,priorEditorialReviews:report.reviewedArticles};
fs.writeFileSync(join(root,'summary.json'),JSON.stringify(summary,null,2)+'\n');
const style='body{max-width:76rem;margin:auto;padding:1.5rem;background:#faf8f1;color:#292b25;font:16px/1.55 system-ui}h1,h2{font-family:Georgia,serif}a{color:#215674}nav{display:flex;gap:1rem;flex-wrap:wrap}.batch{border-top:1px solid #b5b09e;padding:.8rem 0}summary{cursor:pointer;font-weight:600}details{margin:.5rem 0}.photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.8rem}figure{margin:.5rem 0;font-size:.8rem;overflow-wrap:anywhere}img{display:block;width:100%;height:auto;max-height:20rem;object-fit:contain;object-position:top left;border:1px solid #aaa}li,code{overflow-wrap:anywhere}a:focus-visible,summary:focus-visible{outline:2px solid currentColor;outline-offset:3px}@media(max-width:650px){.photos{grid-template-columns:repeat(2,minmax(0,1fr))}}';
const exceptionRows=totalUnknown.map(row=>link(row.from,base+row.from)+' → <code>'+esc(row.to)+'</code> · '+proof(row.from));
const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Factions local review</title><style>'+style+'</style><main><h1>Factions local review</h1>'+
  '<p>491 HTML pages · all 95 Factions members · two supporting guides · 639 headings and 453 citation targets preserved.</p>'+
  '<nav>'+link('Factions index',base+'/category/factions')+link('United Cities',base+'/united-cities')+link('Faction relations guide',base+'/guide-to-faction-relations')+link('Route ledger','../routes.json')+link('Data investigation','../technical-data/')+link('Earlier frame review','../')+'</nav>'+
  '<h2>Checks and scope</h2><p>Each of eight batches passed the production build, catalog suite, browser suite and Cloudflare package dry run. The final checkpoint has six catalog tests and 47 browser tests passing. '+count+' captures cover desktop and phone in both palettes. Existing geography, Holy Nation, Backpacks, font fallback and warm-cache edit-path checks remain active.</p>'+
  '<p>These are preserved source articles with formatting accepted. Factual editorial sign-off is tracked independently; the prior eight reviews remain intact.</p>'+
  '<h2 id="exceptions">Exceptions retained for review</h2>'+Object.entries(report.editorialExceptions).map(([id,note])=>'<p>'+article(id)+' · '+esc(note)+'</p>').join('')+
  '<p>The 84 empty geography galleries remain open. Red Sabres adds one empty Gallery; all other original media coverage remains unassessed. The earlier 35 body icons retain their source and notice.</p>'+
  details('Unregistered book destinations: 15 earlier links plus seven new links',exceptionRows)+
  details('Missing fragments on available faction pages',report.factions.fragmentExceptions.map(row=>esc(row.from+' → '+row.to)))+
  '<h2>Temporary destinations</h2><p>Across this family, '+resolved.length+' earlier destinations resolved locally, '+introduced.length+' new ones appeared, and '+remaining.length+' remain. '+link('Summary with exact paths','summary.json')+'</p>'+
  '<h2>Batch previews</h2>'+blocks+'</main></html>';
fs.writeFileSync(join(root,'index.html'),html);
const data=get('conversion/technical-data/results.json');
fs.copyFileSync('conversion/technical-data-investigation.md','reports/technical-data/recommendation.md');
fs.copyFileSync('conversion/technical-data/results.json','reports/technical-data/results.json');
fs.copyFileSync('conversion/technical-data/source-pins.json','reports/technical-data/source-pins.json');
fs.writeFileSync('reports/technical-data/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kenshi technical-data investigation</title><style>'+style+'</style><main><h1>Kenshi technical-data investigation</h1><p>Use small versioned JSON indexes for direct wiki lookups. Retain KDC for its validated record publication and reviewed contextual answers.</p><ul><li>Two compiler builds produced identical bytes: 8,623 records, 970 context rows and two approved contexts.</li><li>The five sampled records match between the compiler input and the pinned map export.</li><li>The live map bootstrap and four dataset files matched the pinned publication on '+esc(data.live.at)+'.</li><li>The actual map consumer selected Catun’s Fishmen takeover for Shiro’s dead and imprisoned states. This leaves the separate King Gurgler gameplay question open.</li><li>The examined tool checkouts contain uncommitted work. File checksums, rather than Git HEAD alone, identify this investigation.</li></ul><p>'+link('Full recommendation and reproduction commands','recommendation.md')+' · '+link('Results and checksums','results.json')+' · '+link('Source file pins','source-pins.json')+' · '+link('Factions review','../factions/')+'</p></main></html>');
console.log(accepted.length+' faction batches and '+count+' screenshots indexed');
