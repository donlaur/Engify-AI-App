/**
 * Seed MongoDB with all prompts
 * Run with: npx tsx scripts/seed-prompts-to-db.ts
 */

import { MongoClient } from 'mongodb';
import { getSeedPromptsWithTimestamps } from '../src/data/seed-prompts';

// Generate SEO-friendly slug from title
function generateSlug(title: string, id: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60) + `-${id}`;
}

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');
    const promptsCollection = db.collection('prompts');

    // Get all prompts with timestamps
    const prompts = getSeedPromptsWithTimestamps();
    
    console.log(`📊 Found ${prompts.length} prompts to seed`);

    // Add slugs to each prompt
    const promptsWithSlugs = prompts.map((prompt) => ({
      ...prompt,
      slug: generateSlug(prompt.title, prompt.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Clear existing prompts (optional - comment out to keep existing)
    await promptsCollection.deleteMany({});
    console.log('🗑️  Cleared existing prompts');

    // Insert all prompts
    const result = await promptsCollection.insertMany(promptsWithSlugs);
    console.log(`✅ Inserted ${result.insertedCount} prompts`);

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
    const categories = await promptsCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\n📊 Prompts by Category:');
    categories.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count}`);
    });

    // Show summary by role
    const roles = await promptsCollection.aggregate([
      { $match: { role: { $exists: true, $ne: null } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

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

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedDatabase();
