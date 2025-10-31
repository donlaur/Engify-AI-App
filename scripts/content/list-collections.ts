/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  
  const db = client.db('engify');
  const collections = await db.listCollections().toArray();
  
  console.log(`\n📦 Collections in 'engify' database: ${collections.length}\n`);
  
  for (const coll of collections) {
    const count = await db.collection(coll.name).countDocuments();
    console.log(`  ${coll.name}: ${count} documents`);
  }
  
  await client.close();
  process.exit(0);
});
