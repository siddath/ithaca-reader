import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('source-first navigation, distinct sections, stable saved IDs and bookmark persistence',async({page})=>{
  await page.goto('/read/odyssey-1');await expect(page.locator('#original-0')).toBeVisible();
  await expect(page.locator('#chapter-title')).toHaveText('Book I');
  await page.getByRole('button',{name:'Bookmark this chapter',exact:true}).click();await page.reload();
  await expect(page.getByRole('button',{name:'Remove chapter bookmark',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator('.mode-switch button[aria-controls]').click();await page.locator('#chapter-notes-menu button').filter({hasText:'Quotations'}).click();
  await expect(page.locator('.prose>section')).toHaveCount(1);await expect(page.locator('#odyssey-1-q1')).toBeVisible();
  await page.locator('#odyssey-1-q1 button').click();await page.locator('.section-rail>button').filter({hasText:'Questions'}).click();
  await expect(page.locator('.passage')).toHaveCount(0);await page.goBack();await expect(page.locator('#odyssey-1-q1 button')).toHaveText('Saved');
  await page.getByRole('button',{name:'Saved chapters and passages'}).click();await expect(page.locator('.bookmarked-chapters a')).toHaveCount(1);
  await page.locator('.saved-list a').click();await expect(page.locator('#odyssey-1-q1')).toBeInViewport();
  await expect(page.locator('#odyssey-1-q1')).toBeFocused();
});

test('all font choices, retained paragraph, phone largest reflow and accessibility',async({page})=>{
  await page.goto('/read/ulysses-1');await page.locator('#original-20').scrollIntoViewIfNeeded();
  const anchor=await page.evaluate(()=>Array.from(document.querySelectorAll<HTMLElement>('article p[id]')).find(e=>{const r=e.getBoundingClientRect();return r.bottom>120&&r.top<innerHeight;})!.id);
  const before=await page.locator(`#${anchor}`).evaluate(e=>e.getBoundingClientRect().top);
  await page.locator('.top-nav button[aria-label="Reading appearance"]').click();
  for(const font of ['literata','classic','clear']){
    await page.locator(`.font-${font}`).click();await expect(page.locator('html')).toHaveAttribute('data-font',font);
    await expect(page.locator(`.font-${font}`)).toHaveAttribute('aria-pressed','true');
  }
  await page.keyboard.press('Escape');
  await expect.poll(async()=>Math.abs(await page.locator(`#${anchor}`).evaluate(e=>e.getBoundingClientRect().top)-before)).toBeLessThan(4);
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});await page.locator('.reader-toolbar .icon-button').click();
    await page.getByRole('button',{name:'Largest text',exact:true}).click();
    for(const font of ['literata','classic','clear']){
      await page.locator(`.font-${font}`).click();await expect(page.locator('html')).toHaveAttribute('data-font',font);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    }
    await page.keyboard.press('Escape');
  }
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('every dropdown item is keyboard reachable and reduced motion disables movement',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/read/odyssey-1');await page.locator('#original-0').waitFor();
  const trigger=page.locator('.mode-switch button[aria-controls]');await trigger.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#chapter-notes-menu')).toBeVisible();
  await page.keyboard.press('Tab'); // Appearance is next in document order.
  await page.keyboard.press('Tab');await expect(page.locator('#chapter-notes-menu button').first()).toBeFocused();
  await page.keyboard.press('Enter');await expect(page.locator('.prose>section')).toBeFocused();
  await trigger.click();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await page.emulateMedia({reducedMotion:'reduce'});await trigger.click();
  await expect(page.locator('#chapter-notes-menu')).toHaveCSS('transition-duration','0s');
  await expect(page.locator('#chapter-notes-menu')).toHaveCSS('transform','none');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Bookmark this chapter',exact:true}).click();await expect(page.locator('.chapter-bookmark svg')).toHaveCSS('transform','none');
});

test('font changes preserve a paragraph within long commentary and Clear retains emphasis',async({page})=>{
  // Regression: a chapter may arrive before the global library; anchor setup must still run.
  await page.route('**/content/library.json',async route=>{const response=await route.fetch();await new Promise(resolve=>setTimeout(resolve,300));await route.fulfill({response});});
  await page.goto('/read/odyssey-1#s3-important-passages-and-close-reading');await expect(page.locator('.prose>section')).toBeFocused();await page.evaluate(()=>document.fonts.ready);await page.locator('.prose>section p').last().scrollIntoViewIfNeeded();
  const anchor=await page.evaluate(()=>{const top=document.querySelector('.reader-toolbar')!.getBoundingClientRect().bottom+16;return Array.from(document.querySelectorAll<HTMLElement>('article p[id]')).find(e=>{const r=e.getBoundingClientRect();return r.bottom>top&&r.top<innerHeight;})!.id;});
  const offset=await page.locator(`#${anchor}`).evaluate(e=>e.getBoundingClientRect().top);
  await page.locator('.top-nav button[aria-label="Reading appearance"]').click();await page.locator('.font-clear').click();await page.keyboard.press('Escape');
  await expect.poll(async()=>Math.abs(await page.locator(`#${anchor}`).evaluate(e=>e.getBoundingClientRect().top)-offset)).toBeLessThan(4);
  await page.goto('/read/ulysses-1');const emphasis=page.locator('.original-prose em').filter({hasText:'Introibo'});await expect(emphasis).toBeVisible();
  await expect(emphasis).toHaveCSS('font-style','italic');await expect(emphasis).toHaveCSS('font-synthesis','style');
});
