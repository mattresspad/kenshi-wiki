import assert from 'node:assert/strict';
import fs from 'node:fs';
import {git,read,save,sha} from '../release/common.mjs';
import {assertTrustedRun,assertApply,activeVersion,maintenanceRecord,assertWikiVersion,worker} from './policy.mjs';
import {verifyMode} from './verify.mjs';
import {call,deployment,version,recent,assertCurrentMain,summary} from './remote.mjs';
const sourceSha=git('rev-parse','HEAD'),action=process.env.WIKI_MAINTENANCE_ACTION;
assertTrustedRun(process.env,sourceSha);await assertCurrentMain(sourceSha);
assert.equal(sha(fs.readFileSync('reports/maintenance/plan.json')),process.env.WIKI_MAINTENANCE_PLAN_SHA256,'Approval plan changed');
const plan=read('reports/maintenance/plan.json'),snapshot=read('reports/maintenance/crawl-snapshot.json');
assert.deepEqual(snapshot.hashes,plan.crawlHashes);
const current=deployment(),target=version(plan.targetVersion);
assertApply(plan,{sourceSha,action,current,target,recent:recent()});
if(action==='on')assertWikiVersion(version(activeVersion(current)));
else assert.equal(maintenanceRecord(version(activeVersion(current)))?.returnVersion,target.id,'Return target changed');
// Recheck the exact preview just before the traffic change; never rebuild/upload.
await verifyMode(plan.url,plan,snapshot);
assert.equal(deployment().id,current.id,'Traffic changed during verification');await assertCurrentMain(sourceSha);
const recovery={version:plan.previousVersion,command:'cf workers deployments create --worker kenshi-wiki --strategy percentage --versions '+"'"+JSON.stringify([{version_id:plan.previousVersion,percentage:100}])+"'"};
save('reports/maintenance/recovery.json',recovery);
call('workers','deployments','create','--worker',worker,'--strategy','percentage','--versions',JSON.stringify([{version_id:plan.targetVersion,percentage:100}]));
const after=deployment();assert.equal(activeVersion(after),plan.targetVersion);
const receipt={...plan,deployment:after.id,productionTrafficChanged:true,liveChecksPassed:false,recovery};save('reports/maintenance/receipt.json',receipt);
try{
 // A switch takes time to reach all edges. Retry read-only checks only.
 let checks,lastError;for(let i=0;i<6;i++){try{checks=await verifyMode('https://kenshi.wiki',plan,snapshot);break;}catch(error){lastError=error;if(i<5)await new Promise(r=>setTimeout(r,5000));}}
 if(!checks)throw lastError;
 assert.equal(deployment().id,after.id,'Traffic changed during live checks');
 save('reports/maintenance/receipt.json',{...receipt,liveChecksPassed:true,checks});
 summary('## Maintenance '+action.toUpperCase()+' applied and checked\n\n[Open Kenshi Wiki](https://kenshi.wiki)\n\nServing `'+plan.targetVersion+'` at 100%. Saved return version: `'+plan.returnVersion+'`.');
}catch(error){summary('## Traffic switched; live verification needs attention\n\nDo not blindly rerun the switch. Inspect the failure and `reports/maintenance/receipt.json`. No automatic rollback was performed. Recovery version: `'+recovery.version+'`.');throw error;}
