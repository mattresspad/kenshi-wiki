import {projectWorkIndex,compactWorkIndex} from '../../src/lib/work-index.mjs';
import {resolveWorkFindings} from '../../src/lib/work-findings.mjs';
import {workRoute} from '../../src/lib/work-routes.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {families,selectedIds} from '../conversion/batches.mjs';
import {validateResolution} from './core.mjs';
import {snapshot,origin} from '../../src/lib/catalog.mjs';
import {discover,regressions,extractPage,targetOf,digest} from './core.mjs';
const htmlPath=path=>'dist/'+(path==='/'?'index':path.slice(1))+'.html';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function reportGaps(atlas,articleReviews={}) {
  const baseline=JSON.parse(readFileSync('conversion/gaps/source.json'));
  const curated=JSON.parse(readFileSync('conversion/gaps/register.json'));
  assert.equal(baseline.revision,snapshot.revision);assert.equal(curated.revision,snapshot.revision);
  assert.equal(baseline.pages.filter(p=>!p.id.startsWith('route:')).length,2184);
  const sourcePages=new Map(baseline.pages.map(p=>[p.id,p]));
  const sourceByPath=new Map(baseline.pages.map(p=>[p.path,p]));
  const frozenRedirects=new Map(baseline.redirects.map(r=>[r.from,r.to]));
  const detected=discover(baseline,new Set(baseline.registeredRoutes),frozenRedirects);
  const curatedIds=new Set(curated.findings.map(r=>r.id));
  assert.equal(curatedIds.size,curated.findings.length,'Duplicate gap IDs');
  for(const id of detected.keys())assert.ok(curatedIds.has(id),'Unregistered finding '+id);
  const redirects=new Map(snapshot.redirects.map(r=>[r.from,r.to]));
  const registered=new Set([...atlas.articles.keys(),...[...atlas.categories.values()].map(c=>c.path),...snapshot.portals,...snapshot.utilities,...snapshot.endpoints,workRoute,...Object.keys(baseline.assets)]);
  const local=new Map();
  for(const path of atlas.local){
    const id=atlas.articles.get(path)?.id??'route:'+path;
    local.set(path,{id,path,...extractPage(readFileSync(htmlPath(path),'utf8'),{path,fresh:true})});
  }
  const currentSourcePages=baseline.pages.map(p=>({...p,path:atlas.byId.get(p.id)?.path??p.path}));
  const currentProblems=[];
  for(const page of local.values()){
    if(page.path===workRoute || page.path.startsWith(workRoute+'/'))continue;
    const old=sourcePages.get(page.id);
    for(const problem of regressions(page,old,currentSourcePages,registered,redirects,local,path=>existsSync(join('dist',decodeURIComponent(path.slice(1)))))){
      assert.equal(problem.origin,'inherited','Introduced '+problem.kind+' in '+page.path+': '+problem.href);
      const frozenTarget=targetOf(problem.href,old?.path??page.path,frozenRedirects);
      const id=problem.kind+':'+(problem.kind==='destination'?frozenTarget.path:frozenTarget.target);
      assert.ok(curatedIds.has(id),'Unregistered current finding '+id);
      currentProblems.push({pageId:page.id,...problem});
    }
    for(const item of page.media){
      const target=targetOf(item.url,page.path,redirects);if(!target)continue;
      const asset=baseline.assets[target.path];
      if(asset?.exists)assert.ok(existsSync(join('dist',decodeURIComponent(target.path.slice(1)))),'Introduced missing media in '+page.path+': '+item.url);
    }
  }
  const familyOf=id=>{const matches=Object.entries(families).filter(([,f])=>f.roster.batches.some(b=>b.ids.includes(id))||(f.roster.members??[]).includes(id)).map(([name])=>name);if(matches.length)return matches;const a=atlas.byId.get(id);return [a?.filePath?.split('/')[3]??(a?.categories?.[0]??'navigation')];};
  const rows=resolveWorkFindings({curated,detected,baseline,sourcePages,sourceByPath,redirects,atlas,local,assetExists:p=>existsSync(join('dist',decodeURIComponent(p.slice(1)))),assetBytes:p=>readFileSync(join('dist',decodeURIComponent(p.slice(1)))),familyOf});
  rows.sort((a,b)=>a.priority.localeCompare(b.priority)||a.target.localeCompare(b.target)||a.kind.localeCompare(b.kind));
  const formattedIds=new Set(Object.keys(families).flatMap(f=>[...selectedIds(f)]));
  const closureFile='conversion/gaps/resolutions.json';
  const resolutionHistory=existsSync(closureFile)?JSON.parse(readFileSync(closureFile)).records:[];
  const coverage=snapshot.articles.map(a=>({
    id:a.id,path:a.path,sourceFile:a.sourceFile,sourceRevision:a.sourceRevision,
    sourceSha256:sourcePages.get(a.id).sourceSha256,automatedSourceAudit:'complete',
    transferred:!!atlas.byId.get(a.id).filePath,
    formatChecked:formattedIds.has(a.id)||!!articleReviews[a.id]?.formatCheck,
    existenceContentOrganizationReview:articleReviews[a.id]?.editorialReview?'recorded':'pending',
    editorialReview:articleReviews[a.id]?.editorialReview??null,
    originalMediaComparison:'unassessed'
  }));
  const count=key=>Object.fromEntries([...new Set(rows.map(r=>r[key]))].sort().map(value=>[value,rows.filter(r=>r[key]===value).length]));
  const result={revision:snapshot.revision,scope:{sourceArticles:2184,sourcePages:baseline.pages.length,currentPages:local.size,
      audit:'Internal routes, fragments, reference labels, empty sections and declared media. Original Fandom media coverage and external website availability require separate investigation.'},
    counts:{kind:count('kind'),classification:count('classification'),status:count('status')},
    currentProblems,coverage,resolutionHistory,findings:rows,sourcePages:baseline.pages.map(({id,path,sourceFile,sourceRevision,sourceSha256,renderedSha256})=>({id,path,sourceFile,sourceRevision,sourceSha256,renderedSha256}))};
  const work=compactWorkIndex(projectWorkIndex({atlas,findings:rows,reviews:articleReviews,formattedIds,resolutionHistory,familyOf}));
  assert.deepEqual(JSON.parse(readFileSync('dist/pages-needing-work/index.json')),work,'Public work index differs from rendered gap evidence');
  mkdirSync('reports',{recursive:true});
  writeFileSync('reports/work-coverage.json',JSON.stringify(work.counts,null,2)+'\n');
  const folder='reports/gaps';mkdirSync(folder,{recursive:true});
  writeFileSync(join(folder,'register.json'),JSON.stringify(result,null,2)+'\n');
  writeFileSync(join(folder,'coverage.json'),JSON.stringify(coverage,null,2)+'\n');
  const pending=rows.filter(r=>r.status!=='resolved');
  const lines=['# Restoration gaps','',baseline.revision,'',
    'Automated source coverage: 2,184 articles. Editorial review: '+coverage.filter(r=>r.editorialReview).length+'/2,184. Original media comparison remains unassessed.',
    'Resolved route/media checks do not verify article claims or establish a complete import.','',
    '## Counts','',...Object.entries(result.counts.kind).map(([k,v])=>'- '+k+': '+v),
    '',pending.length+' open findings including planned conversions. '+currentProblems.length+' inherited broken-link occurrences on current pages; no introduced failures.',
    '', '## Destination and fragment backlog','',
    ...pending.filter(r=>['destination','fragment','claim'].includes(r.kind)).map(r=>'- '+r.target+' — '+r.classification+'. '+r.finding+' '+r.proposedResolution),
    '', 'At cutover, unresolved absent wiki pages retain their addresses and return genuine 404s with search and correction options. The shared 404 is scheduled for the utility batch. Existing articles with unresolved fragments return 200; apex-domain links are not fallbacks.',
    '', 'The machine-readable register retains every affected occurrence and its literal link, source section and rendered element ordinal. Source line numbers are included only for unique exact matches.'];
  writeFileSync(join(folder,'summary.md'),lines.join('\n')+'\n');
  const options=values=>values.map(v=>'<option>'+escape(v)+'</option>').join('');
  const sourceLink=(o)=>{
    const page=sourcePages.get(o.pageId);if(!page)return escape(o.pageId);
    const link=page.sourceFile?'https://github.com/mattresspad/kenshi-wiki/blob/'+page.sourceRevision+'/'+page.sourceFile+(o.line?'#L'+o.line:''):'https://github.com/mattresspad/kenshi-wiki/tree/'+page.sourceRevision;
    return '<a href="'+escape(link)+'">'+escape(o.pageId)+'</a> · '+escape(o.href??o.url??o.label??o.section)+' · '+escape(o.section??'')+' · element '+escape(o.element??'—');
  };
  const table=rows.map(r=>'<article data-status="'+escape(r.status)+'" data-kind="'+escape(r.kind)+'" data-priority="'+escape(r.priority)+'" data-search="'+escape(r.affectedPages.join(' ')+' '+r.occurrences.map(o=>o.href??o.url??o.label??'').join(' '))+'" data-families="'+escape(JSON.stringify(r.families))+'"><h2>'+escape(r.target)+'</h2><p class="meta">'+escape([r.priority,r.classification,r.origin,r.verification,r.status].join(' · '))+'</p><p><strong>Families:</strong> '+escape(r.families.join(', '))+'</p><p>'+escape(r.finding)+'</p><p>'+escape(r.proposedResolution)+'</p><p><strong>Uncertainty:</strong> '+escape(r.uncertainty)+'</p><p><strong>After cutover:</strong> '+escape(r.postCutover)+'</p><details><summary>'+r.affectedPages.length+' affected pages · '+r.occurrences.length+' occurrences</summary><ul>'+r.occurrences.slice(0,8).map(o=>'<li>'+sourceLink(o)+'</li>').join('')+'</ul>'+(r.occurrences.length>8?'<p>All occurrences are retained in <a href="register.json">register.json</a> under '+escape(r.id)+'.</p>':'')+r.evidence.map(e=>'<p>'+escape(typeof e==='string'?e:JSON.stringify(e))+'</p>').join('')+'</details></article>').join('\n');
  writeFileSync(join(folder,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restoration gap register</title><style>body{font:16px/1.5 system-ui;margin:0;background:#f3f0e8;color:#25231e}main{max-width:1100px;margin:auto;padding:24px}h1{margin-bottom:8px}h2{font-size:18px;overflow-wrap:anywhere}a{color:#17558c}article{background:#fffdf7;border:1px solid #c7beae;padding:14px;margin:12px 0;overflow-wrap:anywhere}article p{margin:6px 0}.meta{color:#635a49;font-size:14px}.filters{position:sticky;top:0;background:#f3f0e8;padding:12px 0;display:flex;flex-wrap:wrap;gap:10px;border-bottom:1px solid #b8a581}label{display:grid;gap:4px;min-width:0;max-width:100%}input,select{font:inherit;padding:6px;max-width:100%;min-width:0;box-sizing:border-box}input{width:340px;max-width:calc(100vw - 48px);box-sizing:border-box}summary{cursor:pointer}a:focus-visible,summary:focus-visible{outline:3px solid #926320}article[hidden]{display:none}@media(prefers-color-scheme:dark){body,.filters{background:#1c1b18;color:#eae5d8}article{background:#25231e;border-color:#625a48}a{color:#a9ceff}.meta{color:#c7beae}}</style><main><h1>Restoration gap register</h1><p>All 2,184 pinned articles scanned; '+local.size+' current preview pages compared. Editorial review and original-media coverage are tracked separately.</p><p><a href="summary.md">Summary</a> · <a href="register.json">Full findings and every source occurrence</a> · <a href="coverage.json">Article review coverage</a> · <a href="../routes.json">Route ledger</a></p><p>Default view shows open findings. Resolved route and media entries remain available. An available page is not a claim that its information is verified or complete.</p><div class="filters"><label>Search target, source, claim or family<input id="query" type="search"></label><label>Status<select id="status"><option>open</option><option>all</option><option>resolved</option></select></label><label>Kind<select id="kind"><option>all</option>'+options(Object.keys(result.counts.kind))+'</select></label><label>Family<select id="family"><option>all</option>'+options([...new Set(rows.flatMap(r=>r.families))].sort())+'</select></label><label>Priority<select id="priority"><option>all</option><option>P1</option><option>P2</option><option>P3</option></select></label></div><p id="count"></p>'+table+'<script>const rows=[...document.querySelectorAll("article")],inputs=["query","status","kind","priority","family"].map(id=>document.getElementById(id));for(const row of rows)row._search=(row.textContent+" "+row.dataset.families+" "+row.dataset.search).toLowerCase();function filter(){const [q,s,k,p,f]=inputs.map(el=>el.value);let n=0;for(const r of rows){r.hidden=!!((s!=="all"&&r.dataset.status!==s)||(k!=="all"&&r.dataset.kind!==k)||(p!=="all"&&r.dataset.priority!==p)||(f!=="all"&&!JSON.parse(r.dataset.families).includes(f))||(q&&!r._search.includes(q.toLowerCase())));if(!r.hidden)n++;}document.getElementById("count").textContent=n+" findings shown";}inputs.forEach(el=>el.addEventListener("input",filter));filter();</script></main></html>');
  return {sourceArticles:2184,currentPages:local.size,findings:rows.length,counts:result.counts,
    introduced:0,inheritedOccurrences:currentProblems.length,editoriallyReviewed:coverage.filter(r=>r.editorialReview).length,report:'gaps/index.html'};
}
