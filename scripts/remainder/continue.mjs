import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {dirname,join} from 'node:path';
const get=p=>JSON.parse(fs.readFileSync(p)),limit=Number(process.argv[2]??4);
const run=args=>execFileSync(process.execPath,args,{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
const git=args=>execFileSync('git',['-c','safe.directory=D:/NeoEcosystem/FreshWiki/site',...args],{stdio:'inherit'});
const roster=get('conversion/remainder/roster.json');
while(get('conversion/remainder/acceptances.json').length<limit){
 const cp=get('conversion/remainder/checkpoint.json').included,accepted=get('conversion/remainder/acceptances.json').length;
 if(cp===accepted){const b=roster.batches[cp];assert.ok(fs.existsSync('reports/remainder/reviews/'+b.name+'.json'));run(['scripts/conversion/run-family-batch.mjs','remainder',b.name]);}
 else{assert.equal(cp,accepted+1);const b=roster.batches[cp-1],folder='reports/remainder/'+String(cp).padStart(2,'0')+'-'+b.name;
 for(const name of ['build','catalog','playwright','cloudflare']){const p=folder+'/'+name+'.log';if(fs.existsSync(p))fs.copyFileSync(p,folder+'/'+name+'-attempt-'+Date.now()+'.log');}
 run([join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),'run','remainder:accept']);
 run(['scripts/gaps/record-resolutions.mjs','remainder']);git(['add','.']);git(['commit','-m','docs(remainder): accept '+b.name+' and retain source qualifications']);}
}
