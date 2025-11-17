#!/usr/bin/env node
/**
 * Test Framework Consistency Checker
 * Ensures all test files use the correct framework (vitest)
 */

const fs = require('fs');
const path = require('path');

const testFiles = process.argv.slice(2);

if (testFiles.length === 0) {
  console.log('  No test files to check');
  process.exit(0);
}

let hasErrors = false;

for (const file of testFiles) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf-8');

  // Check for jest imports (we use vitest)
  if (content.includes("from 'jest'") || content.includes('from "jest"')) {
    console.error(`  ❌ ${file}: Uses jest instead of vitest`);
    hasErrors = true;
  }

  // Check for @testing-library/jest-dom (should use @testing-library/jest-dom for vitest)
  if (content.includes("'@testing-library/react'") || content.includes('"@testing-library/react"')) {
    // This is fine - we use @testing-library/react
  }

  // Check that test files import from vitest
  const hasDescribe = content.includes('describe(');
  const hasIt = content.includes('it(');
  const hasTest = content.includes('test(');

  if ((hasDescribe || hasIt || hasTest)) {
    const hasVitestImport =
      content.includes("from 'vitest'") ||
      content.includes('from "vitest"');

    if (!hasVitestImport) {
      console.error(`  ❌ ${file}: Has test functions but missing vitest import`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Test framework validation failed');
  process.exit(1);
} else {
  console.log('  ✅ All test files use correct framework');
  process.exit(0);
}
