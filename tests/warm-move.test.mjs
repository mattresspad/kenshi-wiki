import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempDisposableSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve, sep as requireSeparator} from 'node:path';
import {load} from 'cheerio';
import {beforeGeography,roster} from '../scripts/geography/batches.mjs';
import {articleFiles} from '../scripts/article-files.mjs';
import {origin} from '../src/lib/catalog.mjs';
import {editableSource, recordedSource} from '../src/lib/page-source.mjs';

test('a byte-identical file move updates the warm Astro build; a separate canonical rename propagates', {timeout:120000}, t=>{
  // The disposable source tree shares installed packages through its ancestor. It contains no checkout of the prototype.
  mkdirSync('reports',{recursive:true});
  const fixture = mkdtempDisposableSync(resolve('reports','address-fixture-'));
  t.after(()=>fixture.remove());
  const root = fixture.path;
  const pilot=new Set([...beforeGeography,...roster.batches[0].ids]);
  const fixtureFiles=new Set(articleFiles().filter(entry=>pilot.has(entry.data.articleId)).map(entry=>resolve(entry.filePath)));
  for (const file of ['astro.config.mjs','package.json','src','public','conversion','scripts','tests']) {
    cpSync(file,join(root,file),{recursive:true,filter:source=>!resolve(source).startsWith(resolve('src/content/articles')+requireSeparator) || !source.endsWith('.md') || fixtureFiles.has(resolve(source))});
  }
  const coverage=join(root,'conversion/geography/checkpoint.json');
  writeFileSync(coverage,JSON.stringify({included:Math.min(1,JSON.parse(readFileSync(coverage)).included)}));
  writeFileSync(join(root,'conversion/factions/checkpoint.json'),JSON.stringify({included:0}));
  writeFileSync(join(root,'conversion/races/checkpoint.json'),JSON.stringify({included:0}));
  const reviewFile=join(root,'conversion/reviews.json'), review=JSON.parse(readFileSync(reviewFile));
  review.articles=Object.fromEntries(Object.entries(review.articles).filter(([id])=>pilot.has(id)));
  writeFileSync(reviewFile,JSON.stringify(review));
  const manifest = JSON.parse(readFileSync('node_modules/astro/package.json'));
  const cli = resolve('node_modules/astro',manifest.bin.astro ?? manifest.bin);
  const inventory = join(root,'conversion/reference.json');
  const registry = JSON.parse(readFileSync(inventory));
  const record = registry.articles.find(a=>a.id==='modding/blender-plugins');
  const docs = recordedSource(record.sourceFile,record.sourceRevision,registry.revision);
  const editable = articleFiles(root).find(e=>e.data.articleId===record.id).filePath;
  const moved = 'src/content/articles/reference/fixture-note.md';
  const html = route => load(readFileSync(join(root,'dist',route.slice(1)+'.html')));
  function build(branch='') {
    const options = {cwd:root,encoding:'utf8',env:{...process.env, WIKI_EDIT_BRANCH:branch,
      ASTRO_TELEMETRY_DISABLED:'1', GIT_DIR:join(root,'unavailable.git')}};
    for (const args of [['scripts/check-articles.mjs'],[cli,'build'],['scripts/package.mjs'],['scripts/report.mjs']]) {
      execFileSync(process.execPath,args,options);
    }
  }
  function checkPage(route, file, branch='') {
    const $ = html(route);
    assert.equal($('article[data-article-id]').attr('data-article-id'),record.id);
    assert.equal($('link[rel=canonical]').attr('href'),origin+route);
    assert.equal($('.source-links a').first().attr('href'),docs.markdown);
    assert.equal($('.revisions a').last().attr('href'),docs.history);
    const correction = new URL($('.article-actions a').last().attr('href'));
    assert.equal(correction.searchParams.get('article'),origin+route);
    if (branch) {
      assert.equal($('.wide-tools a').last().attr('href'),editableSource(file,branch).url);
      assert.equal($('.edit-file').length,0);
    } else {
      assert.equal($('.wide-tools .edit-file code').text(),file);
    }
    const titles = JSON.parse(readFileSync(join(root,'dist/search-titles.json')));
    assert.equal(titles.find(([title])=>title==='Blender plugins')[1],route);
    for (const path of ['/modding','/category/modding']) {
      const page = html(path);
      const link = page('main a').filter((_,a)=>page(a).text()==='Blender plugins');
      assert.equal(link.attr('href'),route);
    }
    const ledger = JSON.parse(readFileSync(join(root,'reports/routes.json')));
    const row = ledger.routes.find(a=>a.id===record.id);
    assert.equal(row.editableFile,file);
    assert.equal(row.path,route);
    assert.equal(row.sourceFile,record.sourceFile);
    const portal = ledger.routes.find(a => a.path === '/modding');
    assert.equal(portal.editableFile, 'src/data/modding.json');
    assert.equal(portal.sourceFile, 'src/data/portals/modding.yaml');
    assert.ok(portal.evidence.markdown.endsWith('/' + registry.revision + '/' + portal.sourceFile));
    const pending = ledger.routes.find(a => a.id === 'ludins-reports');
    assert.equal(pending.transferred, false);
    assert.ok(pending.evidence.sourceLinks.includes('https://kenshi.fandom.com/wiki/Ludin%27s_Reports?oldid=90111'));
  }
  build();
  checkPage(record.path,editable);
  mkdirSync(dirname(join(root,moved)),{recursive:true});
  renameSync(join(root,editable),join(root,moved));
  build();
  checkPage(record.path,moved);
  const previous = record.path;
  record.path = '/fixture/blender-reference';
  registry.redirects.push({from:previous,to:record.path,status:301});
  writeFileSync(inventory,JSON.stringify(registry));
  const branch='review/address-fixture';
  build(branch);
  checkPage(record.path,moved,branch);
  assert.equal(existsSync(join(root,'dist',previous.slice(1)+'.html')),false);
  const sitemap=readFileSync(join(root,'dist/sitemap-0.xml'),'utf8');
  assert.ok(sitemap.includes('<loc>'+origin+record.path+'</loc>'));
  assert.ok(!sitemap.includes('<loc>'+origin+previous+'</loc>'));
});
