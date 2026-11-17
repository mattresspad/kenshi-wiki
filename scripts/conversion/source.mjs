import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {parse} from 'yaml';
import {load} from 'cheerio';
import {snapshot} from '../../src/lib/catalog.mjs';

export function openSource(repository, directory) {
  const root = resolve(directory);
  const records = new Map(snapshot.articles.map(article => [article.id, article]));
  const tree = execFileSync('git', ['-C',repository,'ls-tree','-r','-z',snapshot.revision], {maxBuffer:32*1024*1024});
  const blobs = new Map(tree.toString().split('\0').filter(Boolean).map(line => {
    const [metadata,path] = line.split('\t');
    return [path,metadata.split(' ')[2]];
  }));
  function pinned(file) {
    let bytes = readFileSync(join(root,file));
    const digest = buffer => createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
    if (file.endsWith('.md') && digest(bytes) !== blobs.get(file)) bytes = Buffer.from(bytes.toString().replaceAll('\r\n','\n'));
    assert.equal(digest(bytes),blobs.get(file),file+' differs from the pinned source');
    return bytes;
  }
  return {
    pinned,
    document(id) {
      const input = pinned(records.get(id).sourceFile).toString();
      const match = input.match(/^---\n([\s\S]*?)\n---[ \t]*\n/);
      assert.ok(match,'Missing frontmatter for '+id);
      return {front:parse(match[1]), body:input.slice(match[0].length).replace(/^[ \t]+$/gm,'').trim()};
    },
    html(id) {
      return readFileSync(join(root,'dist',records.get(id).path.slice(1)+'.html'),'utf8');
    }
  };
}

export function factParts(value) {
  const $ = load(value,{},false);
  const parts = [];
  const lineBreak = () => { if (parts.length && !parts.at(-1)?.break) parts.push({break:true}); };
  function visit(node) {
    if (node.type === 'text') { parts.push(node.data); return; }
    if (node.name === 'a') { parts.push([$(node).text(),$(node).attr('href')]); return; }
    if (node.name === 'br') { lineBreak(); return; }
    assert.ok(['p','span'].includes(node.name),'Unexpected fact markup '+node.name);
    if (node.name === 'p') lineBreak();
    for (const child of node.children ?? []) visit(child);
    if (node.name === 'p') lineBreak();
  }
  for (const node of $.root().contents().toArray()) visit(node);
  if (parts.at(-1)?.break) parts.pop();
  return parts.length ? parts : [''];
}
