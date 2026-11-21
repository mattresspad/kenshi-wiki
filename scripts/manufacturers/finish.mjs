import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {parse,stringify} from 'yaml';
import {articleFiles} from '../article-files.mjs';
import {hash} from '../geography/evidence.mjs';
const get=p=>JSON.parse(fs.readFileSync(p)),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const run=args=>execFileSync(process.execPath,args,{encoding:'utf8'}),git=args=>execFileSync('git',['-c','safe.directory=D:/NeoEcosystem/FreshWiki/site',...args],{encoding:'utf8'});
const roster=get('conversion/manufacturers/roster.json');assert.equal(get('conversion/manufacturers/acceptances.json').length,4);
console.log(run(['scripts/conversion/review-family.mjs','manufacturers','--complete']));
const normalize=s=>{const m=s.replaceAll('\r\n','\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);assert.ok(m);return '---\n'+stringify(parse(m[1]),{lineWidth:0}).trimEnd()+'\n---\n\n'+m[2].replace(/^[ \t]+$/gm,'').trim()+'\n'};
for(const file of Object.values(roster.files)){const text=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');assert.equal(normalize(text),text,file);assert.equal(normalize(normalize(text)),text,file);}
const paths=['conversion/reference.json','conversion/gaps/source.json','conversion/gaps/register.json','conversion/gaps/resolutions.json'];
const hashes=Object.fromEntries(paths.map(p=>[p,hash(fs.readFileSync(p))]));
for(let pass=0;pass<2;pass++){console.log(run(['scripts/gaps/register.mjs']));for(const p of paths)assert.equal(hash(fs.readFileSync(p)),hashes[p],p);}
const changes=git(['diff','--name-status',roster.baseRevision,'--','src/content/articles']).trim().split('\n').map(l=>l.trim().split('\t'));
assert.equal(changes.length,30);assert.ok(changes.every(([s])=>s==='A'));assert.deepEqual(new Set(changes.map(([,p])=>p)),new Set(Object.values(roster.files)));
save('conversion/manufacturers/repeatability.json',{articles:30,firstPassChanges:0,secondPassChanges:0,gapRegenerations:2,unchanged:true,retainedHashes:hashes,earlierArticleFilesUnchanged:2138});
const files=articleFiles(),ids=new Set(files.map(a=>a.data.articleId));assert.equal(ids.size,2168);
const remaining=get('conversion/remaining-after-modding.json');remaining.baseRevision=roster.baseRevision;remaining.pending=16;for(const g of Object.values(remaining.groups))g.pending=g.pending.filter(a=>!ids.has(a.id));assert.equal(Object.values(remaining.groups).reduce((n,g)=>n+g.pending.length,0),16);save('conversion/remaining-after-manufacturers.json',remaining);
console.log(run(['scripts/report.mjs']));console.log(run(['scripts/manufacturers/handoff.mjs']));
