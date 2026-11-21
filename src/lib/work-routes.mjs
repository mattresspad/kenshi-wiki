export const workRoute='/pages-needing-work';
export const workIndexRoute=workRoute+'/index.json';
export const workPageSize=50;
export function workPagePath(page=1,history=false){const root=workRoute+(history?'/history':'');return page===1?root:root+'/page/'+page;}
export function isWorkRoute(path){return path===workRoute || path.startsWith(workRoute+'/');}
