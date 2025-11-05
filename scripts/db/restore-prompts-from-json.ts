/**
 * Restore Prompts from JSON File
 * 
 * Restores prompts from public/data/prompts.json to MongoDB
 * Uses upsert to avoid duplicates
 * 
 * Usage: pnpm tsx scripts/db/restore-prompts-from-json.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function restorePrompts() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'prompts.json');
    
    console.log(`📂 Reading prompts from: ${jsonPath}`);
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ JSON file not found: ${jsonPath}`);
      process.exit(1);
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const prompts = jsonData.prompts || [];
    
    console.log(`📊 Found ${prompts.length} prompts in JSON file`);
    
    if (prompts.length === 0) {
      console.error('❌ No prompts found in JSON file');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');
    
    const currentCount = await promptsCollection.countDocuments({});
    console.log(`📊 Current prompts in DB: ${currentCount}`);
    
    // Upsert all prompts (update if exists by id, insert if new)
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    console.log('\n📥 Restoring prompts...');
    
    for (const prompt of prompts) {
      try {
        // Normalize prompt data - remove _id completely as it's immutable
        const { _id, ...promptWithoutId } = prompt;
        const normalizedPrompt = {
          ...promptWithoutId,
          // Ensure id field exists
          id: prompt.id || prompt._id?.toString() || `restored-${Date.now()}-${Math.random()}`,
          // Ensure timestamps
          createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date(),
          updatedAt: new Date(),
        };
        
        // Use id field for upsert (not _id)
        const result = await promptsCollection.updateOne(
          { id: normalizedPrompt.id },
          { $set: normalizedPrompt },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          inserted++;
        } else if (result.modifiedCount > 0) {
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error restoring prompt ${prompt.id || prompt._id}:`, error instanceof Error ? error.message : error);
        errors++;
      }
    }
    
    const finalCount = await promptsCollection.countDocuments({});
    
    console.log('\n✅ Restoration complete!');
    console.log(`   📥 Inserted: ${inserted} new prompts`);
    console.log(`   🔄 Updated: ${updated} existing prompts`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total prompts in DB: ${finalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error restoring prompts:', error);
    process.exit(1);
  }
}

restorePrompts();
