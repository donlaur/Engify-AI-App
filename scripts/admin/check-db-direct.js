#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function checkDB() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected\n');
    
    const db = client.db('engify');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`Found ${users.length} users:\n`);
    users.forEach(u => {
      console.log(`- Email: ${u.email}`);
      console.log(`  Name: ${u.name || 'N/A'}`);
      console.log(`  Role: ${u.role || 'N/A'}`);
      console.log(`  Has password: ${u.password ? 'YES' : 'NO'}`);
      console.log(`  Created: ${u.createdAt || 'N/A'}`);
      console.log('');
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.close();
  }
}

checkDB();

