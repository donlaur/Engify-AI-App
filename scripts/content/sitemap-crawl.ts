#!/usr/bin/env tsx

/*
  Sitemap crawler
  - Inputs: SITEMAP_URL (arg or env), optional FETCH_DELAY_MS (default 500)
  - Output: Saves raw HTML files under tmp/ingest/html/<hash>.html and prints NDJSON with url, storedPath, status, fetchedAt
*/

import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

interface CrawlRecord {
  url: string;
  storedPath: string | null;
  status: number;
  fetchedAt: string;
}

function argOrEnv(name: string, idx: number, fallback?: string): string {
  const fromArg = process.argv[idx];
  if (fromArg) return fromArg;
  const fromEnv = process.env[name];
  if (fromEnv) return fromEnv;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required input: ${name}`);
}

async function delay(ms: number): Promise<void> {
  await new Promise((res) => setTimeout(res, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'user-agent': 'EngifyBot/1.0 (+https://engify.ai)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function parseSitemap(xml: string): string[] {
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const doc = dom.window.document;
  const locs = Array.from(doc.querySelectorAll('url > loc'));
  if (locs.length > 0) {
    return locs
      .map((n) => (n.textContent || '').trim())
      .filter((u) => u.length > 0);
  }

  // sitemap index
  const indexLocs = Array.from(doc.querySelectorAll('sitemap > loc'));
  return indexLocs
    .map((n) => (n.textContent || '').trim())
    .filter((u) => u.length > 0);
}

async function ensureDir(dir: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

async function main(): Promise<void> {
  const sitemapUrl = argOrEnv('SITEMAP_URL', 2);
  const fetchDelayMs = Number(argOrEnv('FETCH_DELAY_MS', 3, '500'));

  const baseDir = 'tmp/ingest/html';
  await ensureDir(baseDir);

  const xml = await fetchText(sitemapUrl);
  const urls = parseSitemap(xml);

  // If this is a sitemap index, expand
  const expanded: string[] = [];
  if (urls.length > 0 && (urls[0] ?? '').endsWith('.xml')) {
    for (const u of urls) {
      try {
        const subXml = await fetchText(u);
        const subUrls = parseSitemap(subXml);
        expanded.push(...subUrls);
        await delay(fetchDelayMs);
      } catch {
        // skip errors
      }
    }
  }
  const crawlList = expanded.length > 0 ? expanded : urls;

  for (const url of crawlList) {
    try {
      const html = await fetchText(url);
      const hash = sha256(`${url}\n${html.substring(0, 2048)}`);
      const outPath = join(baseDir, `${hash}.html`);
      writeFileSync(outPath, html, 'utf8');
      const rec: CrawlRecord = {
        url,
        storedPath: outPath,
        status: 200,
        fetchedAt: new Date().toISOString(),
      };
      process.stdout.write(`${JSON.stringify(rec)}\n`);
    } catch (e) {
      const rec: CrawlRecord = {
        url,
        storedPath: null,
        status: 0,
        fetchedAt: new Date().toISOString(),
      };
      process.stdout.write(`${JSON.stringify(rec)}\n`);
    }
    await delay(fetchDelayMs);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
