/**
 * Database Health Check
 *
 * Red Hat Review - Critical Fix #2
 * Validates MongoDB connection at startup and provides health check endpoint
 */

import clientPromise from './client';

/**
 * Check if MongoDB connection is healthy
 * @throws {Error} If connection fails
 */
export async function checkDbHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const client = await clientPromise;

    // Ping the database
    await client.db().admin().ping();

    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    return {
      status: 'unhealthy',
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate DB connection at startup
 * Fails fast if database is not available
 */
export async function validateDbConnection(): Promise<void> {
  console.log('🔍 Validating database connection...');

  const health = await checkDbHealth();

  if (health.status === 'unhealthy') {
    console.error('❌ Database connection failed:', health.error);
    throw new Error(`Database connection failed: ${health.error}`);
  }

  console.log(`✅ Database connection healthy (${health.latency}ms)`);
}
