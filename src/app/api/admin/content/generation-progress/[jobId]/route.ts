/**
 * Generation Progress API
 * Real-time progress updates for content generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { ContentQueueService } from '@/lib/services/ContentQueueService';
import { generatedContentService } from '@/lib/services/GeneratedContentService';

const queueService = new ContentQueueService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { jobId } = await params;

    // Find queue item by generation job ID
    const allItems = await queueService.getQueue({});
    const queueItem = allItems.find(item => item.generationJobId === jobId);

    if (!queueItem) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Map queue status to progress
    let status: 'queued' | 'processing' | 'completed' | 'failed' = 'processing';
    let progressPercent = 50;
    let logs: string[] = [];

    if (queueItem.status === 'queued') {
      status = 'queued';
      progressPercent = 0;
      logs = ['⏳ Waiting to start generation...'];
    } else if (queueItem.status === 'generating') {
      status = 'processing';
      progressPercent = 50;
      logs = [
        '🚀 Generation started',
        '✍️ Generating content sections...',
        '📝 This may take 1-2 minutes',
      ];
    } else if (queueItem.status === 'completed') {
      status = 'completed';
      progressPercent = 100;
      logs = [
        '✅ Generation complete!',
        '📄 Content saved to database',
        '👉 Check the Review tab to view and edit',
      ];
    } else if (queueItem.status === 'failed') {
      status = 'failed';
      progressPercent = 0;
      logs = [
        '❌ Generation failed',
        queueItem.generationError || 'Unknown error',
      ];
    }

    const progress = {
      jobId,
      topic: queueItem.title,
      contentType: queueItem.contentType,
      status,
      currentAgent: status === 'processing' ? 'writer' : undefined,
      steps: [
        { agent: 'writer', status: status === 'completed' ? 'completed' : status === 'processing' ? 'active' : 'pending' },
      ],
      progress: progressPercent,
      wordCount: queueItem.targetWordCount,
      costUSD: 0,
    };

    return NextResponse.json({
      success: true,
      progress,
      logs,
    });
  } catch (error) {
    console.error('Error fetching generation progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
