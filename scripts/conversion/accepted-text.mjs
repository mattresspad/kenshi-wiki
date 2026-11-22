import assert from 'node:assert/strict';
import {load} from 'cheerio';
import changes from '../../conversion/accepted-text.json' with {type:'json'};

// Verify each approved replacement before comparing an in-memory copy with the
// immutable import fixture. This never modifies the article, output, or fixture.
export function withoutVerifiedAcceptedText(html, family, articleId, frozen) {
  const accepted=changes.filter(change=>change.family===family&&change.articleId===articleId);
  if(!accepted.length)return html;
  const $=load(html);
  for(const change of accepted){
    assert.equal(frozen.text,change.frozenTextFingerprint,change.id+' frozen evidence changed');
    const paragraph=$('.article-body p').filter((_,el)=>$(el).text()===change.rendered.after);
    assert.equal(paragraph.length,1,change.id+' approved paragraph must occur exactly once');
    assert.equal(paragraph.children().length,0,change.id+' unexpected paragraph markup');
    assert.equal(paragraph.prevAll('h2,h3,h4,h5,h6').first().attr('id'),change.headingId,change.id+' section changed');
    paragraph.text(change.rendered.before);
  }
  return $.html();
}

export function acceptedTextRecords(family, articleId) {
  return changes.filter(change=>change.family===family&&change.articleId===articleId)
    .map(({id,articleId,author,pullRequest,sourceCommit,mergeCommit})=>({id,articleId,author,pullRequest,sourceCommit,mergeCommit}));
}
