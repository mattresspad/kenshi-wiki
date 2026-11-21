export function normalizeTitle(value){return value.replaceAll('_',' ').trim().toLocaleLowerCase('en-US');}
export function titleSuggestions(titles,query){const q=normalizeTitle(query);if(!q)return [];return titles.map(([title,path])=>({title,path,n:normalizeTitle(title)})).filter(a=>a.n.includes(q)).sort((a,b)=>(a.n===q?0:a.n.startsWith(q)?1:2)-(b.n===q?0:b.n.startsWith(q)?1:2)||a.title.localeCompare(b.title,'en')).slice(0,8);}
export function randomPaths(atlas){return [...atlas.byId.values()].filter(a=>a.filePath&&!a.categories.some(c=>['Removed Content','Candidates for deletion'].includes(c))).map(a=>a.path).sort();}
export function searchCandidates(atlas){return atlas.searchTitles.filter(([,path])=>atlas.local.has(path));}
