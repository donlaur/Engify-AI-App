/**
 * Generate Static Prompts JSON File
 * 
 * Similar to breeding site's breeding-data.json approach
 * Generates static JSON file for fast prompt loading without MongoDB cold starts
 * 
 * Usage:
 *   pnpm tsx scripts/content/generate-prompts-json.ts
 * 
 * Output: public/data/prompts.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🚀 Generating prompts.json...\n');

  try {
    await generatePromptsJson();

    // Get file size for reporting
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'prompts.json');
    const stats = await fs.stat(jsonPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Prompts JSON generated successfully!\n');
    console.log(`📁 File: ${jsonPath}`);
    console.log(`📦 Size: ${fileSizeKB} KB\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate prompts.json:', error);
    process.exit(1);
  }
}

main();

