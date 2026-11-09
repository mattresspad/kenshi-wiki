import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pageSlug, repoUrl } from '../src/lib/wiki.js';
import worker from '../worker/index.js';
import { articleRecord } from '../scripts/search-index.mjs';

const target = process.env.WIKI_TEST_TARGET;

async function expectedHtml(file) {
  if (target !== 'production') return readFile(`dist/${file}`);
  const route = file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '');
  const response = await fetch(new URL(route, process.env.WIKI_PREVIEW_URL), { redirect: 'error' });
  expect(response.status).toBe(200);
  return Buffer.from(await response.arrayBuffer());
}

function checkPublishedHeaders(response) {
  if (!target) return;
  const headers = response.headers();
  const directives = (headers['x-robots-tag'] || '').toLowerCase().split(/[\s,]+/);
  expect(directives.includes('noindex')).toBe(target === 'staging');
  expect(headers['cache-control']).toContain('no-transform');
}

const pages = [
  { route: '/', file: 'index.html', source: 'src/pages/index.astro' },
  { route: '/about-kenshi', file: 'about-kenshi.html', source: 'src/pages/about-kenshi.astro' },
  { route: '/the-holy-nation', file: 'the-holy-nation.html', source: 'src/content/wiki/the-holy-nation.md' },
];

for (const { route, file, source } of pages) {
  test(`the reader can use ${route} entirely on the wiki origin`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL).origin;
    const outside = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route(/^https?:\/\//, request => {
      if (new URL(request.request().url()).origin === origin) return request.continue();
      outside.push(request.request().url());
      return request.abort();
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response.status(), `HTTP ${response.status()} on ${response.url()} (Ray ${response.headers()['cf-ray'] ?? '-'}, mitigation ${response.headers()['cf-mitigated'] ?? '-'})`).toBe(200);
    expect(await response.body()).toEqual(await expectedHtml(file));
    checkPublishedHeaders(response);

    const header = page.locator('.wiki-header');
    await expect(header.getByRole('link', { name: 'Meitou', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Edit on GitHub' })).toHaveAttribute('href', `${repoUrl}/edit/main/${source}`);
    await expect(header.getByRole('link', { name: 'View history' })).toHaveAttribute('href', `${repoUrl}/commits/main/${source}`);

    const desktopCredit = header.getByRole('link', { name: 'Contributors', exact: true });
    await desktopCredit.click();
    await expect(page).toHaveURL(new URL('/contributors', origin).href);
    await expect(page.getByRole('main')).toContainText(creditIntro);
    await page.goBack();
    await expect(page).toHaveURL(new URL(route, origin).href);

    await page.evaluate(() => window.scrollTo(0, 450));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect.poll(() => header.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(0);

    await page.setViewportSize({ width: 390, height: 844 });
    const links = header.locator('.all-sites-menu');
    await links.locator('summary').press('Enter');
    await expect(links.locator('a:visible')).toHaveCount(16);
    const pictures = await links.locator('img').evaluateAll(async images => {
      await Promise.all(images.map(image => image.decode()));
      return images.map(image => new URL(image.currentSrc).origin);
    });
    expect(pictures.length).toBeGreaterThan(0);
    expect(new Set(pictures)).toEqual(new Set([origin]));
    await page.keyboard.press('Escape');
    await expect(links.locator('summary')).toBeFocused();

    const tools = header.locator('.tools-menu');
    await tools.locator('summary').click();
    await expect(tools.getByRole('link', { name: 'Edit on GitHub' })).toBeVisible();
    await tools.getByRole('link', { name: 'Contributors', exact: true }).click();
    await expect(page).toHaveURL(new URL('/contributors', origin).href);
    await expect(page.getByRole('main')).toContainText(creditIntro);
    await page.locator('footer a[href="/contributors#licensing"]').click();
    await expect(page.getByRole('heading', { name: 'Licenses and reuse' })).toBeInViewport();
    await page.waitForLoadState('networkidle');
    expect(outside).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('the header search suggests pages as you type', async ({ page, baseURL }) => {
  await page.goto('/');
  const search = page.locator('#searchInput');
  await search.pressSequentially('nodach');

  const suggestions = page.locator('#search-suggestions');
  await expect(suggestions.getByRole('option').first()).toContainText('Nodachi');
  await expect(search).toHaveAttribute('aria-expanded', 'true');
  await expect(suggestions.getByRole('option').last()).toHaveAttribute('href', '/search?q=nodach&fulltext=1');

  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page).toHaveURL(new URL('/nodachi', baseURL).href);
  await page.waitForLoadState('domcontentloaded');

  await page.locator('#searchInput').fill('nodachi');
  await expect(page.locator('#search-suggestions').getByRole('option').first()).toBeVisible();
  await page.locator('#searchInput').press('Escape');
  await expect(page.locator('#search-suggestions')).toBeHidden();
});

test('the header search stays closed when the box loses focus before suggestions arrive', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('/search-titles.json', async route => {
    await held;
    await route.continue();
  });

  await page.goto('/');
  const search = page.locator('#searchInput');
  await search.fill('nodachi');
  await search.press('Tab');
  release();

  await page.waitForResponse('**/search-titles.json');
  await page.waitForTimeout(500);
  await expect(page.locator('#search-suggestions')).toBeHidden();
  await expect(search).toHaveAttribute('aria-expanded', 'false');
});

test('dev search reads article titles as YAML, quoted or not', () => {
  const record = (front) => articleRecord('nodachi', `---
${front}
---
A long blade.
`);
  expect(record('title: "Nodachi"').meta.title).toBe('Nodachi');
  expect(record("title: 'Nodachi'").meta.title).toBe('Nodachi');
  expect(record('title: Nodachi (Weapon)').meta.title).toBe('Nodachi (Weapon)');
  expect(record('title: 1984').meta.title).toBe('1984');
  expect(record('category: Weapons').meta.title).toBe('nodachi');
});

test('the header search finds pages and Go opens an exact title', async ({ page, baseURL }) => {
  const origin = new URL(baseURL).origin;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');

  const search = page.locator('#searchInput');
  await search.fill('no chosen hero');
  await search.press('Enter');
  const results = page.locator('.mw-search-results');
  await expect(results.getByRole('link', { name: 'About Kenshi', exact: true })).toHaveAttribute('href', '/about-kenshi');
  await expect(results.locator('mark').first()).toBeVisible();

  await page.locator('#searchText').fill('qqxyzzy');
  await page.locator('#searchText').press('Enter');
  await expect(page.locator('.search-status')).toHaveText('There were no results matching “qqxyzzy”.');

  await page.locator('#searchInput').fill('about kenshi');
  await page.locator('#searchButton').click();
  await expect(page).toHaveURL(new URL('/about-kenshi', origin).href);
  expect(errors).toEqual([]);
});

test('Random page opens an article, and category links lead to their category', async ({ page, baseURL }) => {
  await page.goto('/');
  await page.locator('#p-navigation').getByRole('link', { name: 'Random page' }).click();
  await page.waitForURL((url) => url.pathname !== '/random' && url.pathname !== '/');
  await expect(page.locator('.fandom-notice')).toBeVisible();

  await page.goto('/nodachi');
  await page.locator('#catlinks').getByRole('link', { name: 'Weapons', exact: true }).click();
  await expect(page).toHaveURL(new URL('/category/weapons', baseURL).href);
  await expect(page.locator('.category-columns').getByRole('link', { name: 'Nodachi', exact: true })).toHaveAttribute('href', '/nodachi');
});

test('a sortable table sorts by the clicked column, numbers as numbers', async ({ page }) => {
  await page.goto('/backpacks');
  const table = page.locator('table.sortable').first();
  const firstItem = () => table.locator('tr').nth(1).locator('td').first();
  const value = table.getByRole('columnheader', { name: 'Base value' });

  await value.click();
  await expect(value).toHaveAttribute('aria-sort', 'ascending');
  await expect(firstItem()).toHaveText("Scavenger's Basket");

  await value.click();
  await expect(value).toHaveAttribute('aria-sort', 'descending');
  await expect(firstItem()).toHaveText('Thieves Backpack');

  await table.getByRole('columnheader', { name: 'Weight' }).press('Enter');
  await expect(value).not.toHaveAttribute('aria-sort');
  await expect(firstItem()).toHaveText('Small Thieves Backpack');
});

test('any data table with a header row sorts, a wide header by its first column with values', async ({ page }) => {
  await page.goto('/adventurer-recruit');
  const table = page.locator('table.wikitable', { hasText: 'Attributes' }).first();
  await table.getByRole('columnheader', { name: 'Attributes' }).click();
  await expect(table.locator('td:nth-child(2)')).toHaveText(['Dexterity', 'Perception', 'Strength', 'Toughness']);
  await expect(page.locator('table.wikitable', { hasText: 'All you need to know' }).locator('th.headerSort')).toHaveCount(0);
});

// Git, not the working tree: on Windows and macOS a file renamed only in case keeps its old name in the index, and
// CI builds from the index.
test('every article file is named for its canonical path', () => {
  const files = execFileSync('git', ['ls-files', 'src/content/wiki'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const misnamed = files.filter((file) => {
    const id = file.replace(/^src\/content\/wiki\//, '').replace(/\.md$/, '');
    return id !== pageSlug(id);
  });
  expect(files.length).toBeGreaterThan(0);
  expect(misnamed).toEqual([]);
});

test('unknown routes return a genuine 404', async ({ request }) => {
  expect((await request.get('/missing-wiki-staging-check')).status()).toBe(404);
});

// Another spelling of a page's path, or an old address, ends at the page through permanent redirects.
const respellings = [
  ['/About_Kenshi', '/about-kenshi'],
  ['/about_kenshi.html', '/about-kenshi'],
  ['/Kenshi', '/about-kenshi'],
  ['/Kenshi.html', '/about-kenshi'],
  ['/The_Holy_Nation', '/the-holy-nation'],
  ['/Holy_Nation', '/the-holy-nation'],
];

test('the Worker redirects another spelling only to a page that exists', async () => {
  const pages = new Set(['/about-kenshi', '/kenshi']);
  const env = { ASSETS: { fetch: async (request) => new Response(null, { status: pages.has(new URL(request.url).pathname) ? 200 : 404 }) } };
  const visit = (path) => worker.fetch(new Request(new URL(path, 'https://kenshi.wiki')), env);

  for (const [path, destination] of [['/About_Kenshi?x=1', '/about-kenshi?x=1'], ['/About_kenshi.html', '/about-kenshi'], ['/Kenshi', '/kenshi']]) {
    const response = await visit(path);
    expect(response.status, path).toBe(301);
    expect(response.headers.get('location'), path).toBe(`https://kenshi.wiki${destination}`);
  }
  for (const path of ['/Missing_Page', '/missing-page', '/%E0%A4%A']) expect((await visit(path)).status, path).toBe(404);
});

test('old and differently spelled addresses permanently redirect to the page', async ({ request, baseURL }) => {
  test.skip(!target, 'astro preview runs neither the Worker nor _redirects');
  for (const [route, destination] of respellings) {
    expect((await request.get(route, { maxRedirects: 0 })).status(), route).toBe(301);
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(new URL(response.url(), baseURL).pathname, route).toBe(destination);
  }
});

const creditsPage = '/contributors';
const creditIntro = 'VlcekM built the original Astro prototype and proposed RimWorld Wiki as the model for its presentation.';

test('credits, upstream licenses and editable sources are public on the wiki', async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL).origin;
  const thirdParty = [];
  await page.route(/^https?:\/\//, route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    thirdParty.push(route.request().url());
    return route.abort();
  });
  const response = await page.goto(creditsPage, { waitUntil: 'networkidle' });
  expect(response.status(), `HTTP ${response.status()} on ${response.url()} (Ray ${response.headers()['cf-ray'] ?? '-'}, mitigation ${response.headers()['cf-mitigated'] ?? '-'})`).toBe(200);
  expect(await response.body()).toEqual(await expectedHtml('contributors.html'));
  checkPublishedHeaders(response);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Contributors', exact: true })).toBeVisible();
  await expect(main).toContainText(creditIntro);
  for (const handle of ['VlcekM', 'mattresspad']) {
    await expect(main.getByRole('link', { name: handle, exact: true })).toHaveAttribute('href', 'https://github.com/' + handle);
  }
  await expect(main.getByRole('link', { name: 'repository history' })).toHaveAttribute('href', repoUrl + '/commits/main/');
  for (const href of await main.locator('a[href^="/notices/"]').evaluateAll(links => links.map(link => link.pathname))) {
    const file = await request.get(href);
    expect(file.status(), href).toBe(200);
    expect(await file.body(), href).toEqual(await readFile('public' + href));
  }
  for (const [slug, input] of [['outland', 'global'], ['wiki-header', 'wiki-header']]) {
    const href = '/sources/' + slug + '.css.txt';
    await expect(main.locator('a[href="' + href + '"]')).toBeVisible();
    const file = await request.get(href);
    expect(file.status()).toBe(200);
    expect((await file.text()).replaceAll('\r\n', '\n')).toBe((await readFile('src/styles/' + input + '.css', 'utf8')).replaceAll('\r\n', '\n'));
  }
  expect(thirdParty).toEqual([]);
});
