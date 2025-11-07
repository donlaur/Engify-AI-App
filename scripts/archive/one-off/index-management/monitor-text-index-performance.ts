#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Monitor Text Index Performance
 * Checks index size, query performance, and provides recommendations
 * 
 * Usage:
 *   tsx scripts/admin/monitor-text-index-performance.ts
 */

import { getDb } from '@/lib/mongodb';

interface IndexStats {
  name: string;
  size: number;
  fields: number;
  keysPerIndex: number;
}

interface QueryPerformance {
  query: string;
  executionTime: number;
  resultsCount: number;
  indexUsed: boolean;
}

async function monitorTextIndexPerformance() {
  console.log('📊 Monitoring Text Index Performance...\n');

  try {
    const db = await getDb();
    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    // Get collection stats
    const collections = ['prompts', 'patterns', 'web_content'];
    
    for (const collName of collections) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Collection: ${collName}`);
      console.log('='.repeat(60));

      const collection = db.collection(collName);
      
      // Get collection stats
      const stats = await collection.stats();
      console.log(`\n📈 Collection Stats:`);
      console.log(`   Documents: ${stats.count.toLocaleString()}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

      // Get indexes
      const indexes = await collection.indexes();
      const textIndex = indexes.find(idx => idx.textIndexVersion !== undefined);
      
      if (textIndex) {
        console.log(`\n🔍 Text Index: ${textIndex.name}`);
        
        // Count index fields
        const indexFields = Object.keys(textIndex.key || {}).filter(
          key => textIndex.key[key] === 'text'
        );
        const weights = textIndex.weights || {};
        
        console.log(`   Fields: ${indexFields.length}`);
        console.log(`   Field Weights:`);
        
        // Sort by weight descending
        const sortedWeights = Object.entries(weights)
          .sort((a, b) => (b[1] as number) - (a[1] as number));
        
        sortedWeights.forEach(([field, weight]) => {
          const emoji = weight >= 8 ? '🔴' : weight >= 5 ? '🟡' : '🟢';
          console.log(`   ${emoji} ${field}: ${weight}`);
        });

        // Get index size estimate
        try {
          const indexStats = await collection.aggregate([
            { $indexStats: {} }
          ]).toArray();
          
          const indexStat = indexStats.find((stat: any) => stat.name === textIndex.name);
          if (indexStat) {
            console.log(`\n📊 Index Usage:`);
            console.log(`   Accesses: ${indexStat.accesses?.ops?.toLocaleString() || 'N/A'}`);
            console.log(`   Since: ${indexStat.accesses?.since || 'N/A'}`);
          }
        } catch (error) {
          // Index stats might not be available in all MongoDB versions
          console.log(`\n⚠️  Index stats not available (requires MongoDB 3.2+)`);
        }

        // Test query performance
        console.log(`\n⚡ Query Performance Tests:`);
        const testQueries = [
          'code review',
          'unit test',
          'API endpoint',
        ];

        for (const query of testQueries) {
          const startTime = Date.now();
          try {
            const results = await collection
              .find(
                { $text: { $search: query } },
                { projection: { score: { $meta: 'textScore' } } }
              )
              .sort({ score: { $meta: 'textScore' } })
              .limit(5)
              .toArray();
            
            const executionTime = Date.now() - startTime;
            
            const emoji = executionTime < 50 ? '✅' : executionTime < 100 ? '⚠️' : '❌';
            console.log(`   ${emoji} Query: "${query}"`);
            console.log(`      Time: ${executionTime}ms`);
            console.log(`      Results: ${results.length}`);
            
            if (results.length > 0 && results[0].score) {
              console.log(`      Top Score: ${results[0].score.toFixed(4)}`);
            }
          } catch (error) {
            console.log(`   ❌ Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Recommendations
        console.log(`\n💡 Recommendations:`);
        
        if (indexFields.length > 12) {
          console.log(`   ⚠️  High field count (${indexFields.length} fields)`);
          console.log(`      Consider removing low-weight fields (< 3)`);
        }
        
        const lowWeightFields = Object.entries(weights)
          .filter(([_, weight]) => (weight as number) < 3);
        
        if (lowWeightFields.length > 0) {
          console.log(`   ⚠️  Low-weight fields detected:`);
          lowWeightFields.forEach(([field, weight]) => {
            console.log(`      - ${field}: ${weight} (consider removing)`);
          });
        }

        // Check for duplicate fields
        const hasCaseStudies = indexFields.includes('caseStudies');
        const hasCaseStudiesText = indexFields.includes('caseStudiesText');
        const hasExamples = indexFields.includes('examples');
        const hasExamplesText = indexFields.includes('examplesText');
        
        if ((hasCaseStudies && hasCaseStudiesText) || (hasExamples && hasExamplesText)) {
          console.log(`   ⚠️  Duplicate fields detected:`);
          if (hasCaseStudies && hasCaseStudiesText) {
            console.log(`      - caseStudies and caseStudiesText (remove one)`);
          }
          if (hasExamples && hasExamplesText) {
            console.log(`      - examples and examplesText (remove one)`);
          }
          console.log(`      Recommendation: Keep only flattened text fields (caseStudiesText, examplesText)`);
        }
      } else {
        console.log(`\n⚠️  No text index found`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Performance monitoring complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error monitoring index performance:', error);
    process.exit(1);
  }
}

monitorTextIndexPerformance();

