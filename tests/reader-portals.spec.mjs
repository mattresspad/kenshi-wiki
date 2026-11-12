import { expect, test } from '@playwright/test';
import { resolvePortalSections } from '../src/lib/portals.js';

const portals = [
  { title: 'Gameplay', route: '/gameplay', first: 'Statistics', article: '/statistics', indexes: ['Combat', 'Statistics'] },
  { title: 'Guides', route: '/guides', first: 'Getting Started', article: '/getting-started', indexes: ['Guides'] },
  { title: 'Modding', route: '/modding', first: 'Mods', article: '/mods', indexes: ['Modding'] },
];

for (const phone of [false, true]) {
  test.describe(phone ? 'Phone portals' : 'Desktop portals', () => {
    test.use({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 } });

    test('readers can reach each portal from the homepage, sidebar, and search', async ({ page }) => {
      for (const { title, route, first, article } of portals) {
        await page.goto('/');
        await page.locator('.home-directory').getByRole('link', { name: title, exact: true }).click();
        await expect(page).toHaveURL(url => url.pathname === route);
        await expect(page.getByRole('heading', { name: title, level: 1, exact: true })).toBeVisible();
        await expect(page.getByRole('main').getByRole('link', { name: first, exact: true })).toHaveAttribute('href', article);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(phone ? 390 : 1440);
        expect(await page.locator('.portal-table').evaluateAll(tables => tables.every(table =>
          table.getBoundingClientRect().right <= document.documentElement.clientWidth + 1
        ))).toBe(true);

        await page.goto('/options-menu');
        if (phone) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
        await page.locator('#p-navigation').getByRole('link', { name: title, exact: true }).click();
        await expect(page).toHaveURL(url => url.pathname === route);

        const search = page.locator('#searchInput');
        await search.fill(title);
        await page.getByRole('option', { name: title, exact: true }).click();
        await expect(page).toHaveURL(url => url.pathname === route);
        await expect(search).toHaveValue('');
      }
    });
  });
}

test('the portals credit documented work and lead to complete indexes and editable selections', async ({ page }) => {
  for (const { title, route, indexes } of portals) {
    await page.goto(route);
    const main = page.getByRole('main');
    const edit = 'https://github.com/mattresspad/kenshi-wiki/edit/main/src/data/portals' + route + '.yaml';
    await expect(page.getByRole('link', { name: 'Edit on GitHub', exact: true })).toHaveAttribute('href', edit);
    await expect(page.getByRole('link', { name: 'View history', exact: true })).toHaveAttribute('href', edit.replace('/edit/main/', '/commits/main/'));
    const links = main.getByRole('navigation', { name: 'Category indexes' }).getByRole('link');
    await expect(links).toHaveCount(indexes.length);
    for (let i = 0; i < indexes.length; i++) {
      await links.nth(i).click();
      await expect(page.getByRole('heading', { name: 'Category:' + indexes[i], exact: true })).toBeVisible();
      await page.goto(route);
    }
    if (title === 'Modding') {
      const dialogue = main.getByRole('row').filter({ hasText: 'Dialogue Structure Overlook' });
      await expect(dialogue.getByRole('link', { name: 'Guide by Cattrina' })).toHaveAttribute('href', /oldid=95840$/);
      await expect(main.getByRole('link', { name: 'Technique by Soar' })).toHaveAttribute('href', /oldid=94622$/);
      await dialogue.getByRole('link', { name: 'Dialogue Structure Overlook' }).click();
      await expect(page.locator('.mw-parser-output')).toContainText('by Cattrina');
      await expect(page.locator('.fandom-notice')).toBeVisible();
    } else if (title === 'Guides') {
      const guide = main.getByRole('row').filter({ has: page.getByRole('link', { name: 'Getting Started', exact: true }) });
      await expect(guide.getByRole('link')).toHaveCount(1);
      await guide.getByRole('link').click();
      await expect(page.getByRole('heading', { name: 'Getting Started', level: 1 })).toBeVisible();
    }
  }
});

test('portal selections reject duplicate and missing article IDs', () => {
  const row = { id: 'jobs', description: 'Order squad tasks.' };
  const portal = { title: 'Gameplay', sections: [{ title: 'Squad', articles: [row] }] };
  expect(() => resolvePortalSections(portal, new Map())).toThrow('unknown article "jobs"');
  portal.sections.push({ title: 'More tasks', articles: [row] });
  expect(() => resolvePortalSections(portal, new Map([['jobs', 'Jobs']]))).toThrow('duplicate article "jobs"');
});

test('the desktop sidebar settings follow the live footer height, including a wrapped footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/guides');
  const footer = page.locator('#footer');
  const settings = page.locator('.rail-settings');
  const box = await footer.boundingBox();
  expect((await settings.boundingBox()).y).toBeCloseTo(box.y, 0);
  expect((await settings.boundingBox()).height).toBeCloseTo(box.height, 0);
  await page.setViewportSize({ width: 1024, height: 720 });
  // Model a reader with larger footer text if the available space still fits the default notices.
  await footer.evaluate(el => { el.style.fontSize = '1.1rem'; });
  const wrapped = await footer.boundingBox();
  expect(wrapped.height).toBeGreaterThan(box.height + 10);
  expect((await settings.boundingBox()).y).toBeCloseTo(wrapped.y, 0);
  expect((await settings.boundingBox()).height).toBeCloseTo(wrapped.height, 0);
  await settings.getByRole('button').click();
  await expect(settings.getByRole('group', { name: 'Open article contents' })).toBeVisible();
  expect((await settings.boundingBox()).y).toBeCloseTo(wrapped.y, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  expect((await settings.getByRole('button').boundingBox()).height).toBeGreaterThanOrEqual(40);
});
