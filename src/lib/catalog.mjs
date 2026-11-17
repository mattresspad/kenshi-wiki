import policy from '../../conversion/category-policy.json' with { type: 'json' };
import snapshot from '../../conversion/reference.json' with { type: 'json' };

export { snapshot, policy };
export const origin = 'https://kenshi.wiki';
export const repo = 'https://github.com/mattresspad/kenshi-wiki';

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

export function buildCatalog(reviewed = []) {
  const articles = new Map(snapshot.articles.map(a => [a.path, a]));
  for (const entry of reviewed) articles.set(entry.path, entry);
  const categories = new Map();
  const slugOwners = new Map();
  for (const article of articles.values()) {
    for (const name of displayCategories(article.categories)) {
      if (!categories.has(name)) {
        const path = categoryPath(name);
        if (slugOwners.has(path)) throw Error('Unmapped category collision: ' + name + ' / ' + slugOwners.get(path));
        slugOwners.set(path, name);
        categories.set(name, {name, path, members: []});
      }
      categories.get(name).members.push({path:article.path, title:article.title});
    }
  }
  const compare = new Intl.Collator('en', {numeric:true, sensitivity:'base'});
  for (const group of categories.values()) group.members.sort((a,b) =>
    compare.compare(a.title,b.title) || a.path.localeCompare(b.path,'en'));
  const local = new Set(['/', ...reviewed.map(a=>a.path), ...policy.reviewedCategories.map(categoryPath), ...policy.reviewedPortals]);
  function href(path) {
    if (!path.startsWith('/') || path.startsWith('//')) return path;
    const plain = path.split(/[?#]/,1)[0];
    return local.has(plain) ? path : origin + path;
  }
  return {articles, categories, local, href};
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
