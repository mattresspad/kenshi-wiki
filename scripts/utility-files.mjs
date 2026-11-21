import {readFileSync,readdirSync} from 'node:fs';
import {parse} from 'yaml';
export function utilityFiles(){const entries=readdirSync('src/content/site',{recursive:true}).filter(p=>p.endsWith('.md')).map(p=>{const filePath='src/content/site/'+p.replaceAll('\\','/'),text=readFileSync(filePath,'utf8');return {filePath,data:parse(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])}});if(new Set(entries.map(e=>e.data.pageId)).size!==entries.length)throw Error('Duplicate utility identity');return entries;}
