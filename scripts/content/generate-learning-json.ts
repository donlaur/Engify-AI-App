/**
 * Generate Static Learning Resources JSON File
 * 
 * Generates static JSON file for fast learning resource loading without MongoDB cold starts
 * 
 * Usage:
 *   pnpm tsx scripts/content/generate-learning-json.ts
 * 
 * Output: public/data/learning.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { generateLearningResourcesJson } from '@/lib/learning/generate-learning-json';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🚀 Generating learning.json...\n');

  try {
    await generateLearningResourcesJson();

    // Get file size for reporting
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'learning.json');
    const stats = await fs.stat(jsonPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Learning JSON generated successfully!\n');
    console.log(`📁 File: ${jsonPath}`);
    console.log(`📦 Size: ${fileSizeKB} KB\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate learning.json:', error);
    process.exit(1);
  }
}

main();

