import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {snapshot} from '../src/lib/catalog.mjs';
import {utilityStage,historicalSourceRedirects} from '../src/lib/utility-routes.mjs';
import {originalUtilities,utilitySource} from '../src/lib/utility-routes.mjs';
import {utilityFiles} from '../scripts/utility-files.mjs';

// Moved intact from utilities.test.mjs: this assertion group consumes the exhaustive report.
test('complete conversion ledger preserves every route and historical redirect',()=>{
 if(utilityStage<4)return;
 const routes=JSON.parse(fs.readFileSync('reports/routes.json'));assert.equal(routes.temporaryLinks.length,0);assert.ok(routes.routes.every(r=>r.status==='preserved locally'));assert.equal(new Set(routes.assetRedirects.map(r=>r.from)).size,routes.assetRedirects.length);for(const r of [...snapshot.redirects,...historicalSourceRedirects])assert.ok(routes.assetRedirects.some(a=>a.from===r.from&&a.to===r.to&&a.status===r.status));
});

test('original utility ledger records current history without a fictitious frozen source revision',()=>{
 const routes=JSON.parse(fs.readFileSync('reports/routes.json')).routes;
 for(const definition of originalUtilities){
  const entry=utilityFiles().find(e=>e.data.pageId===definition.id);
  const ledger=routes.find(r=>r.path===definition.path);
  assert.equal(ledger.provenance,'original');assert.equal(ledger.sourceRevision,'main');
  assert.equal(ledger.editableFile,entry.filePath);
  assert.equal(ledger.evidence.history,utilitySource(definition,entry.filePath).history);
 }
});
