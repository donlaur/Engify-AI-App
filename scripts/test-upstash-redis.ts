#!/usr/bin/env tsx
/**
 * Test Upstash Redis Connection
 * Run this after setting up UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

// Load .env.local explicitly
config({ path: '.env.local' });

async function testRedis() {
  console.log('🔍 Testing Upstash Redis connection...\n');

  // Check env vars
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.error('❌ UPSTASH_REDIS_REST_URL not set in .env.local');
    process.exit(1);
  }

  if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ UPSTASH_REDIS_REST_TOKEN not set in .env.local');
    process.exit(1);
  }

  console.log('✅ Environment variables found\n');

  try {
    // Create Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('📡 Connecting to Upstash Redis...');

    // Test 1: Set a value
    await redis.set('test:connection', 'success', { ex: 60 });
    console.log('✅ SET test:connection = "success"');

    // Test 2: Get the value
    const value = await redis.get('test:connection');
    console.log(`✅ GET test:connection = "${value}"`);

    // Test 3: Increment a counter
    await redis.incr('test:counter');
    const counter = await redis.get('test:counter');
    console.log(`✅ INCR test:counter = ${counter}`);

    // Test 4: Set with expiry
    await redis.set('test:expiring', 'will-expire', { ex: 5 });
    console.log('✅ SET test:expiring with 5s expiry');

    // Test 5: Check TTL
    const ttl = await redis.ttl('test:expiring');
    console.log(`✅ TTL test:expiring = ${ttl}s`);

    // Cleanup
    await redis.del('test:connection', 'test:counter', 'test:expiring');
    console.log('✅ Cleaned up test keys\n');

    console.log('🎉 Upstash Redis is working correctly!');
    console.log('\nYou can now use Redis for analytics tracking.');

  } catch (error) {
    console.error('\n❌ Redis connection failed:', error);
    console.error('\nPlease check:');
    console.error('1. UPSTASH_REDIS_REST_URL is correct');
    console.error('2. UPSTASH_REDIS_REST_TOKEN is correct');
    console.error('3. Your Upstash Redis database is active');
    process.exit(1);
  }
}

testRedis();
