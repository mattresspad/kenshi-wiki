import fs from 'node:fs';
import {families} from '../conversion/batches.mjs';
import {articleFiles} from '../article-files.mjs';

export const inventory = () => ({
  catalog: fs.readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f).sort(),
  browser: fs.readdirSync('tests').filter(f=>f.endsWith('.spec.mjs')).map(f=>'tests/'+f).sort()
});
export const structural = ['tests/catalog.test.mjs','tests/work-index.test.mjs','tests/release.test.mjs','tests/ci-policy.test.mjs'];
const documentation = p => /^(README|CONTRIBUTING|SECURITY|CODE_OF_CONDUCT|LICENSING)\.md$/.test(p) || /^docs\/.*\.md$/.test(p);
const preservation = p => /^(conversion\/|scripts\/|tests\/|\.github\/|package(?:-lock)?\.json$|astro\.config\.|playwright\.config\.|\.node-version$|src\/content\.config\.|src\/lib\/)/.test(p);
export function articleContext() {
  return articleFiles().map(({filePath,data})=>({
    file:filePath,id:data.articleId,
    families:Object.entries(families).filter(([,f])=>f.roster.batches.some(b=>b.ids.includes(data.articleId))||(f.roster.members??[]).includes(data.articleId)||(f.roster.previouslyTransferred??[]).includes(data.articleId)).map(([name])=>name)
  }));
}
export function selectChecks({changes,mode='routine',articles=[],tests=inventory()}) {
  if(!['routine','audit','release'].includes(mode))throw Error('Unknown CI mode');
  const selected = new Set(),reasons=[],byFile=new Map(articles.map(a=>[a.file,a]));
  let kind='documentation',audit=mode!=='routine',editing=false;
  const broad=(why,exhaustive=false)=>{kind='broad';audit ||= exhaustive;editing=true;reasons.push(why);};
  if(mode!=='routine')broad('Explicit '+mode,true);
  if(!changes?.length)broad('No reliable changed-file set',true);
  for(const change of changes??[]){
    const {path,status}=change;
    if(!['A','M'].includes(status)){broad('Rename/deletion/unknown status: '+path,true);continue;}
    if(documentation(path)){reasons.push('Repository guidance: '+path);continue;}
    if(path.startsWith('src/content/articles/')&&path.endsWith('.md')){
      const article=byFile.get(path);
      if(!article||!article.families.length){broad('Unmapped article presentation: '+path,true);continue;}
      selected.add(article.id);if(kind==='documentation')kind='content';
      for(const family of article.families)reasons.push('Article family: '+family);
    }else if(preservation(path)){broad('Validation, schema or preservation dependency: '+path,true);}
    else if(/^(src\/|public\/)/.test(path)){broad('Shared rendering, navigation, data or assets: '+path);}
    else broad('Unclassified dependency: '+path,true);
  }
  let browser=[],catalog=structural.filter(f=>tests.catalog.includes(f));
  if(kind==='content'){
    const names=new Set(articles.filter(a=>selected.has(a.id)).flatMap(a=>a.families));
    names.add('addressing');names.add('bookmarks');
    if(names.has('crafting'))names.add('technology');
    browser=tests.browser.filter(f=>names.has(f.slice(6,-9)));
    catalog=[...new Set([...catalog,...tests.catalog.filter(f=>[...names].some(n=>f==='tests/'+n.replace(/s$/,'')+'-format.test.mjs'))])];
  }
  if(kind==='broad'){
    browser=tests.browser.filter(f=>audit||f!=='tests/gap-report.spec.mjs');
    catalog=[...tests.catalog]; // includes warm-cache fixture; broad changes can affect edit paths
  }
  return {version:1,mode,kind,audit,editing,build:kind!=='documentation',articleIds:[...selected].sort(),catalog:catalog.sort(),browser:browser.sort(),reasons:[...new Set(reasons)],changes};
}
