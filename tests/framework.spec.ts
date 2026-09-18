import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a configured edition works without book-specific application code',async({page,request})=>{
  const edition=await(await request.get('/content/edition.json')).json();
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle(edition.site.title);
  await expect(page.locator('#cover-title')).toContainText(edition.cover.title);
  await page.getByRole('button',{name:'Begin reading',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/read/${edition.cover.start}$`));
  const chapter=await(await request.get(`/content/${edition.cover.start}.json`)).json();
  if(chapter.source)await expect(page.locator('#original-0')).toBeVisible();
  else await expect(page.locator('.prose>section')).toBeVisible();
  await page.getByRole('button',{name:'Bookmark this chapter',exact:true}).click();
  await page.reload();await expect(page.getByRole('button',{name:'Remove chapter bookmark',exact:true})).toBeVisible();
  await page.locator('.mode-switch button[aria-controls]').click();
  await page.locator('#chapter-notes-menu button').first().click();
  await expect(page.locator('.prose>section')).toBeVisible();
  await page.getByRole('button',{name:'Change reading appearance',exact:true}).click();
  await page.getByRole('button',{name:'Georgia typeface',exact:true}).click();
  await page.getByRole('button',{name:'Night',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-font','classic');
  await expect(page.locator('html')).toHaveAttribute('data-theme','night');
  await page.getByRole('button',{name:'Texts',exact:true}).click();
  await expect(page.locator('.dialog-tabs button')).toHaveCount(edition.works.length);
  await page.keyboard.press('Escape');
  await page.goto('/about');await expect(page.locator('main h1')).toHaveText(edition.about.title);
  for(const download of edition.downloads){const response=await request.get(download.href);expect(response.ok()).toBeTruthy();}
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await expect(page.locator('#cover-title')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});
