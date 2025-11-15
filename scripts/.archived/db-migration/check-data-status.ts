#!/usr/bin/env tsx
/**
 * Check Data Status - Investigate what's actually in the database
 */

import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function checkDataStatus() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await client.connect();
    console.log('✅ Connected\n');
    
    const db = client.db();
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections in database:');
    
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`   ${coll.name}: ${count} documents`);
    }
    
    console.log('\n📝 Prompts collection details:');
    const promptsCount = await db.collection('prompts').countDocuments();
    console.log(`   Total: ${promptsCount}`);
    
    if (promptsCount > 0) {
      const sample = await db.collection('prompts').find({}).limit(3).toArray();
      console.log('\n   Sample prompts:');
      sample.forEach((p: any) => {
        console.log(`   - ${p.title || p.id}`);
      });
      
      // Check for active prompts
      const activeCount = await db.collection('prompts').countDocuments({ active: { $ne: false } });
      const publicCount = await db.collection('prompts').countDocuments({ isPublic: true });
      console.log(`\n   Active: ${activeCount}`);
      console.log(`   Public: ${publicCount}`);
    } else {
      console.log('   ⚠️  PROMPTS COLLECTION IS EMPTY!');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDataStatus();
