#!/usr/bin/env tsx
/**
 * Icon Usage Audit Script
 *
 * Scans all files for Icons.* usage and reports:
 * 1. Which icons are used but not defined
 * 2. Which icons are defined but never used
 * 3. Usage statistics per file
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ICONS_FILE = 'src/lib/icons.ts';
const SRC_DIR = 'src';

// Extract defined icons from icons.ts
function getDefinedIcons(): Set<string> {
  const content = readFileSync(ICONS_FILE, 'utf-8');
  const iconExportMatch = content.match(
    /export const Icons = \{([\s\S]*?)\} as const/
  );

  if (!iconExportMatch) {
    console.error('Could not find Icons export');
    return new Set();
  }

  const iconsBlock = iconExportMatch[1];
  const iconMatches = iconsBlock.matchAll(/(\w+):/g);

  const icons = new Set<string>();
  for (const match of iconMatches) {
    icons.add(match[1]);
  }

  return icons;
}

// Recursively find all TypeScript/TSX files
function findFiles(dir: string, ext: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === 'node_modules' || item === '.next' || item === 'dist') {
        continue;
      }
      files.push(...findFiles(fullPath, ext));
    } else if (ext.some((e) => item.endsWith(e))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Find all icon usages in a file
function findIconUsages(filePath: string): Map<string, number> {
  const content = readFileSync(filePath, 'utf-8');
  const usages = new Map<string, number>();

  // Match Icons.iconName but exclude JavaScript properties like .length, .constructor, etc.
  // Use negative lookahead to avoid matching after property accessors
  const javascriptProperties = new Set(['length', 'constructor', 'toString', 'valueOf', 'prototype']);
  const matches = content.matchAll(/Icons\.(\w+)/g);

  for (const match of matches) {
    const iconName = match[1];
    // Skip JavaScript built-in properties that are false positives
    if (javascriptProperties.has(iconName)) {
      continue;
    }
    usages.set(iconName, (usages.get(iconName) || 0) + 1);
  }

  return usages;
}

// Main audit
function auditIcons() {
  console.log('🔍 Auditing icon usage...\n');

  const definedIcons = getDefinedIcons();
  console.log(`✅ Found ${definedIcons.size} defined icons\n`);

  const files = findFiles(SRC_DIR);
  console.log(`📁 Scanning ${files.length} files...\n`);

  const allUsages = new Map<string, { files: string[]; count: number }>();
  const undefinedIcons = new Set<string>();

  for (const file of files) {
    if (file === ICONS_FILE) continue; // Skip icons.ts itself

    const usages = findIconUsages(file);

    for (const [icon, count] of usages) {
      if (!definedIcons.has(icon)) {
        undefinedIcons.add(icon);
      }

      if (!allUsages.has(icon)) {
        allUsages.set(icon, { files: [], count: 0 });
      }

      const usage = allUsages.get(icon)!;
      usage.files.push(file);
      usage.count += count;
    }
  }

  // Report undefined icons
  if (undefinedIcons.size > 0) {
    console.log('❌ UNDEFINED ICONS (used but not defined):');
    console.log('─'.repeat(60));
    for (const icon of Array.from(undefinedIcons).sort()) {
      const usage = allUsages.get(icon)!;
      console.log(
        `  ${icon} (${usage.count} usages in ${usage.files.length} files)`
      );
      usage.files.forEach((f) => console.log(`    - ${f}`));
    }
    console.log('');
  }

  // Report unused icons
  const usedIcons = new Set(allUsages.keys());
  const unusedIcons = Array.from(definedIcons).filter((i) => !usedIcons.has(i));

  if (unusedIcons.length > 0) {
    console.log('⚠️  UNUSED ICONS (defined but never used):');
    console.log('─'.repeat(60));
    console.log(unusedIcons.sort().join(', '));
    console.log('');
  }

  // Report most used icons
  const sortedUsages = Array.from(allUsages.entries())
    .filter(([icon]) => definedIcons.has(icon))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  console.log('📊 TOP 10 MOST USED ICONS:');
  console.log('─'.repeat(60));
  for (const [icon, { count, files }] of sortedUsages) {
    console.log(`  ${icon}: ${count} usages in ${files.length} files`);
  }
  console.log('');

  // Summary
  console.log('📈 SUMMARY:');
  console.log('─'.repeat(60));
  console.log(`  Total defined icons: ${definedIcons.size}`);
  console.log(`  Total used icons: ${usedIcons.size}`);
  console.log(`  Undefined icons: ${undefinedIcons.size}`);
  console.log(`  Unused icons: ${unusedIcons.length}`);
  console.log('');

  // Exit with error if there are undefined icons
  if (undefinedIcons.size > 0) {
    console.log('❌ Fix undefined icons before committing!');
    process.exit(1);
  } else {
    console.log('✅ All icons are properly defined!');
  }
}

auditIcons();
