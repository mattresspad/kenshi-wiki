// Export metadata from a Git revision without checking it out or copying article bodies.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import assert from 'node:assert/strict';
import {buildCatalog} from '../src/lib/catalog.mjs';
import blenderChange from '../conversion/pr-43.json' with {type: 'json'};

const revision = '83abc179fafa63b826d7f2662c4a18a134a9e6c1';
const repository = process.argv[2] || '.';
const git = (args, input) => execFileSync('git', ['-C', repository, ...args], { input, maxBuffer: 96 * 1024 * 1024 });
const inventoryFile = 'conversion/reference.json';
const registered = JSON.parse(readFileSync(inventoryFile, 'utf8')).articles;
const byId = new Map(registered.map(row => [row.id, row]));
// Verify the accepted contribution independently of which later snapshot is being inventoried.
const changedFiles = git(['diff', '--name-only', blenderChange.from, blenderChange.revision]).toString().trim().split(/\r?\n/);
const guidePath = entry => byId.get(entry.articleId).sourceFile;
assert.deepEqual(changedFiles.sort(), [
  ...blenderChange.edits.map(guidePath), 'src/content/wiki/modding/blender-plugins.md', 'src/data/portals/modding.yaml'
].sort());
for (const edit of blenderChange.edits) {
  const file = guidePath(edit);
  for (const [rev, expected] of [[blenderChange.from, edit.oldBlob], [blenderChange.revision, edit.newBlob]]) {
    assert.equal(git(['rev-parse', rev + ':' + file]).toString().trim(), expected, file);
  }
  const diff = git(['diff', '--unified=0', blenderChange.from, blenderChange.revision, '--', file]).toString().replaceAll('\r\n','\n');
  const lines = diff.slice(diff.indexOf('\n@@')+1).trimStart().split('\n');
  assert.deepEqual(lines.filter(line=>line.startsWith('+')).map(line=>line.slice(1)), edit.added, file);
  assert.deepEqual(lines.filter(line=>line.startsWith('-')).map(line=>line.slice(1)), edit.removed, file);
  assert.ok(edit.added.some(line => line.includes('](/modding/blender-plugins)')), file);
}
const tree = git(['ls-tree', '-r', '-z', revision]).toString().split('\0').filter(Boolean).map(line => {
  const [meta, name] = line.split('\t');
  return { name, hash: meta.split(' ')[2] };
});
const documents = tree.filter(({name}) => name.startsWith('src/content/wiki/') && name.endsWith('.md'));
const bySource = new Map(registered.map(row => [row.sourceFile, row]));
assert.equal(bySource.size, registered.length, 'Duplicate source file in the article registry');
assert.equal(documents.length, registered.length, 'Reconcile additions or removals in the article registry');
const firstCommits = new Map();
let firstCommit, author;
const history = git(['log', '--reverse', '--no-renames', '--diff-filter=A', '--format=@%H%x09%an', '--name-only', revision, '--', 'src/content/wiki']).toString();
for (const line of history.split(/\r?\n/)) {
  if (line.startsWith('@')) [firstCommit, author] = line.slice(1).split('\t');
  else if (line && !firstCommits.has(line)) firstCommits.set(line, {firstCommit, author});
}
const portalCredits = new Map();
for (const file of tree.filter(f => /^src\/data\/portals\/[^/]+\.yaml$/.test(f.name))) {
  const portal = parse(git(['cat-file','blob',file.hash]).toString());
  for (const section of portal.sections ?? []) for (const entry of section.articles ?? []) {
    if (entry.credit) portalCredits.set(entry.id, entry.credit);
  }
}
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
  const row = bySource.get(name);
  assert.ok(row?.id && row.path && row.sourceRevision, 'Missing registered identity for '+name);
  if (row.sourceRevision !== revision) {
    assert.equal(git(['rev-parse',row.sourceRevision+':'+name]).toString().trim(), hash, 'Inspect changed historical source '+name);
  }
  const first = firstCommits.get(name);
  assert.ok(first, 'Missing Git origin for '+name);
  const isOriginal = source === 'original';
  const credit = isOriginal ? (first.author === 'mattresspad' ? 'Prd (mattresspad)' : first.author) : 'Kenshi Wiki’s Fandom contributors';
  const contributor = portalCredits.get(row.id);
  return {id:row.id, path:row.path, sourceFile:name, sourceRevision:row.sourceRevision,
    title, categories, source, credit, license:isOriginal?'4.0':'3.0', originalCommit:first.firstCommit,
    ...(contributor ? {contributor} : {}), ...(row.evidence?.length ? {evidence:row.evidence} : {})};
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
buildCatalog([], snapshot);
const printRows = arr => '[\n' + arr.map(item=>'    '+JSON.stringify(item)).join(',\n') + '\n  ]';
const text = '{\n' + Object.entries(snapshot).map(([k,v])=>'  '+JSON.stringify(k)+': '+
  (k==='articles'||k==='redirects' ? printRows(v) : JSON.stringify(v))).join(',\n') + '\n}\n';
if (readFileSync(inventoryFile,'utf8').replaceAll('\r\n','\n') !== text) writeFileSync(inventoryFile, text);
console.log('Inventoried',articles.length,'articles,',redirects.length,'redirects,',portals.length,'portals and',utilities.length,'top-level pages at',revision);
