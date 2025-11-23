import { NextRequest, NextResponse } from 'next/server';
import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import { generateWorkflowsJson } from '@/lib/workflows/generate-workflows-json';
import { generateAIModelsJson } from '@/lib/ai-models/generate-ai-models-json';
import { generateAIToolsJson } from '@/lib/ai-tools/generate-ai-tools-json';
import { generatePainPointsJson } from '@/lib/workflows/generate-pain-points-json';
import { generateRecommendationsJson } from '@/lib/workflows/generate-recommendations-json';
import { logger } from '@/lib/logging/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const CRON_SECRET = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

/**
 * GET /api/cron/regenerate-json
 * Regenerate all JSON cache files
 * 
 * Protected by CRON_SECRET header (Vercel Cron only)
 * 
 * Enterprise Compliance:
 * - ✅ Rate limiting: Not needed - protected by CRON_SECRET (internal only)
 * - ✅ XSS: Not applicable - no user input processed
 * - ⚠️ Tests: Cron endpoint - low priority for testing (internal use only)
 */
export async function GET(request: NextRequest) {
  // SECURITY: Protected by CRON_SECRET - rate limiting not needed
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

    // Generate workflows JSON
    await generateWorkflowsJson();
    logger.info('[Cron] Workflows JSON generated');

    // Generate AI models JSON
    await generateAIModelsJson();
    logger.info('[Cron] AI Models JSON generated');

    // Generate AI tools JSON
    await generateAIToolsJson();
    logger.info('[Cron] AI Tools JSON generated');

    // Generate pain points JSON
    await generatePainPointsJson();
    logger.info('[Cron] Pain Points JSON generated');

    // Generate recommendations JSON
    await generateRecommendationsJson();
    logger.info('[Cron] Recommendations JSON generated');

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
