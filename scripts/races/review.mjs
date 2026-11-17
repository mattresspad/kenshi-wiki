import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {snapshot} from '../../src/lib/catalog.mjs';
import {selectedIds} from '../conversion/batches.mjs';
const get=file=>JSON.parse(readFileSync(file));
const notes=get('conversion/races/review.json'),curated=get('conversion/gaps/register.json'),review=get('conversion/reviews.json');
assert.equal(notes.revision,snapshot.revision);
assert.equal(new Set(notes.articles.map(a=>a.id)).size,33);
const findings=new Set(curated.findings.map(r=>r.id));
for(const id of selectedIds('races')){
 const note=notes.articles.find(n=>n.id===id);assert.ok(note?.existence&&note.content&&note.organization,id);
 for(const question of note.questions)assert.ok(findings.has('claim:'+question),id+' '+question);
 review.articles[id]={...review.articles[id],editorialReview:'conversion/races/review.json'};
}
writeFileSync('conversion/reviews.json',JSON.stringify(review,null,2)+'\n');
console.log('Recorded '+selectedIds('races').size+' individually reviewed local race articles; open findings retained.');
