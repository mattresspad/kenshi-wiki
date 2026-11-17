import {test, expect} from '@playwright/test';
import {snapshot, origin} from '../src/lib/catalog.mjs';
import {articleFiles} from '../scripts/article-files.mjs';
import {recordedSource} from '../src/lib/page-source.mjs';

const files = new Map(articleFiles().map(entry => [entry.id, entry.filePath]));

test('the search title index covers registered addresses while the header opens live search', async ({request,page}) => {
  const response = await request.get('/search-titles.json');
  expect(response.ok()).toBe(true);
  const rows = await response.json();
  const expected = new Map(snapshot.articles.map(a => [a.path,a.title]));
  for (const [path,title] of [['/about-kenshi','About Kenshi'],['/contributors','Contributors'],['/gameplay','Gameplay'],['/guides','Guides'],['/modding','Modding']]) expected.set(path,title);
  expect(rows).toHaveLength(2189);
  expect(new Map(rows.map(([title,path])=>[path,title]))).toEqual(expected);
  await page.goto('/modding');
  await expect(page.getByRole('search')).toHaveAttribute('action',origin+'/search');
});

for (const phone of [false,true]) test('copy a real Markdown or portal file '+(phone?'on phone':'on desktop'),async({page,context,baseURL})=>{
  await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:baseURL});
  for (const route of ['/catun','/backpacks','/the-holy-nation','/modding/meitou/make-a-saddle-pack','/modding/blender-plugins','/modding']) {
    await page.goto(route);
    if (phone) await page.locator('#tools > summary').press('Enter');
    const editor = page.locator((phone?'.small-tools':'.wide-tools')+' .edit-file');
    const summary = editor.locator('summary');
    await summary.press('Enter');
    const article = snapshot.articles.find(a=>a.path===route);
    const path = article ? files.get(article.id) : 'src/data/modding.json';
    await expect(editor.locator('code')).toHaveText(path);
    await editor.getByRole('button',{name:'Copy',exact:true}).press('Enter');
    await expect(editor.getByRole('status')).toHaveText('Copied');
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(path);
    await page.keyboard.press('Escape');
    await expect(summary).toBeFocused();
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
    const editor=page.locator('.small-tools .edit-file');
    await editor.locator('summary').click();
    const text=editor.locator('code');
    await expect(text).toBeVisible();
    await expect(text).toHaveText(files.get('modding/blender-plugins'));
    await expect(text).toHaveCSS('user-select','all');
    await expect(editor.getByRole('button',{name:'Copy'})).toBeHidden();
  } finally { await context.close(); }
});
