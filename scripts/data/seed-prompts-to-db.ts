/**
 * Seed MongoDB with all prompts
 * Run with: npx tsx scripts/seed-prompts-to-db.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

// Generate SEO-friendly slug from title (CLEAN - no IDs)
function generateSlug(title: string): string {
  const { generateSlug: generateCleanSlug } = require('@/lib/utils/slug');
  return generateCleanSlug(title);
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await getMongoDb();
    console.log('✅ Connected to MongoDB');
    const promptsCollection = db.collection('prompts');

    // Get all prompts with timestamps
    const prompts = getSeedPromptsWithTimestamps();

    console.log(`📊 Found ${prompts.length} prompts to seed`);

    // Add slugs to each prompt
    const promptsWithSlugs = prompts.map((prompt) => ({
      ...prompt,
      slug: generateSlug(prompt.title), // Clean slug, no ID
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Check existing prompts count
    const existingCount = await promptsCollection.countDocuments({});
    console.log(`📊 Found ${existingCount} existing prompts in database`);

    // Upsert prompts (update if exists by id, insert if new)
    // This preserves existing prompts and only adds/updates the ones from seed file
    let inserted = 0;
    let updated = 0;
    
    for (const prompt of promptsWithSlugs) {
      const result = await promptsCollection.updateOne(
        { id: prompt.id },
        { $set: prompt },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }
    
    console.log(`✅ Upserted ${promptsWithSlugs.length} prompts:`);
    console.log(`   - Inserted: ${inserted} new prompts`);
    console.log(`   - Updated: ${updated} existing prompts`);
    console.log(`   - Unchanged: ${promptsWithSlugs.length - inserted - updated} prompts`);

    // Create indexes for better performance
    await promptsCollection.createIndex({ slug: 1 }, { unique: true });
    await promptsCollection.createIndex({ category: 1 });
    await promptsCollection.createIndex({ role: 1 });
    await promptsCollection.createIndex({ pattern: 1 });
    await promptsCollection.createIndex({ tags: 1 });
    await promptsCollection.createIndex({ isPublic: 1 });
    await promptsCollection.createIndex({ isFeatured: 1 });
    console.log('✅ Created indexes');

    // Show summary by category
    const categories = await promptsCollection
      .aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log('\n📊 Prompts by Category:');
    categories.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count}`);
    });

    // Show summary by role
    const roles = await promptsCollection
      .aggregate([
        { $match: { role: { $exists: true, $ne: null } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log('\n👥 Prompts by Role:');
    roles.forEach((role) => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    console.log('\n✨ Database seeding complete!');
    console.log(`\n🔗 Example URLs:`);
    const samplePrompts = promptsWithSlugs.slice(0, 3);
    samplePrompts.forEach((p) => {
      console.log(`   /library/${p.slug}`);
    });
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
