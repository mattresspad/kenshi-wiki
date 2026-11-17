import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {snapshot} from '../../src/lib/catalog.mjs';
import {discover,mergeRegister} from './core.mjs';
const baseline=JSON.parse(readFileSync('conversion/gaps/source.json'));
const detected=discover(baseline,new Set(baseline.registeredRoutes),new Map(baseline.redirects.map(r=>[r.from,r.to])));
const file='conversion/gaps/register.json';
const old=existsSync(file)?JSON.parse(readFileSync(file)):{version:1,revision:snapshot.revision,findings:[]};
const result={...old,findings:mergeRegister(old.findings,detected,baseline)};
const body=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==body)throw Error('Gap register needs normalization');}
else writeFileSync(file,body);
console.log(result.findings.length+' deduplicated findings; curated fields retained.');
