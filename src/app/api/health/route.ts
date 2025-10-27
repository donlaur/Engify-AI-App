/**
 * Health Check Endpoint
 *
 * Red Hat Review - Medium Priority Fix
 * Provides application health status for monitoring
 */

import { NextResponse } from 'next/server';
import { checkDbHealth } from '@/lib/db/health';

export async function GET() {
  try {
    const dbHealth = await checkDbHealth();

    const health = {
      status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth.status,
          latency: `${dbHealth.latency}ms`,
          error: dbHealth.error,
        },
      },
    };

    const statusCode = health.status === 'ok' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
