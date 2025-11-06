/**
 * Visual Regression Tests
 *
 * Captures screenshots and compares them to baseline images
 * Detects unintended visual changes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3005';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, 'baseline');
const CURRENT_DIR = path.join(SCREENSHOTS_DIR, 'current');
const DIFF_DIR = path.join(SCREENSHOTS_DIR, 'diff');
const TIMEOUT = 30000;

// Check if server is available
async function isServerAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Ensure directories exist
[BASELINE_DIR, CURRENT_DIR, DIFF_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

let serverAvailable = false;

describe('Visual Regression Tests', () => {
  let browser: Browser | undefined;
  let page: Page | undefined;

  beforeAll(async () => {
    serverAvailable = await isServerAvailable(BASE_URL);
    if (!serverAvailable) {
      console.warn(
        `Server not available at ${BASE_URL}. Visual tests will be skipped.`
      );
      return;
    }
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
  }, TIMEOUT);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  async function captureAndCompare(
    name: string,
    viewport: { width: number; height: number },
    url: string = BASE_URL,
    darkMode: boolean = false
  ) {
    if (!page) throw new Error('Page not initialized');
    await page.setViewport(viewport);

    // Set dark mode preference
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: darkMode ? 'dark' : 'light' },
    ]);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });

    // Apply or remove dark class (next-themes uses class-based dark mode)
    await page.evaluate((isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, darkMode);

    // Wait for theme to apply
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Wait for any animations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const screenshotName = `${name}${darkMode ? '-dark' : ''}-${viewport.width}x${viewport.height}.png`;
    const baselinePath = path.join(BASELINE_DIR, screenshotName);
    const currentPath = path.join(CURRENT_DIR, screenshotName);
    const diffPath = path.join(DIFF_DIR, screenshotName);

    // Capture current screenshot
    await page.screenshot({
      path: currentPath as `${string}.png`,
      fullPage: true,
    });

    // If baseline doesn't exist, create it
    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`📸 Created baseline: ${screenshotName}`);
      return { isBaseline: true, diff: 0 };
    }

    // Compare with baseline
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    // Ensure dimensions match
    if (
      baseline.width !== current.width ||
      baseline.height !== current.height
    ) {
      throw new Error(
        `Screenshot dimensions don't match for ${screenshotName}`
      );
    }

    const diff = new PNG({ width: baseline.width, height: baseline.height });

    const numDiffPixels = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      baseline.width,
      baseline.height,
      { threshold: 0.1 }
    );

    // Save diff image if there are differences
    if (numDiffPixels > 0) {
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }

    const diffPercentage =
      (numDiffPixels / (baseline.width * baseline.height)) * 100;

    return { isBaseline: false, diff: diffPercentage, numDiffPixels };
  }

  describe('Homepage', () => {
    it.skipIf(!serverAvailable)(
      'should match baseline on desktop',
      async () => {
        if (!page) throw new Error('Page not initialized');
        const result = await captureAndCompare('homepage', {
          width: 1920,
          height: 1080,
        });

        if (!result.isBaseline) {
          expect(result.diff).toBeLessThan(1); // Allow 1% difference
        }
      },
      TIMEOUT
    );

    it.skipIf(!serverAvailable)(
      'should match baseline on tablet',
      async () => {
        if (!page) throw new Error('Page not initialized');
        const result = await captureAndCompare('homepage', {
          width: 768,
          height: 1024,
        });

        if (!result.isBaseline) {
          expect(result.diff).toBeLessThan(1);
        }
      },
      TIMEOUT
    );

    it.skipIf(!serverAvailable)(
      'should match baseline on mobile',
      async () => {
        if (!page) throw new Error('Page not initialized');
        const result = await captureAndCompare('homepage', {
          width: 375,
          height: 667,
        });

        if (!result.isBaseline) {
          expect(result.diff).toBeLessThan(1);
        }
      },
      TIMEOUT
    );
  });

  describe('Dark Mode', () => {
    it.skipIf(!serverAvailable)(
      'should match baseline in dark mode',
      async () => {
        if (!page) throw new Error('Page not initialized');
        await page.emulateMediaFeatures([
          { name: 'prefers-color-scheme', value: 'dark' },
        ]);

        const result = await captureAndCompare('homepage-dark', {
          width: 1920,
          height: 1080,
        });

        if (!result.isBaseline) {
          expect(result.diff).toBeLessThan(1);
        }
      },
      TIMEOUT
    );
  });

  // Role Landing Pages
  const rolePages = [
    { slug: 'directors', name: 'Directors' },
    { slug: 'managers', name: 'Managers' },
    { slug: 'engineers', name: 'Engineers' },
    { slug: 'architects', name: 'Architects' },
    { slug: 'devops-sre', name: 'DevOps/SRE' },
    { slug: 'designers', name: 'Designers' },
    { slug: 'pms', name: 'Product Managers' },
    { slug: 'product-owners', name: 'Product Owners' },
    { slug: 'qa', name: 'QA Engineers' },
    { slug: 'scrum-masters', name: 'Scrum Masters' },
  ];

  rolePages.forEach((role) => {
    describe(`Role Landing Page: ${role.name}`, () => {
      const pageUrl = `${BASE_URL}/for-${role.slug}`;
      const screenshotName = `role-${role.slug}`;

      it.skipIf(!serverAvailable)(
        `should match baseline on desktop - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 1920,
              height: 1080,
            },
            pageUrl
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2); // Allow 2% difference for dynamic content
          }
        },
        TIMEOUT
      );

      it.skipIf(!serverAvailable)(
        `should match baseline on tablet - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 768,
              height: 1024,
            },
            pageUrl
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2);
          }
        },
        TIMEOUT
      );

      it.skipIf(!serverAvailable)(
        `should match baseline on mobile - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 375,
              height: 667,
            },
            pageUrl
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2);
          }
        },
        TIMEOUT
      );

      // Dark mode tests
      it.skipIf(!serverAvailable)(
        `should match baseline in dark mode on desktop - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 1920,
              height: 1080,
            },
            pageUrl,
            true // darkMode = true
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2);
          }
        },
        TIMEOUT
      );

      it.skipIf(!serverAvailable)(
        `should match baseline in dark mode on tablet - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 768,
              height: 1024,
            },
            pageUrl,
            true // darkMode = true
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2);
          }
        },
        TIMEOUT
      );

      it.skipIf(!serverAvailable)(
        `should match baseline in dark mode on mobile - ${role.name}`,
        async () => {
          if (!page) throw new Error('Page not initialized');
          const result = await captureAndCompare(
            screenshotName,
            {
              width: 375,
              height: 667,
            },
            pageUrl,
            true // darkMode = true
          );

          if (!result.isBaseline) {
            expect(result.diff).toBeLessThan(2);
          }
        },
        TIMEOUT
      );
    });
  });
});
