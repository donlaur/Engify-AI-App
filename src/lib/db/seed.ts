/**
 * Database Seeding Script
 * Seeds MongoDB with initial data from static files
 */

import { MongoClient } from 'mongodb';
import { seedPrompts } from '@/data/seed-prompts';
import { promptPatterns } from '@/data/prompt-patterns';
import { learningPathways } from '@/data/learning-pathways';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

async function seed() {
  console.log('🌱 Starting database seed...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');

    // Clear existing data (optional - comment out to preserve)
    console.log('🗑️  Clearing existing data...');
    await db.collection('prompts').deleteMany({});
    await db.collection('patterns').deleteMany({});
    await db.collection('pathways').deleteMany({});

    // Seed prompts
    console.log('📝 Seeding prompts...');
    const promptsResult = await db.collection('prompts').insertMany(
      seedPrompts.map((prompt) => ({
        ...prompt,
        views: 0,
        favorites: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log(`✅ Inserted ${promptsResult.insertedCount} prompts`);

    // Seed patterns
    console.log('🎯 Seeding patterns...');
    const patternsResult = await db.collection('patterns').insertMany(
      promptPatterns.map((pattern) => ({
        ...pattern,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log(`✅ Inserted ${patternsResult.insertedCount} patterns`);

    // Seed pathways
    console.log('🛤️  Seeding learning pathways...');
    const pathwaysResult = await db.collection('pathways').insertMany(
      learningPathways.map((pathway) => ({
        ...pathway,
        enrollments: 0,
        completions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log(`✅ Inserted ${pathwaysResult.insertedCount} pathways`);

    // Create indexes
    console.log('📊 Creating indexes...');
    
    await db.collection('prompts').createIndexes([
      { key: { category: 1 } },
      { key: { tags: 1 } },
      { key: { title: 'text', description: 'text' } },
      { key: { createdAt: -1 } },
      { key: { views: -1 } },
      { key: { rating: -1 } },
    ]);

    await db.collection('patterns').createIndexes([
      { key: { category: 1 } },
      { key: { difficulty: 1 } },
      { key: { name: 'text', description: 'text' } },
    ]);

    await db.collection('pathways').createIndexes([
      { key: { level: 1 } },
      { key: { enrollments: -1 } },
    ]);

    console.log('✅ Indexes created');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Prompts: ${promptsResult.insertedCount}`);
    console.log(`   - Patterns: ${patternsResult.insertedCount}`);
    console.log(`   - Pathways: ${pathwaysResult.insertedCount}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
