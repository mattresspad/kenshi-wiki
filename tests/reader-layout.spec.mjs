import { expect, test } from '@playwright/test';

test('the full homepage directory fits a 1440 × 900 reader with the rail open', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const main = page.getByRole('main');
  const directory = page.getByRole('navigation', { name: 'Browse wiki topics' });
  const headings = directory.getByRole('heading', { level: 2 });
  await expect(headings).toHaveText(['Concepts', 'Items', 'Life']);
  const tops = await headings.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
  expect(Math.max(...tops)).toBeLessThanOrEqual(240);
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  expect(await main.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
  await expect(directory.getByRole('link').last()).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#catlinks')).toBeInViewport({ ratio: 1 });
  const footer = await page.locator('footer').boundingBox();
  expect(Math.round(footer.y + footer.height)).toBe(900);

  // The same viewport switches between two and three columns when the rail releases its width.
  await page.setViewportSize({ width: 1200, height: 900 });
  const columns = () => page.locator('.home-sections').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  await expect.poll(columns).toBe(2);
  const life = directory.getByRole('region', { name: 'Life' });
  expect((await life.boundingBox()).width).toBeCloseTo((await directory.boundingBox()).width, 0);
  await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  await expect.poll(columns).toBe(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(columns).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('reader and rail scroll independently, and the desktop width preference survives navigation', async ({ page }) => {
  await page.goto('/about-kenshi');
  const main = page.getByRole('main');
  const rail = page.getByRole('complementary', { name: 'Wiki sidebar' });
  const toggle = page.getByRole('button', { name: 'Navigation', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const bounds = await main.boundingBox();

  await main.evaluate(el => el.scrollTo(0, 400));
  expect(await main.evaluate(el => el.scrollTop)).toBe(400);
  expect(await rail.evaluate(el => el.scrollTop)).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect((await page.locator('.wiki-header').boundingBox()).y).toBe(0);
  expect((await page.locator('footer').boundingBox()).y).toBeCloseTo(bounds.y + bounds.height, 0);

  // The real rail currently has two links. Simulate a longer navigation list to exercise its scrollport.
  await rail.evaluate(el => {
    const space = document.createElement('div');
    space.style.height = '120vh';
    el.append(space);
    el.scrollTo(0, 220);
  });
  expect(await rail.evaluate(el => el.scrollTop)).toBe(220);
  expect(await main.evaluate(el => el.scrollTop)).toBe(400);

  await toggle.click();
  await expect(rail).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect((await main.boundingBox()).x).toBe(0);
  await page.goto('/small-backpack');
  await expect(rail).toBeHidden();
  await toggle.click();
  await expect(rail).toBeVisible();
  expect((await main.boundingBox()).x).toBeCloseTo(bounds.x, 0);
});

test('article section links and Back return the reader to the table of contents', async ({ page, baseURL }) => {
  await page.goto('/about-kenshi');
  const link = page.locator('#toc a[href="#Gallery"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(new URL('/about-kenshi#Gallery', baseURL).href);
  await expect(page.getByRole('heading', { name: 'Gallery', exact: true })).toBeInViewport({ ratio: 1 });
  await page.goBack();
  await expect(page).toHaveURL(new URL('/about-kenshi', baseURL).href);
  await expect(link).toBeInViewport({ ratio: 1 });
});

test('phone navigation can be used from a scrolled article with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about-kenshi');
  const rail = page.locator('#mw-panel');
  const toggle = page.getByRole('button', { name: 'Navigation', exact: true });
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  expect((await page.locator('.wiki-header').boundingBox()).y).toBe(0);
  await expect(rail).toBeHidden();
  await expect(page.locator('footer')).not.toBeInViewport();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(rail.getByRole('link', { name: 'Main page', exact: true })).toBeFocused();
  await expect(rail.getByRole('link', { name: 'Random page' })).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Escape');
  await expect(rail).toBeHidden();
  await expect(toggle).toBeFocused();
  const licensing = page.locator('footer a[href="/contributors#licensing"]');
  await licensing.click();
  await expect(page.locator('#licensing')).toBeInViewport({ ratio: 1 });
});

test('a wide item table can be browsed and sorted within a phone-width article', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/backpacks');
  const table = page.getByRole('table').first();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(await table.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  const value = table.getByRole('columnheader', { name: 'Base value' });
  await value.press('Enter');
  await expect(value).toHaveAttribute('aria-sort', 'ascending');
});
