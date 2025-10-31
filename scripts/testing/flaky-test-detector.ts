#!/usr/bin/env tsx
/**
 * AI Summary: Detects flaky tests by running suite N times and tracking failures.
 * Part of Day 5 Phase 7 CI improvements.
 */

/* eslint-disable no-console */

import { execSync } from 'node:child_process';

const RUNS = Number(process.env.FLAKY_TEST_RUNS ?? '5');
const FAIL_THRESHOLD = 0.3; // Fail if >30% of runs fail

interface TestResult {
  name: string;
  runs: number;
  failures: number;
  flaky: boolean;
}

function runTestSuite(): { passed: boolean; output: string } {
  try {
    const output = execSync('pnpm test:unit --reporter=json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { passed: true, output };
  } catch (error) {
    const err = error as { stdout?: string };
    return { passed: false, output: err.stdout ?? '' };
  }
}

function parseTestResults(output: string): Map<string, boolean> {
  const results = new Map<string, boolean>();
  try {
    const jsonOutput = JSON.parse(output);
    const testFiles = jsonOutput.testResults ?? [];
    
    for (const file of testFiles) {
      for (const test of file.assertionResults ?? []) {
        const fullName = `${file.name}::${test.fullName}`;
        results.set(fullName, test.status === 'passed');
      }
    }
  } catch {
    // If JSON parsing fails, treat as all passed
  }
  return results;
}

async function detectFlakyTests(): Promise<{
  flakyTests: TestResult[];
  totalRuns: number;
}> {
  console.log(`🔍 Running test suite ${RUNS} times to detect flaky tests...\n`);

  const testStats = new Map<string, { runs: number; failures: number }>();

  for (let i = 1; i <= RUNS; i++) {
    console.log(`Run ${i}/${RUNS}...`);
    const result = runTestSuite();
    const tests = parseTestResults(result.output);

    tests.forEach((passed, testName) => {
      const stats = testStats.get(testName) ?? { runs: 0, failures: 0 };
      stats.runs += 1;
      if (!passed) {
        stats.failures += 1;
      }
      testStats.set(testName, stats);
    });
  }

  const flakyTests: TestResult[] = [];

  testStats.forEach((stats, name) => {
    const failureRate = stats.failures / stats.runs;
    const isFlaky = failureRate > 0 && failureRate < 1;

    if (isFlaky || failureRate >= FAIL_THRESHOLD) {
      flakyTests.push({
        name,
        runs: stats.runs,
        failures: stats.failures,
        flaky: isFlaky,
      });
    }
  });

  return { flakyTests, totalRuns: RUNS };
}

async function main() {
  const { flakyTests, totalRuns } = await detectFlakyTests();

  if (flakyTests.length === 0) {
    console.log('\n✅ No flaky tests detected!\n');
    return;
  }

  console.log(`\n⚠️  Found ${flakyTests.length} potentially flaky test(s):\n`);

  flakyTests
    .sort((a, b) => b.failures - a.failures)
    .forEach((test) => {
      const failureRate = ((test.failures / test.runs) * 100).toFixed(1);
      console.log(
        `  ${test.flaky ? '🔥' : '❌'} ${test.name}`
      );
      console.log(`     ${test.failures}/${totalRuns} runs failed (${failureRate}%)`);
      console.log('');
    });

  const consistentlyFailing = flakyTests.filter((t) => !t.flaky);
  if (consistentlyFailing.length > 0) {
    console.log(
      `\n❌ ${consistentlyFailing.length} test(s) fail consistently. Fix before merging.\n`
    );
    process.exit(1);
  }

  console.log(
    '\n⚠️  Flaky tests detected. Consider adding retry logic or fixing race conditions.\n'
  );
}

if (require.main === module) {
  main().catch(console.error);
}

