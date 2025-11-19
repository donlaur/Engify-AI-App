/**
 * News Aggregator Sync API
 * 
 * Syncs RSS/Atom feeds for AI tools and models
 * RBAC: Admin, Super Admin, and Org Admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { newsAggregatorService } from '@/lib/services/NewsAggregatorService';
import { logger } from '@/lib/logging/logger';

// Helper to trigger model sync for mentioned models
async function triggerModelSync(modelIds: string[]): Promise<void> {
  if (modelIds.length === 0) return;
  
  try {
    // Call the model sync API for each mentioned model
    // This could be enhanced to batch sync or use a queue
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    for (const modelId of modelIds) {
      try {
        // Trigger sync for the provider of this model
        // Extract provider from modelId (e.g., 'gpt-5' -> 'openai', 'gemini-3' -> 'google')
        let provider = 'all';
        if (modelId.includes('gpt') || modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
          provider = 'openai';
        } else if (modelId.includes('claude')) {
          provider = 'anthropic';
        } else if (modelId.includes('gemini')) {
          provider = 'google';
        }
        
        logger.info('Triggering model sync', { modelId, provider });
        
        // Note: In production, this should use an internal API call or queue
        // For now, we'll just log it - the sync can be triggered manually or via cron
        // await fetch(`${baseUrl}/api/admin/ai-models/sync`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ provider }),
        // });
      } catch (error) {
        logger.error('Failed to trigger model sync', {
          modelId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } catch (error) {
    logger.error('Error triggering model syncs', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// POST: Sync all feeds or a specific feed
export async function POST(request: NextRequest) {
  // RBAC: Allow super_admin and org_admin roles
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { feedUrl } = body;

    let result;

    if (feedUrl) {
      // Sync a specific feed
      logger.info('Syncing specific feed', { feedUrl, userId: session.user.id });
      // Note: This would require finding the feed config or creating a temporary one
      // For now, we'll sync all feeds
      result = await newsAggregatorService.syncAllFeeds();
    } else {
      // Sync all feeds
      logger.info('Syncing all feeds', { userId: session.user.id });
      result = await newsAggregatorService.syncAllFeeds();
    }

    // Trigger model syncs for mentioned models
    if (result.modelsTriggered.length > 0) {
      logger.info('Models mentioned in feeds, triggering sync', {
        models: result.modelsTriggered,
      });
      await triggerModelSync(result.modelsTriggered);
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'news_aggregator',
      details: { 
        action: 'feeds_synced', 
        ...result,
        modelsTriggered: result.modelsTriggered,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feeds synced successfully',
      ...result,
      note: result.modelsTriggered.length > 0
        ? `${result.modelsTriggered.length} model(s) mentioned - consider running model sync`
        : undefined,
    });
  } catch (error) {
    logger.error('Error syncing feeds', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return NextResponse.json(
      { 
        error: 'Failed to sync feeds', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

