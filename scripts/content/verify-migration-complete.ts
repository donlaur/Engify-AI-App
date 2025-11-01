import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

async function verifyMigration() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('engify');

    const patterns = await db.collection('patterns').countDocuments();
    const prompts = await db
      .collection('prompts')
      .countDocuments({ isPublic: true });

    console.log(`Patterns in DB: ${patterns} (expected: 26)`);
    console.log(`Prompts in DB: ${prompts} (expected: 90+)`);

    if (patterns >= 26 && prompts >= 90) {
      console.log('✅ Migration verification passed - safe to delete TS files');
      process.exit(0);
    } else {
      console.log('❌ Migration incomplete - DO NOT DELETE FILES');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyMigration();
