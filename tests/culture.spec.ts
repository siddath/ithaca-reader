import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import type { Culture } from '../src/culture-types';
const culture=JSON.parse(fs.readFileSync(new URL('../editions/odyssey/culture.json',import.meta.url),'utf8')) as Culture;

test('gallery filters, empty state, cultural essays and whole-book guide',async({page})=>{
 await page.goto('/');await page.getByRole('link',{name:'Art & culture',exact:true}).click();
 await expect(page.locator('.gallery-work')).toHaveCount(12);
 await page.getByRole('button',{name:'Paintings & prints',exact:true}).click();await expect(page.locator('.gallery-work')).toHaveCount(6);
 await page.getByRole('button',{name:'Objects & manuscripts',exact:true}).click();await expect(page.locator('.gallery-work')).toHaveCount(6);
 await page.getByRole('combobox',{name:'Filter artworks by book'}).selectOption('odyssey-20');await expect(page.locator('.gallery-work')).toHaveCount(1);
 await page.getByRole('button',{name:'Paintings & prints',exact:true}).click();await expect(page.locator('.gallery-empty')).toBeVisible();
 await page.getByRole('button',{name:'Show all works'}).click();await expect(page.locator('.gallery-work')).toHaveCount(12);
 await expect(page.locator('.culture-book-grid>article')).toHaveCount(24);
 for(const theme of culture.themes){const details=page.locator(`#theme-${theme.id}`);await details.locator('summary').focus();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','');await expect(details.locator('.theme-body')).toBeVisible();await page.keyboard.press('Enter');await expect(details).not.toHaveAttribute('open','');}
 await page.locator('.culture-navigation a[href$="#books"]').click();await expect(page.locator('#books')).toBeFocused();
 await page.locator('#culture-odyssey-24 .culture-book-title').click();await expect(page.locator('#original-0')).toBeVisible();
 await page.getByRole('link',{name:'Art & cultural context'}).click();await expect(page.locator('#culture-odyssey-24')).toBeFocused();
});

test('every artwork has a working image, credits, chapter links and enlargement',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const art of culture.artworks){
  await page.goto(`/culture/${art.id}`);await expect(page.locator('main h1')).toHaveText(art.title);await expect(page).toHaveTitle(`${art.title} · Art & culture`);
  const image=page.locator('.art-plate img');await expect.poll(()=>image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBeTruthy();
  await expect(page.locator('.art-plate .art-credit a')).toHaveAttribute('href',art.rights.url);
  await expect(page.locator('.art-facts .culture-chapter-links a')).toHaveCount(art.chapterIds.length);
  const trigger=page.locator('.art-enlarge');await trigger.click();await expect(page.locator('.art-lightbox')).toBeVisible();
  await expect(page.getByRole('button',{name:'Close enlarged artwork',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.getByRole('region',{name:'Scrollable artwork detail'})).toBeVisible();
  expect(await page.locator('.art-zoom-stage').evaluate(e=>e.scrollWidth>e.clientWidth)).toBeTruthy();
  await page.getByRole('button',{name:'Fit to screen',exact:true}).click();
  await page.keyboard.press('Escape');await expect(page.locator('.art-lightbox')).not.toBeVisible();await expect(trigger).toBeFocused();
 }
 expect(errors).toEqual([]);
});

test('art remains accessible on a phone, in night mode and with large text',async({page})=>{
 await page.goto('/culture/circe-calyx-krater');
 await page.getByRole('button',{name:'Reading appearance',exact:true}).click();await page.getByRole('button',{name:'Largest text',exact:true}).click();await page.locator('.font-clear').click();await page.locator('.night-option').click();await page.keyboard.press('Escape');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.art-enlarge').click();await expect(page.locator('.art-lightbox')).toHaveCSS('animation-name','none');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'Close enlarged artwork'}).click();await page.locator('.back-link').click();
 await page.setViewportSize({width:320,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.locator('#theme-hospitality summary').click();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('unknown artwork route gives a working way back',async({page})=>{await page.goto('/culture/absent-work');await page.getByRole('link',{name:'Return to art & culture'}).click();await expect(page.locator('.gallery-work')).toHaveCount(12);});
