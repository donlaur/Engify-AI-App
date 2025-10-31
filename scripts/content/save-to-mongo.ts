#!/usr/bin/env tsx

/* eslint-disable no-console */

/*
  Save enriched content records to MongoDB with dedupe and quality gates.

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

import type {
  RawContentRecord,
  StoredContentRecord,
} from '@/lib/content/transform';
import { buildStoredContent } from '@/lib/content/transform';

async function readLines(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const all = Buffer.concat(chunks).toString('utf8');
  return all.split(/\r?\n/).filter((l) => l.trim().length > 0);
}

async function main(): Promise<void> {
  const { getDb } = await import('@/lib/db/client');
  const { Collections } = await import('@/lib/db/schema');
  const db = await getDb();
  const collection = db.collection<StoredContentRecord>(
    Collections.WEB_CONTENT as unknown as string
  );

  await collection.createIndex({ hash: 1 }, { unique: true });
  await collection.createIndex({ canonicalUrl: 1 });

  const lines = await readLines();
  let upserts = 0;
  for (const line of lines) {
    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      console.error('Skipping invalid JSON');
      continue;
    }
    if (!obj || typeof obj !== 'object') continue;

    const stored = buildStoredContent(obj as RawContentRecord);
    if (!stored) continue;

    if (stored.quality.checks.length > 0) {
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
    const insertDoc: StoredContentRecord = {
      ...stored,
      createdAt: now,
      updatedAt: now,
    };

    await collection.updateOne(
      { hash: insertDoc.hash },
      {
        $setOnInsert: insertDoc,
        $set: {
          title: insertDoc.title,
          description: insertDoc.description,
          text: insertDoc.text,
          canonicalUrl: insertDoc.canonicalUrl,
          source: insertDoc.source,
          lang: insertDoc.lang,
          readingMinutes: insertDoc.readingMinutes,
          quality: insertDoc.quality,
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
  console.error(err);
  process.exit(1);
});
