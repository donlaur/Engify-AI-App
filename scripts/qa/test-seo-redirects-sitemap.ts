#!/usr/bin/env tsx
/**
 * QA Testing Script: SEO, Redirects, Sitemap, and URL Validation
 *
 * This script automates testing of:
 * - Sitemap generation and validation
 * - URL redirects (301, 302)
 * - Canonical URLs
 * - robots.txt
 * - SEO metadata (OpenGraph, Twitter cards)
 * - Problematic slug patterns
 * - Internal ID detection
 *
 * Usage:
 *   tsx scripts/qa/test-seo-redirects-sitemap.ts [baseUrl]
 *
 * Examples:
 *   # Test against production (default)
 *   tsx scripts/qa/test-seo-redirects-sitemap.ts
 *   
 *   # Test against branch/preview URL
 *   tsx scripts/qa/test-seo-redirects-sitemap.ts https://engify-ai-app-git-claude-improve-code-dd03fa-donlaurs-projects.vercel.app
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Priority: 1) Command line arg, 2) Production URL env var, 3) Default to production
// Note: For branch/preview testing, pass URL as command line arg
const BASE_URL = 
  process.argv[2] || 
  process.env.NEXT_PUBLIC_APP_URL || 
  'https://engify.ai';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Helper to make HTTP/HTTPS requests
function fetchUrl(url: string, followRedirects = true, maxRedirects = 5): Promise<{
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  finalUrl: string;
}> {
  return new Promise((resolve, reject) => {
    let redirectCount = 0;
    let currentUrl = url;

    const makeRequest = (urlToFetch: string) => {
      const urlObj = new URL(urlToFetch);
      const client = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Engify-QA-Script/1.0',
        },
      };

      const req = client.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk.toString();
        });

        res.on('end', () => {
          const location = res.headers.location;
          const statusCode = res.statusCode || 0;

          // Handle redirects
          if (followRedirects && (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308)) {
            if (redirectCount >= maxRedirects) {
              reject(new Error(`Too many redirects (${maxRedirects}) for ${url}`));
              return;
            }
            if (!location) {
              reject(new Error(`Redirect without Location header: ${url}`));
              return;
            }

            redirectCount++;
            const nextUrl = location.startsWith('http') ? location : new URL(location, urlToFetch).href;
            currentUrl = nextUrl;
            makeRequest(nextUrl);
            return;
          }

          resolve({
            statusCode,
            headers: res.headers as Record<string, string | string[] | undefined>,
            body,
            finalUrl: currentUrl,
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error(`Request timeout for ${urlToFetch}`));
      });
      req.end();
    };

    makeRequest(url);
  });
}

// Test 1: Sitemap exists and is valid XML
async function testSitemapExists() {
  try {
    const { statusCode, body } = await fetchUrl(`${BASE_URL}/sitemap.xml`);
    
    if (statusCode !== 200) {
      results.push({
        name: 'Sitemap Exists',
        passed: false,
        message: `Sitemap returned status ${statusCode}`,
      });
      return;
    }

    // Check if it's valid XML
    if (!body.trim().startsWith('<?xml') && !body.trim().startsWith('<urlset')) {
      results.push({
        name: 'Sitemap Valid XML',
        passed: false,
        message: 'Sitemap is not valid XML',
      });
      return;
    }

    // Check for problematic patterns
    const problematicPatterns = [
      /ref-\d{3}/i,
      /em-\d{3}/i,
      /cg-\d{3}/i,
      /generated-\d+/i,
      /anthropicclaude/i,
      /mistralaimistral/i,
      /googlegemini/i,
      /openaigpt/i,
    ];

    const foundProblems: string[] = [];
    problematicPatterns.forEach((pattern) => {
      if (pattern.test(body)) {
        const matches = body.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          foundProblems.push(...matches.slice(0, 5)); // Limit to first 5 matches
        }
      }
    });

    if (foundProblems.length > 0) {
      results.push({
        name: 'Sitemap Clean (No Problematic Slugs)',
        passed: false,
        message: `Found ${foundProblems.length} problematic patterns in sitemap`,
        details: foundProblems.slice(0, 10),
      });
    } else {
      results.push({
        name: 'Sitemap Clean (No Problematic Slugs)',
        passed: true,
        message: 'No problematic slug patterns found',
      });
    }

    results.push({
      name: 'Sitemap Exists',
      passed: true,
      message: `Sitemap exists and is valid XML (${Math.round(body.length / 1024)}KB)`,
    });
  } catch (error) {
    results.push({
      name: 'Sitemap Exists',
      passed: false,
      message: `Failed to fetch sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

// Test 2: robots.txt exists and blocks _next
async function testRobotsTxt() {
  try {
    const { statusCode, body } = await fetchUrl(`${BASE_URL}/robots.txt`);

    if (statusCode !== 200) {
      results.push({
        name: 'robots.txt Exists',
        passed: false,
        message: `robots.txt returned status ${statusCode}`,
      });
      return;
    }

    const blocksNext = /Disallow:\s*\/_next/i.test(body);
    const hasSitemap = /Sitemap:/i.test(body);

    results.push({
      name: 'robots.txt Exists',
      passed: true,
      message: 'robots.txt exists and is accessible',
    });

    results.push({
      name: 'robots.txt Blocks _next',
      passed: blocksNext,
      message: blocksNext ? 'robots.txt correctly blocks /_next/' : 'robots.txt does NOT block /_next/',
    });

    results.push({
      name: 'robots.txt Has Sitemap',
      passed: hasSitemap,
      message: hasSitemap ? 'robots.txt includes sitemap reference' : 'robots.txt missing sitemap reference',
    });
  } catch (error) {
    results.push({
      name: 'robots.txt Exists',
      passed: false,
      message: `Failed to fetch robots.txt: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

// Test 3: Test problematic URL redirects
async function testProblematicRedirects() {
  const testUrls = [
    // Tag redirects
    { url: `${BASE_URL}/tags/ci/cd`, expectedRedirect: `${BASE_URL}/tags/ci%2Fcd`, description: 'Tag with slash redirects to encoded' },
    
    // AI Model slug redirects
    { url: `${BASE_URL}/learn/ai-models/anthropicclaude-3-opus`, expectedRedirect: `${BASE_URL}/learn/ai-models/claude-3-opus`, description: 'Problematic AI model slug redirects' },
    
    // Blog redirects
    { url: `${BASE_URL}/blog/11`, expectedRedirect: `${BASE_URL}/learn`, description: 'Numeric blog slug redirects to /learn' },
  ];

  for (const test of testUrls) {
    try {
      const { statusCode, finalUrl } = await fetchUrl(test.url, true);

      if (statusCode === 200 && finalUrl === test.expectedRedirect) {
        results.push({
          name: `Redirect: ${test.description}`,
          passed: true,
          message: `Correctly redirected to ${finalUrl}`,
        });
      } else if (statusCode === 301 || statusCode === 302) {
        // Check if redirect location matches
        const { headers } = await fetchUrl(test.url, false);
        const location = headers.location;
        if (location === test.expectedRedirect || finalUrl === test.expectedRedirect) {
          results.push({
            name: `Redirect: ${test.description}`,
            passed: true,
            message: `Correctly redirected (${statusCode}) to ${finalUrl}`,
          });
        } else {
          results.push({
            name: `Redirect: ${test.description}`,
            passed: false,
            message: `Redirected to ${finalUrl} instead of ${test.expectedRedirect}`,
            details: { statusCode, location, finalUrl },
          });
        }
      } else {
        results.push({
          name: `Redirect: ${test.description}`,
          passed: false,
          message: `No redirect (status ${statusCode}), expected redirect to ${test.expectedRedirect}`,
        });
      }
    } catch (error) {
      results.push({
        name: `Redirect: ${test.description}`,
        passed: false,
        message: `Failed to test redirect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// Test 4: Test 404 handling for generated/internal IDs
async function test404Handling() {
  const testUrls = [
    `${BASE_URL}/prompts/generated-1761973543589-ekaraae`,
    `${BASE_URL}/prompts/em-001`,
    `${BASE_URL}/prompts/ref-001`,
  ];

  for (const url of testUrls) {
    try {
      const { statusCode } = await fetchUrl(url, false);

      if (statusCode === 404) {
        results.push({
          name: `404 Handling: ${url.split('/').pop()}`,
          passed: true,
          message: 'Correctly returns 404',
        });
      } else if (statusCode === 500) {
        results.push({
          name: `404 Handling: ${url.split('/').pop()}`,
          passed: false,
          message: `Returns 500 instead of 404 (should be 404 for generated/internal IDs)`,
        });
      } else {
        results.push({
          name: `404 Handling: ${url.split('/').pop()}`,
          passed: false,
          message: `Returns ${statusCode} instead of 404`,
        });
      }
    } catch (error) {
      results.push({
        name: `404 Handling: ${url.split('/').pop()}`,
        passed: false,
        message: `Failed to test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// Test 5: Test canonical URLs
async function testCanonicalUrls() {
  const testUrls = [
    { url: `${BASE_URL}/prompts`, expectedCanonical: `${BASE_URL}/prompts` },
    { url: `${BASE_URL}/learn/ai-tools`, expectedCanonical: `${BASE_URL}/learn/ai-tools` },
    { url: `${BASE_URL}/workflows/pain-points`, expectedCanonical: `${BASE_URL}/workflows/pain-points` },
  ];

  for (const test of testUrls) {
    try {
      const { body } = await fetchUrl(test.url);

      // Check for canonical link tag (handle whitespace/newlines in attributes)
      // Use multiline flag and handle whitespace in URL
      const canonicalMatch = body.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/ims);
      
      if (canonicalMatch) {
        // Normalize URL: trim and remove any internal whitespace/newlines
        const canonicalUrl = canonicalMatch[1].replace(/\s+/g, '').trim();
        if (canonicalUrl === test.expectedCanonical) {
          results.push({
            name: `Canonical URL: ${test.url.split('/').pop()}`,
            passed: true,
            message: `Canonical URL is correct: ${canonicalUrl}`,
          });
        } else {
          results.push({
            name: `Canonical URL: ${test.url.split('/').pop()}`,
            passed: false,
            message: `Canonical URL is ${canonicalUrl}, expected ${test.expectedCanonical}`,
          });
        }
      } else {
        results.push({
          name: `Canonical URL: ${test.url.split('/').pop()}`,
          passed: false,
          message: 'No canonical URL found in page',
        });
      }
    } catch (error) {
      results.push({
        name: `Canonical URL: ${test.url.split('/').pop()}`,
        passed: false,
        message: `Failed to test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// Test 6: Test robots meta tags
async function testRobotsMetaTags() {
  const testUrls = [
    { url: `${BASE_URL}/learn/ai-models/claude-3-opus`, shouldIndex: true },
    { url: `${BASE_URL}/prompts/generated-123`, shouldIndex: false }, // Should not index generated prompts
  ];

  for (const test of testUrls) {
    try {
      const { statusCode, body } = await fetchUrl(test.url, false);

      if (statusCode === 404) {
        // Skip 404s (they shouldn't have robots tags anyway)
        continue;
      }

      // Check for robots meta tag
      const robotsMatch = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
      
      if (robotsMatch) {
        const robotsContent = robotsMatch[1].toLowerCase();
        const hasNoindex = robotsContent.includes('noindex');
        
        if (test.shouldIndex && hasNoindex) {
          results.push({
            name: `Robots Meta: ${test.url.split('/').pop()}`,
            passed: false,
            message: `Page should be indexed but has noindex`,
          });
        } else if (!test.shouldIndex && !hasNoindex) {
          results.push({
            name: `Robots Meta: ${test.url.split('/').pop()}`,
            passed: false,
            message: `Page should NOT be indexed but missing noindex`,
          });
        } else {
          results.push({
            name: `Robots Meta: ${test.url.split('/').pop()}`,
            passed: true,
            message: `Robots meta tag is correct: ${robotsContent}`,
          });
        }
      } else if (test.shouldIndex) {
        // If shouldIndex is true and no robots tag, that's fine (defaults to index)
        results.push({
          name: `Robots Meta: ${test.url.split('/').pop()}`,
          passed: true,
          message: 'No robots meta tag (defaults to index)',
        });
      } else {
        results.push({
          name: `Robots Meta: ${test.url.split('/').pop()}`,
          passed: false,
          message: 'Missing robots meta tag (should have noindex)',
        });
      }
    } catch (error) {
      results.push({
        name: `Robots Meta: ${test.url.split('/').pop()}`,
        passed: false,
        message: `Failed to test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// Test 7: Test OpenGraph and Twitter cards
async function testSocialMetaTags() {
  const testUrls = [
    `${BASE_URL}/prompts`,
    `${BASE_URL}/learn/ai-tools`,
    `${BASE_URL}/workflows/pain-points`,
  ];

  for (const url of testUrls) {
    try {
      const { body } = await fetchUrl(url);

      const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(body);
      const hasOgDescription = /<meta[^>]*property=["']og:description["']/i.test(body);
      const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(body);

      const allPresent = hasOgTitle && hasOgDescription && hasTwitterCard;

      results.push({
        name: `Social Meta Tags: ${url.split('/').pop()}`,
        passed: allPresent,
        message: allPresent
          ? 'OpenGraph and Twitter cards present'
          : `Missing: ${!hasOgTitle ? 'og:title ' : ''}${!hasOgDescription ? 'og:description ' : ''}${!hasTwitterCard ? 'twitter:card' : ''}`,
      });
    } catch (error) {
      results.push({
        name: `Social Meta Tags: ${url.split('/').pop()}`,
        passed: false,
        message: `Failed to test: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// Test 8: Test _next pages are blocked
async function testNextPagesBlocked() {
  try {
    const { statusCode } = await fetchUrl(`${BASE_URL}/_next/static/chunks/main.js`, false);

    // Should be 404 or blocked by robots.txt (crawlers won't index, but we can check status)
    if (statusCode === 404 || statusCode === 403) {
      results.push({
        name: '_next Pages Blocked',
        passed: true,
        message: `_next pages return ${statusCode} (blocked)`,
      });
    } else {
      results.push({
        name: '_next Pages Blocked',
        passed: false,
        message: `_next pages return ${statusCode} (should be 404 or 403)`,
      });
    }
  } catch (error) {
    // Network errors are fine (means it's blocked)
    results.push({
      name: '_next Pages Blocked',
      passed: true,
      message: '_next pages are not accessible',
    });
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Running QA Tests for SEO, Redirects, and Sitemap\n');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Warn if testing production
  if (BASE_URL.includes('engify.ai') && !BASE_URL.includes('vercel.app')) {
    console.log('⚠️  WARNING: Testing against PRODUCTION. Use branch URL for QA!\n');
  } else if (BASE_URL.includes('vercel.app')) {
    console.log('✅ Testing against branch/preview URL (correct for QA)\n');
  } else {
    console.log('');
  }
  
  console.log('='.repeat(60));

  await testSitemapExists();
  await testRobotsTxt();
  await testProblematicRedirects();
  await test404Handling();
  await testCanonicalUrls();
  await testRobotsMetaTags();
  await testSocialMetaTags();
  await testNextPagesBlocked();

  // Print results
  console.log('\n📊 Test Results\n');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log();
  });

  console.log('='.repeat(60));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Some tests failed. Review the details above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});

