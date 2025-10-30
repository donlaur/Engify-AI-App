#!/usr/bin/env tsx

/*
  RSS/Atom fetch script
  - Inputs: RSS/Atom feed URL via CLI arg or ENV RSS_URL
  - Output: NDJSON to stdout with fields: title, url, publishedAt, source
  - Usage: tsx scripts/content/rss-fetch.ts https://example.com/feed.xml > tmp/ingest/rss-YYYYMMDD.jsonl
*/

import { URL } from 'node:url';
import { JSDOM } from 'jsdom';

interface RssItemRecord {
  title: string;
  url: string;
  publishedAt: string | null;
  source: string;
}

function getArgOrEnv(): string {
  if (process.argv.length > 2) {
    const fromArg = process.argv[2];
    if (fromArg) return fromArg;
  }
  const fromEnv = process.env.RSS_URL;
  if (fromEnv) return fromEnv;
  throw new Error('Missing RSS URL. Provide as arg or set RSS_URL env var.');
}

function text(node: Element | null): string | null {
  return node ? (node.textContent || '').trim() : null;
}

function toIsoOrNull(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'user-agent': 'EngifyBot/1.0 (+https://engify.ai)' },
  });
  if (!res.ok)
    throw new Error(`Failed to fetch RSS: ${res.status} ${res.statusText}`);
  return await res.text();
}

function parseRss(xml: string, sourceUrl: string): RssItemRecord[] {
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const doc = dom.window.document;

  const items = Array.from(doc.querySelectorAll('item'));
  if (items.length > 0) {
    return items.map((it) => {
      const title = text(it.querySelector('title')) || '';
      const link = text(it.querySelector('link')) || '';
      const pub = text(it.querySelector('pubDate'));
      return {
        title,
        url: link,
        publishedAt: toIsoOrNull(pub),
        source: sourceUrl,
      };
    });
  }

  // Atom fallback
  const entries = Array.from(doc.querySelectorAll('entry'));
  return entries.map((e) => {
    const title = text(e.querySelector('title')) || '';
    const linkEl = e.querySelector('link');
    const href = linkEl?.getAttribute('href') || '';
    const pub =
      text(e.querySelector('updated')) || text(e.querySelector('published'));
    return {
      title,
      url: href,
      publishedAt: toIsoOrNull(pub),
      source: sourceUrl,
    };
  });
}

async function main(): Promise<void> {
  const feedUrl = getArgOrEnv();
  // Validate URL
  new URL(feedUrl);

  const xml = await fetchText(feedUrl);
  const records = parseRss(xml, feedUrl);
  for (const rec of records) {
    process.stdout.write(`${JSON.stringify(rec)}\n`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
