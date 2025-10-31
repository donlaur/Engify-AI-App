/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');
  
  console.log('\n📊 PROMPT DATABASE AUDIT\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  const prompts = await db.collection('prompts').find({}).toArray();
  console.log(`Total Prompts: ${prompts.length}\n`);
  
  // Tag analysis
  const allTags = new Map<string, number>();
  prompts.forEach((p: any) => {
    (p.tags || []).forEach((tag: string) => {
      allTags.set(tag, (allTags.get(tag) || 0) + 1);
    });
  });
  
  console.log(`🏷️  Tag Analysis:`);
  console.log(`  Unique tags: ${allTags.size}`);
  console.log(`  Prompts without tags: ${prompts.filter((p: any) => !p.tags || p.tags.length === 0).length}\n`);
  
  console.log('  Top 15 tags:');
  Array.from(allTags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([tag, count]) => console.log(`    ${tag}: ${count}`));
  
  // Category distribution
  const categories = new Map<string, number>();
  prompts.forEach((p: any) => {
    const cat = p.category || 'uncategorized';
    categories.set(cat, (categories.get(cat) || 0) + 1);
  });
  
  console.log(`\n📁 Category Distribution:`);
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
  
  // Sample 10 prompts
  console.log(`\n📝 Sample Prompts (first 10):\n`);
  prompts.slice(0, 10).forEach((p: any, i) => {
    console.log(`${i + 1}. ${p.title || 'NO TITLE'}`);
    console.log(`   Category: ${p.category || 'MISSING'}`);
    console.log(`   Tags: [${(p.tags || []).join(', ')}]`);
    console.log(`   Content length: ${(p.content || p.prompt || '').length} chars\n`);
  });
  
  await client.close();
  process.exit(0);
});
