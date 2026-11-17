import {createHash} from 'node:crypto';
import {load} from 'cheerio';
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const origin='https://kenshi.wiki';
const tidy=s=>s.replace(/\s+/gu,' ').trim();
export function targetOf(raw,from,redirects=new Map()) {
  let u;try{u=new URL(raw,origin+from)}catch{return null;}
  if(!['kenshi.wiki','www.kenshi.wiki'].includes(u.hostname)||!['http:','https:'].includes(u.protocol))return null;
  let path=u.pathname.replace(/\/$/,'')||'/',fragment=u.hash,seen=new Set();
  while(redirects.has(path)) {
    if(seen.has(path))throw Error('Redirect cycle '+path);seen.add(path);
    const next=new URL(redirects.get(path),origin);path=next.pathname;fragment=next.hash||fragment;
  }
  try{fragment=fragment?'#'+decodeURIComponent(fragment.slice(1)):''}catch{}
  return {path,fragment,target:path+fragment};
}
export function extractPage(html,{path,markdown='',fresh=false}) {
  const doc=load(html);
  const root=doc('<div></div>');
  if(fresh && doc('article[data-article-id]').length)root.append(doc('.factbox').clone(),doc('.lead-text').contents().clone(),doc('.article-body').contents().clone());
  else root.append((doc('.mw-parser-output').length?doc('.mw-parser-output'):doc('main')).contents().clone());
  root.find('.fandom-notice').remove();
  const links=[],media=[],labels=[],emptySections=[];
  let section='firstHeading',ordinal=0;
  const location=(el,literal='')=>{
    let line=null;
    if(literal && markdown){const at=markdown.indexOf(literal);if(at>=0 && markdown.indexOf(literal,at+literal.length)<0)line=markdown.slice(0,at).split('\n').length;}
    return {section,element:ordinal,line};
  };
  for(const el of root.find('*').toArray()){
    ordinal++;
    if(/^h[1-6]$/.test(el.name))section=el.attribs.id??doc(el).find('[id]').first().attr('id')??section;
    if(el.name==='a'&&el.attribs.href)links.push({href:el.attribs.href,label:tidy(doc(el).text()),...location(el,el.attribs.href)});
    if(el.name==='form'&&el.attribs.action)links.push({href:el.attribs.action,label:'Search form',...location(el,el.attribs.action)});
    if(doc(el).is('.new') && !el.attribs.href)labels.push({label:tidy(doc(el).text()),...location(el,tidy(doc(el).text()))});
    for(const attr of ['src','poster'])if(el.attribs[attr]&&['img','video','audio','source','iframe'].includes(el.name))media.push({url:el.attribs[attr],tag:el.name,...location(el,el.attribs[attr])});
    if(el.attribs.srcset)for(const part of el.attribs.srcset.split(',')){const url=part.trim().split(/\s+/)[0];if(url)media.push({url,tag:el.name,...location(el,url)});}
  }
  for(const heading of root.find('h2,h3,h4,h5,h6').toArray()){
    const level=Number(heading.name[1]),parts=[];
    for(let n=heading.nextSibling;n;n=n.nextSibling){
      if(/^h[1-6]$/.test(n.name)&&Number(n.name[1])<=level)break;
      parts.push(n);
    }
    const area=doc('<div></div>');for(const part of parts)area.append(doc(part).clone());
    area.find('h1,h2,h3,h4,h5,h6').remove();
    if(!tidy(area.text())&&!area.find('img,video,audio,iframe,source,object,embed').length)
      emptySections.push({section:heading.attribs.id??doc(heading).find('[id]').first().attr('id')??tidy(doc(heading).text()),label:tidy(doc(heading).text())});
  }
  return {ids:doc('[id]').toArray().map(el=>el.attribs.id),links,media,labels,emptySections};
}
export function discover(baseline,registered,redirects) {
  const found=new Map();
  function add(kind,target,page,occurrence){
    const id=kind+':'+target;
    if(!found.has(id))found.set(id,{id,kind,target,occurrences:[]});
    found.get(id).occurrences.push({pageId:page.id,...occurrence});
  }
  const pages=new Map(baseline.pages.map(p=>[p.path,p]));
  for(const page of baseline.pages){
    for(const link of page.links){
      const t=targetOf(link.href,page.path,redirects);if(!t)continue;
      const isAsset=Object.hasOwn(baseline.assets,t.path);
      if(isAsset) {add('media',t.path,page,link);continue;}
      add(registered.has(t.path)?'availability':'destination',t.path,page,link);
      if(t.fragment&&pages.has(t.path)&&!pages.get(t.path).ids.includes(t.fragment.slice(1)))
        add('fragment',t.target,page,link);
    }
    for(const item of page.media){
      const t=targetOf(item.url,page.path,redirects);
      add('media',t?.path??item.url,page,item);
    }
    for(const item of page.labels)add('unlinked-label',item.label,page,item);
    for(const item of (page.id.startsWith('route:')?[]:page.emptySections))add('empty-section',page.path+'#'+item.section,page,item);
  }
  return found;
}
export function defaultFinding(item,baseline) {
  const kind=item.kind;
  const classification=kind==='availability'?'pending conversion':kind==='empty-section'?'unresolved':
    kind==='media'&&baseline.assets[item.target]?.exists?'pending conversion':'unresolved';
  const behavior=kind==='availability'?'Serve the registered local destination after its conversion; no apex-domain fallback survives cutover.':
    kind==='destination'?'Retain the wiki address. If no article or verified alias is established, return a genuine 404 with search and correction options.':
    kind==='fragment'?'Serve the article with HTTP 200; retain the unresolved fragment until a verified bookmark alias or content restoration is available.':
    kind==='media'?'Restore credited media where verified. Preserve useful alternative text; original media coverage remains unassessed.':
    kind==='unlinked-label'?'Keep the source label unlinked until its intended destination is verified.':'Preserve the section bookmark and record incomplete content without inventing material.';
  return {id:item.id,kind,target:item.target,classification,origin:'inherited',priority:kind==='availability'?'P3':'P2',
    verification:'source recorded',status:'open',finding:kind==='availability'?'Track registered destination availability.':
      kind==='destination'?'Destination is outside the frozen route inventory.':
      kind==='fragment'?'The pinned destination lacks this exact fragment.':
      kind==='empty-section'?'The imported section has no substantive content.':
      kind==='unlinked-label'?'The import marks this label as a missing page.':'Referenced media require source and local availability checks.',
    proposedResolution:kind==='availability'?'Convert the registered target and verify its canonical response.':
      'Compare the pinned Markdown, original revision, aliases and related articles; retain unresolved classification where evidence is insufficient.',
    uncertainty:kind==='availability'?'Editorial and media completeness are separate from route availability.':'Source presence alone does not establish correctness or completeness.',
    evidence:[],postCutover:behavior};
}
export function mergeRegister(existing,detected,baseline){
  const old=new Map(existing.map(r=>[r.id,r]));
  const out=[...detected.values()].map(item=>({...defaultFinding(item,baseline),...old.get(item.id)}));
  const ids=new Set(out.map(r=>r.id));for(const row of existing)if(!ids.has(row.id))out.push(row);
  return out.sort((a,b)=>a.id.localeCompare(b.id,'en'));
}
export function regressions(page,baselinePage,baselinePages,registered,redirects,localPages,assetsExist){
  const problems=[],oldTargets=new Set((baselinePage?.links??[]).map(l=>targetOf(l.href,baselinePage.path,redirects)?.target));
  const sourceIds=new Map(baselinePages.map(p=>[p.path,new Set(p.ids)]));
  for(const link of page.links){
    const t=targetOf(link.href,page.path,redirects);if(!t)continue;
    let reason;
    if(!registered.has(t.path)&&!assetsExist(t.path))reason='destination';
    else if(t.fragment&&localPages.has(t.path)&&!localPages.get(t.path).ids.includes(t.fragment.slice(1)))reason='fragment';
    else if(t.fragment&&!localPages.has(t.path)&&sourceIds.has(t.path)&&!sourceIds.get(t.path).has(t.fragment.slice(1)))reason='fragment';
    if(reason){
      const inherited=oldTargets.has(t.target) && (reason==='destination'||!sourceIds.get(t.path)?.has(t.fragment.slice(1)));
      problems.push({...link,target:t.target,kind:reason,origin:inherited?'inherited':'introduced'});
    }
  }
  return problems;
}

export function validateResolution(row,observed){
  if(row.status!=='resolved')return;
  if(!row.evidence?.length||!row.resolution)throw Error('Resolution evidence required '+row.id);
  if(!observed&&!['claim','unlinked-label'].includes(row.kind))throw Error('Unsupported resolved claim '+row.id);
  if(!observed&&(!row.resolution.method||!row.resolution.evidence||!row.resolution.verifiedBy))throw Error('Investigation proof required '+row.id);
}
