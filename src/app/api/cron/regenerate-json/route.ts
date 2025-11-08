import { NextRequest, NextResponse } from 'next/server';
import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import { logger } from '@/lib/logging/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const CRON_SECRET = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    logger.warn('Unauthorized cron request to regenerate-json');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('[Cron] Starting JSON regeneration...');

    // Generate prompts JSON
    await generatePromptsJson();
    logger.info('[Cron] Prompts JSON generated');

    // Generate patterns JSON
    await generatePatternsJson();
    logger.info('[Cron] Patterns JSON generated');

    return NextResponse.json({
      success: true,
      message: 'JSON cache regenerated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[Cron] JSON regeneration failed', { error });
    return NextResponse.json(
      {
        error: 'Failed to regenerate JSON',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
