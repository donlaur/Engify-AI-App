/**
 * Generation Progress API
 * Real-time progress updates for content generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { ProgressCache } from '@/lib/services/content/ProgressCache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { jobId } = await params;

    // Get real-time progress from Redis
    const progressCache = new ProgressCache();
    const progress = await progressCache.get(jobId);
    await progressCache.close();

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Job not found or expired' },
        { status: 404 }
      );
    }

    // Format for frontend
    const formattedProgress = {
      jobId: progress.jobId,
      topic: progress.topic,
      contentType: progress.contentType,
      status: progress.status,
      currentAgent: progress.currentSection ? 'writer' : undefined,
      steps: [
        {
          agent: 'writer',
          status: progress.status === 'completed' ? 'completed' : progress.status === 'processing' ? 'active' : 'pending',
          output: progress.currentSection,
        },
      ],
      progress: progress.progress,
      wordCount: progress.wordCount,
      costUSD: progress.costUSD,
    };

    return NextResponse.json({
      success: true,
      progress: formattedProgress,
      logs: progress.logs,
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
