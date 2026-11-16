import { expect, test } from '@playwright/test';
import { categoryGroups, categoryLayout } from '../src/lib/category-layout.js';
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';

let sourceIndex;
async function sourceMembers(category) {
  sourceIndex ??= (async () => {
    const root = new URL('../src/content/wiki/', import.meta.url);
    const index = new Map();
    for (const file of await readdir(root, { recursive: true })) {
      if (!file.endsWith('.md')) continue;
      const source = await readFile(new URL(file.replaceAll('\\', '/'), root), 'utf8');
      const meta = parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
      for (const name of meta.categories ?? []) {
        if (!index.has(name)) index.set(name, []);
        index.get(name).push('/' + file.replaceAll('\\', '/').slice(0, -3));
      }
    }
    return index;
  })();
  return (await sourceIndex).get(category).toSorted();
}

test('category packing keeps natural heights, balances contiguous columns, and respects a shared cap', () => {
  const groups = Array.from({ length: 26 }, (_, index) => ({ fixed: 24, natural: index === 2 ? 48 : 0, minimum: index === 2 ? 48 : 0 }));
  const sparse = categoryLayout(groups, 4, 600, 8);
  expect(sparse.lists).toEqual(groups.map(group => group.natural));
  expect(sparse.columns.flat()).toEqual(groups.map((_, i) => i));
  const packed = categoryLayout([{ fixed: 10, natural: 300, minimum: 30 }, { fixed: 10, natural: 30, minimum: 30 }], 1, 150, 10);
  expect(packed.lists).toEqual([89, 30]);
  const dense = Array.from({ length: 18 }, (_, i) => ({ fixed: 24, natural: 200 + i * 40, minimum: 48 }));
  const compressed = categoryLayout(dense, 3, 540, 8);
  expect(compressed).not.toBeNull();
  for (const column of compressed.columns) {
    const height = column.reduce((sum, i) => sum + dense[i].fixed + compressed.lists[i], 0) + (column.length - 1) * 8;
    expect(height).toBeLessThanOrEqual(540);
    for (const i of column) expect(compressed.lists[i]).toBeGreaterThanOrEqual(48);
  }
  expect(categoryLayout(dense, 2, 300, 8)).toBeNull();
});

test('category grouping emits the complete alphabet and retains nonalphabetic titles once', () => {
  const articles = ['Zulu', 'Beta', '7 signals', 'Alpha', 'Élan'].map((title, i) => ({ id: String(i), data: { title } }));
  const groups = categoryGroups(articles);
  expect(groups.map(group => group.letter).join('')).toBe('#ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  expect(groups[0].articles.map(article => article.data.title)).toEqual(['7 signals', 'Élan']);
  expect(groups.flatMap(group => group.articles).map(article => article.id).toSorted()).toEqual(articles.map(article => article.id).toSorted());
  expect(articles[0].data.title).toBe('Zulu');
});

const directory = page => page.locator('[data-category-directory]');
async function bounded(page) {
  await expect(directory(page)).toHaveAttribute('data-bounded', '');
  await expect.poll(() => page.locator('main').evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
}

test('desktop categories keep every heading in the reader and sparse groups remain compact', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const name of ['Bounty', 'Characters', 'Leaders']) {
    await page.goto('/category/' + name.toLowerCase());
    await bounded(page);
    const board = directory(page);
    await expect(board.locator('.category-group')).toHaveCount(26);
    const expected = await sourceMembers(name);
    await expect(board.getByRole('link')).toHaveCount(expected.length);
    expect(await board.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')).sort())).toEqual(expected);
    expect(await board.locator('.category-group').evaluateAll(nodes => nodes.map(node => node.dataset.letter).join(''))).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const main = await page.locator('main').boundingBox();
    for (const heading of await board.getByRole('heading').all()) {
      const box = await heading.boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(main.y);
      expect(box.y + box.height).toBeLessThanOrEqual(main.y + main.height);
    }
    if (name === 'Leaders') expect((await board.boundingBox()).height).toBeLessThan(main.height / 2);
  }
  expect(errors).toEqual([]);
});

test('overflowing letter lists scroll by keyboard and retain focus through resizing and sidebar changes', async ({ page }) => {
  await page.goto('/category/characters');
  await bounded(page);
  const board = directory(page);
  const pane = board.locator('.category-entries[data-overflow]').first();
  await expect(pane).toHaveAttribute('role', 'region');
  await pane.focus();
  await pane.press('End');
  await expect.poll(() => pane.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  const link = pane.getByRole('link').last();
  const href = await link.getAttribute('href');
  await link.focus();
  await expect(link).toBeInViewport();
  const columns = await board.locator(':scope > .category-column').count();
  await page.locator('#navigation-toggle').click();
  await bounded(page);
  await expect.poll(() => board.locator(':scope > .category-column').count()).toBeGreaterThan(columns);
  // Clicking the sidebar toggle intentionally moved focus; keyboard focus then survives the layout transitions.
  await board.locator(`a[href="${href}"]`).focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(board).not.toHaveAttribute('data-bounded', '');
  await expect(board.locator(`a[href="${href}"]`)).toBeFocused();
  await expect(board.locator('.category-entries[data-overflow]')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await bounded(page);
  await expect(board.locator(`a[href="${href}"]`)).toBeFocused();
  await expect(board.locator(`a[href="${href}"]`)).toBeInViewport();
});

test('cramped and printed categories flow with every member accessible', async ({ page }) => {
  await page.goto('/category/bounty');
  await bounded(page);
  await page.setViewportSize({ width: 1200, height: 640 });
  await expect(directory(page)).not.toHaveAttribute('data-bounded', '');
  await expect(directory(page).getByRole('link')).toHaveCount((await sourceMembers('Bounty')).length);
  await page.setViewportSize({ width: 1440, height: 900 });
  await bounded(page);
  await page.emulateMedia({ media: 'print' });
  await expect(directory(page)).not.toHaveAttribute('data-bounded', '');
  expect(await directory(page).locator('.category-entries').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).maxBlockSize === 'none'))).toBe(true);
  await page.emulateMedia({ media: 'screen' });
  await page.setViewportSize({ width: 320, height: 844 });
  const last = directory(page).getByRole('link').last();
  await last.focus();
  await expect(last).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('category fallback keeps all entries without scripts and fitting works with blocked fonts', async ({ browser, baseURL }) => {
  const plain = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await plain.newPage();
  await page.goto('/category/characters');
  await expect(directory(page)).not.toHaveAttribute('data-bounded', '');
  await expect(directory(page).getByRole('link')).toHaveCount((await sourceMembers('Characters')).length);
  await directory(page).getByRole('link').last().focus();
  await expect(directory(page).getByRole('link').last()).toBeInViewport();
  await plain.close();

  const fallback = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  await fallback.route('**/*.woff2', route => route.abort());
  const system = await fallback.newPage();
  await system.goto('/category/characters');
  await bounded(system);
  await expect(directory(system).getByRole('link')).toHaveCount((await sourceMembers('Characters')).length);
  await fallback.close();
});
