#!/usr/bin/env tsx

/*
  HTML extractor/cleaner
  - Inputs: path to an HTML file (or raw HTML via STDIN if '-' provided)
  - Output: JSON to stdout { title, description, text, url?, wordCount }
*/

import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

interface ExtractedContent {
  title: string | null;
  description: string | null;
  text: string;
  url?: string;
  wordCount: number;
}

function readInput(arg: string): string {
  if (arg === '-') {
    const buf = readFileSync(0);
    return buf.toString('utf8');
  }
  return readFileSync(arg, 'utf8');
}

function extract(html: string): ExtractedContent {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // Remove script/style/nav/footer
  document
    .querySelectorAll('script,style,noscript,nav,footer,iframe')
    .forEach((n) => n.remove());

  const title = document.querySelector('title')?.textContent?.trim() || null;
  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content')
      ?.trim() || null;

  // Heuristic: main/article or body text
  const main = document.querySelector('main, article') || document.body;
  const text = (main.textContent || '').replace(/\s+/g, ' ').trim();
  const wordCount = text.length > 0 ? text.split(/\s+/).length : 0;

  return { title, description, text, wordCount };
}

function main(): void {
  const file = process.argv[2];
  if (!file) {
    throw new Error(
      'Usage: tsx scripts/content/html-extract.ts <html-file | ->'
    );
  }
  const html = readInput(file);
  const out = extract(html);
  process.stdout.write(`${JSON.stringify(out)}\n`);
}

try {
  main();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}
