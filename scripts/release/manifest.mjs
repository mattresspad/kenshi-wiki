import {resolve} from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {releaseConfiguration} from './config.mjs';
import {read,save,sha,git,hashes} from './common.mjs';
export async function manifest({checks,validation}){
 assert.ok(Array.isArray(checks)&&checks.length&&validation,"Executed validation evidence is required");
 const release=releaseConfiguration(),{workers}=await readBuildOutput(process.cwd());assert.equal(workers.default.config.name,release.worker);
 const routes=read('reports/routes.json'),search=read('reports/utilities/search-coverage.json');assert.equal(routes.gaps.introduced,0);assert.equal(routes.temporaryLinks.length,0);
 const record={...release,sourceSha:git('rev-parse','HEAD'),sourceBranch:process.env.WIKI_CANDIDATE_BRANCH||git('branch','--show-current'),node:process.versions.node,lockfileSha256:sha(fs.readFileSync('package-lock.json')),packageFiles:hashes(resolve('.cloudflare/output')),counts:{articles:routes.transferredArticles.length,categories:routes.routes.filter(r=>r.kind==='category').length,memberships:routes.memberships,titleSearch:routes.searchTitles,fullText:search.indexed,random:search.random.count},work:read('reports/work-coverage.json'),checks,validation,productionTrafficChanged:false};
 save('reports/release/candidate.json',record);return record;
}
