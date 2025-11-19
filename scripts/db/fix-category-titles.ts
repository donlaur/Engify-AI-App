#!/usr/bin/env tsx

/**
 * Fix Category Titles in MongoDB
 * 
 * Updates category values from lowercase-with-hyphens format
 * to proper title case format directly in the database.
 * 
 * Examples:
 * - 'agentic-assistant' -> 'Agentic Assistant'
 * - 'cloud-optimized' -> 'Cloud Optimized'
 * - 'ai-terminal' -> 'AI Terminal'
 * 
 * Run with: tsx scripts/db/fix-category-titles.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import * as fs from 'fs';
import * as path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

/**
 * Map of old category keys to new category titles
 */
const CATEGORY_MAPPINGS: Record<string, string> = {
  'agentic-assistant': 'Agentic Assistant',
  'cloud-optimized': 'Cloud Optimized',
  'code-assistant': 'Code Assistant',
  'ai-terminal': 'AI Terminal',
  'ui-generator': 'UI Generator',
  'ai-testing-qa': 'AI Testing QA',
  'code-review': 'Code Review',
  'internal-tooling': 'Internal Tooling',
  // Single word categories stay as-is, just capitalize
  'ide': 'IDE',
  'builder': 'Builder',
  'mlops': 'MLOps',
  'protocol': 'Protocol',
  'framework': 'Framework',
  'other': 'Other',
};

/**
 * Convert hyphenated category to proper title
 */
function formatCategoryTitle(category: string): string {
  // If mapping exists, use it
  if (CATEGORY_MAPPINGS[category]) {
    return CATEGORY_MAPPINGS[category];
  }
  
  // Otherwise, convert hyphenated to title case
  if (category.includes('-')) {
    return category
      .split('-')
      .map((word) => {
        // Handle acronyms
        if (word.toUpperCase() === word && word.length > 1) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
  
  // Single word - capitalize first letter
  return category.charAt(0).toUpperCase() + category.slice(1);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('🔧 Fixing category titles in MongoDB...\n');
    console.log('This script will:');
    console.log('1. ✅ Create backup of existing data');
    console.log('2. ✅ Update category values to proper titles');
    console.log('   Examples:');
    console.log('     - agentic-assistant → Agentic Assistant');
    console.log('     - cloud-optimized → Cloud Optimized');
    console.log('     - ai-terminal → AI Terminal\n');

    // Create backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `categories-backup-${timestamp}.json`);
    
    const existingTools = await collection.find({}).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(existingTools, null, 2));
    console.log(`✅ Backup created: ${backupFile}\n`);

    // Get all unique categories
    const categories = await collection.distinct('category');
    console.log(`📋 Found ${categories.length} unique categories:\n`);

    let updated = 0;
    const categoryUpdates: Record<string, string> = {};

    // Update each category
    for (const oldCategory of categories) {
      const newCategory = formatCategoryTitle(oldCategory);
      
      if (oldCategory !== newCategory) {
        categoryUpdates[oldCategory] = newCategory;
        console.log(`   ${oldCategory} → ${newCategory}`);
        
        // Update all tools with this category
        const result = await collection.updateMany(
          { category: oldCategory },
          {
            $set: {
              category: newCategory,
              updatedAt: new Date(),
              lastUpdated: new Date(),
            },
          }
        );
        
        if (result.modifiedCount > 0) {
          updated += result.modifiedCount;
          console.log(`      ✓ Updated ${result.modifiedCount} tools\n`);
        }
      } else {
        console.log(`   ${oldCategory} (already correct)\n`);
      }
    }

    // Summary
    console.log('\n✨ Category title fix complete!');
    console.log(`   - Categories updated: ${Object.keys(categoryUpdates).length}`);
    console.log(`   - Tools updated: ${updated}`);
    console.log(`   - Backup: ${backupFile}\n`);
    
    if (Object.keys(categoryUpdates).length > 0) {
      console.log('📝 Category mappings applied:');
      Object.entries(categoryUpdates).forEach(([old, newCat]) => {
        console.log(`   - ${old} → ${newCat}`);
      });
      console.log('');
    }

    console.log('💡 To rollback, run:');
    console.log(`   mongoimport --uri="$MONGODB_URI" --collection=ai_tools --file="${backupFile}" --jsonArray --drop\n`);

  } catch (error) {
    logger.error('Failed to fix category titles', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

