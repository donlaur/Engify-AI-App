/**
 * Batch Content Generation API Endpoint
 *
 * Allows admins to generate multiple articles in a single request.
 * Uses background job processing for async execution.
 *
 * POST /api/admin/content/generate/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { getContentGenerationJobQueue } from '@/lib/services/jobs/ContentGenerationJobQueue';
import { GeneratorType } from '@/lib/factories/ContentGeneratorFactory';

const BatchGenerateRequestSchema = z.object({
  generatorType: z.enum(['single-agent', 'multi-agent']).default('single-agent'),
  topics: z.array(
    z.object({
      topic: z.string().min(3, 'Topic must be at least 3 characters'),
      category: z.string().min(1, 'Category is required'),
      targetWordCount: z.number().min(100).max(5000).optional(),
      keywords: z.array(z.string()).optional(),
    })
  ).min(1, 'At least one topic is required').max(50, 'Maximum 50 topics per batch'),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only admins can batch generate content
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting (stricter for batch operations)
    const rateLimitResult = await checkRateLimit(
      `content-batch-generate-${session.user.id}`,
      'authenticated'
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = BatchGenerateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { generatorType, topics } = validationResult.data;

    // Get organization ID (default to user ID for now)
    const organizationId = session.user.organizationId || session.user.id;

    // Initialize job queue
    const jobQueue = getContentGenerationJobQueue();
    await jobQueue.initialize();

    // Submit batch job
    const jobId = await jobQueue.submitBatchJob({
      organizationId,
      generatorType: generatorType as GeneratorType,
      topics,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: `Batch job submitted with ${topics.length} topics`,
      statusUrl: `/api/admin/content/generation-status/${jobId}`,
    });
  } catch (error) {
    console.error('[API] Batch content generation error:', error);
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
 * GET /api/admin/content/generate/batch
 *
 * Get all batch jobs for the current user
 */
export async function GET(request: NextRequest) {
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

    // Get job queue
    const jobQueue = getContentGenerationJobQueue();
    await jobQueue.initialize();

    // Get all job statuses
    const allJobs = jobQueue.getAllJobStatuses();

    // Get queue stats
    const queueStats = await jobQueue.getQueueStats();

    return NextResponse.json({
      success: true,
      jobs: allJobs,
      queueStats,
    });
  } catch (error) {
    console.error('[API] Get batch jobs error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
