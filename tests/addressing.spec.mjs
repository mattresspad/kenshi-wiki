import {editBranch} from './edit-target.mjs';
import {utilityStage} from '../src/lib/utility-routes.mjs';
import {test, expect} from '@playwright/test';
import {snapshot, origin} from '../src/lib/catalog.mjs';
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

for (const phone of [false,true]) test('actual Markdown or portal editing destination '+(phone?'on phone':'on desktop'),async({page,context,baseURL})=>{
  await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:baseURL});
  const ids=new Set([...initialIds,...(newestBatch()?.ids.slice(0,1) ?? [])]);
  const routes=snapshot.articles.filter(article=>ids.has(article.id)).map(article=>article.path);
  for (const route of [...routes,'/modding']) {
    await page.goto(route);
    if (phone) await page.locator('#tools > summary').press('Enter');
    const article = snapshot.articles.find(a=>a.path===route);
    const path = article ? files.get(article.id) : 'src/data/modding.json';
    if(editBranch){
      await expect(page.locator(phone?'.small-tools':'.wide-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',editableSource(path,editBranch).url);
    }else{
    const editor = page.locator((phone?'.small-tools':'.wide-tools')+' .edit-file');
    const summary = editor.locator('summary');
    await summary.press('Enter');
    await expect(editor.locator('code')).toHaveText(path);
    await editor.getByRole('button',{name:'Copy',exact:true}).press('Enter');
    await expect(editor.getByRole('status')).toHaveText('Copied');
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(path);
    await page.keyboard.press('Escape');
    await expect(summary).toBeFocused();
    }
    const source = article ? recordedSource(article.sourceFile,article.sourceRevision,snapshot.revision)
      : recordedSource('src/data/portals/modding.yaml',snapshot.revision);
    await expect(page.getByRole('link',{name:article?'Recorded Markdown':'Recorded portal data'})).toHaveAttribute('href',source.markdown);
    for (const href of await page.locator('a').filter({hasText:/^View history$/}).evaluateAll(links=>links.map(a=>a.href))) expect(href).toBe(source.history);
  }
});

test('the editable file is selectable without JavaScript',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const page=await context.newPage();
    await page.goto('/modding/blender-plugins');
    await page.locator('#tools > summary').click();
    if(editBranch){await expect(page.locator('.small-tools').getByRole('link',{name:'Edit on GitHub',exact:true})).toHaveAttribute('href',editableSource(files.get('modding/blender-plugins'),editBranch).url);return;}
    const editor=page.locator('.small-tools .edit-file');
    await editor.locator('summary').click();
    const text=editor.locator('code');
    await expect(text).toBeVisible();
    await expect(text).toHaveText(files.get('modding/blender-plugins'));
    await expect(text).toHaveCSS('user-select','all');
    await expect(editor.getByRole('button',{name:'Copy'})).toBeHidden();
  } finally { await context.close(); }
});
