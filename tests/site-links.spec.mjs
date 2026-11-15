import { expect, test } from '@playwright/test';
import { ecosystem, platforms } from '../src/lib/header-links.js';

const destinations = [...ecosystem, ...platforms];
const names = destinations.map(link => link.label);

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
  await expect(direct).toHaveText(names);
  await expect(toggle).toBeHidden();

  await direct.last().focus();
  await page.setViewportSize({ width: 1150, height: 900 });
  await expect(toggle).toBeFocused();
  const count = await direct.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(names.length);
  await expect(direct).toHaveText(names.slice(0, count));
  await toggle.press('Enter');
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
  await expect(sites.getByRole('link')).toHaveText(names);
  await expect(menu.getByRole('link').last()).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the site-links disclosure provides all destinations', async ({ page }) => {
    await page.goto('/');
    const sites = page.getByRole('navigation', { name: 'Related sites' });
    await sites.locator('summary').press('Enter');
    const links = sites.getByRole('link');
    await expect(links).toHaveText(names);
    expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
      .toEqual(destinations.map(link => link.href));
  });
});
