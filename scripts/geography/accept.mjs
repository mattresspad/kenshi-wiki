import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {openSync,closeSync,existsSync,readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {checkpoint,roster} from './batches.mjs';
import {openPreview} from '../static-preview.mjs';
import {captureBatch} from './capture.mjs';

const seq=checkpoint.included,batch=roster.batches[seq-1];
if(!batch) throw Error('Transfer a geography batch before accepting it');
const root='reports/geography', folder=String(seq).padStart(2,'0')+'-'+batch.name;
const output=join(root,folder);
mkdirSync(output,{recursive:true});
const get=file=>JSON.parse(readFileSync(file));
const save=(file,data)=>writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const evidenceFile='conversion/geography/acceptances.json';
const accepted=existsSync(evidenceFile)?get(evidenceFile):[];
assert.ok(accepted.length===seq-1 || (accepted.length===seq && accepted.at(-1).name===batch.name),'Unexpected acceptance sequence');
const npm=process.env.npm_execpath;
if(!npm) throw Error('Run npm run geography:accept');
async function gate(name,args,env={}){
  const file=join(output,name+'.log'),fd=openSync(file,'w');
  try{
    const status=await new Promise((done,reject)=>{
      const proc=spawn(process.execPath,[npm,...args],{stdio:['ignore',fd,fd],env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',...env}});
      proc.once('error',reject);proc.once('close',done);
    });
    if(status!==0) throw Error(name+' failed\n'+readFileSync(file,'utf8').trim().split(/\r?\n/).slice(-32).join('\n'));
  }finally{closeSync(fd);}
}
await gate('build',['run','build']);
const runtime=await openPreview('127.0.0.1',0);
try{
  const base=(await runtime.ready).origin;
  // Finish both suites even when one finds a regression, and retain their separate logs.
  const results=await Promise.allSettled([gate('catalog',['run','test:catalog']),gate('playwright',['test'],{WIKI_PREVIEW_URL:base}),gate('cloudflare',['run','package:check'])]);
  const failures=results.filter(r=>r.status==='rejected');
  if(failures.length)throw new Error(failures.map(r=>r.reason.message).join('\n'));
  const shots=await captureBatch(base,batch,output);
  const report=get('reports/routes.json');
  const historyFile='conversion/geography/link-changes.json';
  const changes=existsSync(historyFile)?get(historyFile):[];
  const old=new Set(get('conversion/geography/baseline-links.json'));
  for(const change of changes.slice(0,seq-1)){
    for(const url of change.resolved)old.delete(url);
    for(const url of change.introduced)old.add(url);
  }
  const now=new Set(report.temporaryLinks.flatMap(row=>row.to));
  const delta={resolved:[...old].filter(url=>!now.has(url)).sort(),introduced:[...now].filter(url=>!old.has(url)).sort(),remaining:[...now].sort()};
  save(join(output,'links.json'),delta);
  copyFileSync('reports/routes.json',join(output,'routes.json'));
  copyFileSync('reports/route-report.md',join(output,'route-report.md'));
  const pages=report.routes.filter(r=>r.status==='preserved locally' && ['article','home','category','portal','utility'].includes(r.kind)).length;
  const details={number:seq,name:batch.name,folder,articles:batch.ids.length,pages,verified:report.geography.verified,
    icons:report.geography.assets,links:{resolved:delta.resolved.length,introduced:delta.introduced.length,remaining:now.size}};
  save(join(output,'evidence.json'),{...details,shots});
  accepted.splice(seq-1,1,details);
  changes.splice(seq-1,1,{name:batch.name,resolved:delta.resolved,introduced:delta.introduced});
  save(historyFile,changes);
  save(evidenceFile,accepted);
  console.log('Accepted '+seq+'/'+roster.batches.length+' '+batch.name+' — '+pages+' pages; '+shots.length+' captures; '+now.size+' temporary destinations');
}finally{await runtime.dispose();}
