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
  function visit(node, strike = false) {
    if (node.type === 'text') { parts.push(strike ? {strike:true,text:node.data} : node.data); return; }
    if(node.name==='a' && $(node).children('strong').length){assert.ok(!strike && node.children.length===1 && $(node).children('strong').contents().toArray().every(n=>n.type==='text'),'Unexpected linked bold markup');parts.push({strong:true,text:$(node).text(),href:$(node).attr('href')});return;}
    if (node.name === 'a') { parts.push(strike ? {strike:true,text:$(node).text(),href:$(node).attr('href')} : [$(node).text(),$(node).attr('href')]); return; }
    if (node.name === 'strong') {
      assert.ok(!strike,'Combined strong/strike needs explicit support');
      for(const child of node.children??[]){
        if(child.type==='text')parts.push({strong:true,text:child.data});
        else if(child.name==='a' && (child.children??[]).every(n=>n.type==='text'))parts.push({strong:true,text:$(child).text(),href:$(child).attr('href')});
        else throw Error('Unexpected bold fact markup '+child.name);
      }
      return;
    }
    if (node.name === 'ul') {
      assert.ok($(node).children().toArray().every(n=>n.name==='li'),'Unexpected fact list child');
      const list=$(node).children('li').toArray().map(li=>factParts($(li).html()));
      assert.ok(list.every(items=>items.every(p=>!p?.list)),'Nested fact lists require explicit support');
      parts.push({list}); return;
    }
    if (node.name === 'br') { lineBreak(); return; }
    assert.ok(['p','span','s'].includes(node.name),'Unexpected fact markup '+node.name);
    if (node.name === 'p') lineBreak();
    for (const child of node.children ?? []) visit(child, strike || node.name === 's');
    if (node.name === 'p') lineBreak();
  }
  for (const node of $.root().contents().toArray()) visit(node);
  if (parts.at(-1)?.break) parts.pop();
  return parts.length ? parts : [''];
}
