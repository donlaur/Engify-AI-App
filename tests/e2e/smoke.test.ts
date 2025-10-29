/**
 * Smoke Tests
 *
 * Basic tests to verify the application is running and accessible
 * Run these before deploying to catch critical issues
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3005';
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

// Shared server availability check
let serverAvailable = false;

describe('Smoke Tests', () => {
  let browser: Browser | undefined;
  let page: Page | undefined;

  beforeAll(async () => {
    // Check if server is running
    serverAvailable = await isServerAvailable(BASE_URL);

    if (!serverAvailable) {
      console.warn(
        `Server not available at ${BASE_URL}. E2E tests will be skipped.`
      );
      return;
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  }, TIMEOUT);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  it.skipIf(!serverAvailable)(
    'should load the homepage',
    async () => {
      if (!page) throw new Error('Page not initialized');
      const response = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      expect(response?.status()).toBe(200);

      const title = await page.title();
      expect(title).toContain('Engify');
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should have proper security headers',
    async () => {
      if (!page) throw new Error('Page not initialized');
      const response = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      const headers = response?.headers();

      // Check critical security headers
      expect(headers?.['x-frame-options']).toBe('DENY');
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['strict-transport-security']).toContain('max-age');
      expect(headers?.['content-security-policy']).toBeDefined();
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should not have console errors',
    async () => {
      if (!page) throw new Error('Page not initialized');
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      // Allow some time for any async errors
      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(errors).toHaveLength(0);
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should load without JavaScript errors',
    async () => {
      if (!page) throw new Error('Page not initialized');
      const jsErrors: Error[] = [];

      page.on('pageerror', (error) => {
        jsErrors.push(error as Error);
      });

      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(jsErrors).toHaveLength(0);
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should have accessible navigation',
    async () => {
      if (!page) throw new Error('Page not initialized');
      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      // Check for common navigation elements
      const nav = await page.$('nav');
      expect(nav).toBeTruthy();
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should be responsive',
    async () => {
      if (!page) throw new Error('Page not initialized');
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      const mobileResponse = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });
      expect(mobileResponse?.status()).toBe(200);

      // Test tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      const tabletResponse = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });
      expect(tabletResponse?.status()).toBe(200);

      // Test desktop viewport
      await page.setViewport({ width: 1920, height: 1080 });
      const desktopResponse = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });
      expect(desktopResponse?.status()).toBe(200);
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should have valid HTML',
    async () => {
      if (!page) throw new Error('Page not initialized');
      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      const html = await page.content();

      // Basic HTML structure checks
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should load CSS correctly',
    async () => {
      if (!page) throw new Error('Page not initialized');
      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      // Check if styles are applied
      // eslint-disable-next-line no-eval -- Puppeteer's evaluate is safe, not actual eval()
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Should have a background color set
      expect(bodyBg).not.toBe('rgba(0, 0, 0, 0)');
    },
    TIMEOUT
  );

  it.skipIf(!serverAvailable)(
    'should have proper meta tags',
    async () => {
      if (!page) throw new Error('Page not initialized');
      await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT,
      });

      // eslint-disable-next-line no-eval -- Puppeteer's $eval is safe, not actual eval()
      const metaDescription = await page.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute('content')
      );

      expect(metaDescription).toBeTruthy();
      expect(metaDescription).toContain('AI');
    },
    TIMEOUT
  );
});
