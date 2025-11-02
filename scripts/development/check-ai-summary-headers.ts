#!/usr/bin/env tsx
/**
 * AI Summary: Check for AI Summary Headers - Ensures files have AI summary headers
 * Scans TypeScript/TSX files in src/ and checks if they have AI Summary headers.
 * Reports files missing headers to maintain code documentation standards.
 * Part of Day 7 QA improvements.
 * Last updated: 2025-11-02
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

const REQUIRED_PATTERNS = [
  /AI Summary:/i,
  /Last updated:/i,
];

const EXCLUDE_PATTERNS = [
  /\.test\.tsx?$/,
  /\.d\.ts$/,
  /node_modules/,
  /\.next/,
  /\.git/,
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  '__tests__',
  '__mocks__',
];

async function shouldCheckFile(filePath: string): boolean {
  // Skip excluded patterns
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))) {
    return false;
  }

  // Skip if in excluded directory
  const parts = filePath.split('/');
  if (parts.some(part => EXCLUDE_DIRS.includes(part))) {
    return false;
  }

  // Only check TypeScript/TSX files
  return /\.(ts|tsx)$/.test(filePath);
}

async function hasAISummaryHeader(content: string): boolean {
  // Check if content starts with AI Summary header
  const lines = content.split('\n').slice(0, 20); // Check first 20 lines
  const headerBlock = lines.join('\n');
  
  // Must have AI Summary and Last updated
  return REQUIRED_PATTERNS.every(pattern => pattern.test(headerBlock));
}

async function scanDirectory(dir: string, relativePath: string = ''): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativeFilePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          const subFiles = await scanDirectory(fullPath, relativeFilePath);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        if (await shouldCheckFile(relativeFilePath)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
  
  return files;
}

async function checkFiles(): Promise<void> {
  const srcDir = join(process.cwd(), 'src');
  const files = await scanDirectory(srcDir);
  
  const missingHeaders: Array<{ file: string; reason: string }> = [];
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      
      // Skip if file is too short or empty
      if (content.trim().length < 50) {
        continue;
      }
      
      if (!hasAISummaryHeader(content)) {
        const relativePath = file.replace(process.cwd() + '/', '');
        missingHeaders.push({
          file: relativePath,
          reason: 'Missing AI Summary header or Last updated date',
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  // Report results
  if (missingHeaders.length === 0) {
    console.log('✅ All files have AI Summary headers!');
    process.exit(0);
  }
  
  console.log(`\n⚠️  Found ${missingHeaders.length} files missing AI Summary headers:\n`);
  missingHeaders.forEach(({ file, reason }) => {
    console.log(`  - ${file}`);
    console.log(`    ${reason}\n`);
  });
  
  // Calculate percentage
  const total = files.length;
  const withHeaders = total - missingHeaders.length;
  const percentage = Math.round((withHeaders / total) * 100);
  
  console.log(`\n📊 Coverage: ${withHeaders}/${total} files (${percentage}%)`);
  
  // Exit with error if coverage is below threshold
  const THRESHOLD = 70; // Require 70% coverage
  if (percentage < THRESHOLD) {
    console.error(`\n❌ Coverage below threshold (${THRESHOLD}%)`);
    process.exit(1);
  } else {
    console.log(`\n✅ Coverage above threshold (${THRESHOLD}%)`);
    process.exit(0);
  }
}

checkFiles().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

