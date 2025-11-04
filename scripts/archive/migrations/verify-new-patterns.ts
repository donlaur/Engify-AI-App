#!/usr/bin/env tsx
/**
 * Verify New Patterns
 * Checks that the 3 new critical patterns are in the database
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { patternRepository } from '../src/lib/db/repositories/ContentService.js';

async function verifyPatterns() {
  try {
    const patterns = await patternRepository.getAll();
    const newPatternIds = ['structured-output', 'self-reflection', 'flipped-interaction'];
    
    console.log('📊 Verifying new patterns...\n');
    
    const newPatterns = patterns.filter(p => newPatternIds.includes(p.id));
    
    console.log(`✅ Found ${newPatterns.length} of ${newPatternIds.length} new patterns:\n`);
    
    newPatterns.forEach(p => {
      console.log(`  ✓ ${p.name}`);
      console.log(`    ID: ${p.id}`);
      console.log(`    Category: ${p.category}`);
      console.log(`    Level: ${p.level}`);
      console.log(`    Description: ${p.description.substring(0, 80)}...`);
      console.log('');
    });
    
    if (newPatterns.length === newPatternIds.length) {
      console.log('✅ All 3 critical patterns successfully added!\n');
    } else {
      console.log(`⚠️  Missing ${newPatternIds.length - newPatterns.length} pattern(s)\n`);
    }
    
    console.log(`📈 Total patterns in database: ${patterns.length}`);
    
  } catch (error) {
    console.error('❌ Error verifying patterns:', error);
    process.exit(1);
  }
}

verifyPatterns();

