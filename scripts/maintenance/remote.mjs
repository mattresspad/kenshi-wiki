import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {cf} from '../release/common.mjs';
import {worker,activeVersion} from './policy.mjs';
export const call=(...args)=>JSON.parse(execFileSync(process.execPath,[cf,...args],{encoding:'utf8',maxBuffer:16*1024*1024}));
export const deployment=()=>call('workers','deployments','list','--worker',worker,'--per-page','1').deployments[0];
export const version=id=>call('workers','versions','get',id,'--worker-id',worker);
export const recent=()=>call('workers','versions','list','--worker-id',worker,'--per-page','100');
export async function assertCurrentMain(sourceSha) {
 const r=await fetch('https://api.github.com/repos/mattresspad/kenshi-wiki/git/ref/heads/main',{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN},signal:AbortSignal.timeout(20000)});
 assert.ok(r.ok,'Cannot verify main');assert.equal((await r.json()).object.sha,sourceSha,'Main advanced; run Maintenance mode again');
}
export function assertUnchanged(before) {const after=deployment();assert.equal(after.id,before.id,'Live deployment changed');assert.equal(activeVersion(after),activeVersion(before));}
export function summary(text) {console.log(text);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,text+'\n');}
export function output(values) {if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,Object.entries(values).map(([k,v])=>k+'='+v).join('\n')+'\n');}
export function upload(root,message) {
 const run=spawnSync(process.execPath,[cf,'workers','versions','create','--prebuilt','--tag','maintenance','--message',message],{cwd:resolve(root),encoding:'utf8',maxBuffer:16*1024*1024});
 fs.writeFileSync('reports/maintenance/upload.log',(run.stdout??'')+(run.stderr??''));
 assert.equal(run.status,0,'Maintenance upload failed; see upload.log');
 const id=((run.stdout??'')+(run.stderr??'')).match(/(?:Worker |Current )?Version ID:\s*([a-f0-9-]{36})/i)?.[1];
 assert.ok(id,'No uploaded version ID');return id;
}
