import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const get=file=>JSON.parse(readFileSync(file));
const family=process.argv[2]??'races',acceptanceFile='conversion/'+family+'/acceptances.json';
const report=get('reports/gaps/register.json'),accepted=get(acceptanceFile),last=accepted.at(-1);
assert.equal(last?.pages,report.scope.currentPages,'Accept the current batch before recording resolutions');
const file='conversion/gaps/resolutions.json',history=existsSync(file)?get(file):{version:1,records:[]};
for(const row of report.findings.filter(r=>r.status==='resolved'&&r.resolution)){
 const proof={id:row.id,kind:row.kind,target:row.target,sourceRevision:report.revision,acceptedIn:acceptanceFile+'#'+last.name,resolution:row.resolution};
 if(!history.records.some(old=>old.id===proof.id&&old.sourceRevision===proof.sourceRevision&&JSON.stringify(old.resolution)===JSON.stringify(proof.resolution)))history.records.push(proof);
}
history.records.sort((a,b)=>a.id.localeCompare(b.id,'en'));
writeFileSync(file,JSON.stringify(history,null,2)+'\n');console.log(history.records.length+' accepted resolution records retained.');
