import { test, expect } from '@playwright/test';

test.describe('Library Page Visual Regression', () => {
  test('library page renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3005/library');
    await page.locator('text=Browse Prompts').waitFor();
    await expect(page).toHaveScreenshot('library-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('library filters section', async ({ page }) => {
    await page.goto('http://localhost:3005/library');
    const filters = page.locator('input[placeholder*="Search"]').locator('..');
    await expect(filters).toHaveScreenshot('library-filters.png');
  });

  test('library prompt cards', async ({ page }) => {
    await page.goto('http://localhost:3005/library');
    await page.locator('text=Browse Prompts').waitFor();
    const cards = page.locator('article').first();
    await expect(cards).toHaveScreenshot('prompt-card.png');
  });
});
