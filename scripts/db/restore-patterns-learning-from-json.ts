/**
 * Restore Patterns and Learning Content from JSON Files
 * 
 * Restores patterns and learning content from public/data JSON files to MongoDB
 * Uses upsert to avoid duplicates and preserves existing data
 * 
 * Usage: pnpm tsx scripts/db/restore-patterns-learning-from-json.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function restorePatterns() {
  const jsonPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
  
  console.log(`\n📂 Reading patterns from: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    return { inserted: 0, updated: 0, errors: 0 };
  }
  
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const patterns = jsonData.patterns || [];
  
  console.log(`📊 Found ${patterns.length} patterns in JSON file`);
  
  if (patterns.length === 0) {
    console.error('❌ No patterns found in JSON file');
    return { inserted: 0, updated: 0, errors: 0 };
  }
  
  const db = await getMongoDb();
  const patternsCollection = db.collection('patterns');
  
  const currentCount = await patternsCollection.countDocuments({});
  console.log(`📊 Current patterns in DB: ${currentCount}`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  console.log('\n📥 Restoring patterns...');
  
  for (const pattern of patterns) {
    try {
      // Normalize pattern data - remove _id completely as it's immutable
      const { _id, ...patternWithoutId } = pattern;
      const normalizedPattern = {
        ...patternWithoutId,
        // Ensure id field exists
        id: pattern.id || pattern._id?.toString() || `restored-${Date.now()}-${Math.random()}`,
        // Ensure timestamps
        createdAt: pattern.createdAt ? new Date(pattern.createdAt) : new Date(),
        updatedAt: new Date(),
      };
      
      // Use id field for upsert (not _id)
      const result = await patternsCollection.updateOne(
        { id: normalizedPattern.id },
        { $set: normalizedPattern },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error restoring pattern ${pattern.id || pattern._id}:`, error instanceof Error ? error.message : error);
      errors++;
    }
  }
  
  return { inserted, updated, errors };
}

async function restoreLearningContent() {
  const jsonPath = path.join(process.cwd(), 'public', 'data', 'learning.json');
  
  console.log(`\n📂 Reading learning content from: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    return { inserted: 0, updated: 0, errors: 0 };
  }
  
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  // Handle both 'resources' and 'items' array names
  const learningItems = jsonData.resources || jsonData.items || [];
  
  console.log(`📊 Found ${learningItems.length} learning items in JSON file`);
  
  if (learningItems.length === 0) {
    console.error('❌ No learning items found in JSON file');
    return { inserted: 0, updated: 0, errors: 0 };
  }
  
  const db = await getMongoDb();
  const learningCollection = db.collection('learning_content');
  
  const currentCount = await learningCollection.countDocuments({});
  console.log(`📊 Current learning content in DB: ${currentCount}`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  console.log('\n📥 Restoring learning content...');
  
  for (const item of learningItems) {
    try {
      // Normalize learning item data - remove _id completely as it's immutable
      const { _id, ...itemWithoutId } = item;
      const normalizedItem = {
        ...itemWithoutId,
        // Ensure id field exists
        id: item.id || item._id?.toString() || `restored-${Date.now()}-${Math.random()}`,
        // Ensure timestamps
        createdAt: item.createdAt || item.publishedAt ? new Date(item.createdAt || item.publishedAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      };
      
      // Use id field for upsert (not _id)
      const result = await learningCollection.updateOne(
        { id: normalizedItem.id },
        { $set: normalizedItem },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error restoring learning item ${item.id || item._id}:`, error instanceof Error ? error.message : error);
      errors++;
    }
  }
  
  return { inserted, updated, errors };
}

async function main() {
  try {
    console.log('🌱 Starting restoration of patterns and learning content...\n');
    
    await getMongoDb(); // Test connection
    
    // Restore patterns
    const patternsResult = await restorePatterns();
    
    // Restore learning content
    const learningResult = await restoreLearningContent();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Restoration Summary\n');
    
    console.log('Patterns:');
    console.log(`  📥 Inserted: ${patternsResult.inserted}`);
    console.log(`  🔄 Updated: ${patternsResult.updated}`);
    console.log(`  ❌ Errors: ${patternsResult.errors}`);
    
    console.log('\nLearning Content:');
    console.log(`  📥 Inserted: ${learningResult.inserted}`);
    console.log(`  🔄 Updated: ${learningResult.updated}`);
    console.log(`  ❌ Errors: ${learningResult.errors}`);
    
    const db = await getMongoDb();
    const finalPatternsCount = await db.collection('patterns').countDocuments({});
    const finalLearningCount = await db.collection('learning_content').countDocuments({});
    
    console.log(`\n✅ Final counts:`);
    console.log(`   Patterns: ${finalPatternsCount}`);
    console.log(`   Learning Content: ${finalLearningCount}`);
    console.log('\n✨ Restoration complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during restoration:', error);
    process.exit(1);
  }
}

main();

