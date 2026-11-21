import assert from 'node:assert/strict';
import known from './known-site-findings.json' with {type:'json'};
import {targetOf} from '../gaps/core.mjs';
export function changedTargets(pages,changed,redirects){
 const affected=new Set(changed);
 for(const [path,page]of pages)if(page.links.some(link=>changed.has(targetOf(link.href,path,redirects)?.path)))affected.add(path);
 return affected;
}

export function checkDuplicateIds(path,ids){
 const counts=new Map();for(const id of ids)counts.set(id,(counts.get(id)??0)+1);
 const findings=[];
 for(const [id,count]of counts)if(count>1){
  const baseline=known.find(f=>f.path===path&&f.id===id&&f.count===count);
  assert.ok(baseline,'Unrecorded duplicate ID '+path+'#'+id+' ('+count+')');
  findings.push({...baseline,observedCount:count});
 }
 return findings;
}
