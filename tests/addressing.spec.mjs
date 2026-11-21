import {editBranch} from './edit-target.mjs';
import {utilityStage} from '../src/lib/utility-routes.mjs';
import {test, expect} from '@playwright/test';
import {effectiveSnapshot as snapshot, origin} from '../src/lib/catalog.mjs';
import {articleFiles} from '../scripts/article-files.mjs';
import {editableSource,recordedSource} from '../src/lib/page-source.mjs';

import {initialIds, newestBatch} from '../scripts/conversion/batches.mjs';

const files = new Map(articleFiles().map(entry => [entry.data.articleId, entry.filePath]));

test('the search title index covers registered addresses and the header follows the active search route', async ({request,page}) => {
  const response = await request.get('/search-titles.json');
  expect(response.ok()).toBe(true);
  const rows = await response.json();
  const expected = new Map(snapshot.articles.map(a => [a.path,a.title]));
  for (const [path,title] of [['/pages-needing-work','Pages needing work'],['/about-kenshi','About Kenshi'],['/contributors','Contributors'],['/gameplay','Gameplay'],['/guides','Guides'],['/modding','Modding']]) expected.set(path,title);
  expect(rows).toHaveLength(snapshot.articles.length+snapshot.portals.length+3);
  expect(new Map(rows.map(([title,path])=>[path,title]))).toEqual(expected);
  await page.goto('/modding');
  await expect(page.getByRole('search')).toHaveAttribute('action',utilityStage>=4?'/search':origin+'/search');
});
