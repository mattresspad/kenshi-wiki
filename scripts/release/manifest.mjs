import {resolve,join} from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {releaseConfiguration} from './config.mjs';
import {read,save,sha,git,hashes} from './common.mjs';
import {buildCatalog} from '../../src/lib/catalog.mjs';
import {articleFiles} from '../article-files.mjs';
export async function manifest({checks,validation}){
 assert.ok(Array.isArray(checks)&&checks.length&&validation,'Executed validation evidence is required');
 const release=releaseConfiguration(),{workers}=await readBuildOutput(process.cwd());
 assert.equal(workers.default.config.name,release.worker);
 const atlas=buildCatalog(articleFiles()),search=read('reports/utilities/search-coverage.json');
 const work=read(join(workers.default.assetsDir,'pages-needing-work/index.json')).counts;
 const record={...release,sourceSha:git('rev-parse','HEAD'),sourceBranch:process.env.WIKI_CANDIDATE_BRANCH||git('branch','--show-current'),
  node:process.versions.node,lockfileSha256:sha(fs.readFileSync('package-lock.json')),packageFiles:hashes(resolve('.cloudflare/output')),
  counts:{articles:[...atlas.byId.values()].filter(a=>a.filePath).length,categories:atlas.categories.size,
   memberships:[...atlas.categories.values()].reduce((n,c)=>n+c.members.length,0),titleSearch:atlas.searchTitles.length,fullText:search.indexed,random:search.random.count},
  work,checks,validation,productionTrafficChanged:false};
 record.packageSha256=sha(JSON.stringify(record.packageFiles));
 save('reports/release/candidate.json',record);return record;
}
