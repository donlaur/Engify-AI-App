/**
 * Generate Static Patterns JSON File
 * 
 * Similar to breeding site's breeding-data.json approach
 * Generates static JSON file for fast pattern loading without MongoDB cold starts
 * 
 * Usage:
 *   pnpm tsx scripts/content/generate-patterns-json.ts
 * 
 * Output: public/data/patterns.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🚀 Generating patterns.json...\n');

  try {
    await generatePatternsJson();

    // Get file size for reporting
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
    const stats = await fs.stat(jsonPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Patterns JSON generated successfully!\n');
    console.log(`📁 File: ${jsonPath}`);
    console.log(`📦 Size: ${fileSizeKB} KB\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate patterns.json:', error);
    process.exit(1);
  }
}

main();

