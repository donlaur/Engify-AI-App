/**
 * Verify Source URLs
 * 
 * Checks if all source URLs in verified-sources.ts are accessible.
 * Removes links for broken URLs but keeps the citation text.
 * 
 * Run: pnpm tsx scripts/development/verify-source-urls.ts
 */

import { VERIFIED_SOURCES } from '@/lib/workflows/verified-sources';
import axios from 'axios';

interface SourceVerificationResult {
  name: string;
  url: string;
  status: 'accessible' | 'broken' | 'redirect' | 'unknown';
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}

async function verifyUrl(url: string): Promise<{
  status: 'accessible' | 'broken' | 'redirect' | 'unknown';
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}> {
  try {
    const response = await axios.head(url, {
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status < 500, // Don't throw on 4xx
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        status: response.request.res.responseUrl !== url ? 'redirect' : 'accessible',
        statusCode: response.status,
        finalUrl: response.request.res.responseUrl || url,
      };
    } else if (response.status === 404) {
      return {
        status: 'broken',
        statusCode: response.status,
        error: '404 Not Found',
      };
    } else {
      return {
        status: 'unknown',
        statusCode: response.status,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status === 404 ? 'broken' : 'unknown',
          statusCode: error.response.status,
          error: `HTTP ${error.response.status}`,
        };
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return {
          status: 'broken',
          error: error.code,
        };
      }
    }
    return {
      status: 'unknown',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function verifyAllSources() {
  console.log('🔍 Verifying source URLs...\n');
  
  const results: SourceVerificationResult[] = [];
  
  for (const [name, source] of Object.entries(VERIFIED_SOURCES)) {
    if (!source.url) {
      console.log(`⚠️  ${name}: No URL provided`);
      results.push({
        name,
        url: '',
        status: 'unknown',
        error: 'No URL provided',
      });
      continue;
    }

    console.log(`Checking: ${name}...`);
    const verification = await verifyUrl(source.url);
    
    results.push({
      name,
      url: source.url,
      ...verification,
    });

    if (verification.status === 'accessible') {
      console.log(`  ✅ Accessible (${verification.statusCode})`);
    } else if (verification.status === 'redirect') {
      console.log(`  🔄 Redirects to: ${verification.finalUrl}`);
    } else if (verification.status === 'broken') {
      console.log(`  ❌ Broken: ${verification.error || verification.statusCode}`);
    } else {
      console.log(`  ⚠️  Unknown: ${verification.error || verification.statusCode}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  const accessible = results.filter(r => r.status === 'accessible' || r.status === 'redirect');
  const broken = results.filter(r => r.status === 'broken');
  const unknown = results.filter(r => r.status === 'unknown');

  console.log(`✅ Accessible: ${accessible.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  console.log(`⚠️  Unknown: ${unknown.length}`);
  console.log(`📦 Total: ${results.length}`);

  if (broken.length > 0) {
    console.log('\n❌ BROKEN URLs (should remove links):');
    broken.forEach(result => {
      console.log(`  • ${result.name}`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Error: ${result.error || result.statusCode}\n`);
    });
  }

  if (unknown.length > 0) {
    console.log('\n⚠️  UNKNOWN STATUS URLs (needs manual verification):');
    unknown.forEach(result => {
      console.log(`  • ${result.name}`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Error: ${result.error || result.statusCode}\n`);
    });
  }

  console.log('='.repeat(60) + '\n');

  // Return results for programmatic use
  return results;
}

verifyAllSources()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });

