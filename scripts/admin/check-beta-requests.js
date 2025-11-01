#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkRequests() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('engify');
    const requests = await db.collection('access_requests')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📧 Beta Access Requests: ${requests.length}\n`);
    
    if (requests.length === 0) {
      console.log('No requests yet.');
    } else {
      requests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.name} (${req.email})`);
        console.log(`   Company: ${req.company || 'N/A'}`);
        console.log(`   Role: ${req.role || 'N/A'}`);
        console.log(`   Date: ${req.createdAt}`);
        console.log(`   Status: ${req.status || 'pending'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkRequests();

