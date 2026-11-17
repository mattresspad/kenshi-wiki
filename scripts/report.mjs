import {readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parse} from 'yaml';
import {load} from 'cheerio';
import {buildCatalog, categoryPath, origin, policy, snapshot} from '../src/lib/catalog.mjs';

import blenderChange from '../conversion/pr-43.json' with {type:'json'};

const root = 'src/content/articles';
const reviewed = readdirSync(root, {recursive:true}).filter(f=>f.endsWith('.md')).map(file=>{
  const source=readFileSync(path.join(root,file),'utf8');
  const data=parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  return {path:'/'+file.replaceAll('\\','/').slice(0,-3),...data};
});
const atlas=buildCatalog(reviewed);
const initial=buildCatalog();
const htmlFile = p => path.join('dist', p==='/'?'index.html':p.slice(1)+'.html');
const routes=[];
const external=new Map();
function record(kind,url,details={}) {
  const built=atlas.local.has(url) && existsSync(htmlFile(url));
  routes.push({kind,path:url,status:built?'preserved locally':'awaiting conversion',...details});
}
for (const a of snapshot.articles) record('article',a.path,{source:a.source});
for (const g of initial.categories.values()) record('category',g.path,{name:g.name,referenceMembers:g.members.length});
for (const url of snapshot.portals) record('portal',url);
for (const url of snapshot.utilities) record(url==='/'?'home':'utility',url);
const assetRedirects = readFileSync('dist/_redirects','utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => { const [from,to,status] = line.trim().split(/\s+/); return {from,to,status:Number(status)}; });
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
const report={revision:snapshot.revision,reviewedArticles:reviewed.map(a=>a.path),memberships,
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
  'This batch adds The Holy Nation, Backpacks, Blender plugins, the Modding portal and its category. Four live guide edits are pinned to PR #43. The JSON ledger includes their exact changed lines and before/after Git blob IDs.','',
  'Milestone remains open while routes await conversion or verification, or temporary links remain. Reconcile public main again, record the software license, then review the candidate and rollback version with Prd before production.',''];
writeFileSync('reports/route-report.md',lines.join('\n'));
console.log(atlas.local.size+' HTML pages; '+memberships+' reference memberships; '+routes.length+' ledger rows.');
