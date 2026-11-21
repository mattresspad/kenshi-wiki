import {createHash} from 'node:crypto';
import {workPagePath,workPageSize} from './work-routes.mjs';
export const workMarkings={awaiting:'Awaiting editorial review',reviewed:'Reviewed, with open findings',specific:'Specific restoration work'};
export const workTypes={availability:'Destination restoration',destination:'Unresolved destination',fragment:'Missing bookmark',media:'Media restoration','empty-section':'Incomplete section','unlinked-label':'Unlinked missing-page label',claim:'Verification or editorial investigation'};
export const workAnchor=id=>'article-'+createHash('sha256').update(id).digest('hex').slice(0,16);
export function projectWorkIndex({atlas,findings,reviews,formattedIds,resolutionHistory=[],familyOf}){
 const tasks=new Map(findings.map(f=>[f.id,f]));
 if(tasks.size!==findings.length)throw Error('Duplicate work-item ID');
 const perArticle=new Map();
 for(const f of findings)for(const id of new Set(f.occurrences.map(o=>o.pageId))){
  if(!perArticle.has(id))perArticle.set(id,[]);perArticle.get(id).push(f.id);
 }
 const all=[...atlas.byId.values()].filter(a=>a.filePath).map(a=>{
  const ids=(perArticle.get(a.id)??[]).sort(),open=ids.filter(id=>tasks.get(id).status!=='resolved'),closed=ids.filter(id=>tasks.get(id).status==='resolved');
  const formatChecked=formattedIds.has(a.id)||!!reviews[a.id]?.formatCheck,review=reviews[a.id]?.editorialReview??null;
  const markings=[...(formatChecked&&!review?['awaiting']:[]),...(review&&open.length?['reviewed']:[]),...(open.length?['specific']:[])];
  return {id:a.id,title:a.title,path:a.path,filePath:a.filePath,formatChecked,review,markings,open,closed,anchor:workAnchor(a.id),families:[...new Set(familyOf?.(a.id)??[a.filePath.split('/')[3]??'reference'])].sort(),sourceFile:a.sourceFile,sourceRevision:a.sourceRevision};
 }).sort((a,b)=>a.title.localeCompare(b.title,'en',{numeric:true,sensitivity:'base'})||a.id.localeCompare(b.id));
 const active=all.filter(a=>a.markings.length),history=all.filter(a=>a.closed.length);
 for(const [list,historical]of [[active,false],[history,true]])list.forEach((a,i)=>{a[historical?'historyHref':'queueHref']=workPagePath(Math.floor(i/workPageSize)+1,historical)+'#'+a.anchor});
 const routes=[...Array(Math.max(1,Math.ceil(active.length/workPageSize)))].map((_,i)=>({path:workPagePath(i+1),page:i+1,history:false}));
 routes.push(...[...Array(Math.max(1,Math.ceil(history.length/workPageSize)))].map((_,i)=>({path:workPagePath(i+1,true),page:i+1,history:true})));
 return {version:1,all,active,history,byId:new Map(all.map(a=>[a.id,a])),tasks,resolutionHistory,routes,counts:{transferred:all.length,formatChecked:all.filter(a=>a.formatChecked).length,editoriallyReviewed:all.filter(a=>a.review).length,awaitingReview:all.filter(a=>a.markings.includes('awaiting')).length,activeArticles:active.length,openFindings:new Set(active.flatMap(a=>a.open)).size,resolvedFindings:new Set(history.flatMap(a=>a.closed)).size}};
}
export function compactWorkIndex(index){
 const used=new Set(index.all.flatMap(a=>[...a.open,...a.closed]));
 return {version:index.version,counts:index.counts,routes:index.routes,articles:index.all.map(({id,title,path,markings,open,closed,families,queueHref,historyHref})=>({id,title,path,markings,open,closed,families,queueHref:queueHref??null,historyHref:historyHref??null})),tasks:[...used].sort().map(id=>{const t=index.tasks.get(id);return {id,type:t.kind,priority:t.priority,status:t.status,search:[t.target,t.finding,t.proposedResolution,t.uncertainty].join(' ')}})};
}
