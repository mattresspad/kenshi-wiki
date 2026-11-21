import {readWiki} from '../../lib/wiki';
import {readWorkIndex} from '../../lib/work-data.mjs';
import {compactWorkIndex} from '../../lib/work-index.mjs';
export async function GET(){return new Response(JSON.stringify(compactWorkIndex(await readWorkIndex(await readWiki()))),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
