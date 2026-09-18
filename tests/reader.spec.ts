import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
test('all 42 complete chapters and 156 quotations are served intact', async({request})=>{
  const library=await (await request.get('/content/library.json')).json();
  const quotes=await (await request.get('/content/quotes.json')).json();
  expect(library.filter((e:any)=>e.work==='odyssey')).toHaveLength(24);
  expect(library.filter((e:any)=>e.work==='ulysses')).toHaveLength(18);
  expect(quotes).toHaveLength(156);
  for(const e of library){
    const response=await request.get(`/content/${e.id}.json`);expect(response.ok()).toBeTruthy();
    const chapter=await response.json();expect(chapter.sections.length).toBeGreaterThan(2);
    if(e.work!=='guide'){
      const original=fs.readFileSync(`editions/odyssey/sources/${e.work}-${String(e.number).padStart(2,'0')}.txt`,'utf8').replace(/^(BOOK [IVXLC]+|\[ \d+ \])\s*\n/,'');
      expect(chapter.source.text).toBe(original);
      for(const q of quotes.filter((q:any)=>q.chapterId===e.id))expect(original.replace(/\s+/g,' ')).toContain(q.text.replace(/\s+/g,' '));
    }
  }
});
test('reader, save, search, deep passage links and keyboard dialogs',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.getByRole('button',{name:'Begin reading',exact:true}).click();
  await expect(page.locator('#chapter-title')).toBeVisible();
  await page.locator('.section-rail>button').filter({hasText:'Quotations'}).click();
  const quote=page.locator('.passage').first();await quote.getByRole('button',{name:'Save passage'}).click();
  await expect(quote.getByRole('button',{name:'Saved',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.reload();await expect(page.locator('.passage').first().getByRole('button',{name:'Saved',exact:true})).toBeVisible();
  await page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true}).click();await expect(page.locator('#original-0')).toBeVisible();
  await page.getByRole('button',{name:'Saved chapters and passages',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('.saved-list a').first().click();await expect(page.locator('#odyssey-1-q1')).toBeInViewport();
  await expect(page.getByRole('button',{name:'Reading notes',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Search the reading edition',exact:true}).click();
  await page.getByLabel('Search the commentary and chapter titles').fill('Polyphemus');
  await expect(page.locator('.search-results a')).not.toHaveCount(0);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Search the reading edition',exact:true})).toBeFocused();
  expect(errors).toEqual([]);
});
test('appearance and exact reading place survive a return home',async({page})=>{
  await page.goto('/read/odyssey-9');await page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true}).click();
  await page.locator('#original-12').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ithaca-reading-v1-place')||'{}').anchor)).toMatch(/^original-/);
  let anchor=await page.evaluate(()=>JSON.parse(localStorage.getItem('ithaca-reading-v1-place')!).anchor);
  await page.locator('.top-nav').getByRole('button',{name:'Reading appearance',exact:true}).click();
  await page.getByRole('button',{name:'Night',exact:true}).click();await page.getByRole('button',{name:'Largest text',exact:true}).click();
  await page.keyboard.press('Escape');
  await page.locator('#original-12').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ithaca-reading-v1-place')||'{}').anchor)).toMatch(/^original-/);
  await expect.poll(()=>page.evaluate(()=>{const a=JSON.parse(localStorage.getItem('ithaca-reading-v1-place')||'{}').anchor;const r=document.getElementById(a)?.getBoundingClientRect();return !!r&&r.bottom>80&&r.top<innerHeight;})).toBeTruthy();
  anchor=await page.evaluate(()=>JSON.parse(localStorage.getItem('ithaca-reading-v1-place')!).anchor);
  await page.getByRole('link',{name:'Ithaca, home',exact:true}).click();
  await page.getByRole('button',{name:'Continue reading',exact:true}).click();
  await expect(page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator(`#${anchor}`)).toBeInViewport();
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','night');
  await expect(page.locator('html')).toHaveCSS('--reading-size','24px');
});
test('desktop and phone renders, reduced motion, accessibility and reflow',async({page})=>{
  fs.mkdirSync('evidence/screenshots',{recursive:true});
  await page.goto('/');await page.getByRole('button',{name:'Begin reading',exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/home-desktop.png',fullPage:true});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.goto('/read/odyssey-1');await page.locator('#chapter-title').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/reader-desktop.png'});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.locator('.top-nav').getByRole('button',{name:'Reading appearance',exact:true}).click();
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/appearance.png'});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Night',exact:true}).click();await page.keyboard.press('Escape');
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/reader-night.png'});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Change reading appearance',exact:true}).click();await page.getByRole('button',{name:'Day',exact:true}).click();await page.keyboard.press('Escape');
  await page.goto('/');await page.getByRole('button',{name:/reading$/,exact:false}).waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/home-phone.png',fullPage:true});
  await page.goto('/read/odyssey-1');await page.locator('#chapter-title').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({animations:'disabled',path:'evidence/screenshots/reader-phone.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.getByRole('button',{name:'Change reading appearance',exact:true}).click();await page.getByRole('button',{name:'Largest text',exact:true}).click();await page.keyboard.press('Escape');
  await page.goto('/read/comparison');await page.locator('#chapter-title').waitFor();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Change reading appearance',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCSS('transition-duration','0s');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('keyboard anchors preserve reading mode and Joyce source typography',async({page})=>{
  await page.goto('/read/ulysses-1');await page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true}).click();
  await expect(page.locator('.original-prose em').filter({hasText:'Introibo'})).toBeVisible();
  const verse=page.locator('.verse').filter({hasText:'For Fergus rules the brazen cars.'});
  await expect(verse.locator('br')).toHaveCount(2);
  await page.getByRole('link',{name:'Skip to reading',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('#main')).toBeFocused();
  await page.goto('/about#images');await expect(page.locator('#images')).toBeInViewport();await expect(page.locator('#images')).toBeFocused();
  await page.setViewportSize({width:390,height:844});await page.goto('/read/odyssey-1');await page.locator('#chapter-title').waitFor();
  await page.locator('.mode-switch button[aria-controls]').click();await page.locator('#chapter-notes-menu button').nth(1).click();
  const section=page.locator('.prose>section');await expect(section).toBeInViewport();await expect(section).toBeFocused();
});
