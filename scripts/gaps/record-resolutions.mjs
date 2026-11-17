import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const get=file=>JSON.parse(readFileSync(file));
const report=get('reports/gaps/register.json'),accepted=get('conversion/races/acceptances.json');
assert.equal(accepted.at(-1)?.pages,report.scope.currentPages,'Accept the current batch before recording resolutions');
assert.equal(accepted.at(-1)?.number,4,'This handoff records the completed race-family acceptance');
const file='conversion/gaps/resolutions.json',history=existsSync(file)?get(file):{version:1,records:[]};
for(const row of report.findings.filter(r=>r.status==='resolved'&&r.resolution)){
 const proof={id:row.id,kind:row.kind,target:row.target,sourceRevision:report.revision,
 acceptedIn:'conversion/races/acceptances.json#race-siblings-2',resolution:row.resolution};
 if(!history.records.some(old=>JSON.stringify(old)===JSON.stringify(proof)))history.records.push(proof);
}
history.records.sort((a,b)=>a.id.localeCompare(b.id,'en'));
writeFileSync(file,JSON.stringify(history,null,2)+'\n');
console.log(history.records.length+' accepted resolution records retained.');
