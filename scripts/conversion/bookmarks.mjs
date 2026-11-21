import assert from 'node:assert/strict';
import {load} from 'cheerio';

// Check additive compatibility anchors independently; never weaken the frozen ID/content comparison.
export function withoutVerifiedBookmarks(html, bookmarks, originalIds) {
  if (!Object.keys(bookmarks).length) return html;
  const $ = load(html);
  for (const [old, target] of Object.entries(bookmarks)) {
    assert.ok(!originalIds.includes(old), 'Alias replaces an original ID: ' + old);
    assert.ok(originalIds.includes(target), 'Alias target absent from frozen content: ' + target);
    const find = id => $('[id]').filter((_, el) => el.attribs.id === id);
    const alias = find(old), section = find(target);
    assert.equal(alias.length, 1, 'Alias must occur exactly once: ' + old);
    assert.equal(section.length, 1, 'Target must occur exactly once: ' + target);
    assert.ok(alias.is('span.bookmark[aria-hidden="true"]'), 'Alias must be a decorative marker: ' + old);
    assert.equal(alias.attr('data-bookmark-target'), target);
    assert.equal(alias.contents().length, 0, 'Alias cannot contain article content: ' + old);
    assert.equal(alias.next()[0], section[0], 'Alias must immediately precede its target: ' + old);
    alias.remove();
  }
  return $.html();
}
