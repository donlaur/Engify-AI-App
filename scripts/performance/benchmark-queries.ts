#!/usr/bin/env tsx
/**
 * Database Query Performance Benchmark
 *
 * Benchmarks critical database queries and provides performance insights.
 */

import { getMongoDb } from '@/lib/mongodb';
import { BenchmarkRunner } from '@/lib/performance/benchmark';
import { QueryMonitor } from '@/lib/performance/query-monitor';
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

async function main() {
  console.log('=== Database Query Performance Benchmark ===\n');

  const db = await getMongoDb();
  const runner = new BenchmarkRunner();
  const monitor = new QueryMonitor();
  const optimizer = new QueryOptimizer();

  // Benchmark 1: Find prompts by category
  console.log('\n📊 Benchmarking prompts queries...\n');

  const promptsCollection = db.collection('prompts');

  await runner.run(
    'Find prompts by category',
    async () => {
      await monitor.monitorFind(promptsCollection, {
        category: 'prompt-engineering',
        active: { $ne: false },
      });
    },
    {
      iterations: 50,
      warmupIterations: 5,
      async: true,
    }
  );

  await runner.run(
    'Find prompts with text search',
    async () => {
      await monitor.monitorFind(promptsCollection, {
        $text: { $search: 'chatgpt' },
      });
    },
    {
      iterations: 30,
      warmupIterations: 5,
      async: true,
    }
  );

  await runner.run(
    'Find prompts sorted by favorites',
    async () => {
      await monitor.monitorFind(
        promptsCollection,
        { active: { $ne: false } },
        { sort: { favorites: -1 }, limit: 10 }
      );
    },
    {
      iterations: 50,
      warmupIterations: 5,
      async: true,
    }
  );

  // Benchmark 2: Aggregate queries
  console.log('\n📊 Benchmarking aggregate queries...\n');

  await runner.run(
    'Aggregate prompts by category',
    async () => {
      await monitor.monitorAggregate(promptsCollection, [
        { $match: { active: { $ne: false } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    },
    {
      iterations: 30,
      warmupIterations: 5,
      async: true,
    }
  );

  // Print query monitor report
  monitor.printReport();

  // Analyze queries and get recommendations
  console.log('\n🔍 Analyzing queries for optimization opportunities...\n');

  const analysis1 = await optimizer.analyzeQuery(promptsCollection, {
    category: 'prompt-engineering',
    active: { $ne: false },
  });

  optimizer.printReport(analysis1);

  const analysis2 = await optimizer.analyzeQuery(
    promptsCollection,
    { active: { $ne: false } },
    { sort: { favorites: -1 }, limit: 10 }
  );

  optimizer.printReport(analysis2);

  // Get index recommendations
  console.log('\n💡 Index Recommendations:\n');

  const recommendations = await optimizer.suggestIndexes('prompts');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.impact.toUpperCase()}] ${rec.reason}`);
    console.log(`   Index: ${JSON.stringify(rec.keys)}`);
    console.log(`   Impact: ${rec.estimatedImprovement}\n`);
  });

  // Analyze all collections
  console.log('\n📈 Analyzing all collections...\n');

  const collectionAnalysis = await optimizer.analyzeAllCollections();

  console.log('Collection Statistics:');
  collectionAnalysis.collections.forEach((col) => {
    console.log(`\n${col.collection}:`);
    console.log(`  Documents: ${col.documentCount.toLocaleString()}`);
    console.log(`  Total Size: ${(col.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Avg Doc Size: ${col.avgDocumentSize.toFixed(2)} bytes`);
    console.log(`  Indexes: ${col.indexes.length}`);
    col.indexes.forEach((idx) => {
      console.log(`    - ${idx.name}: ${JSON.stringify(idx.keys)}`);
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`Total Collections: ${collectionAnalysis.summary.totalCollections}`);
  console.log(`Total Indexes: ${collectionAnalysis.summary.totalIndexes}`);
  console.log(`Total Recommendations: ${collectionAnalysis.summary.totalRecommendations}`);
  console.log(`Estimated Impact: ${collectionAnalysis.summary.estimatedImpact}`);
  console.log('='.repeat(60));

  // Create recommended indexes (dry run)
  if (collectionAnalysis.recommendations.length > 0) {
    console.log('\n🔧 Creating recommended indexes (DRY RUN)...\n');

    for (const rec of collectionAnalysis.recommendations) {
      const result = await optimizer.createRecommendedIndexes(
        rec.collection,
        [rec],
        true
      );

      console.log(`${rec.collection}:`);
      console.log(`  Created: ${result.created.length}`);
      console.log(`  Skipped: ${result.skipped.length}`);
      console.log(`  Errors: ${result.errors.length}`);
    }
  }

  console.log('\n✅ Benchmark complete!\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
