/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI loaded:', uri ? 'YES' : 'NO');
console.log('URI starts with:', uri?.substring(0, 20));

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(uri!);
  await client.connect();
  console.log('✅ Connected to MongoDB!');
  
  const db = client.db('engify');
  
  const promptCount = await db.collection('prompt_templates').countDocuments();
  const webCount = await db.collection('web_content').countDocuments();
  
  console.log(`\nPrompt Templates: ${promptCount}`);
  console.log(`Web Content: ${webCount}`);
  
  if (promptCount > 0) {
    const sample = await db.collection('prompt_templates').find({}).limit(5).toArray();
    console.log('\nSample prompts:');
    sample.forEach((p: any) => console.log(`  - ${p.title} (${p.category})`));
  }
  
  await client.close();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
