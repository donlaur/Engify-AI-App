import { test, expect } from '@playwright/test';

test.describe('Homepage Visual Regression', () => {
  test('homepage renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3005');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage hero section', async ({ page }) => {
    await page.goto('http://localhost:3005');
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('hero-section.png');
  });

  test('homepage stats section', async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.locator('text=67').first().waitFor();
    const stats = page.locator('section').nth(1);
    await expect(stats).toHaveScreenshot('stats-section.png');
  });

  test('homepage FAQ section', async ({ page }) => {
    await page.goto('http://localhost:3005');
    await page.locator('text=Frequently Asked Questions').waitFor();
    const faq = page.locator('text=Frequently Asked Questions').locator('..');
    await expect(faq).toHaveScreenshot('faq-section.png');
  });
});
