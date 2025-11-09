#!/usr/bin/env tsx
/**
 * Test Redis Rate Limiting
 */

import { config } from 'dotenv';
import { rateLimit } from '../src/lib/middleware/rateLimit';

config({ path: '.env.local' });

async function testRateLimit() {
  console.log('🧪 Testing Redis Rate Limiting...\n');

  const testKey = 'test-user-123';
  const opts = {
    windowMs: 10000, // 10 second window
    max: 5, // 5 requests per window
  };

  console.log(`Config: ${opts.max} requests per ${opts.windowMs / 1000}s window\n`);

  // Test 1: Should allow first 5 requests
  console.log('Test 1: First 5 requests (should all pass)');
  for (let i = 1; i <= 5; i++) {
    const allowed = await rateLimit(testKey, opts);
    console.log(`  Request ${i}: ${allowed ? '✅ Allowed' : '❌ Blocked'}`);
    if (!allowed && i <= 5) {
      console.error('  ❌ FAILED: Should have been allowed');
      process.exit(1);
    }
  }

  // Test 2: Should block 6th request
  console.log('\nTest 2: 6th request (should be blocked)');
  const blocked = await rateLimit(testKey, opts);
  console.log(`  Request 6: ${blocked ? '✅ Allowed' : '❌ Blocked'}`);
  if (blocked) {
    console.error('  ❌ FAILED: Should have been blocked');
    process.exit(1);
  }

  // Test 3: Wait for window to expire
  console.log('\nTest 3: Waiting for window to expire (10s)...');
  await new Promise(resolve => setTimeout(resolve, 11000));
  
  const afterWait = await rateLimit(testKey, opts);
  console.log(`  Request after wait: ${afterWait ? '✅ Allowed' : '❌ Blocked'}`);
  if (!afterWait) {
    console.error('  ❌ FAILED: Should have been allowed after window expired');
    process.exit(1);
  }

  console.log('\n🎉 All rate limit tests passed!');
  console.log('\nRate limiting is working correctly with Redis.');
}

testRateLimit().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
