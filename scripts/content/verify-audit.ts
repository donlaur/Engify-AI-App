#!/usr/bin/env tsx
import { config } from 'dotenv';
config({ path: '.env.local' });
import { getMongoDb } from '@/lib/db/mongodb';

async function verify() {
  const db = await getMongoDb();
  const prompt = await db.collection('prompts').findOne({ id: 'cg-001' });
  console.log('✅ Prompt:', prompt?.title);
  console.log('   Case Studies:', prompt?.caseStudies?.length || 0);
  console.log('   Use Cases:', prompt?.useCases?.length || 0);
  console.log('   Best Practices:', prompt?.bestPractices?.length || 0);
  const audit = await db.collection('prompt_audit_results').findOne({ promptId: 'cg-001' }, { sort: { auditVersion: -1 } });
  console.log('\n📊 Latest Audit:');
  console.log('   Score:', audit?.overallScore || 'N/A');
  console.log('   Version:', audit?.auditVersion || 'N/A');
  console.log('   Missing Elements:', audit?.missingElements?.length || 0);
  await db.client.close();
}

verify().catch(console.error);

