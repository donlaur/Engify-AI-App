/**
 * Sync Analytics Cron Job
 * 
 * Runs hourly to sync Redis analytics to MongoDB
 * This is the ONLY MongoDB write for analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncStatsToMongoDB } from '@/lib/analytics/redis-tracker';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔄 Starting analytics sync...');
    await syncStatsToMongoDB();

    return NextResponse.json({
      success: true,
      message: 'Analytics synced to MongoDB',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Analytics sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
