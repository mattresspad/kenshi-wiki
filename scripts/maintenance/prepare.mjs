import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolve} from 'node:path';
import {git,save,sha,gate,npm,cf} from '../release/common.mjs';
import {assertTrustedRun,chooseAction,assertEligible,assertWikiVersion,activeVersion,versionUrl,worker,maintenanceRecord} from './policy.mjs';
import {collectDocuments} from './documents.mjs';
import {buildMaintenance} from './package.mjs';
import {verifyMode} from './verify.mjs';
import {deployment,version,recent,assertCurrentMain,assertUnchanged,summary,output,upload} from './remote.mjs';
const sourceSha=git('rev-parse','HEAD'),action=process.env.WIKI_MAINTENANCE_ACTION;
assertTrustedRun(process.env,sourceSha);await assertCurrentMain(sourceSha);
const current=deployment(),active=version(activeVersion(current));
const choice=chooseAction(action,current,active);
if(choice.noop){summary('## Already '+(action==='on'?'in maintenance':'serving the wiki')+'\n\nNo upload or traffic change.');output({noop:'true'});process.exit(0);}
assertEligible(choice.returnVersion,recent());
const restored=version(choice.returnVersion);assertWikiVersion(restored);
const snapshot=await collectDocuments(versionUrl(restored));
save('reports/maintenance/crawl-snapshot.json',snapshot);
let target=restored,packageSha256=null;
if(action==='on'){
 const root=resolve('reports/maintenance/package');
 const packaged=await buildMaintenance(root,snapshot);packageSha256=packaged.packageSha256;
 save('reports/maintenance/package-checksums.json',packaged);
 // cf reads the prebuilt package from cwd. No Astro build and no email credentials.
 const {spawnSync}=await import('node:child_process');
 const dry=spawnSync(process.execPath,[cf,'workers','versions','create','--prebuilt','--dry-run'],{cwd:root,encoding:'utf8'});
 fs.writeFileSync('reports/maintenance/package-dry-run.log',(dry.stdout??'')+(dry.stderr??''));assert.equal(dry.status,0,'Maintenance package dry run failed');
 await assertCurrentMain(sourceSha);assertUnchanged(current);
 target=version(upload(root,'FreshWiki maintenance v1 return '+restored.id+' source '+sourceSha+' package '+packageSha256));
 assert.deepEqual(maintenanceRecord(target),{returnVersion:restored.id,sourceSha,packageSha256});
 assert.ok(!target.assets,'Maintenance upload unexpectedly retains wiki assets');
 assert.ok(!(target.bindings??[]).some(b=>b.type==='send_email'||b.type==='assets'),'Maintenance must not retain mail or asset bindings');
 // Cloudflare may preserve unused secret_text bindings. This Worker never reads env.
}
const plan={schema:1,worker,sourceSha,action,noop:false,previousDeployment:current.id,previousVersion:active.id,returnVersion:restored.id,targetVersion:target.id,url:versionUrl(target),packageSha256,crawlHashes:snapshot.hashes};
assertEligible(target.id,recent());assertEligible(restored.id,recent());
save('reports/maintenance/plan.json',plan);
const checks=await verifyMode(plan.url,plan,snapshot);
if(action==='on')await gate('reports/maintenance','browser',[npm,'exec','--','playwright','test','tests/maintenance.spec.mjs'],{WIKI_PREVIEW_URL:plan.url,WIKI_MAINTENANCE_PREVIEW_URL:plan.url});
assertUnchanged(current);
save('reports/maintenance/preview-checks.json',{passed:true,checks,productionTrafficChanged:false});
output({noop:'false',url:plan.url,plan_hash:sha(fs.readFileSync('reports/maintenance/plan.json'))});
summary('## Maintenance '+action.toUpperCase()+' ready for approval\n\n[Review the tested '+(action==='on'?'maintenance':'return')+' version]('+plan.url+')\n\nCurrent: `'+active.id+'`\n\nTarget: `'+target.id+'`\n\nSaved wiki: `'+restored.id+'`\n\nAll crawl files match. Production is unchanged. Use **Review deployments → production → Approve and deploy** to apply this choice.');
