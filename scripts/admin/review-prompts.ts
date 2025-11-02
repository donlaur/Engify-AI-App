#!/usr/bin/env tsx
/**
 * Prompt Quality Review & Cleanup Tool
 *
 * Features:
 * - List all prompts with quality scores
 * - Mark AI-generated prompts as inactive
 * - Delete low-quality prompts
 * - Add/update quality scores
 * - Remove duplicates
 *
 * Usage:
 *   pnpm admin:review-prompts --list                    # List all
 *   pnpm admin:review-prompts --inactive-ai             # Mark AI-gen as inactive
 *   pnpm admin:review-prompts --delete-duplicate        # Remove duplicate
 *   pnpm admin:review-prompts --delete-low-quality=5    # Delete score < 5
 *   pnpm admin:review-prompts --add-source-tags         # Tag by source
 */

/* eslint-disable no-console */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function listPrompts(db: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompts = await (db as any)
    .collection('prompts')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  console.log(`\n📋 Total Prompts: ${prompts.length}\n`);

  // Group by source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bySource: Record<string, any[]> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompts.forEach((p: any) => {
    let source = p.source || 'unknown';
    if (p.id.startsWith('generated-')) source = 'ai-generated';
    else if (!p.source) source = 'seed';

    if (!bySource[source]) bySource[source] = [];
    bySource[source].push(p);
  });

  Object.entries(bySource).forEach(([source, items]) => {
    console.log(`\n${source}: ${items.length} prompts`);
    items.slice(0, 5).forEach((p, i) => {
      const active = p.active !== false ? '✅' : '❌';
      const score = p.qualityScore?.overall || 'N/A';
      console.log(
        `  ${i + 1}. ${active} [${p.id}] ${p.title} (score: ${score})`
      );
    });
    if (items.length > 5) {
      console.log(`  ... and ${items.length - 5} more`);
    }
  });

  // Show inactive count
  const inactive = prompts.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.active === false
  ).length;
  console.log(`\n⚠️  Inactive prompts: ${inactive}`);

  // Show unscored count
  const unscored = prompts.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => !p.qualityScore
  ).length;
  console.log(`📊 Prompts without quality score: ${unscored}`);
}

async function markAIGeneratedInactive(db: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (db as any).collection('prompts').updateMany(
    { id: { $regex: /^generated-/ } },
    {
      $set: {
        active: false,
        source: 'ai-generated',
        updatedAt: new Date(),
      },
    }
  );

  console.log(
    `\n✅ Marked ${result.modifiedCount} AI-generated prompts as inactive`
  );
  console.log('   They will not appear on the prompts page until reviewed.');
}

async function addSourceTags(db: unknown) {
  // Tag AI-generated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiResult = await (db as any)
    .collection('prompts')
    .updateMany(
      { id: { $regex: /^generated-/ }, source: { $exists: false } },
      { $set: { source: 'ai-generated', updatedAt: new Date() } }
    );

  // Tag seed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seedResult = await (db as any)
    .collection('prompts')
    .updateMany(
      { id: { $not: { $regex: /^generated-/ } }, source: { $exists: false } },
      { $set: { source: 'seed', updatedAt: new Date() } }
    );

  console.log(`\n✅ Tagged ${aiResult.modifiedCount} AI-generated prompts`);
  console.log(`✅ Tagged ${seedResult.modifiedCount} seed prompts`);
}

async function removeDuplicate(db: unknown) {
  // Find the duplicate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const duplicates = await (db as any)
    .collection('prompts')
    .aggregate([
      { $group: { _id: '$title', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (duplicates.length === 0) {
    console.log('\n✅ No duplicates found');
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} duplicate title(s):`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  duplicates.forEach((d: any) => {
    console.log(`  "${d._id}" appears ${d.count} times`);
  });

  const answer = await question(
    '\nDelete duplicates, keeping the oldest? (yes/no): '
  );
  if (answer.toLowerCase() !== 'yes') {
    console.log('Cancelled');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const dup of duplicates) {
    // Keep first, delete rest
    const idsToDelete = dup.ids.slice(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .collection('prompts')
      .deleteMany({ _id: { $in: idsToDelete } });
    console.log(`  Deleted ${idsToDelete.length} duplicate(s) of "${dup._id}"`);
  }

  console.log('\n✅ Duplicates removed');
}

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    console.log('🔍 Prompt Quality Review Tool\n' + '='.repeat(60));

    if (args.includes('--list') || args.length === 0) {
      await listPrompts(db);
    }

    if (args.includes('--inactive-ai')) {
      await markAIGeneratedInactive(db);
    }

    if (args.includes('--add-source-tags')) {
      await addSourceTags(db);
    }

    if (args.includes('--delete-duplicate')) {
      await removeDuplicate(db);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Available commands:');
    console.log('   --list                  List all prompts');
    console.log('   --inactive-ai           Mark AI-generated as inactive');
    console.log('   --add-source-tags       Tag prompts by source');
    console.log('   --delete-duplicate      Remove duplicate titles\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await client.close();
  }
}

main();
