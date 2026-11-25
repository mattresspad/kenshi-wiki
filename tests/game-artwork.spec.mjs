import {test,expect} from '@playwright/test';
import directory from '../src/data/directory.json' with {type:'json'};
const groups=directory.subjects.flatMap(s=>s.groups);
async function decoded(locator){
  expect(await locator.count()).toBeGreaterThan(0);
  await locator.evaluateAll(images=>Promise.all(images.map(image=>{image.loading='eager';return image.decode()})));
  expect(await locator.evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
}
for(const width of [1920,1440,1024,390])for(const theme of ['light','dark'])test(`restored Home artwork ${width}px ${theme}`,async({page,request},info)=>{
  await page.setViewportSize({width,height:width===390?844:900});
  await page.goto('/?theme='+theme);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('heading',{level:1,name:'Kenshi Wiki',exact:true})).toBeVisible();
  await decoded(page.locator('.home-wordmark,.thumbnail,.masthead img'));
  for(const group of groups){
    const topic=page.locator('#'+group.id),image=topic.locator('.thumbnail');
    await expect(image).toHaveAttribute('src',group.image);await expect(image).toHaveAttribute('alt','');
    await expect(image).toHaveCSS('object-fit',group.cutout?'contain':'cover');
    const box=await image.boundingBox();expect(box.width).toBe(64);expect(box.height).toBe(64);
    await expect(topic.locator('h3 a')).toHaveAttribute('href',group.href);
  }
  const wordmark=await page.locator('.home-wordmark').boundingBox();
  expect(wordmark.width/wordmark.height).toBeCloseTo(796/373,1);
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href','/favicon.ico');
  expect((await request.get('/favicon.ico')).status()).toBe(200);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  if(width>=1440)expect(await page.locator('main').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('home-'+width+'-'+theme+'.png'),fullPage:width===390});
  if(width===390)await page.locator('#toggle-navigation').press('Enter');
  const brand=page.getByRole('link',{name:'Kenshi Wiki main page',exact:true});
  await brand.focus();await expect(brand).toBeInViewport();await expect(brand).toHaveCSS('outline-style','solid');
  await expect(brand.locator('img')).toBeVisible();
  if(width===390){
    await page.screenshot({path:info.outputPath('drawer-'+theme+'.png')});
    await page.keyboard.press('Escape');await expect(page.locator('#toggle-navigation')).toBeFocused();
  }else{
    await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/$/);
  }
});
for(const theme of ['light','dark'])test(`image failures retain named links and navigation without JavaScript: ${theme}`,async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844},colorScheme:theme});
  try{
    const page=await context.newPage();
    await page.route(/\/(?:kenshi-(?:logo|wordmark)\.png|images\/kenshi\/main-page\/)/,route=>route.abort());
    await page.goto('/');
    // Inline theme selection also needs JavaScript; CSS light is the documented no-script default.
    await expect(page.getByRole('heading',{level:1,name:'Kenshi Wiki',exact:true})).toBeVisible();
    const link=page.locator('#group-gear h3 a');await link.focus();await expect(link).toBeInViewport();
    await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/equipment$/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await page.setViewportSize({width:1440,height:900});
    const brand=page.getByRole('link',{name:'Kenshi Wiki main page',exact:true});
    await expect(brand.locator('img')).toHaveAttribute('alt','Kenshi Wiki');
    await brand.press('Enter');await expect(page).toHaveURL(/\/$/);
  }finally{await context.close();}
});
for(const width of [1440,390])for(const theme of ['light','dark'])test(`existing article icons still render ${width}px ${theme}`,async({page},info)=>{
  await page.setViewportSize({width,height:width===390?844:900});
  for(const route of ['/katana','/backpacks','/armour-king']){
    await page.goto(route+'?theme='+theme);
    await decoded(page.locator('main img[src^="/icons/items/"]'));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    if(route==='/katana')await page.screenshot({path:info.outputPath('article-'+width+'-'+theme+'.png')});
  }
});
