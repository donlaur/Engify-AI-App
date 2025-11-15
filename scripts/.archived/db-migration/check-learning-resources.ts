#!/usr/bin/env tsx
/**
 * Check Learning Resources in DB
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { learningResourceRepository } from '@/lib/db/repositories/ContentService';

async function checkResources() {
  const resources = await learningResourceRepository.getAll();
  console.log(`Found ${resources.length} learning resources:\n`);
  resources.forEach(r => {
    console.log(`- Slug: ${r.seo?.slug || r.id}`);
    console.log(`  Title: ${r.title}`);
    console.log(`  Status: ${r.status}`);
    console.log('');
  });
}

checkResources().catch(console.error);

