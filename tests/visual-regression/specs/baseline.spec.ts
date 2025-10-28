import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests - Baseline Screenshots
 * Run with: npx playwright test --update-snapshots
 */

test.describe('Visual Regression - Baselines', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Library Page', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('library.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('For Directors Page', async ({ page }) => {
    await page.goto('/for-directors');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('for-directors.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('For Engineers Page', async ({ page }) => {
    await page.goto('/for-engineers');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('for-engineers.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('For Managers Page', async ({ page }) => {
    await page.goto('/for-managers');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('for-managers.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Built in Public Page', async ({ page }) => {
    await page.goto('/built-in-public');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('built-in-public.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Patterns Page', async ({ page }) => {
    await page.goto('/patterns');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('patterns.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Learn Page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('learn.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Blog Page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('blog.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Pricing Page', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('pricing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Login Page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login.png', {
      animations: 'disabled',
    });
  });

  test('Signup Page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('signup.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('Homepage Mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Library Mobile', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('library-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('For Directors Mobile', async ({ page }) => {
    await page.goto('/for-directors');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('for-directors-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
