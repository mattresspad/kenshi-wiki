import {spawnSync} from 'node:child_process';
import {inventory} from './policy.mjs';
const run=spawnSync(process.execPath,['--test',...inventory().catalog],{stdio:'inherit',env:process.env});
if(run.error)throw run.error;
process.exitCode=run.status??1;
