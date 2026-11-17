import { test, expect } from '@playwright/test';
import { load } from 'cheerio';
import evidence from './restored-articles.json' with {type: 'json'};
import accepted from '../conversion/pr-43.json' with {type: 'json'};
import { origin } from '../src/lib/catalog.mjs';

const holy = '/the-holy-nation';
const packs = '/backpacks';
const blender = '/modding/blender-plugins';
const reference = evidence.articles;
const normalize = text => text.replace(/\s+/g, ' ').trim();
const forPath = href => new URL(href, origin).pathname;
const byId = (page, id) => page.locator('[id="' + id + '"]');

test('original headings, citation pairs, backpack cells, sort keys and icons survive the conversion', async ({request}) => {
  for (const [slug, expected] of Object.entries(reference)) {
    const $ = load(await (await request.get('/' + slug)).text());
    const ids = $('[id]').map((_, el) => el.attribs.id).get();
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of expected.frameIds) expect(ids).toContain(id);
    const headings = $('.article-body h2,.article-body h3,.article-body h4').toArray()
      .filter(el => el.attribs.id !== 'source-history')
      .map(el => ({id: el.attribs.id, level: Number(el.tagName.slice(1))}));
    expect(headings).toEqual(expected.headings);
    if (expected.citations) {
      const actual = $('sup[id^=cite_ref]').toArray().map(el => [el.attribs.id, $(el).find('a').attr('href').slice(1)]);
      expect(actual).toEqual(expected.citations);
      const notes = $('li[id^=cite_note]');
      expect(notes).toHaveLength(211);
      const back = notes.toArray().flatMap(note => $(note).find('a[href^="#cite_ref"]').toArray().map(a => [a.attribs.href.slice(1),note.attribs.id]));
      expect(back.sort()).toEqual([...expected.citations].sort());
      for (const a of $('main a[href^="#"]').toArray()) expect(ids).toContain(decodeURIComponent(a.attribs.href.slice(1)));
      expect($('.factbox a').toArray().map(a=>forPath(a.attribs.href))).toContain('/the-holy-nation-trade-culture');
    } else {
      const table = $('table[data-sortable]');
      expect(table.find('thead th[scope=col]')).toHaveLength(12);
      const rows = table.find('tbody tr').toArray().map(row => {
        const cells = $(row).children();
        expect(cells.first().is('th[scope=row]')).toBe(true);
        return {item: forPath(cells.first().find('a').attr('href')), icon: cells.first().find('img').attr('src'),
          cells: cells.toArray().map(c => normalize($(c).text())), gridSort: cells.eq(1).attr('data-sort-value') ?? null};
      });
      expect(rows).toEqual(expected.rows);
      for (const row of rows) expect((await request.get(row.icon)).status()).toBe(200);
      expect($('#history').next('p').text()).toContain('Old World');
      const notice = $('main a').filter((_, el) => $(el).text() === 'item-art notice').attr('href');
      expect(notice).toBe('/notices/artwork.txt');
      expect(await (await request.get(notice)).text()).toContain('Lo-Fi Games’ Kenshi artwork');
    }
    const revision = slug === 'the-holy-nation' ? '95303' : '91761';
    expect($('main a[href*="oldid='+revision+'"]').length).toBe(1);
    expect($('main a[href*="action=history"]').length).toBe(1);
    expect($('main a[href*="/by-sa/3.0/"]').length).toBe(1);
    const correction = new URL($('.article-actions a').last().attr('href'));
    expect(correction.searchParams.get('article')).toBe(origin+'/'+slug);
  }
});

test('old Holy Nation paths keep their fragment through permanent static redirects', async ({page,request}) => {
  for (const path of ['/holy-nation','/The_Holy_Nation','/Holy_Nation','/the_holy_nation.html','/Holy_Nation.html']) {
    const response = await request.get(path, {maxRedirects:0});
    expect(response.status()).toBe(301);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(holy);
    await page.goto(path + '#military-1');
    await expect(page).toHaveURL(/\/the-holy-nation#military-1$/);
    await expect(byId(page,'military-1')).toBeInViewport();
  }
});

test('Modding portal, category and accepted Blender contribution can be followed both ways', async ({page})=>{
  await page.goto('/');
  await page.locator('.primary-links').getByRole('link',{name:'Modding',exact:true}).click();
  await expect(page).toHaveURL(/\/modding$/);
  const portal = page.locator('.portal');
  await expect(portal.locator('section h2')).toHaveText(['Using mods','Modding with Meitou','Working with the FCS','Dialogue and world editing','Art and animation']);
  await page.goto('/modding#art-and-animation');
  await expect(byId(page,'art-and-animation')).toBeInViewport();
  const art = portal.locator('section[aria-labelledby="art-and-animation"]');
  await expect(art.getByRole('link',{name:'Making Animations Basics'})).toHaveAttribute('href',origin+'/making-animations-basics');
  await art.getByRole('link',{name:'Blender plugins'}).click();
  await expect(page).toHaveURL(/\/modding\/blender-plugins$/);
  const main = page.locator('main');
  for(const text of ['November 2026','37 base game models','174 animations','5 times out of 6','20 to 70 degrees']) await expect(main).toContainText(text);
  await expect(main.locator('p').filter({hasText:'original plugin'})).toContainText(/wasn['’]t tested/);
  const table = main.getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveText(['Plugin','Version','Blender versions','Tested in']);
  await expect(table.locator('tbody tr td:last-child')).toHaveText(['5.2.3','4.5.16','3.6.23 and 4.0.2']);
  for (const href of ['https://github.com/Ragnarking/kenshi_io_blender5/releases/tag/v1.4.0','https://github.com/Lucius64/kenshi_io_blender','https://codeberg.org/Kindrad/Kenshi_IO_Continued','https://github.com/teppuM','https://creativecommons.org/licenses/by-sa/4.0/']) {
    expect(await main.locator('a[href="'+href+'"]').count()).toBeGreaterThan(0);
  }
  await expect(main.getByRole('link',{name:'original contribution'})).toHaveAttribute('href',new RegExp(accepted.contribution));
  await page.locator('.end-categories').getByRole('link',{name:'Modding',exact:true}).click();
  await expect(page.locator('[data-member]')).toHaveCount(96);
  for (const {article} of accepted.edits) {
    await expect(page.locator('[data-member="'+article+'"]')).toHaveAttribute('href',origin+article);
  }
  await page.locator('[data-member="'+blender+'"]').click();
  await expect(page).toHaveURL(/\/modding\/blender-plugins$/);
});

async function tabTo(page, target) {
  for (let step = 0; step < 120; step++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw Error('Could not reach '+await target.textContent()+' using Tab');
}

async function visibleTarget(page,id) {
  const target = byId(page,id);
  await expect(target).toBeInViewport();
  const top = await target.evaluate(el=>el.getBoundingClientRect().top);
  const header = await page.locator('.context-row').boundingBox();
  expect(top).toBeGreaterThanOrEqual(Math.max(0,header.y+header.height)-2);
}

async function swipeToEnd(page,region) {
  const client = await page.context().newCDPSession(page);
  try {
    await region.scrollIntoViewIfNeeded();
    const box = await region.boundingBox();
    const visible = page.viewportSize();
    const y = Math.round(Math.max(105,Math.min(visible.height-70,box.y+94)));
    const x0 = Math.floor(box.x+box.width-18);
    const x1 = Math.ceil(box.x+20);
    for (let attempt = 0; attempt < 9; attempt++) {
      if (await region.evaluate(el=>el.scrollLeft+el.clientWidth >= el.scrollWidth-2)) return;
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y}]});
      for (let step = 1; step <= 8; step++) {
        await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*step/8,y}]});
        await page.evaluate(()=>new Promise(requestAnimationFrame));
      }
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    await expect.poll(()=>region.evaluate(el=>el.scrollWidth-el.clientWidth-el.scrollLeft)).toBeLessThanOrEqual(2);
  } finally { await client.detach(); }
}

for (const phone of [false,true]) for (const palette of ['light','dark']) {
  test.describe((phone?'phone':'desktop')+' in '+palette,()=>{
    test.use({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone,colorScheme:palette});
    test('deep outline, dismissal and a citation round trip',async({page})=>{
      await page.goto(holy+'?theme='+palette+'#military');
      await visibleTarget(page,'military');
      const toggle=page.locator('#toggle-navigation');
      if (phone) {
        await toggle.focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
        await expect(toggle).toBeFocused();await page.keyboard.press('Enter');
      }
      const rail=page.locator('.page-outline');
      await rail.locator('#article-outline > summary').focus();
      for(const name of ['Characters','Generic Characters']) {
        const summary=rail.locator('summary[aria-label="Subsections of '+name+'"]');
        await tabTo(page,summary);await page.keyboard.press('Enter');
      }
      await tabTo(page,rail.locator('a[href="#military-1"]'));
      await page.keyboard.press('Enter');await expect(byId(page,'military-1')).toBeFocused();await visibleTarget(page,'military-1');
      if(phone) await expect(page.locator('.rail')).toBeHidden();
      const [cite,note]=reference['the-holy-nation'].citations.find(([id])=>id.includes(':'));
      await page.goto(holy+'?theme='+palette+'#'+cite);
      await visibleTarget(page,cite);await byId(page,cite).getByRole('link').focus();await page.keyboard.press('Enter');
      await expect(byId(page,note)).toBeFocused();await visibleTarget(page,note);
      await byId(page,note).locator('a[href="#'+cite+'"]').focus();await page.keyboard.press('Enter');
      await expect(byId(page,cite)).toBeFocused();await visibleTarget(page,cite);
    });
    test('table sorting, horizontal navigation and a linked header',async({page})=>{
      await page.goto(packs+'?theme='+palette+'#types-of-backpacks');
      const region=page.getByRole('region',{name:'Backpack comparison'}),table=region.getByRole('table');
      const first=table.locator('tbody tr').first().getByRole('rowheader');
      const button=name=>table.getByRole('button',{name:'Sort by '+name,exact:true});
      await button('Base value').press('Enter');await expect(first).toContainText("Scavenger's Basket");
      await expect(button('Base value').locator('..')).toHaveAttribute('aria-sort','ascending');
      await button('Base value').press('Space');await expect(first).toContainText('Thieves Backpack');
      await expect(button('Base value').locator('..')).toHaveAttribute('aria-sort','descending');
      await button('Weight').press('Enter');await expect(first).toContainText('Small Thieves Backpack');
      await expect(table.locator('tbody tr').last().getByRole('rowheader')).toContainText('Shopkeepers goods bag');
      await expect(table.locator('[aria-sort]')).toHaveCount(1);
      if(phone){
        expect(await region.evaluate(el=>el.scrollWidth > el.clientWidth)).toBe(true);
        await region.focus();await page.keyboard.press('Home');await expect.poll(()=>region.evaluate(el=>el.scrollLeft)).toBe(0);
        await page.keyboard.press('End');
        await expect.poll(()=>region.evaluate(el=>el.scrollWidth-el.clientWidth-el.scrollLeft)).toBeLessThanOrEqual(2);
        await page.keyboard.press('Home');await swipeToEnd(page,region);
      } else {
        expect(await region.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
      }
      await expect(table.getByRole('link',{name:'Dodge'})).toBeInViewport();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
      await page.route(origin+'/dodge',route=>route.fulfill({contentType:'text/html',body:'<title>Dodge</title>'}));
      await table.getByRole('link',{name:'Dodge'}).click();await expect(page).toHaveURL(origin+'/dodge');
    });
  });
}
