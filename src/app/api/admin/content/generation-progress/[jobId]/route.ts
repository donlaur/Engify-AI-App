/**
 * Generation Progress API
 * Real-time progress updates for content generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';

// Mock progress data - in production, this would come from Redis or a job queue
const mockProgress: Record<string, any> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { jobId } = await params;

    // In production, fetch from Redis/job queue
    // For now, return mock progress
    const progress = mockProgress[jobId] || {
      jobId,
      topic: 'Sample Article',
      contentType: 'tutorial',
      status: 'processing',
      currentAgent: 'researcher',
      steps: [
        { agent: 'researcher', status: 'completed', output: 'Research complete' },
        { agent: 'outliner', status: 'completed', output: 'Outline created' },
        { agent: 'writer', status: 'active', output: 'Writing in progress...' },
        { agent: 'editor', status: 'pending' },
        { agent: 'seo', status: 'pending' },
      ],
      progress: 45,
      wordCount: 1200,
      costUSD: 0.023,
    };

    const logs = [
      '🔍 Researcher: Analyzing topic and gathering information...',
      '✅ Researcher: Found 15 relevant sources',
      '📋 Outliner: Creating content structure...',
      '✅ Outliner: Generated 5-section outline',
      '✍️ Writer: Beginning content generation...',
      '📝 Writer: Section 1 complete (250 words)',
      '📝 Writer: Section 2 in progress...',
    ];

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
