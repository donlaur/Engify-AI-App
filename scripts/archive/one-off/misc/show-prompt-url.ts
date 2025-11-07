#!/usr/bin/env tsx
/**
 * Get first prompt URL
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { getMongoDb } from '@/lib/db/mongodb';

async function getPromptUrl() {
  const db = await getMongoDb();
  const prompt = await db.collection('prompts').findOne({});
  
  if (!prompt) {
    console.error('❌ No prompts found');
    await db.client.close();
    process.exit(1);
  }
  
  const slug = prompt.slug || prompt.id;
  const url = `https://www.engify.ai/prompts/${slug}`;
  
  console.log('\n🔗 CURRENT PROMPT URL:');
  console.log(`   ${url}\n`);
  console.log(`📝 Title: ${prompt.title}`);
  console.log(`   ID: ${prompt.id}`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Current enrichment:`);
  console.log(`     - Case Studies: ${prompt.caseStudies?.length || 0}`);
  console.log(`     - Use Cases: ${prompt.useCases?.length || 0}`);
  console.log(`     - Best Practices: ${prompt.bestPractices?.length || 0}`);
  console.log(`     - Examples: ${prompt.examples?.length || 0}\n`);
  
  await db.client.close();
  return { prompt, url };
}

getPromptUrl().catch(console.error);

