#!/usr/bin/env tsx

/*
  Metadata enrichment
  - Reads JSON object from stdin (one per line) with at least { text, title?, description?, url? }
  - Outputs same object with added fields: hash, lang (heuristic), readingMinutes
*/

import { createHash } from 'node:crypto';

interface InputRecord {
  text: string;
  title?: string | null;
  description?: string | null;
  url?: string;
}

interface OutputRecord extends InputRecord {
  hash: string;
  lang: string;
  readingMinutes: number;
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

function detectLang(text: string): string {
  // Minimal heuristic: presence of ASCII vs extended; default to 'en'
  const asciiRatio =
    text.replace(/[\x00-\x7F]/g, '').length / Math.max(1, text.length);
  return asciiRatio > 0.2 ? 'unknown' : 'en';
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  const minutes = words / 200; // ~200 wpm
  return Math.max(1, Math.round(minutes));
}

async function readLines(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const all = Buffer.concat(chunks).toString('utf8');
  return all.split(/\r?\n/).filter((l) => l.trim().length > 0);
}

async function main(): Promise<void> {
  const lines = await readLines();
  for (const line of lines) {
    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      // eslint-disable-next-line no-console
      console.error('Skipping invalid JSON line');
      continue;
    }

    if (!obj || typeof obj !== 'object') continue;
    const rec = obj as InputRecord;
    const text = typeof rec.text === 'string' ? rec.text : '';
    const hash = sha256(`${rec.url ?? ''}\n${text}`);
    const lang = detectLang(text);
    const readingMinutes = estimateReadingMinutes(text);
    const out: OutputRecord = { ...rec, hash, lang, readingMinutes };
    process.stdout.write(`${JSON.stringify(out)}\n`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
