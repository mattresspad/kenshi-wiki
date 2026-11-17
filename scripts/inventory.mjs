// Export metadata from a Git revision without checking it out or copying article bodies.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const revision = '0c9b4348592605169315b6dd613dde1c220d1237';
const repository = process.argv[2] || '.';
const git = (args, input) => execFileSync('git', ['-C', repository, ...args], { input, maxBuffer: 96 * 1024 * 1024 });
const tree = git(['ls-tree', '-r', '-z', revision]).toString().split('\0').filter(Boolean).map(line => {
  const [meta, name] = line.split('\t');
  return { name, hash: meta.split(' ')[2] };
});
const documents = tree.filter(({name}) => name.startsWith('src/content/wiki/') && name.endsWith('.md'));
const stream = git(['cat-file', '--batch'], documents.map(f => f.hash).join('\n') + '\n');
let cursor = 0;
const articles = documents.map(({name, hash}) => {
  const boundary = stream.indexOf(10, cursor);
  const [object, type, size] = stream.toString('ascii', cursor, boundary).split(' ');
  if (object !== hash || type !== 'blob') throw Error('Unexpected Git object for ' + name);
  const end = boundary + 1 + Number(size);
  const content = stream.toString('utf8', boundary + 1, end);
  cursor = end + 1;
  const header = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!header) throw Error('Missing frontmatter in ' + name);
  const {title, categories = [], source} = parse(header[1]);
  return {path:'/' + name.slice('src/content/wiki/'.length, -3), title, categories, source};
});
const redirects = git(['show', revision + ':public/_redirects']).toString().split(/\r?\n/)
  .map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => {
    const [from, to, status] = l.split(/\s+/);
    return {from, to, status: Number(status)};
  });
const portals = tree.filter(f => /^src\/data\/portals\/[^/]+\.yaml$/.test(f.name))
  .map(f => '/' + f.name.split('/').pop().slice(0,-5));
const utilities = tree.filter(f => /^src\/pages\/(?!\[)[^/]+\.astro$/.test(f.name))
  .map(f => f.name === 'src/pages/index.astro' ? '/' : '/' + f.name.split('/').pop().slice(0,-6));
const snapshot = {
  revision, portals, utilities,
  endpoints: ['/robots.txt','/sitemap-index.xml','/sitemap-0.xml','/search-titles.json','/sources/outland.css.txt','/sources/wiki-header.css.txt'],
  redirects, articles
};
const printRows = arr => '[\n' + arr.map(item=>'    '+JSON.stringify(item)).join(',\n') + '\n  ]';
const text = '{\n' + Object.entries(snapshot).map(([k,v])=>'  '+JSON.stringify(k)+': '+
  (k==='articles'||k==='redirects' ? printRows(v) : JSON.stringify(v))).join(',\n') + '\n}\n';
writeFileSync('conversion/reference.json', text);
console.log('Inventoried',articles.length,'articles,',redirects.length,'redirects,',portals.length,'portals and',utilities.length,'top-level pages at',revision);
