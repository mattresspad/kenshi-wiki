import fs from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {releaseConfiguration,assertStaging,assertRehearsal} from './config.mjs';
import {read,save,cf,git,hashes,clean} from './common.mjs';
const release=releaseConfiguration(),candidate=read('reports/release/candidate.json');assertStaging(release,candidate);clean();assert.equal(candidate.sourceSha,git('rev-parse','HEAD'));assert.deepEqual(hashes(resolve('.cloudflare/output')),candidate.packageFiles);
const {workers}=await readBuildOutput(process.cwd());assert.equal(workers.default.config.name,'kenshi-wiki-restoration');assert.equal(workers.default.config.assets.notFoundHandling,'404-page');
assertRehearsal(process.env,candidate.sourceSha);
assert.equal(git('ls-remote','origin','refs/heads/main').split(/\s+/)[0],candidate.sourceSha,'Staging requires the current main commit');
if(process.env.GITHUB_ACTIONS){const r=await fetch('https://api.github.com/repos/mattresspad/kenshi-wiki/git/ref/heads/main',{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json'}});assert.ok(r.ok);assert.equal((await r.json()).object.sha,candidate.sourceSha,'A newer candidate exists; do not stage this run');}
const list=spawnSync(process.execPath,[cf,'workers','deployments','list','--worker',release.worker],{encoding:'utf8'});
let bootstrap=false;if(list.status!==0){assert.match(list.stderr,/10007|does not exist/);bootstrap=true;}
const args=bootstrap?['deploy','--prebuilt']:['workers','versions','create','--prebuilt','--tag',candidate.sourceSha.slice(0,12),'--message','FreshWiki '+candidate.sourceSha];
const upload=spawnSync(process.execPath,[cf,...args],{encoding:'utf8',maxBuffer:64*1024*1024});fs.writeFileSync('reports/release/staging-upload.log',upload.stdout+upload.stderr);if(upload.status!==0)throw Error('Staging upload failed; see reports/release/staging-upload.log');
let version=(upload.stdout+upload.stderr).match(/(?:Worker |Current )?Version ID:\s*([0-9a-f-]{36})/i)?.[1];
if(bootstrap){const deployed=JSON.parse(execFileSync(process.execPath,[cf,'workers','deployments','list','--worker',release.worker],{encoding:'utf8'}));version=deployed.deployments[0].versions[0].version_id;}
assert.match(version??'',/^[0-9a-f-]{36}$/);
const details=JSON.parse(execFileSync(process.execPath,[cf,'workers','versions','get',version,'--worker-id',release.worker],{encoding:'utf8'}));
const url=details.urls.find(u=>new URL(u).hostname===version.slice(0,8)+'-kenshi-wiki-restoration.prds.workers.dev');assert.ok(url,'Missing immutable version URL');
const record={sourceSha:candidate.sourceSha,worker:release.worker,version,url,bootstrap,packageFiles:candidate.packageFiles,counts:candidate.counts,productionTrafficChanged:false};save('reports/release/staging.json',record);
if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'version='+version+'\nurl='+url+'\n');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'FreshWiki candidate '+candidate.sourceSha+'\n\n'+url+'\n\nWorker version: '+version+'\n');
console.log('Staged '+candidate.sourceSha+' at '+url);
