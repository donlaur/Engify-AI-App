import { test, expect } from '@playwright/test';

test.describe('Patterns Page Visual Regression', () => {
  test('patterns page renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3005/patterns');
    await page.locator('text=Prompt Engineering Patterns').waitFor();
    await expect(page).toHaveScreenshot('patterns-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('pattern card with example', async ({ page }) => {
    await page.goto('http://localhost:3005/patterns');
    const card = page.locator('article').first();
    await expect(card).toHaveScreenshot('pattern-card.png');
  });
});
