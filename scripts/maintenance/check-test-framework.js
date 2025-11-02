#!/usr/bin/env node
/**
 * Enforces Vitest-only test framework syntax
 * Blocks Jest syntax to maintain consistency
 * See: docs/development/ADR/012-test-framework-standardization.md
 */

const fs = require('fs');
const path = require('path');

const JEST_PATTERNS = [
  { pattern: /jest\.mock\(/g, replacement: 'vi.mock(', severity: 'ERROR' },
  { pattern: /jest\.fn\(/g, replacement: 'vi.fn(', severity: 'ERROR' },
  {
    pattern: /jest\.clearAllMocks\(/g,
    replacement: 'vi.clearAllMocks(',
    severity: 'ERROR',
  },
  { pattern: /jest\.spyOn\(/g, replacement: 'vi.spyOn(', severity: 'ERROR' },
  {
    pattern: /jest\.resetAllMocks\(/g,
    replacement: 'vi.resetAllMocks(',
    severity: 'ERROR',
  },
  {
    pattern: /jest\.restoreAllMocks\(/g,
    replacement: 'vi.restoreAllMocks(',
    severity: 'ERROR',
  },
  {
    pattern: /: jest\.Mock/g,
    replacement: ': ReturnType<typeof vi.fn>',
    severity: 'ERROR',
  },
  {
    pattern: /: jest\.Mocked/g,
    replacement: ': ReturnType<typeof vi.fn>',
    severity: 'ERROR',
  },
  {
    pattern: /jest\.MockedFunction/g,
    replacement: 'ReturnType<typeof vi.fn>',
    severity: 'ERROR',
  },
  {
    pattern: /as jest\.Mock/g,
    replacement: 'as any',
    severity: 'ERROR',
  },
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  for (const { pattern, replacement, severity } of JEST_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filePath,
        pattern: pattern.source,
        replacement,
        severity,
        count: matches.length,
      });
    }
  }

  return violations;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('✅ No test files to check');
    process.exit(0);
  }

  const allViolations = [];

  for (const file of args) {
    // Only check test files
    if (
      !file.includes('.test.') &&
      !file.includes('.spec.') &&
      !file.includes('__tests__')
    ) {
      continue;
    }

    // Skip TypeScript declaration files
    if (file.endsWith('.d.ts')) {
      continue;
    }

    const violations = checkFile(file);
    allViolations.push(...violations);
  }

  if (allViolations.length > 0) {
    console.error('\n❌ Jest syntax detected in test files\n');
    console.error(
      '⚠️  We use Vitest exclusively. Please convert to Vitest syntax:\n'
    );

    const grouped = {};
    for (const v of allViolations) {
      if (!grouped[v.file]) grouped[v.file] = [];
      grouped[v.file].push(v);
    }

    for (const [file, violations] of Object.entries(grouped)) {
      console.error(`\n📄 ${file}:`);
      for (const v of violations) {
        console.error(`  ❌ ${v.pattern} (${v.count}x)`);
        console.error(`     Replace with: ${v.replacement}`);
      }
    }

    console.error('\n🔧 Quick fix commands:\n');
    for (const [file] of Object.entries(grouped)) {
      console.error(`  # Fix ${file}:`);
      console.error(`  sed -i '' 's/jest\\.mock(/vi.mock(/g' ${file}`);
      console.error(`  sed -i '' 's/jest\\.fn(/vi.fn(/g' ${file}`);
      console.error(
        `  sed -i '' 's/jest\\.clearAllMocks(/vi.clearAllMocks(/g' ${file}`
      );
      console.error(`  sed -i '' 's/jest\\.spyOn(/vi.spyOn(/g' ${file}`);
      console.error(`  sed -i '' 's/as jest\\.Mock/as any/g' ${file}`);
      console.error('');
    }

    console.error(
      '📖 See: docs/development/ADR/012-test-framework-standardization.md\n'
    );
    process.exit(1);
  }

  if (args.length > 0) {
    const testFileCount = args.filter(
      (f) =>
        (f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')) &&
        !f.endsWith('.d.ts')
    ).length;

    if (testFileCount > 0) {
      console.log(`✅ All ${testFileCount} test file(s) use Vitest syntax`);
    }
  }

  process.exit(0);
}

main();

