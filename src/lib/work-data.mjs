import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {families,selectedIds} from '../../scripts/conversion/batches.mjs';
import {discover,extractPage} from '../../scripts/gaps/core.mjs';
import {resolveWorkFindings} from './work-findings.mjs';
import {projectWorkIndex} from './work-index.mjs';
import {prepareArticle} from './article.mjs';
const get=p=>JSON.parse(readFileSync(p));
let pending;
export function readWorkIndex(wiki){return pending??=loadWorkIndex(wiki);}
async function loadWorkIndex(wiki){
 const atlas=wiki,baseline=get('conversion/gaps/source.json'),curated=get('conversion/gaps/register.json'),reviews=get('conversion/reviews.json').articles;
 let pages=baseline.pages;
 if(existsSync('conversion/pr-44/gap-source.json')&&atlas.byId.has('modding/meitou/code-mod-hooks')){
  pages=[...pages,...get('conversion/pr-44/gap-source.json').pages];curated.findings.push(...get('conversion/pr-44/gap-findings.json').findings);
 }
 const sourcePages=new Map(pages.map(p=>[p.id,p])),sourceByPath=new Map(pages.map(p=>[p.path,p])),redirects=new Map(baseline.redirects.map(r=>[r.from,r.to]));
 const detected=discover(baseline,new Set(baseline.registeredRoutes),redirects);
 const needed=new Set(curated.findings.filter(f=>['empty-section','fragment'].includes(f.kind)).map(f=>f.target.split('#')[0]));
 for(const f of curated.findings)if(f.presentationRepair)needed.add(atlas.byId.get(f.presentationRepair.articleId)?.path);
 const local=new Map();
 for(const entry of wiki.entries){const a=atlas.byId.get(entry.data.articleId);if(!needed.has(a.path))continue;
  const prepared=prepareArticle(entry.rendered.html,entry.data,atlas.href);
  const html='<article data-article-id="'+a.id+'"><div class="lead-text">'+prepared.intro+'</div><div class="article-body">'+prepared.body+'</div></article>';
  local.set(a.path,{id:a.id,path:a.path,...extractPage(html,{path:a.path,fresh:true})});
 }
 const publicFile=p=>typeof p==='string'&&p.startsWith('/')&&!p.split('/').includes('..')?join('public',decodeURIComponent(p.slice(1))):null;
 const generated=new Set(['/sitemap-index.xml','/sitemap-0.xml','/search-titles.json','/pages-needing-work/index.json']);
 const assetExists=p=>generated.has(p)||!!(publicFile(p)&&existsSync(publicFile(p)));
 const familyOf=id=>{const matches=Object.entries(families).filter(([,f])=>f.roster.batches.some(b=>b.ids.includes(id))||(f.roster.members??[]).includes(id)).map(([name])=>name);const a=atlas.byId.get(id);return matches.length?matches:[a?.filePath?.split('/')[3]??(a?.categories?.[0]??'navigation')];};
 const findings=resolveWorkFindings({curated,detected,baseline,sourcePages,sourceByPath,redirects,atlas,local,assetExists,assetBytes:p=>readFileSync(publicFile(p)),familyOf});
 const formattedIds=new Set(Object.keys(families).flatMap(f=>[...selectedIds(f)]));
 const resolutionHistory=get('conversion/gaps/resolutions.json').records;
 return {...projectWorkIndex({atlas,findings,reviews,formattedIds,resolutionHistory}),sourcePages};
}
