#!/usr/bin/env tsx
/**
 * AI Summary: Enforces bundle size budgets to prevent performance regressions.
 * Part of Day 5 Phase 7 CI improvements.
 */

/* eslint-disable no-console */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BUNDLE_BUDGETS = {
  // Client bundles (KB)
  'app/page': 150,
  'app/library/page': 200,
  'app/workbench/page': 250,
  'app/patterns/page': 180,
  
  // Shared chunks
  '_app': 300,
  'framework': 150,
  'commons': 100,
} as const;

const TOTAL_BUDGET_KB = 1200;

interface BundleInfo {
  name: string;
  sizeKB: number;
  budgetKB: number;
  overBudget: boolean;
  percentOfBudget: number;
}

function getFileSize(filePath: string): number {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function findBundles(buildDir: string): Map<string, number> {
  const bundles = new Map<string, number>();
  
  if (!statSync(buildDir, { throwIfNoEntry: false })) {
    return bundles;
  }

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.js') && !entry.endsWith('.map')) {
        const size = stats.size;
        bundles.set(fullPath, size);
      }
    }
  }

  walk(buildDir);
  return bundles;
}

function analyzeBundles(): {
  bundles: BundleInfo[];
  totalSizeKB: number;
  violations: BundleInfo[];
} {
  const buildDir = join(process.cwd(), '.next/static/chunks');
  const bundleFiles = findBundles(buildDir);
  
  const bundles: BundleInfo[] = [];
  let totalSize = 0;

  bundleFiles.forEach((sizeBytes, filePath) => {
    const sizeKB = Math.round(sizeBytes / 1024);
    totalSize += sizeBytes;

    // Match bundle to budget
    let budgetKB = 0;
    let bundleName = filePath;

    Object.entries(BUNDLE_BUDGETS).forEach(([key, budget]) => {
      if (filePath.includes(key.replace(/\//g, '_'))) {
        budgetKB = budget;
        bundleName = key;
      }
    });

    if (budgetKB > 0) {
      bundles.push({
        name: bundleName,
        sizeKB,
        budgetKB,
        overBudget: sizeKB > budgetKB,
        percentOfBudget: Math.round((sizeKB / budgetKB) * 100),
      });
    }
  });

  const totalSizeKB = Math.round(totalSize / 1024);
  const violations = bundles.filter((b) => b.overBudget);

  return { bundles, totalSizeKB, violations };
}

function main() {
  console.log('📦 Checking bundle sizes...\n');

  const { bundles, totalSizeKB, violations } = analyzeBundles();

  if (bundles.length === 0) {
    console.log('⚠️  No bundles found. Run `pnpm build` first.\n');
    return;
  }

  console.log(`Total bundle size: ${totalSizeKB} KB / ${TOTAL_BUDGET_KB} KB\n`);

  bundles
    .sort((a, b) => b.sizeKB - a.sizeKB)
    .forEach((bundle) => {
      const icon = bundle.overBudget ? '❌' : '✅';
      console.log(
        `${icon} ${bundle.name}: ${bundle.sizeKB} KB / ${bundle.budgetKB} KB (${bundle.percentOfBudget}%)`
      );
    });

  if (totalSizeKB > TOTAL_BUDGET_KB) {
    console.log(
      `\n❌ Total bundle size ${totalSizeKB} KB exceeds budget ${TOTAL_BUDGET_KB} KB\n`
    );
    process.exit(1);
  }

  if (violations.length > 0) {
    console.log(`\n❌ ${violations.length} bundle(s) exceed their budget\n`);
    process.exit(1);
  }

  console.log('\n✅ All bundles within budget\n');
}

if (require.main === module) {
  main();
}

