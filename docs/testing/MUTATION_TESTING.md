# Mutation Testing Guide

Comprehensive guide to mutation testing with Stryker in the Engify AI Application.

## Table of Contents

- [What is Mutation Testing?](#what-is-mutation-testing)
- [Why Mutation Testing?](#why-mutation-testing)
- [Getting Started](#getting-started)
- [Running Mutation Tests](#running-mutation-tests)
- [Understanding Results](#understanding-results)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## What is Mutation Testing?

Mutation testing is a technique to evaluate the quality of your test suite by introducing small changes (mutations) to your source code and checking if your tests catch them.

### How It Works

1. **Mutate** - Stryker introduces small changes to your code
2. **Test** - Run your test suite against the mutated code
3. **Analyze** - Check if tests caught the mutation

### Example

Original code:
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

Mutated code:
```typescript
function add(a: number, b: number): number {
  return a - b;  // Changed + to -
}
```

If your tests still pass with the mutation, it means they don't properly test the addition logic!

## Why Mutation Testing?

### Problems with Coverage Alone

Code coverage tells you which lines are executed, but not if they're properly tested:

```typescript
// 100% coverage, but poorly tested
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// This test gives 100% coverage
it('should divide numbers', () => {
  expect(divide(10, 2)).toBe(5);
  // ❌ Never tests the error case!
});
```

### Mutation Testing Catches This

Stryker would mutate `b === 0` to `b !== 0` or remove the if statement entirely. If your tests still pass, you know the error handling isn't tested.

### Benefits

- **Find weak tests** - Discover tests that pass but don't actually verify behavior
- **Improve test quality** - Write more comprehensive tests
- **Prevent regressions** - Ensure edge cases are covered
- **Increase confidence** - Know your tests actually protect your code

## Getting Started

### Installation

The required packages are in `stryker.config.json`. To install:

```bash
pnpm add -D @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
```

### Quick Start

Run your first mutation test:

```bash
# Run all mutation tests
pnpm test:mutation

# This will:
# 1. Find all files matching the mutate patterns
# 2. Create mutations for each file
# 3. Run your tests against each mutation
# 4. Generate a report
```

## Running Mutation Tests

### Basic Commands

```bash
# Run all mutation tests
pnpm test:mutation

# Run for CI (single concurrency, more stable)
pnpm test:mutation:ci

# Run only on changed files (faster)
pnpm test:mutation:incremental

# Test specific directories
pnpm test:mutation:services
pnpm test:mutation:critical
```

### Target Specific Files

```bash
# Test only UserService
stryker run --mutate src/lib/services/UserService.ts

# Test all services
stryker run --mutate 'src/lib/services/**/*.ts'

# Test security modules
stryker run --mutate 'src/lib/security/**/*.ts'
```

### Incremental Runs

After the first run, Stryker stores results. Incremental runs only test changed code:

```bash
pnpm test:mutation:incremental
```

This is much faster for iterative development!

## Understanding Results

### Mutation States

#### ✅ Killed
The mutation was caught by your tests (good!)

```typescript
// Original
function isAdult(age: number): boolean {
  return age >= 18;
}

// Mutation: >= changed to >
function isAdult(age: number): boolean {
  return age > 18;  // ❌ Mutation
}

// Test catches it:
it('should return true for age 18', () => {
  expect(isAdult(18)).toBe(true);  // ✅ Fails with mutation
});
```

#### ❌ Survived
The mutation wasn't caught - you need a better test!

```typescript
// Original
function isPositive(n: number): boolean {
  return n > 0;
}

// Mutation: > changed to >=
function isPositive(n: number): boolean {
  return n >= 0;  // ❌ Mutation
}

// Weak test doesn't catch it:
it('should work', () => {
  expect(isPositive(5)).toBe(true);  // ❌ Still passes
});

// Better test would catch it:
it('should return false for zero', () => {
  expect(isPositive(0)).toBe(false);  // ✅ Would fail with mutation
});
```

#### ⏱️ Timeout
Tests took too long - might indicate an infinite loop

```typescript
// Mutation might create infinite loop
function countdown(n: number): void {
  while (n > 0) {  // Mutated to n >= 0
    console.log(n);
    n--;
  }
}
// This would cause timeout if n starts at 0
```

#### ⚠️ No Coverage
Code has no tests at all

```typescript
// No tests for this function
function formatName(name: string): string {
  return name.trim().toUpperCase();
}
// Add tests!
```

#### 🤷 Runtime Error
Mutation caused a runtime error

```typescript
// Original
const config = { timeout: 5000 };

// Mutation: property removed
const config = {};

// Accessing config.timeout causes error
```

### Mutation Score

The mutation score is the percentage of mutations your tests caught:

```
Mutation Score = (Killed / (Killed + Survived)) * 100
```

Our thresholds:
- **High**: 80%+ (Excellent)
- **Low**: 60% (Acceptable)
- **Break**: 50% (Build fails)

### Reading the Report

After running mutation tests, open the HTML report:

```bash
open reports/mutation/html/index.html
```

The report shows:
- Overall mutation score
- Per-file mutation scores
- Each mutation with its state
- Side-by-side code comparison
- Which tests covered each mutation

## Configuration

### stryker.config.json

```json
{
  "packageManager": "pnpm",
  "testRunner": "vitest",

  // Files to mutate
  "mutate": [
    "src/lib/services/**/*.ts",
    "src/lib/repositories/**/*.ts",
    "!src/**/*.test.ts"
  ],

  // Mutation types to use
  "mutator": {
    "plugins": ["typescript"],
    "excludedMutations": [
      "StringLiteral",  // Don't mutate strings
      "ObjectLiteral"   // Don't mutate objects
    ]
  },

  // Quality thresholds
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  },

  // Performance tuning
  "timeoutMS": 60000,
  "timeoutFactor": 1.5,
  "maxConcurrentTestRunners": 2
}
```

### Mutation Types

Stryker can create these mutation types:

#### Arithmetic Operators
```typescript
// Original → Mutations
a + b    → a - b, a * b, a / b
a - b    → a + b
a * b    → a / b
a / b    → a * b
```

#### Comparison Operators
```typescript
a > b    → a < b, a >= b, a <= b
a >= b   → a > b, a < b
a === b  → a !== b
```

#### Logical Operators
```typescript
a && b   → a || b
a || b   → a && b
!a       → a
```

#### Conditional Expressions
```typescript
if (condition) → if (true), if (false)
while (x > 0)  → while (true), while (false)
```

#### Return Values
```typescript
return true  → return false
return x     → return undefined
```

## Best Practices

### 1. Start Small

Don't run mutation tests on everything at once:

```bash
# Start with one critical file
stryker run --mutate src/lib/security/sanitizer.ts

# Gradually expand
stryker run --mutate 'src/lib/security/**/*.ts'
```

### 2. Focus on Critical Code

Prioritize mutation testing for:
- Security-sensitive code
- Business logic
- Utility functions
- Core services

```bash
# Test critical security code
pnpm test:mutation:critical
```

### 3. Use Incremental Mode

After the initial run, use incremental mode:

```bash
pnpm test:mutation:incremental
```

This only tests changed files, saving time.

### 4. Review Survived Mutations

When mutations survive:

```typescript
// Survived mutation example
function processData(data: string[]): string[] {
  return data.filter(item => item.length > 0);
  // Mutation: > changed to >=
  // If survived, add test:
}

// Add test for edge case
it('should filter empty strings', () => {
  expect(processData(['', 'a', ''])).toEqual(['a']);
  // This would catch the >= mutation
});
```

### 5. Ignore Trivial Mutations

Some mutations aren't worth testing:

```typescript
// Ignore logging mutations
/* istanbul ignore next */
console.log('Debug info');

// Ignore obvious mutations
const PI = 3.14159;  // Don't need to test mutations here
```

### 6. Set Realistic Thresholds

Different code deserves different standards:

- **Security code**: 90%+
- **Business logic**: 80%+
- **Utilities**: 75%+
- **UI components**: 60%+ (rely more on E2E tests)

### 7. Run in CI Carefully

Mutation testing is slow. In CI:

```yaml
# Only run on main branch or specific triggers
- name: Mutation testing
  if: github.ref == 'refs/heads/main'
  run: pnpm test:mutation:ci
```

Or run incrementally:

```yaml
- name: Incremental mutation testing
  run: pnpm test:mutation:incremental
```

### 8. Combine with Coverage

Use both coverage and mutation testing:

```bash
# First check coverage
pnpm test:coverage:threshold

# Then run mutation tests on critical paths
pnpm test:mutation:critical
```

## Troubleshooting

### Tests Taking Too Long

**Problem**: Mutation tests timeout

**Solutions**:
```json
{
  "timeoutMS": 120000,      // Increase timeout
  "timeoutFactor": 2,       // Give tests more time
  "maxConcurrentTestRunners": 1  // Reduce concurrency
}
```

### Too Many Mutations

**Problem**: Too many mutations to test

**Solutions**:
1. Exclude less critical files
2. Use incremental mode
3. Target specific directories
4. Exclude certain mutation types

```json
{
  "mutator": {
    "excludedMutations": [
      "StringLiteral",
      "ObjectLiteral",
      "ArrayDeclaration"
    ]
  }
}
```

### False Positives

**Problem**: Mutations reported as survived but tests seem correct

**Investigation**:
1. Check the mutation in the HTML report
2. Verify the test actually runs
3. Check if the test is too generic
4. Ensure test assertions are specific

### Memory Issues

**Problem**: Out of memory errors

**Solutions**:
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm test:mutation

# Reduce concurrency
# In stryker.config.json:
{
  "maxConcurrentTestRunners": 1,
  "concurrency": 1
}
```

### Incremental Mode Not Working

**Problem**: Incremental run tests everything

**Solution**: Clear the stryker cache
```bash
rm -rf .stryker-tmp
pnpm test:mutation
```

## Advanced Usage

### Custom Mutation Ranges

Test specific code ranges:

```typescript
// Only mutate this function
function criticalFunction() {
  // stryker:enable
  const result = complexCalculation();
  // stryker:disable
  return result;
}
```

### Ignore Specific Lines

```typescript
// Disable mutation for this line
const value = config.get('key'); // stryker:disable-line

// Disable for next line
// stryker:disable-next-line
const connection = createConnection();
```

### Disable for Blocks

```typescript
// stryker:disable
function loggingFunction() {
  // All mutations disabled in this block
  console.log('Debug info');
  console.error('Error info');
}
// stryker:enable
```

## Continuous Improvement

### Weekly Review

1. Run full mutation tests weekly
2. Review survived mutations
3. Add tests for critical survivors
4. Track mutation score trend

### Before Releases

```bash
# Full mutation test before release
pnpm test:mutation

# Check critical code has high scores
pnpm test:mutation:critical
```

### Integration with PR Reviews

```yaml
# .github/workflows/pr.yml
- name: Incremental Mutation Testing
  run: pnpm test:mutation:incremental

- name: Comment on PR
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        body: 'Mutation score: check the artifacts'
      })
```

## Resources

- [Stryker Documentation](https://stryker-mutator.io/)
- [Mutation Testing Concepts](https://en.wikipedia.org/wiki/Mutation_testing)
- [Testing Quality Metrics](https://martinfowler.com/articles/testing-metrics.html)

## Summary

Mutation testing helps you:
- **Verify test quality** beyond just coverage
- **Find weak spots** in your test suite
- **Improve confidence** in your codebase
- **Prevent bugs** by ensuring thorough testing

Start with critical code, use incremental mode for speed, and continuously improve your mutation scores!
