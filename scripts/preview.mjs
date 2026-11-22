import {parseArgs} from 'node:util';
import {openPreview} from './static-preview.mjs';
const {values}=parseArgs({options:{contact:{type:'boolean',default:false},host:{type:'string',default:'127.0.0.1'},port:{type:'string',default:'4392'}}});
const runtime=await openPreview(values.host,Number(values.port),{contact:values.contact});
for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>runtime.dispose());
console.log('Static wiki preview at '+(await runtime.ready).href);
