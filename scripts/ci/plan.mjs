import fs from 'node:fs';
import assert from 'node:assert/strict';
import {git,save} from '../release/common.mjs';
import {articleContext,selectChecks} from './policy.mjs';
export function createPlan(mode='routine'){
 const head=git('rev-parse','HEAD');
 let base=process.env.WIKI_CI_BASE_SHA;
 if(process.env.GITHUB_EVENT_NAME==='pull_request'){
  const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH));base=event.pull_request.base.sha;
  assert.ok(event.pull_request.head.sha,'Missing PR head');
 }
 if(base)assert.match(base,/^[a-f0-9]{40}$/);
 let changes;
 if(base){git('cat-file','-e',base+'^{commit}');changes=git('diff','--no-renames','--name-status',base,head).split('\n').filter(Boolean).map(line=>{const [status,...parts]=line.split('\t');return {status,path:parts.join('\t')};});}
 const plan={...selectChecks({changes,mode,articles:articleContext()}),sourceSha:head,baseSha:base??null,run:new Date().toISOString()};
 save('reports/ci/plan.json',plan);save('reports/ci/phases.json',{run:plan.run,phases:{}});
 const text='## Selected coverage\n\n'+plan.kind+' checks: '+plan.catalog.length+' catalog files, '+plan.browser.length+' browser files.\n\n'+(plan.audit?'Explicit exhaustive audit.': 'Exhaustive conversion auditing runs separately in **Exhaustive audits**.')+'\n\n'+plan.reasons.map(r=>'- '+r).join('\n')+'\n';
 console.log(text);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,text);
 return plan;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/scripts/ci/plan.mjs'))createPlan(process.argv[2]??'routine');
