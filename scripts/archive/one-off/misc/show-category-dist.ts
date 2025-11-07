/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');
  
  const categories = await db.collection('prompts').aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  
  console.log('\n📊 UPDATED CATEGORY DISTRIBUTION\n');
  categories.forEach((c: any) => {
    console.log(`  ${c._id}: ${c.count} prompts`);
  });
  console.log('');
  
  await client.close();
  process.exit(0);
});
