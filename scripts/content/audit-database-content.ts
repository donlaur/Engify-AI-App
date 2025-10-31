/* eslint-disable @typescript-eslint/no-explicit-any */
#!/usr/bin/env tsx
/**
 * Database Content Audit Script
 * Queries MongoDB to assess current content quality and completeness
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly BEFORE any imports that use process.env
config({ path: resolve(process.cwd(), '.env.local') });

// Verify env loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  console.error('Make sure .env.local exists and contains MONGODB_URI');
  process.exit(1);
}

async function auditDatabaseContent() {
  // Dynamic imports after env is loaded
  const { getDb } = await import('../../src/lib/db/client');
  const { Collections } = await import('../../src/lib/db/schema');
  console.log('🔍 Starting database content audit...\n');
  
  try {
    const db = await getDb();
    
    // Count records in each collection
    const promptCount = await db.collection(Collections.PROMPT_TEMPLATES).countDocuments();
    const webContentCount = await db.collection(Collections.WEB_CONTENT).countDocuments();
    const pathwaysCount = await db.collection(Collections.LEARNING_PATHWAYS).countDocuments();
    
    console.log('📊 Collection Counts:');
    console.log(`  Prompt Templates: ${promptCount}`);
    console.log(`  Web Content: ${webContentCount}`);
    console.log(`  Learning Pathways: ${pathwaysCount}\n`);
    
    // Get tag distribution from prompts
    console.log('🏷️  Tag Analysis:');
    const tagAggregation = await db.collection(Collections.PROMPT_TEMPLATES).aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray();
    
    console.log('  Top 20 tags in use:');
    tagAggregation.forEach((tag: { _id: string; count: number }) => {
      console.log(`    ${tag._id}: ${tag.count} prompts`);
    });
    
    // Find prompts without tags
    const noTags = await db.collection(Collections.PROMPT_TEMPLATES).countDocuments({
      $or: [
        { tags: { $exists: false } },
        { tags: { $size: 0 } }
      ]
    });
    console.log(`\n  Prompts missing tags: ${noTags}\n`);
    
    // Sample 15 prompts for quality check
    console.log('📝 Sample Prompt Quality Check:');
    const samplePrompts = await db.collection(Collections.PROMPT_TEMPLATES)
      .find({})
      .limit(15)
      .toArray();
    
    console.log(`  Sampled ${samplePrompts.length} prompts:\n`);
    samplePrompts.forEach((prompt: any, idx: number) => {
      console.log(`  ${idx + 1}. ${prompt.title}`);
      console.log(`     Category: ${prompt.category || 'MISSING'}`);
      console.log(`     Role: ${prompt.role || 'MISSING'}`);
      console.log(`     Tags: ${prompt.tags?.length || 0} tags`);
      console.log(`     Difficulty: ${prompt.difficulty || 'MISSING'}`);
      console.log(`     Content length: ${prompt.content?.length || 0} chars`);
      console.log(`     Stats: ${prompt.stats?.views || 0} views, ${prompt.stats?.favorites || 0} favorites\n`);
    });
    
    // Check for duplicates by title
    console.log('🔄 Checking for duplicate titles:');
    const duplicates = await db.collection(Collections.PROMPT_TEMPLATES).aggregate([
      { $group: { _id: '$title', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicates.length > 0) {
      console.log(`  Found ${duplicates.length} duplicate titles:`);
      duplicates.forEach((dup: any) => {
        console.log(`    "${dup._id}": ${dup.count} copies`);
      });
    } else {
      console.log('  ✅ No duplicate titles found\n');
    }
    
    console.log('✅ Database audit complete!\n');
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

auditDatabaseContent();
