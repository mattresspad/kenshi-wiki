import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import changes from '../conversion/accepted-text.json' with {type:'json'};
import {articleEvidence} from '../scripts/geography/evidence.mjs';
import {withoutVerifiedAcceptedText,acceptedTextRecords} from '../scripts/conversion/accepted-text.mjs';
const change=changes.find(c=>c.id==='pr-57-hunger-floor');
const frozen=JSON.parse(readFileSync('conversion/gameplay/reference.json')).articles[change.articleId];
const html=()=>readFileSync('dist/guide-to-health.html','utf8');
const verify=source=>assert.deepEqual(articleEvidence(withoutVerifiedAcceptedText(source,'gameplay',change.articleId,frozen),false,'gameplay'),frozen);
const edit=fn=>{const $=load(html());fn($);return $.html();};
const paragraph=$=>$('.article-body p').filter((_,el)=>$(el).text()===change.rendered.after);

test('PR #57 evidence keeps the approved text, contributor and immutable original fingerprint',()=>{
  assert.equal(new Set(changes.map(c=>c.id)).size,changes.length);
  assert.equal(change.author,'teppuM');
  assert.match(change.pullRequest,/\/pull\/57$/);
  assert.equal(change.sourceCommit,'986c67e8c09ee7ee8ed9e436219d26d775820acd');
  assert.equal(change.mergeCommit,'d3aa2e8a7f1f98577469d9516a6fd0aa278d1535');
  const markdown=readFileSync(change.file,'utf8');
  assert.ok(markdown.includes(change.source.after));
  assert.ok(!markdown.includes(change.source.before));
  for(const key of ['before','after'])assert.equal(createHash('sha256').update(change.source[key]).digest('hex'),change.paragraphSha256[key]);
  assert.equal(articleEvidence(html(),false,'gameplay').text,change.acceptedTextFingerprint);
  verify(html());
  assert.equal(acceptedTextRecords('gameplay',change.articleId).length,1);
  assert.equal(withoutVerifiedAcceptedText('<p>unrelated</p>','gameplay','strength',{}),'<p>unrelated</p>');
});

test('accepted paragraph checks reject edits, reversion, duplication, extra markup and wrong sections',()=>{
  for(const mutate of [
    $=>paragraph($).text(change.rendered.after.replace('100 and 220','100 and 221')),
    $=>paragraph($).text(change.rendered.before),
    $=>paragraph($).after(paragraph($).clone()),
    $=>paragraph($).wrapInner('<span></span>'),
    $=>paragraph($).insertAfter($('#nutrition'))
  ])assert.throws(()=>verify(edit(mutate)));
  assert.throws(()=>withoutVerifiedAcceptedText(html(),'gameplay',change.articleId,{...frozen,text:'0'.repeat(64)}));
});

test('PR #57 acceptance does not exempt surrounding text, table values, links or bookmarks',()=>{
  for(const mutate of [
    $=>$('.lead-text p').first().append(' An unapproved sentence.'),
    $=>$('.article-body td').first().text('99.99x'),
    $=>$('.article-body a').first().attr('href','/wrong-destination'),
    $=>$('#hunger').attr('id','lost-hunger')
  ])assert.throws(()=>verify(edit(mutate)));
});
