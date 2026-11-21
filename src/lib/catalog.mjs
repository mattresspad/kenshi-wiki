import {activeUtilityPaths,historicalSourceRedirects,isGeneratedUtilityPath,utilityStage} from './utility-routes.mjs';
import {workRoute,workIndexRoute,isWorkRoute} from './work-routes.mjs';
import policy from '../../conversion/category-policy.json' with { type: 'json' };
import snapshot from '../../conversion/reference.json' with { type: 'json' };

export { snapshot, policy };
export const origin = 'https://kenshi.wiki';
export {repo} from './page-source.mjs';

export function categoryPath(name) {
  const segments = name.replaceAll(': ', ' ').split(/[:/]/u);
  const slug = segments.map(part => part.toLowerCase().replace(/[\s_]+/gu, '-')
    .replace(/(?<!\d)\.|\.(?!\d)/gu, '').replace(/[^\p{L}\p{N}.\-]/gu,'')
    .replace(/-{2,}/gu,'-').replace(/^-|-$/gu,'')).filter(Boolean).join('/');
  return '/category/' + slug;
}

export function displayCategories(raw) {
  const names = raw.filter(n => !Object.hasOwn(policy.excluded, n)).map(n => policy.aliases[n] ?? n);
  return Array.from(new Set(names));
}

function claim(map, key, owner) {
  if (!key || map.has(key)) throw Error('Missing or duplicate ' + owner + ' [' + key + '], already held by ' + map.get(key));
  map.set(key, owner);
}

export function buildCatalog(entries = [], reference = snapshot, deployedRedirects = []) {
  const byId = new Map();
  const articles = new Map();
  const publicPaths = new Map();
  const sourceFiles = new Map();
  claim(publicPaths,workRoute,'maintenance utility');
  claim(publicPaths,workIndexRoute,'maintenance index');
  for (const path of [...reference.portals, ...reference.utilities, ...reference.endpoints]) claim(publicPaths, path, 'non-article route');
  for (const name of Object.keys(policy.excluded)) claim(publicPaths, categoryPath(name), 'excluded category');
  const redirects = new Map();
  for (const rule of reference.redirects) {
    if (redirects.has(rule.from)) throw Error('Duplicate redirect source: ' + rule.from);
    redirects.set(rule.from, rule.to);
  }
  for (const rule of deployedRedirects) {
    if(rule.to.startsWith('https://')) {if(!historicalSourceRedirects.some(r=>r.from===rule.from&&r.to===rule.to&&r.status===rule.status))throw Error('Unregistered historical redirect: '+rule.from);continue;}
    if (redirects.has(rule.from) && redirects.get(rule.from) !== rule.to) throw Error('Redirect conflict at ' + rule.from);
    redirects.set(rule.from, rule.to);
  }
  for (const from of redirects.keys()) {if(isWorkRoute(from))throw Error('Redirect collides with maintenance routes: '+from);claim(publicPaths, from, 'redirect');}
  for (const record of reference.articles) {
    const {id, path, sourceFile, sourceRevision} = record;
    if (typeof id !== 'string' || !id.trim() || byId.has(id)) throw Error('Missing or duplicate article ID: ' + id);
    if (typeof path !== 'string' || !/^\/[a-z0-9.-]+(?:\/[a-z0-9.-]+)*$/.test(path) ||
        path.endsWith('.html') || new URL(path, origin).pathname !== path) throw Error('Invalid canonical path for ' + id);
    if (!sourceFile?.startsWith('src/content/wiki/') || !sourceFile.endsWith('.md') || sourceFile.split('/').includes('..') ||
        !/^[a-f0-9]{40}$/.test(sourceRevision) || !record.credit || !record.license) throw Error('Missing source mapping for ' + id);
    if (!/^[a-f0-9]{40}$/.test(record.originalCommit) ||
        !(record.source === 'original' || (record.source?.title && Number.isInteger(record.source.revision)))) {
      throw Error('Missing source history for ' + id);
    }
    if(isGeneratedUtilityPath(path))throw Error('Article collides with generated utility: '+path);
    if(isWorkRoute(path))throw Error('Article collides with maintenance routes: '+path);
    claim(sourceFiles, sourceFile, 'original source');
    claim(publicPaths, path, 'article ' + id);
    const article = {...record, filePath: null};
    byId.set(id, article);
    articles.set(path, article);
  }
  const editableFiles = new Map();
  for (const {filePath, data} of entries) {
    const id = data.articleId;
    const article = byId.get(id);
    if (!article) throw Error('Unregistered article ID ' + id + ' in ' + filePath);
    if (article.filePath) throw Error('Duplicate editable article ID ' + id + ' in ' + article.filePath + ' and ' + filePath);
    if (!filePath?.startsWith('src/content/articles/') || !filePath.endsWith('.md') || filePath.split('/').includes('..')) throw Error('Invalid editable file for ' + id);
    claim(editableFiles, filePath.toLowerCase(), 'editable file');
    Object.assign(article, {filePath, title: data.title, categories: data.categories});
  }
  const categories = new Map();
  const slugOwners = new Map();
  for (const article of articles.values()) {
    for (const name of displayCategories(article.categories)) {
      if (!categories.has(name)) {
        const path = categoryPath(name);
        if (slugOwners.has(path)) throw Error('Unmapped category collision: ' + name + ' / ' + slugOwners.get(path));
        slugOwners.set(path, name);
        if(isGeneratedUtilityPath(path))throw Error('Article collides with generated utility: '+path);
    if(isWorkRoute(path))throw Error('Category collides with maintenance routes: '+path);
        claim(publicPaths, path, 'category ' + name);
        categories.set(name, {name, path, members: []});
      }
      categories.get(name).members.push({path:article.path, title:article.title});
    }
  }
  const compare = new Intl.Collator('en', {numeric:true, sensitivity:'base'});
  for (const group of categories.values()) group.members.sort((a,b) =>
    compare.compare(a.title,b.title) || a.path.localeCompare(b.path,'en'));
  const local = new Set([...activeUtilityPaths,workRoute,'/', ...entries.map(e => byId.get(e.data.articleId).path), ...policy.reviewedCategories.map(categoryPath), ...policy.reviewedPortals]);
  const searchTitles = [
    ['Pages needing work',workRoute], ['About Kenshi', '/about-kenshi'], ['Contributors', '/contributors'],
    ...[...articles.values()].map(a => [a.title, a.path]),
    ...reference.portals.map(path => [path.slice(1,2).toUpperCase() + path.slice(2), path])
  ];
  function href(path) {
    if (!path.startsWith('/') || path.startsWith('//')) return path;
    const plain = path.split(/[?#]/,1)[0];
    if (local.has(plain) || (utilityStage>=3&&historicalSourceRedirects.some(r=>r.from===plain))) return path;
    const destination = redirects.get(plain);
    if (destination && local.has(destination)) return destination + path.slice(plain.length);
    return origin + path;
  }
  return {articles, byId, categories, local, href, searchTitles};
}

export function letterGroups(members) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const groups = new Map([...('#'+alphabet)].map(letter => [letter, []]));
  for (const member of members) {
    const initial = member.title.charAt(0).toUpperCase();
    groups.get(alphabet.includes(initial) && initial.length === 1 ? initial : '#').push(member);
  }
  if (!groups.get('#').length) groups.delete('#');
  return [...groups].map(([letter,entries])=>({letter,entries}));
}
