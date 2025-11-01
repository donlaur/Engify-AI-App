/**
 * GET /api/prompts/[id]/test-results
 * Fetch test results for a specific prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { PromptTestResultSchema } from '@/lib/db/schemas/prompt-test-results';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

