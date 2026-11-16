import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { normalizeImportedTables } from '../scripts/normalize-tables.mjs';

const stat = '<table class="wikitable"><tbody><tr><th colspan="2">Attributes</th><th>Level</th></tr><tr><td width="10"></td><td><a href="/strength">Strength</a></td><td>-2 – 4</td></tr><tr><td></td><td>Toughness</td><td>40</td></tr></tbody></table>';
const fixture = name => readFile(new URL(`./fixtures/imported-tables/${name}.html`, import.meta.url), 'utf8');

test('stat repair preserves prose, frontmatter, linked labels and negative ranges', () => {
  const prefix = '---\r\ntitle: Example\r\n---\r\n\r\nBefore **this**.\r\n\r\n';
  const suffix = '\r\n\r\nAfter [that](/that).\r\n';
  const result = normalizeImportedTables(prefix + stat + suffix);
  expect(result.markdown.startsWith(prefix)).toBe(true);
  expect(result.markdown.endsWith(suffix)).toBe(true);
  const $ = load(result.markdown);
  expect($('tr').toArray().map(row => $(row).children().length)).toEqual([2, 2, 2]);
  expect($('th').first().attr('colspan')).toBeUndefined();
  expect($('td').toArray().map(cell => $(cell).text())).toEqual(['Strength', '-2 – 4', 'Toughness', '40']);
  expect($('a[href="/strength"]').text()).toBe('Strength');
  expect(normalizeImportedTables(result.markdown).markdown).toBe(result.markdown);
});

test('blank boundary repair preserves real empty values, anchors, media and crossing rowspans', () => {
  const input = '<table class="wikitable"><tbody><tr><td colspan="2"><br></td></tr><tr><th>Item</th><th>Value</th></tr><tr><td>Unknown</td><td></td></tr><tr><td colspan="2">&nbsp;</td></tr></tbody></table>';
  const result = normalizeImportedTables(input);
  const $ = load(result.markdown);
  expect(result.report.spacerRows).toBe(2);
  expect($('tr').length).toBe(2);
  expect($('tr').last().children().length).toBe(2);
  expect($('tr').last().children().last().text()).toBe('');
  for (const table of [
    '<table><tbody><tr><td id="bookmark"></td></tr><tr><td>Value</td></tr></tbody></table>',
    '<table><tbody><tr><td><img src="/image.png" alt=""></td></tr><tr><td>Value</td></tr></tbody></table>',
    '<table><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td></td></tr></tbody></table>',
    '<table><tbody><tr><td data-sort-value="0"></td></tr><tr><td>Value</td></tr></tbody></table>',
  ]) expect(normalizeImportedTables(table).markdown).toBe(table);
});

test('limb and building templates become captioned tables without losing their information', async () => {
  const limb = normalizeImportedTables(await fixture('hive-limbs'));
  const $ = load(limb.markdown);
  expect(limb.report.limbGrids).toBe(1);
  expect($('.imported-item-grid > table > caption').toArray().map(cell => $(cell).text())).toEqual([
    'Severed Hive Right Arm', 'Severed Hive Left Arm', 'Severed Hive Right Leg', 'Severed Hive Left Leg',
  ]);
  expect($('table table').length).toBe(0);
  expect($('td').filter((_, cell) => $(cell).text() === '10/10').length).toBe(4);
  expect($.text()).toContain('The severed left leg of a hiver');
  expect(normalizeImportedTables(limb.markdown).markdown).toBe(limb.markdown);

  const building = normalizeImportedTables(await fixture('building-card'));
  const b = load(building.markdown);
  expect(building.report.buildingCards).toBe(1);
  expect(b('caption').text()).toBe('Storage: Armour Plate');
  expect(b('table').length).toBe(1);
  expect(b('a[href="/iron-plates"]').text()).toBe('Iron Plates');
  expect(b('tbody tr').last().text()).toBe('Estimated build time:1 hrs');
  expect(b('tfoot').text()).toContain('A storage box for steel plates, used to craft heavy armour');
  expect(normalizeImportedTables(building.markdown).markdown).toBe(building.markdown);
});

test('code examples and unfamiliar nested data layouts remain unchanged', () => {
  for (const code of ['```html\n' + stat + '\n```', '~~~~html\n' + stat + '\n~~~~', '`' + stat + '`', '    ' + stat]) {
    expect(normalizeImportedTables(code).markdown).toBe(code);
  }
  const unusual = '<table class="wikitable"><tbody><tr><td>Heading</td><td><table class="wikitable"><tbody><tr><td>Nested data</td></tr></tbody></table></td></tr></tbody></table>';
  const result = normalizeImportedTables(unusual);
  expect(result.markdown).toBe(unusual);
  expect(result.report.retainedNested).toHaveLength(1);
});

test('repaired character tables sort their real columns', async ({ page }) => {
  await page.goto('/straw-lieutenant');
  const table = page.locator('table.wikitable').filter({ has: page.getByRole('columnheader', { name: 'Attributes', exact: true }) }).first();
  await expect(table.locator('tr').first().locator('th')).toHaveCount(2);
  expect(await table.locator('tr').evaluateAll(rows => rows.every(row => row.cells.length === 2))).toBe(true);
  await table.getByRole('columnheader', { name: 'Attributes', exact: true }).press('Enter');
  await expect(table.locator('tr').nth(1)).toContainText('Dexterity');
});

test('a genuine merged heading still sorts by its first populated column', async ({ page }) => {
  const example = '<table id="merged-example" class="wikitable"><tbody><tr><th colspan="2">Label</th><th>Value</th></tr><tr><td></td><td>Zulu</td><td>3</td></tr><tr><td></td><td>Alpha</td><td>1</td></tr><tr><td></td><td>Beta</td><td>2</td></tr></tbody></table>';
  expect(normalizeImportedTables(example).markdown).toBe(example);
  // Let the browser navigate normally, including Cloudflare's browser checks.
  // Add the fixture as its container is parsed, before the deferred sorting module runs.
  await page.addInitScript(example => {
    const observer = new MutationObserver(insert);
    function insert() {
      const content = document.querySelector('.mw-parser-output');
      if (!content) return;
      observer.disconnect();
      content.insertAdjacentHTML('afterbegin', example);
    }
    observer.observe(document, { childList: true, subtree: true });
    insert();
  }, example);
  await page.goto('/adventurer-recruit');
  const table = page.locator('#merged-example');
  const heading = table.getByRole('columnheader', { name: 'Label', exact: true });
  await expect(heading).toHaveClass(/\bheaderSort\b/);
  await expect(heading).toHaveAttribute('colspan', '2');
  await heading.press('Enter');
  await expect(table.locator('td:nth-child(2)')).toHaveText(['Alpha', 'Beta', 'Zulu']);
  await expect(table.locator('td:nth-child(3)')).toHaveText(['1', '2', '3']);
});

test('limb and building cards fit reader widths and retain meaningful blank anatomy values', async ({ page }) => {
  await page.goto('/hive-prince');
  const grid = page.locator('.imported-item-grid');
  await expect(grid.locator('caption')).toHaveCount(4);
  await expect(grid.locator('table table')).toHaveCount(0);
  const anatomy = page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Body Part', exact: true }) });
  await expect(anatomy.locator('tr').nth(1).locator('td').last()).toBeEmpty();
  expect(await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
    // The header reallocates its visible links on the next resize frame.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.goto('/storage-armour-plate');
  const building = page.getByRole('table', { name: 'Storage: Armour Plate', exact: true });
  await expect(building.getByRole('link', { name: 'Iron Plates' })).toHaveAttribute('href', '/iron-plates');
  await expect(building).toContainText('Exterior/Interior');
  await expect(building).toContainText('1 hrs');
  await expect(building.locator('table')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
