/**
 * Fix Learning Content - Add Missing IDs and Slugs
 * 
 * Updates learning content to have proper id and slug fields
 * from the JSON data structure
 * 
 * Usage: pnpm tsx scripts/db/fix-learning-content-fields.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

async function fixLearningContent() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'learning.json');
    
    console.log(`📂 Reading learning content from: ${jsonPath}`);
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ JSON file not found: ${jsonPath}`);
      process.exit(1);
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const learningItems = jsonData.resources || jsonData.items || [];
    
    console.log(`📊 Found ${learningItems.length} learning items in JSON file`);
    
    if (learningItems.length === 0) {
      console.error('❌ No learning items found in JSON file');
      process.exit(1);
    }
    
    const db = await getMongoDb();
    const learningCollection = db.collection('learning_content');
    
    let updated = 0;
    let errors = 0;
    
    console.log('\n📥 Updating learning content with IDs and slugs...');
    
    for (const item of learningItems) {
      try {
        const updates: Record<string, unknown> = {};
        let needsUpdate = false;
        
        // Add id field if missing
        if (item.id) {
          updates.id = item.id;
          needsUpdate = true;
        }
        
        // Add slug from seo.slug if exists
        if (item.seo?.slug && !item.slug) {
          updates.slug = item.seo.slug;
          needsUpdate = true;
        }
        
        // Update timestamps
        updates.updatedAt = new Date();
        
        if (needsUpdate) {
          // Try to find by id first, then by title
          const query = item.id 
            ? { id: item.id }
            : { title: item.title };
            
          const result = await learningCollection.updateOne(
            query,
            { $set: updates },
            { upsert: false }
          );
          
          if (result.modifiedCount > 0) {
            updated++;
          }
        }
      } catch (error) {
        console.error(`❌ Error updating learning item ${item.id || item.title}:`, error instanceof Error ? error.message : error);
        errors++;
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`   🔄 Updated: ${updated} learning items`);
    console.log(`   ❌ Errors: ${errors}`);
    
    // Show final status
    const finalCount = await learningCollection.countDocuments({});
    const withIds = await learningCollection.countDocuments({ id: { $exists: true, $ne: null } });
    const withSlugs = await learningCollection.countDocuments({ slug: { $exists: true, $ne: null } });
    
    console.log(`\n📊 Final status:`);
    console.log(`   Total: ${finalCount}`);
    console.log(`   With IDs: ${withIds}`);
    console.log(`   With slugs: ${withSlugs}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing learning content:', error);
    process.exit(1);
  }
}

fixLearningContent();
