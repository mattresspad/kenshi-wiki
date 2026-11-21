import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {articleFiles,assetRedirects} from '../article-files.mjs';
import {buildCatalog,effectiveSnapshot} from '../../src/lib/catalog.mjs';
import {reportGaps} from '../gaps/report.mjs';
const get=p=>JSON.parse(fs.readFileSync(p)),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(get('conversion/pr44/acceptances.json').length,1,'Accept the contribution before finalizing');
const prior=get('conversion/modding/repeatability.json');
assert.equal(hash('conversion/reference.json'),prior.baselineRegistrySHA256);
assert.equal(hash('conversion/gaps/source.json'),prior.frozenGapSourceSHA256);
assert.equal(hash('conversion/gaps/register.json'),prior.curatedFindingsSHA256);
execFileSync(process.execPath,['scripts/gaps/record-resolutions.mjs','pr44'],{stdio:'inherit'});
const retained=['conversion/reference.json','conversion/gaps/source.json','conversion/gaps/register.json','conversion/gaps/resolutions.json','conversion/pr-44/gap-source.json','conversion/pr-44/gap-findings.json','conversion/pr-44/version-evidence.json'];
const hashes=Object.fromEntries(retained.map(p=>[p,hash(p)]));
const file='src/content/articles/modding/meitou/code-mod-hooks.md',text=fs.readFileSync(file,'utf8'),normalize=s=>s.replaceAll('\r\n','\n').trimEnd()+'\n';
assert.equal(normalize(text),text);assert.equal(normalize(normalize(text)),text);
const atlas=buildCatalog(articleFiles(),effectiveSnapshot,assetRedirects('dist/_redirects')),reviews=get('conversion/reviews.json');let first;
for(let pass=0;pass<2;pass++){
 execFileSync(process.execPath,['scripts/gaps/register.mjs'],{stdio:'inherit'});
 reportGaps(atlas,reviews.articles);
 const current=hash('reports/gaps/register.json');if(pass)assert.equal(current,first);else first=current;
 for(const[p,value]of Object.entries(hashes))assert.equal(hash(p),value,p+' changed during regeneration');
}
fs.writeFileSync('conversion/pr-44/repeatability.json',JSON.stringify({baselineNormalization:'conversion/modding/repeatability.json',contributionNormalization:'LF and final newline; authored frontmatter and body retained',contributionSHA256:hash(file),passes:2,unchanged:true,retainedHashes:hashes,composedGapReportSHA256:first},null,2)+'\n');
execFileSync(process.execPath,['scripts/modding/handoff.mjs'],{stdio:'inherit'});
console.log('Contribution handoff and independent gap evidence regenerated without changing curated notes or history.');
