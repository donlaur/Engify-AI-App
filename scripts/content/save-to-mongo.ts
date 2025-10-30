#!/usr/bin/env tsx

/*
  Save enriched content records to MongoDB with dedupe and simple quality flags.

  Input: NDJSON on stdin, each line at minimum:
    {
      "title": string|null,
      "description": string|null,
      "text": string,
      "url"?: string,
      "source"?: string,
      "hash"?: string, // if absent, computed from url+text
      "lang"?: string,
      "readingMinutes"?: number
    }

  Output: writes minimal stats to stdout.
*/

import { createHash } from 'node:crypto';
import {
  getQualityConfig,
  passesQuality,
  countWords,
} from '@/lib/content/quality';

interface InputRecord {
  title?: string | null;
  description?: string | null;
  text?: string;
  url?: string;
  source?: string;
  hash?: string;
  lang?: string;
  readingMinutes?: number;
}

interface StoredRecord {
  organizationId: unknown | null;
  title: string | null;
  description: string | null;
  text: string;
  canonicalUrl: string | null;
  source: string | null;
  hash: string;
  lang: string | null;
  readingMinutes: number | null;
  quality: {
    hasTitle: boolean;
    hasDescription: boolean;
    minWordsMet: boolean;
    checks: string[]; // additional gate failures if any
  };
  createdAt: Date;
  updatedAt: Date;
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

// use countWords from quality module

async function readLines(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const all = Buffer.concat(chunks).toString('utf8');
  return all.split(/\r?\n/).filter((l) => l.trim().length > 0);
}

function toStored(input: InputRecord): StoredRecord | null {
  const text = typeof input.text === 'string' ? input.text : '';
  if (text.trim().length === 0) return null;

  const url = typeof input.url === 'string' ? input.url : null;
  const source = typeof input.source === 'string' ? input.source : null;
  const hash =
    typeof input.hash === 'string' && input.hash.length > 0
      ? input.hash
      : sha256(`${url ?? ''}\n${text}`);
  const lang = typeof input.lang === 'string' ? input.lang : null;
  const minutes =
    typeof input.readingMinutes === 'number' ? input.readingMinutes : null;
  const title = input.title ?? null;
  const description = input.description ?? null;

  const cfg = getQualityConfig();
  const wc = countWords(text);
  const gate = passesQuality(text, lang, source, cfg);
  const quality = {
    hasTitle: typeof title === 'string' && title.trim().length > 0,
    hasDescription:
      typeof description === 'string' && description.trim().length > 0,
    minWordsMet: wc >= cfg.minWords,
    checks: gate.ok ? [] : gate.reasons,
  };

  return {
    organizationId: null,
    title: typeof title === 'string' ? title : null,
    description: typeof description === 'string' ? description : null,
    text,
    canonicalUrl: url,
    source,
    hash,
    lang,
    readingMinutes: minutes,
    quality,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function main(): Promise<void> {
  // Dynamic imports to respect app aliases
  const { getDb } = await import('@/lib/db/client');
  const { Collections } = await import('@/lib/db/schema');
  const db = await getDb();
  const collection = db.collection<StoredRecord>(
    Collections.WEB_CONTENT as unknown as string
  );

  // Ensure index (idempotent)
  await collection.createIndex({ hash: 1 }, { unique: true });
  await collection.createIndex({ canonicalUrl: 1 });

  const lines = await readLines();
  let upserts = 0;
  for (const line of lines) {
    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      // eslint-disable-next-line no-console
      console.error('Skipping invalid JSON');
      continue;
    }
    if (!obj || typeof obj !== 'object') continue;
    const stored = toStored(obj as InputRecord);
    if (!stored) continue;
    // If gates failed, skip persist (soft drop) but count toward stats if needed
    if (stored.quality.checks.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          skipped: true,
          hash: stored.hash,
          reasons: stored.quality.checks,
        })
      );
      continue;
    }

    const now = new Date();
    stored.updatedAt = now;

    await collection.updateOne(
      { hash: stored.hash },
      {
        $setOnInsert: { ...stored, createdAt: now },
        $set: {
          title: stored.title,
          description: stored.description,
          text: stored.text,
          canonicalUrl: stored.canonicalUrl,
          source: stored.source,
          lang: stored.lang,
          readingMinutes: stored.readingMinutes,
          quality: stored.quality,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
    upserts += 1;
  }
  process.stdout.write(JSON.stringify({ upserts }) + '\n');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
