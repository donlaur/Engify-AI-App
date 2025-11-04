#!/usr/bin/env tsx
/**
 * List Existing Content
 * Quick script to list all patterns, roles, categories we have
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { patternRepository, promptRepository } from '@/lib/db/repositories/ContentService';

async function listExisting() {
  const [patterns, prompts] = await Promise.all([
    patternRepository.getAll(),
    promptRepository.getAll(),
  ]);

  const categories = new Set(prompts.map((p) => p.category));
  const roles = new Set(prompts.map((p) => p.role).filter(Boolean));
  const usedPatterns = new Set(prompts.map((p) => p.pattern).filter(Boolean));

  console.log('EXISTING PATTERNS:');
  patterns.forEach(p => {
    console.log(`  - ${p.id}: ${p.name} (${p.category}, ${p.level})`);
  });

  console.log('\nEXISTING CATEGORIES:');
  Array.from(categories).sort().forEach(c => console.log(`  - ${c}`));

  console.log('\nEXISTING ROLES:');
  Array.from(roles).sort().forEach(r => console.log(`  - ${r}`));

  console.log('\nPATTERNS USED IN PROMPTS:');
  Array.from(usedPatterns).sort().forEach(p => console.log(`  - ${p}`));
}

listExisting().catch(console.error);

