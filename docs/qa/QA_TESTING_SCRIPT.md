# QA Testing Script Documentation

## Overview

The QA testing script (`scripts/qa/test-seo-redirects-sitemap.ts`) automates testing of critical SEO, redirect, and sitemap functionality that is difficult to manually test.

## What It Tests

### 1. Sitemap Validation
- ✅ Sitemap exists and is accessible (`/sitemap.xml`)
- ✅ Sitemap is valid XML
- ✅ No problematic slug patterns (internal IDs, concatenated provider names)

### 2. robots.txt Validation
- ✅ robots.txt exists and is accessible
- ✅ Blocks `/_next/` directory
- ✅ Includes sitemap reference

### 3. URL Redirects
- ✅ Tag redirects (`/tags/ci/cd` → `/tags/ci%2Fcd`)
- ✅ AI model slug redirects (problematic slugs → clean slugs)
- ✅ Blog redirects (`/blog/11` → `/learn`)

### 4. 404 Handling
- ✅ Generated prompt IDs return 404 (not 500)
- ✅ Internal prompt IDs return 404 (not 500)

### 5. Canonical URLs
- ✅ Pages have correct canonical URLs
- ✅ Canonical URLs match expected values

### 6. Robots Meta Tags
- ✅ Pages that should be indexed have correct robots tags
- ✅ Pages that should NOT be indexed have `noindex`

### 7. Social Meta Tags
- ✅ OpenGraph tags (og:title, og:description)
- ✅ Twitter cards

### 8. _next Pages Blocking
- ✅ `/_next/` pages are blocked (404 or 403)

## Usage

```bash
# Test against production
tsx scripts/qa/test-seo-redirects-sitemap.ts https://engify.ai

# Test against local/staging
tsx scripts/qa/test-seo-redirects-sitemap.ts https://your-staging-url.com

# Uses NEXT_PUBLIC_APP_URL from .env.local if no URL provided
tsx scripts/qa/test-seo-redirects-sitemap.ts
```

## Output

The script outputs:
- ✅ Passed tests (green checkmark)
- ❌ Failed tests (red X) with details
- Summary with pass/fail counts
- Exit code 0 if all pass, 1 if any fail

## Integration

This script can be integrated into:
- Pre-commit hooks (for local validation)
- CI/CD pipelines (for automated testing)
- Manual QA workflows (before merging to main)

## Example Output

```
🧪 Running QA Tests for SEO, Redirects, and Sitemap

Base URL: https://engify.ai

============================================================

📊 Test Results

============================================================
✅ Sitemap Exists
   Sitemap exists and is valid XML (45KB)

✅ Sitemap Clean (No Problematic Slugs)
   No problematic slug patterns found

✅ robots.txt Exists
   robots.txt exists and is accessible

✅ robots.txt Blocks _next
   robots.txt correctly blocks /_next/

✅ robots.txt Has Sitemap
   robots.txt includes sitemap reference

✅ Redirect: Tag with slash redirects to encoded
   Correctly redirected (301) to https://engify.ai/tags/ci%2Fcd

...

============================================================

📈 Summary: 25 passed, 0 failed

✅ All tests passed!
```

## Adding New Tests

To add new test cases, add a new async function following the pattern:

```typescript
async function testNewFeature() {
  try {
    // Your test logic
    results.push({
      name: 'Test Name',
      passed: true/false,
      message: 'Description',
      details: {}, // Optional
    });
  } catch (error) {
    results.push({
      name: 'Test Name',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}
```

Then call it in `runAllTests()`.

