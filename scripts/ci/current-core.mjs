import {targetOf} from '../gaps/core.mjs';
export function changedTargets(pages,changed,redirects){
 const affected=new Set(changed);
 for(const [path,page]of pages)if(page.links.some(link=>changed.has(targetOf(link.href,path,redirects)?.path)))affected.add(path);
 return affected;
}
