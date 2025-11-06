#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Ensure Text Indexes for Search
 * Creates text indexes on collections for full-text search
 * 
 * Handles duplicate index errors gracefully (idempotent)
 * 
 * Usage:
 *   tsx scripts/admin/ensure-text-indexes.ts
 * 
 * For production MongoDB Atlas:
 *   tsx scripts/admin/ensure-text-indexes-atlas.ts <MONGODB_URI>
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Try multiple env file locations
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Now import MongoDB after env is loaded
import { getDb } from '@/lib/mongodb';

async function ensureTextIndexes() {
  console.log('🔍 Ensuring text indexes for search...\n');

  try {
    const db = await getDb();
    const dbName = db.databaseName;
    console.log(`📦 Database: ${dbName}\n`);

    // 1. Prompts collection - for RAG chat search
    // Includes enriched fields: caseStudies, whatIs, whyUse, examples, useCases, bestPractices, seoKeywords
    console.log('Creating text index on prompts collection...');
    try {
      await db.collection('prompts').createIndex(
        {
          title: 'text',
          description: 'text',
          content: 'text',
          tags: 'text',
          role: 'text',  // Include role for leadership role searches (engineering-director, vp-engineering, etc.)
          category: 'text',  // Include category for better filtering
          // Enriched fields for better RAG search
          whatIs: 'text',
          whyUse: 'text',
          metaDescription: 'text',
          seoKeywords: 'text',
          caseStudies: 'text',
          examples: 'text',
          useCases: 'text',
          bestPractices: 'text',
          whenNotToUse: 'text',
          // Flattened text fields for better searchability
          caseStudiesText: 'text',
          examplesText: 'text',
        },
        {
          name: 'prompts_text_search',
          weights: {
            title: 10,
            description: 8,
            content: 5,
            role: 4,  // Role matches for leadership prompts (engineering-director, vp-engineering, etc.)
            category: 3,  // Category for filtering
            whatIs: 6,
            whyUse: 5,
            metaDescription: 4,
            seoKeywords: 3,
            caseStudies: 4,
            examples: 4,
            useCases: 5,
            bestPractices: 4,
            whenNotToUse: 3,
            // Flattened text fields (higher weight since they're pre-processed)
            caseStudiesText: 5,
            examplesText: 5,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Prompts text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Prompts text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // 2. Patterns collection - for pattern search
    console.log('Creating text index on patterns collection...');
    try {
      await db.collection('patterns').createIndex(
        {
          title: 'text',
          description: 'text',
          useCases: 'text',
          tags: 'text',
        },
        {
          name: 'patterns_text_search',
          weights: {
            title: 10,
            description: 5,
            useCases: 3,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Patterns text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Patterns text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // 3. Web content collection - for general search
    console.log('Creating text index on web_content collection...');
    try {
      await db.collection('web_content').createIndex(
        {
          title: 'text',
          content: 'text',
          excerpt: 'text',
          tags: 'text',
        },
        {
          name: 'web_content_text_search',
          weights: {
            title: 10,
            excerpt: 5,
            content: 3,
            tags: 2,
          },
          default_language: 'english',
        }
      );
      console.log('✅ Web content text index created\n');
    } catch (error: any) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Web content text index already exists (skipping)\n');
      } else {
        throw error;
      }
    }

    // List all indexes
    console.log('📋 Current indexes:');
    const collections = ['prompts', 'patterns', 'web_content'];
    for (const collName of collections) {
      const indexes = await db.collection(collName).indexes();
      console.log(`\n${collName}:`);
      indexes.forEach((index) => {
        const isTextIndex = index.textIndexVersion !== undefined;
        console.log(`  ${isTextIndex ? '🔍' : '📌'} ${index.name}`);
      });
    }

    console.log('\n✅ All text indexes ensured!');
    console.log('\n💡 To verify indexes, run: tsx scripts/admin/verify-text-indexes.ts');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring text indexes:', error);
    process.exit(1);
  }
}

ensureTextIndexes();
