import { expect, test } from '@playwright/test';

// Exercise the actual rail width when a native scrollbar has a gutter.
test.use({ launchOptions: {
  ignoreDefaultArgs: ['--hide-scrollbars'],
  args: ['--disable-features=OverlayScrollbar,FluentOverlayScrollbar'],
} });

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
  await expect(page.locator('#catlinks')).toHaveCount(0);
  await expect(page.locator('.wiki-header a[aria-current="page"]')).toHaveText('Main page');
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

  for (const key of ['Concepts', 'Concepts/Basics', 'Concepts/Gameplay', 'Concepts/Extras', 'Concepts/Skills', 'Concepts/World', 'Items', 'Items/Gear']) {
    await topic(rail, key).click();
  }
  const scroller = rail.locator('.rail-scroll');
  const settings = rail.getByRole('button', { name: 'Sidebar settings' });
  const foot = await settings.boundingBox();
  await scroller.evaluate(el => el.scrollTo(0, 220));
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(220);
  expect((await settings.boundingBox()).y).toBe(foot.y);
  await topic(rail, 'Life').click();
  await topic(rail, 'Life/Fauna').click();
  const lastLink = rail.locator('.rail-nav a').last();
  await lastLink.scrollIntoViewIfNeeded();
  const lastBounds = await lastLink.boundingBox();
  expect(lastBounds.y + lastBounds.height).toBeLessThanOrEqual(foot.y);
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

const sidebar = page => page.getByRole('complementary', { name: 'Wiki sidebar' });
const topic = (rail, key) => rail.locator(`details[data-topic="${key}"] > summary`);

for (const phone of [false, true]) {
  test.describe(phone ? 'Phone sidebar' : 'Desktop sidebar', () => {
    test.use({ hasTouch: phone, viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 } });

    test('browse topic groups and shortcuts', async ({ page }) => {
      const rail = sidebar(page);
      async function openDrawer() {
        if (phone) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
      }
      await page.goto('/');
      await openDrawer();
      await expect(rail.locator('[data-topic][open]')).toHaveCount(0);
      await topic(rail, 'Concepts').press('Enter');
      await topic(rail, 'Concepts/World').press('Space');
      await rail.getByRole('link', { name: 'Locations', exact: true }).click();
      await expect(page).toHaveURL(/\/category\/locations$/);
      await openDrawer();
      await expect(rail.getByRole('link', { name: 'Locations', exact: true })).toHaveAttribute('aria-current', 'page');
      await topic(rail, 'Items').click();
      await topic(rail, 'Items/Gear').click();
      await expect(rail.getByRole('link', { name: 'Equipment', exact: true })).toHaveAttribute('href', '/equipment');
      await rail.getByRole('link', { name: 'Backpacks', exact: true }).click();
      await expect(page).toHaveURL(/\/backpacks$/);
      await openDrawer();
      await expect(rail.getByRole('link', { name: 'Backpacks', exact: true })).toHaveAttribute('aria-current', 'page');
      await rail.locator('#p-navigation').getByRole('link', { name: 'Guides', exact: true }).click();
      await expect(page).toHaveURL(/\/guides$/);
      await openDrawer();
      await rail.locator('#p-navigation').getByRole('link', { name: 'Modding', exact: true }).click();
      await expect(page).toHaveURL(/\/modding$/);
      await openDrawer();
      await expect(topic(rail, 'Items/Gear').locator('..')).toHaveAttribute('open', '');
    });

    test('contents modes persist while manual folds belong to the current article', async ({ page }) => {
      const rail = sidebar(page);
      const settings = rail.getByRole('button', { name: 'Sidebar settings' });
      const outline = rail.locator('.rail-outline > details');
      const subsections = outline.locator('details');
      async function openRail() {
        if (phone) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
      }
      await page.goto('/the-holy-nation');
      await openRail();
      await expect(outline).toHaveJSProperty('open', true);
      await expect(subsections.first()).toHaveJSProperty('open', false);
      const bottom = await settings.boundingBox();
      await settings.press('Enter');
      await expect(rail.getByRole('radio', { name: 'Headings', exact: true })).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(rail.getByRole('radio', { name: 'Headings and subsections' })).toBeChecked();
      await expect(outline.locator('details:not([open])')).toHaveCount(0);
      expect((await settings.boundingBox()).y).toBeCloseTo(bottom.y, 0);
      await page.keyboard.press('Escape');
      await expect(settings).toBeFocused();
      await expect(rail).toBeVisible();
      await rail.getByLabel('Subsections of Disposition').click();
      await expect(rail.getByLabel('Subsections of Disposition').locator('..')).toHaveJSProperty('open', false);
      await page.reload();
      await openRail();
      await expect(outline.locator('details:not([open])')).toHaveCount(0);
      await settings.click();
      await rail.getByRole('radio', { name: 'Folded' }).check();
      await expect(outline).toHaveJSProperty('open', false);
      await page.goto('/about-kenshi');
      await openRail();
      await expect(outline).toHaveJSProperty('open', false);
      await settings.click();
      await rail.getByRole('radio', { name: 'Headings', exact: true }).check();
      await expect(outline).toHaveJSProperty('open', true);
      await expect(outline.locator('details[open]')).toHaveCount(0);
      await page.reload();
      await openRail();
      await expect(outline).toHaveJSProperty('open', true);
      await expect(outline.locator('details[open]')).toHaveCount(0);
    });

    test('settings float above the button without resizing or scrolling the rail', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/the-holy-nation');
      const rail = sidebar(page);
      const nav = page.getByRole('button', { name: 'Navigation', exact: true });
      const settings = rail.getByRole('button', { name: 'Sidebar settings' });
      const panel = rail.locator('#sidebar-settings-panel');
      const scroller = rail.locator('.rail-scroll');
      const measure = () => scroller.evaluate(el => ({
        top: el.scrollTop, height: el.clientHeight, width: el.clientWidth, contentWidth: el.scrollWidth,
      }));
      if (phone) await nav.click();
      for (const group of ['Concepts', 'Concepts/World', 'Life', 'Life/Fauna']) {
        await topic(rail, group).click();
      }
      const lastLink = scroller.getByRole('link').last();
      await lastLink.scrollIntoViewIfNeeded();
      await expect(lastLink).toBeInViewport({ ratio: 1 });
      const before = await measure();
      expect(before.top).toBeGreaterThan(0);
      expect(before.contentWidth).toBe(before.width);

      await settings.press('Enter');
      await expect(rail.getByRole('radio', { name: 'Headings', exact: true })).toBeFocused();
      expect(await measure()).toEqual(before);
      const bounds = await panel.boundingBox();
      expect(Math.abs(bounds.y + bounds.height - (await settings.boundingBox()).y)).toBeLessThanOrEqual(1);
      expect(await panel.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);

      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(settings).toBeFocused();
      await expect(rail).toBeVisible();
      expect(await measure()).toEqual(before);
      if (phone) {
        await page.keyboard.press('Escape');
        await expect(rail).toBeHidden();
        await expect(nav).toBeFocused();
        await nav.click();
      }
      await settings.click();
      await rail.locator('#wiki-nav-heading').click();
      await expect(panel).toBeHidden();
      await expect(rail).toBeVisible();
      await settings.click();
      await page.keyboard.press('Tab');
      await expect(panel).toBeHidden();
      await expect(page.getByRole('main')).toBeFocused();
    });

    test('section jumps use rendered anchors and respect Back', async ({ page }) => {
      await page.goto('/the-holy-nation');
      const rail = sidebar(page);
      const main = page.getByRole('main');
      await main.evaluate((el, narrow) => (narrow ? window : el).scrollTo(0, 310), phone);
      const readerTop = () => main.evaluate((el, narrow) => narrow ? window.scrollY : el.scrollTop, phone);
      await expect.poll(readerTop).toBe(310);
      if (phone) {
        // Tap the already visible sticky control. Locator auto-scrolling would move the document before the tap.
        const box = await page.getByRole('button', { name: 'Navigation', exact: true }).boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      }
      await expect.poll(readerTop).toBe(310);
      await expect(rail.locator('.rail-outline > details')).toHaveAttribute('open', '');
      await expect(rail.getByRole('link', { name: 'Disposition', exact: true })).toHaveAttribute('href', '#disposition');
      const jump = rail.getByRole('link', { name: 'Shek Kingdom', exact: true });
      await expect(jump).toBeHidden();
      await rail.getByLabel('Subsections of Disposition', { exact: true }).press('Enter');
      await jump.press('Enter');
      const target = main.getByRole('heading', { name: 'Shek Kingdom', exact: true });
      await expect(target).toBeFocused();
      await expect(target).toBeInViewport({ ratio: 1 });
      expect((await target.boundingBox()).y).toBeGreaterThanOrEqual((await page.locator('.wiki-header').boundingBox()).height - 1);
      if (phone) await expect(rail).toBeHidden();
      await page.goBack();
      await expect(page).toHaveURL(/\/the-holy-nation$/);
      await expect.poll(readerTop).toBe(310);
    });
  });
}

test('the outline respects hand-authored bookmarks and omits short articles', async ({ page }) => {
  await page.goto('/about-kenshi');
  const rail = sidebar(page);
  await expect(rail.locator('.rail-outline > details')).toHaveAttribute('open', '');
  await expect(rail.getByRole('link', { name: 'Gallery', exact: true })).toHaveAttribute('href', '#Gallery');
  await rail.getByRole('link', { name: 'Gallery', exact: true }).click();
  await expect(page.locator('main #Gallery')).toBeFocused();
  await page.goto('/small-backpack');
  await expect(rail.locator('.rail-outline')).toHaveCount(0);
});

test('topic disclosures work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const rail = sidebar(page);
    await topic(rail, 'Life').click();
    await topic(rail, 'Life/Races').click();
    await rail.getByRole('link', { name: 'Skeleton', exact: true }).click();
    await expect(page).toHaveURL(/\/skeleton$/);
  } finally {
    await context.close();
  }
});

test('a leading infobox meets the header beside a short or wrapped desktop title, and follows the title on phones', async ({ page }) => {
  const title = page.locator('#firstHeading');
  const infobox = page.locator('.mw-parser-output > .infobox').first();
  await page.goto('/catun');
  const header = await page.locator('.wiki-header').boundingBox();
  const box = await infobox.boundingBox();
  expect(Math.abs(box.y - (header.y + header.height))).toBeLessThanOrEqual(1);
  const heading = await title.boundingBox();
  expect(heading.y).toBeGreaterThan(box.y);
  expect(heading.x + heading.width).toBeLessThan(box.x);
  const firstLine = page.locator('.mw-parser-output > p').first();
  expect((await firstLine.boundingBox()).y).toBeLessThan(box.y + box.height);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/how-to-use-the-part-map-aka-how-to-make-the-skin-invisible-under-clothes');
  const wrapped = await title.boundingBox();
  expect(wrapped.height).toBeGreaterThan(1.8 * await title.evaluate(el => parseFloat(getComputedStyle(el).lineHeight)));
  expect(wrapped.x + wrapped.width).toBeLessThan((await infobox.boundingBox()).x);
  expect((await infobox.boundingBox()).y).toBeCloseTo(header.y + header.height, 0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catun');
  const mobileTitle = await title.boundingBox();
  const mobileBox = await infobox.boundingBox();
  expect(mobileBox.y).toBeGreaterThanOrEqual(mobileTitle.y + mobileTitle.height);
  expect((await firstLine.boundingBox()).y).toBeGreaterThanOrEqual(mobileBox.y + mobileBox.height);
});

test('creature attributes, growth and drops keep their values, links and notes at reader widths', async ({ page }) => {
  await page.goto('/swamp-raptor');
  const attributes = page.getByRole('table', { name: 'Attributes', exact: true });
  const growth = page.getByRole('table', { name: 'Growth stages' });
  const drops = page.getByRole('table', { name: 'Death Items' });
  expect((await growth.boundingBox()).y).toBeCloseTo((await attributes.boundingBox()).y, 0);
  await expect(attributes.getByRole('row', { name: 'Martial Arts 3', exact: true })).toBeVisible();
  await expect(growth.getByRole('row', { name: 'Teen (0.40x) 3.2 days' })).toBeVisible();
  await expect(page.getByText('Stats randomize by 2', { exact: true })).toBeVisible();
  await expect(page.locator('.creature-table-note a', { hasText: 'FCS' })).toHaveAttribute('href', '/forgotten-construction-set');
  await expect(drops.getByRole('columnheader')).toHaveText(['Item', 'Quantity', 'Average price']);
  await expect(drops.getByRole('row', { name: 'Animal Skin 1 240' })).toBeVisible();
  await expect(page.locator('.creature-drops')).toContainText('Removing these items from the creature will kill it instantly.');
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await growth.boundingBox()).y).toBeGreaterThan((await attributes.boundingBox()).y + (await attributes.boundingBox()).height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto('/great-white-gorillo');
  await expect(page.locator('.creature-drops td').filter({ hasText: 'FILE' })).toHaveCount(1);
});

test('faction disclosures open on their content and preserve their linked town lists', async ({ page }) => {
  await page.goto('/the-holy-nation#locations');
  for (const [name, link, href] of [['Zones', 'Bast', '/bast-zone'], ['Towns', 'Watchtower', '/watchtower-town']]) {
    const summary = page.locator('summary').filter({ hasText: new RegExp('^' + name + '$') });
    const section = summary.locator('..');
    const rows = section.locator(':scope > table.wikitable > tbody > tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toBeHidden();
    await expect(rows.last()).toBeVisible();
    await expect(rows.last().getByRole('link', { name: link, exact: true })).toHaveAttribute('href', href);
    await summary.click();
    await expect(rows.last()).toBeHidden();
    await summary.click();
    await expect(rows.last()).toBeVisible();
  }
  await expect(page.locator('details.collapsible table table').getByRole('link', { name: 'Blister Hill', exact: true })).toBeVisible();
});

test('the heading view and its controls work when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    for (const key of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, key, { get() { throw new DOMException('Storage is disabled', 'SecurityError'); } });
    }
  });
  await page.goto('/the-holy-nation');
  const rail = sidebar(page);
  await expect(rail.locator('.rail-outline > details')).toHaveJSProperty('open', true);
  await rail.getByRole('button', { name: 'Sidebar settings' }).click();
  await rail.getByRole('radio', { name: 'Folded' }).check();
  await expect(rail.locator('.rail-outline > details')).toHaveJSProperty('open', false);
  await page.reload();
  await expect(rail.locator('.rail-outline > details')).toHaveJSProperty('open', true);
});
