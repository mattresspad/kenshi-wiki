import { expect, test } from '@playwright/test';
import { ecosystem, platforms } from '../src/lib/header-links.js';

const destinations = [...ecosystem, ...platforms];
const names = destinations.map(link => link.label);

async function expectLinkNames(links, expected) {
  await expect(links).toHaveCount(expected.length);
  for (const [index, name] of expected.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(name);
  }
}

test('site links fill the available row and share overflow with the keyboard', async ({ page }) => {
  await page.goto('/');
  const sites = page.getByRole('navigation', { name: 'Related sites' });
  const track = sites.locator('.site-links-track');
  const direct = track.getByRole('link');
  // Leave room for the whole catalog, even as more projects are added.
  const wide = Math.ceil((await track.boundingBox()).width) + 700;
  await page.setViewportSize({ width: wide, height: 900 });
  const menu = sites.locator('details');
  const toggle = menu.locator('summary');
  await expectLinkNames(direct, names);
  await expect(toggle).toBeHidden();
  const groups = track.getByRole('group');
  for (const [index, name] of ['Ecosystem', 'Buy', 'Mods', 'Community', 'Official'].entries()) {
    await expect(groups.nth(index)).toHaveAccessibleName(name);
  }
  await expect(groups.nth(1).getByRole('link')).toHaveText(['Steam', 'GOG', 'Humble Bundle']);
  await expect(groups.nth(2).getByRole('link')).toHaveText(['Steam Workshop', 'Nexus Mods']);
  await expect(groups.nth(3).getByRole('link')).toHaveText(['r/Kenshi', 'Steam Forums', 'Discord']);
  for (const name of ['X', 'Facebook', 'Instagram']) {
    const link = track.getByRole('link', { name, exact: true });
    await expect(link).toHaveText('');
    await expect(link).toHaveAttribute('title', name);
    await expect(link.getByRole('img', { name })).toBeVisible();
  }

  await direct.last().focus();
  await page.setViewportSize({ width: 1150, height: 900 });
  await expect(toggle).toBeFocused();
  const count = await direct.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(names.length);
  await expectLinkNames(direct, names.slice(0, count));
  await toggle.press('Enter');
  await expectLinkNames(menu.getByRole('link'), names.slice(count));
  await expect(menu.getByRole('link')).toHaveText(names.slice(count));
  await expect(menu.getByRole('heading', { name: 'Ecosystem' })).toBeVisible({ visible: count < ecosystem.length });
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.press('Enter');
  await menu.getByRole('link').last().focus();

  await page.setViewportSize({ width: wide, height: 900 });
  await expect(direct.last()).toBeFocused();
  await expect(toggle).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await toggle.click();
  await expectLinkNames(sites.getByRole('link'), names);
  await expect(menu.getByRole('link').last()).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('theme icons and labels stay synchronized across the ribbon, menu and navigation', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('.wiki-header');
  const labels = header.locator('[data-theme-label]');
  for (const [theme, icon] of [['Light', 'sun'], ['Dark', 'moon'], ['Auto', 'moon']]) {
    await header.getByRole('button', { name: /^Theme:/ }).click();
    await expect(labels).toHaveText(['Theme: ' + theme, 'Theme: ' + theme]);
    await expect(header.getByRole('button', { name: 'Theme: ' + theme }).locator(`[data-icon="${icon}"]`)).toBeVisible();
  }
  await expect(header.getByRole('link', { name: 'Contributors', exact: true }).locator('[data-icon="people"]')).toBeVisible();
  await expect(header.getByRole('link', { name: 'Recent changes', exact: true }).locator('[data-icon="pulse"]')).toBeVisible();
  await expect(header.getByRole('link', { name: 'View history', exact: true }).locator('[data-icon="clock"]')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const tools = header.locator('.tools-menu');
  await tools.locator('summary').click();
  await tools.getByRole('button', { name: 'Theme: Auto' }).click();
  await expect(tools.getByRole('button', { name: 'Theme: Light' }).locator('[data-icon="sun"]')).toBeVisible();
  await expect(labels).toHaveText(['Theme: Light', 'Theme: Light']);
  await expect(tools.getByRole('link', { name: 'Recent changes' }).locator('[data-icon="pulse"]')).toBeVisible();
  await page.goto('/category/locations');
  await tools.locator('summary').click();
  await expect(tools.getByRole('button', { name: 'Theme: Light' }).locator('[data-icon="sun"]')).toBeVisible();
  await expect(tools.getByRole('link', { name: 'Layout history' }).locator('[data-icon="clock"]')).toBeVisible();
});

test('the ribbon refits when its local font arrives and remains usable without it', async ({ browser, baseURL }) => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext({ baseURL, viewport: { width: 1200, height: 900 } });
    const page = await context.newPage();
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route('**/fonts/*.woff2', async route => {
      if (blocked) return route.abort();
      await held;
      await route.continue();
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const sites = page.getByRole('navigation', { name: 'Related sites' });
      const direct = sites.locator('.site-links-track').getByRole('link');
      await expect(direct.first()).toBeVisible();
      release();
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => document.fonts.check('500 12px "Exo 2"'))).toBe(!blocked);
      const count = await direct.count();
      await expectLinkNames(direct, names.slice(0, count));
      await sites.locator('summary').click();
      await expectLinkNames(sites.locator('details').getByRole('link'), names.slice(count));
      await page.setViewportSize({ width: 320, height: 844 });
      await expectLinkNames(sites.getByRole('link'), names);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      expect((await page.locator('.wiki-header').boundingBox()).height).toBe(80);
    } finally {
      release();
      await context.close();
    }
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the site-links disclosure provides all destinations', async ({ page }) => {
    await page.goto('/');
    const sites = page.getByRole('navigation', { name: 'Related sites' });
    await sites.locator('summary').press('Enter');
    const links = sites.getByRole('link');
    await expectLinkNames(links, names);
    expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
      .toEqual(destinations.map(link => link.href));
  });
});
