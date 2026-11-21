import fs from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {resolve,join,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
export const read=p=>JSON.parse(fs.readFileSync(p));
export function save(p,value){fs.mkdirSync(resolve(p,'..'),{recursive:true});fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n');}
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const git=(...args)=>execFileSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),...args],{encoding:'utf8'}).trim();
const require=createRequire(import.meta.url);
export const npm=process.env.npm_execpath || (process.platform==='win32'?join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'):require.resolve('npm/bin/npm-cli.js'));
export const cf=resolve('node_modules/cf/bin/cf');
export async function gate(folder,name,args,env={}){
 fs.mkdirSync(folder,{recursive:true});const file=join(folder,name+'.log'),fd=fs.openSync(file,'w');
 try{const code=await new Promise((done,reject)=>{const p=spawn(process.execPath,args,{stdio:['ignore',fd,fd],env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',...env}});p.on('error',reject);p.on('close',done)});if(code!==0)throw Error(name+' failed ('+code+'): '+file);}finally{fs.closeSync(fd)}
 console.log('Passed '+name);
}
export function hashes(root){return Object.fromEntries(fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const path=join(e.parentPath,e.name),relative=path.slice(root.length+1).replaceAll('\\','/');return [relative,sha(fs.readFileSync(path))]}).sort(([a],[b])=>a.localeCompare(b)));}
export function clean(){git('diff','--exit-code');git('diff','--cached','--exit-code');}
