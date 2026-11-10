import { expect, test } from '@playwright/test';

const crowded = '/creating-a-rideable-animal/vehicle';
const longArticle = '/re-kenshi-extra-extensions-modding-how-to-use-the-silent-world-states-and-variables';

test('the sticky tab identifies an article and links to its category indexes', async ({ page, baseURL }) => {
  const header = page.locator('.wiki-header');
  for (const [route, title, categories] of [
    ['/port-north', 'Port North', ['Locations']],
    ['/options-menu', 'Options Menu', ['WIP', 'User Interfaces']],
  ]) {
    await page.goto(route);
    const context = header.getByRole('navigation', { name: 'Page and categories' });
    await expect(context.getByRole('link', { name: 'Article: ' + title, exact: true })).toHaveAttribute('href', route);
    await expect(context.locator('.context-category-label')).toHaveText(categories.length === 1 ? 'Category:' : 'Categories:');
    await expect(context.getByRole('link')).toHaveText(['Article: ' + title, ...categories]);
    await expect(page.locator('main #catlinks')).toBeHidden();
    await expect(page.locator('main .fandom-notice')).toBeAttached();

    const name = categories.at(-1);
    const category = context.getByRole('link', { name, exact: true });
    const href = '/category/' + name.toLowerCase().replaceAll(' ', '-');
    await expect(category).toHaveAttribute('href', href);
    await category.click();
    await expect(page).toHaveURL(new URL(href, baseURL).href);
    await expect(context.getByRole('link')).toHaveAccessibleName('Category: ' + name);
    await expect(context.getByRole('link')).toHaveAttribute('href', href);
    await expect(context.locator('.context-category')).toHaveCount(0);
  }

  await page.goto('/port-north');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('main[data-pagefind-body] #catlinks a')).toHaveText('Locations');
  await expect(page.locator('main #catlinks')).toBeVisible();
});

test('category lists share the available width and expose every remaining link in order', async ({ page }) => {
  await page.goto(crowded);
  const context = page.locator('.page-context');
  const direct = context.locator('.context-category:not([inert])');
  const menu = context.locator('details');
  const toggle = menu.locator('summary');
  const expected = await page.locator('main #catlinks a').allTextContents();
  expect(expected).toHaveLength(10);
  await expect(context).toHaveAttribute('data-split', '');
  const count = await direct.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(expected.length);
  await expect(direct).toHaveText(expected.slice(0, count));
  await expect(toggle).toHaveText(`+${expected.length - count} more`);
  await toggle.press('Enter');
  await expect(menu.getByRole('link')).toHaveText(expected.slice(count));
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('#searchInput').click();
  await expect(menu).not.toHaveAttribute('open', '');

  await page.locator('#navigation-toggle').click();
  await expect.poll(() => direct.count()).toBeGreaterThan(count);
  await page.setViewportSize({ width: 2200, height: 900 });
  await expect(direct).toHaveText(expected);
  await expect(menu).toBeHidden();
});

test('a compact title opens the complete page context and keeps search usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(longArticle);
  const context = page.locator('.page-context');
  const title = await page.locator('#firstHeading').innerText();
  const expected = await page.locator('main #catlinks a').allTextContents();
  const toggle = context.locator('summary');
  await expect(toggle).toHaveAccessibleName('Article: ' + title);
  await toggle.press('Enter');
  const full = context.getByRole('link', { name: 'Article: ' + title, exact: true });
  await expect(full).toHaveAttribute('href', longArticle);
  await expect(full).toBeInViewport({ ratio: 1 });
  await expect(context.getByRole('link')).toHaveText(['Article: ' + title, ...expected]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await page.locator('#searchInput').fill('nodach');
  await expect(page.getByRole('option').first()).toContainText(/nodachi/i);
  expect((await page.locator('.wiki-header').boundingBox()).height).toBe(80);
});

test('uncategorized articles and utility tabs have their own canonical links', async ({ page }) => {
  for (const [route, label] of [
    ['/blood-bandit-camp', 'Article: Blood Bandit Camp'],
    ['/about-kenshi', 'Article: About Kenshi'],
    ['/contributors', 'Contributors'],
    ['/search', 'Search'],
    ['/', 'Main page'],
  ]) {
    await page.goto(route);
    const tab = page.locator('.wiki-page-bar').getByRole('link', { name: label, exact: true });
    await expect(tab).toHaveAttribute('aria-current', 'page');
    await expect(tab).toHaveAttribute('href', route);
    await expect(page.locator('.context-category-label')).toHaveCount(0);
    await expect(page.locator('#catlinks')).toHaveCount(0);
  }
  await page.goto('/category/kenshi-wiki');
  await expect(page.locator('.category-columns a')).toHaveCount(6);
});

test.describe('with scripting disabled', () => {
  test.use({ javaScriptEnabled: false });
  test('the native title disclosure exposes the current page and all categories', async ({ page }) => {
    await page.goto(crowded);
    const context = page.locator('.page-context');
    await context.locator('summary').press('Enter');
    await expect(context.getByRole('link')).toHaveCount(11);
    await expect(context.getByRole('link').first()).toHaveAttribute('href', crowded);
    await expect(context.getByRole('link').last()).toHaveAttribute('href', '/category/icons');
    await page.goto('/random');
    await expect(page.locator('.wiki-page-bar a[aria-current="page"]')).toHaveAttribute('href', '/random');
  });
});
