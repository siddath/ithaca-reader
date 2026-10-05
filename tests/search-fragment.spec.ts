import { test, expect } from '@playwright/test';

for (const hash of ['find-%', 'find-%GG', 'find-%E0%A4%A']) {
  test(`malformed fragment ${hash} falls back on direct and history navigation`, async ({page, request}) => {
    const library = await (await request.get('/content/library.json')).json();
    const chapter = await (await request.get(`/content/${library[0].id}.json`)).json();
    const errors:string[]=[];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/read/${chapter.id}#${hash}`);
    await expect(page.locator('#chapter-title')).toBeVisible();
    await expect(page.locator('.prose')).toContainText(chapter.sections[0].text.slice(0,40));
    await page.locator('.mode-switch').getByRole('button',{name:'Original text',exact:true}).click();
    await page.goBack();
    await expect(page.locator('.prose')).toContainText(chapter.sections[0].text.slice(0,40));
    await page.goForward();
    await expect(page.locator('#chapter-title')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('valid encoded Unicode search still selects the matching section', async ({page, request}) => {
  const library = await (await request.get('/content/library.json')).json();
  const chapter = await (await request.get(`/content/${library[0].id}.json`)).json();
  // Use a synthetic section so the UTF-8 regression does not depend on edition prose.
  chapter.sections[1].text = 'A café beside the sea';
  chapter.sections[1].html = '<p>A café beside the sea</p>';
  await page.route(`**/content/${chapter.id}.json`, route => route.fulfill({json:chapter}));
  await page.goto(`/read/${chapter.id}#find-${encodeURIComponent('café')}`);
  await expect(page.locator('.prose')).toContainText('A café beside the sea');
});
