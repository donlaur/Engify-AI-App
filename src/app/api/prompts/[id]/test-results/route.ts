/**
 * GET /api/prompts/[id]/test-results
 * Fetch test results for a specific prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { PromptTestResultSchema } from '@/lib/db/schemas/prompt-test-results';
import { checkFeedbackRateLimit } from '@/lib/security/feedback-rate-limit';
import { auth } from '@/lib/auth';
import { logAuditEvent } from '@/server/middleware/audit';
import { z } from 'zod';

// Validate prompt ID parameter
const promptIdSchema = z.string().min(1).max(100);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts.length > 0 ? parts[0].trim() : 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await checkFeedbackRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Validate input
    const idValidation = promptIdSchema.safeParse(params.id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid prompt ID format' },
        { status: 400 }
      );
    }

    const { id } = params;
    const session = await auth();
    const db = await getDb();
    
    // Find prompt by id, slug, or MongoDB _id
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id },
        { slug: id },
        { _id: id },
      ],
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Use MongoDB _id for looking up test results
    const promptId = prompt._id.toString();

    // Audit logging
    await logAuditEvent({
      action: 'prompt.test_results.viewed',
      userId: session?.user?.id,
      organizationId: session?.user?.organizationId,
      resourceId: prompt.id || prompt.slug || promptId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    
    // Get test results for this prompt
    const testResults = await db
      .collection('prompt_test_results')
      .find({
        promptId,
      })
      .sort({ testedAt: -1 })
      .toArray();

    if (testResults.length === 0) {
      return NextResponse.json({
        promptId: prompt.id || prompt.slug || promptId,
        promptTitle: prompt.title,
        hasResults: false,
        results: [],
        averageScore: null,
        totalTests: 0,
      });
    }

    // Calculate aggregate stats
    const totalTests = testResults.length;
    const averageScore =
      testResults.reduce((sum, r) => sum + (r.qualityScore || 0), 0) /
      totalTests;
    const totalCost = testResults.reduce(
      (sum, r) => sum + (r.costUSD || 0),
      0
    );

    // Group by model
    const modelScores = testResults.reduce(
      (acc: Record<string, any>, result: any) => {
        const key = `${result.provider}-${result.model}`;
        if (!acc[key]) {
          acc[key] = {
            model: result.model,
            provider: result.provider,
            scores: [],
            costs: [],
            latencies: [],
          };
        }
        acc[key].scores.push(result.qualityScore || 0);
        acc[key].costs.push(result.costUSD || 0);
        acc[key].latencies.push(result.latencyMs || 0);
        return acc;
      },
      {}
    );

    const modelStats = Object.values(modelScores).map((m: any) => ({
      model: m.model,
      provider: m.provider,
      averageScore:
        m.scores.reduce((s: number, a: number) => s + a, 0) / m.scores.length,
      totalCost: m.costs.reduce((s: number, a: number) => s + a, 0),
      averageLatency:
        m.latencies.reduce((s: number, a: number) => s + a, 0) /
        m.latencies.length,
      testCount: m.scores.length,
    }));

    return NextResponse.json({
      promptId: prompt.id || prompt.slug || promptId,
      promptTitle: prompt.title,
      hasResults: true,
      results: testResults.map((r: any) => ({
        ...r,
        testedAt: r.testedAt?.toISOString() || new Date().toISOString(),
      })),
      averageScore: Math.round(averageScore * 10) / 10,
      totalTests,
      totalCost: Math.round(totalCost * 10000) / 10000,
      modelStats,
      lastTested: testResults[0]?.testedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}

