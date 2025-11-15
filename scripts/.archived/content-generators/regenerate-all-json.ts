#!/usr/bin/env tsx
/**
 * Regenerate All JSON Files + Update Backups
 * 
 * Run this after updating content in MongoDB
 * Regenerates ISR JSON files and updates immutable backups
 */

import 'dotenv/config';
import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import fs from 'fs';
import path from 'path';

async function regenerateAllJson() {
  console.log('🔄 Regenerating all JSON files...\n');

  try {
    // 1. Regenerate prompts JSON
    console.log('📝 Regenerating prompts.json...');
    await generatePromptsJson();
    console.log('✅ Prompts JSON regenerated\n');

    // 2. Regenerate patterns JSON
    console.log('📝 Regenerating patterns.json...');
    await generatePatternsJson();
    console.log('✅ Patterns JSON regenerated\n');

    // 3. Update backup files
    console.log('💾 Updating backup files...');
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    
    fs.copyFileSync(
      path.join(publicDataDir, 'prompts.json'),
      path.join(publicDataDir, 'prompts-backup.json')
    );
    console.log('✅ prompts-backup.json updated');

    fs.copyFileSync(
      path.join(publicDataDir, 'patterns.json'),
      path.join(publicDataDir, 'patterns-backup.json')
    );
    console.log('✅ patterns-backup.json updated');

    fs.copyFileSync(
      path.join(publicDataDir, 'learning.json'),
      path.join(publicDataDir, 'learning-backup.json')
    );
    console.log('✅ learning-backup.json updated\n');

    console.log('✅ All JSON files and backups updated!');
    console.log('\n📋 Next steps:');
    console.log('   git add public/data/*.json');
    console.log('   git commit -m "Update content JSON and backups"');
    console.log('   git push');

  } catch (error) {
    console.error('❌ Error regenerating JSON:', error);
    process.exit(1);
  }
}

regenerateAllJson();
