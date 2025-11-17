/**
 * Content Generation Job Status API Endpoint
 *
 * Get status and progress of batch content generation jobs.
 * Supports long-polling for real-time updates.
 *
 * GET /api/admin/content/generation-status/[jobId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getContentGenerationJobQueue } from '@/lib/services/jobs/ContentGenerationJobQueue';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job queue
    const jobQueue = getContentGenerationJobQueue();
    await jobQueue.initialize();

    // Get job status
    const jobStatus = jobQueue.getJobStatus(jobId);

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate progress percentage
    const progressPercent =
      jobStatus.totalTopics > 0
        ? Math.round(
            ((jobStatus.completedTopics + jobStatus.failedTopics) /
              jobStatus.totalTopics) *
              100
          )
        : 0;

    // Calculate duration
    const duration = jobStatus.completedAt
      ? jobStatus.completedAt.getTime() - jobStatus.createdAt.getTime()
      : jobStatus.startedAt
        ? Date.now() - jobStatus.startedAt.getTime()
        : 0;

    // Calculate estimated time remaining
    const avgTimePerTopic =
      jobStatus.completedTopics > 0 && jobStatus.startedAt
        ? (Date.now() - jobStatus.startedAt.getTime()) /
          (jobStatus.completedTopics + jobStatus.failedTopics)
        : 0;

    const remainingTopics =
      jobStatus.totalTopics -
      jobStatus.completedTopics -
      jobStatus.failedTopics;

    const estimatedTimeRemaining = avgTimePerTopic * remainingTopics;

    return NextResponse.json({
      success: true,
      job: {
        jobId: jobStatus.jobId,
        status: jobStatus.status,
        progress: {
          total: jobStatus.totalTopics,
          completed: jobStatus.completedTopics,
          failed: jobStatus.failedTopics,
          pending: remainingTopics,
          percentComplete: progressPercent,
        },
        timing: {
          createdAt: jobStatus.createdAt,
          startedAt: jobStatus.startedAt,
          completedAt: jobStatus.completedAt,
          durationMs: duration,
          estimatedTimeRemainingMs:
            jobStatus.status === 'processing' ? estimatedTimeRemaining : 0,
        },
        results: jobStatus.results,
        error: jobStatus.error,
      },
    });
  } catch (error) {
    console.error('[API] Job status error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/content/generation-status/[jobId]
 *
 * Cancel a running job (if supported)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { jobId } = params;

    // For now, just return not implemented
    // In future: implement job cancellation
    return NextResponse.json(
      {
        error: 'Job cancellation not yet implemented',
        message: 'Jobs will complete processing. You can ignore the results.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('[API] Job cancellation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
