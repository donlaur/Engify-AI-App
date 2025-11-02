#!/usr/bin/env tsx
/**
 * Unified Database Statistics Tool
 *
 * DRY replacement for multiple one-off counting scripts.
 *
 * Usage:
 *   pnpm admin:stats                    # All collections
 *   pnpm admin:stats prompts            # Specific collection
 *   pnpm admin:stats prompts --details  # With detailed breakdown
 *   pnpm admin:stats --duplicates       # Check for duplicates
 */

/* eslint-disable no-console */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

const COLLECTIONS = [
  'prompts',
  'patterns',
  'users',
  'learning_content',
  'web_content',
  'affiliate_config',
  'partnership_outreach',
  'audit_logs',
  'pathways',
] as const;

type CollectionName = (typeof COLLECTIONS)[number];

interface StatsOptions {
  collection?: CollectionName;
  details?: boolean;
  duplicates?: boolean;
}

async function getCollectionStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  collection: CollectionName,
  options: StatsOptions
) {
  const coll = db.collection(collection);
  const count = await coll.countDocuments();

  console.log(`\n📦 ${collection}: ${count} documents`);

  if (options.details && count > 0) {
    // Sample documents
    const samples = await coll.find().limit(3).toArray();
    console.log(`   Samples:`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    samples.forEach((doc: any, i: number) => {
      const label = doc.title || doc.name || doc.email || doc.id || doc._id;
      console.log(`     ${i + 1}. ${label}`);
    });

    // Collection-specific breakdowns
    if (collection === 'prompts') {
      const byCategory = await coll
        .aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();
      if (byCategory.length > 0) {
        console.log(`   By category:`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        byCategory.forEach((g: any) => {
          console.log(`     ${g._id || 'uncategorized'}: ${g.count}`);
        });
      }

      // Check for AI-generated prompts
      const generated = await coll.countDocuments({
        id: { $regex: /^generated-/ },
      });
      if (generated > 0) {
        console.log(`   ⚠️  AI-generated: ${generated}`);
      }
    }

    if (collection === 'learning_content') {
      const byType = await coll
        .aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();
      if (byType.length > 0) {
        console.log(`   By type:`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        byType.forEach((g: any) => {
          console.log(`     ${g._id || 'uncategorized'}: ${g.count}`);
        });
      }
    }

    if (collection === 'users') {
      const byRole = await coll
        .aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();
      if (byRole.length > 0) {
        console.log(`   By role:`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        byRole.forEach((g: any) => {
          console.log(`     ${g._id || 'no role'}: ${g.count}`);
        });
      }
    }
  }

  if (options.duplicates) {
    await checkDuplicates(coll, collection);
  }
}

async function checkDuplicates(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coll: any,
  _collection: CollectionName
) {
  // Check by 'id' field if it exists
  const sampleDoc = await coll.findOne();
  if (!sampleDoc) return;

  if (sampleDoc.id) {
    const idDuplicates = await coll
      .aggregate([
        { $group: { _id: '$id', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    if (idDuplicates.length > 0) {
      console.log(`   ⚠️  Duplicate IDs: ${idDuplicates.length}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      idDuplicates.slice(0, 3).forEach((d: any) => {
        console.log(`     "${d._id}" appears ${d.count} times`);
      });
    }
  }

  if (sampleDoc.title) {
    const titleDuplicates = await coll
      .aggregate([
        { $group: { _id: '$title', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    if (titleDuplicates.length > 0) {
      console.log(`   ⚠️  Duplicate titles: ${titleDuplicates.length}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      titleDuplicates.slice(0, 3).forEach((d: any) => {
        console.log(`     "${d._id}" appears ${d.count} times`);
      });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: StatsOptions = {
    details: args.includes('--details'),
    duplicates: args.includes('--duplicates'),
    collection: args.find((arg) =>
      COLLECTIONS.includes(arg as CollectionName)
    ) as CollectionName | undefined,
  };

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    console.log('\n📊 Database Statistics\n' + '='.repeat(60));

    if (options.collection) {
      await getCollectionStats(db, options.collection, options);
    } else {
      for (const collection of COLLECTIONS) {
        await getCollectionStats(db, collection, options);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(
      '\n💡 Tip: Use --details for breakdowns, --duplicates to check for dupes'
    );
    console.log(
      '   Example: pnpm admin:stats prompts --details --duplicates\n'
    );
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
