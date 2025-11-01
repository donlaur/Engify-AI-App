/**
 * GET /api/prompts/quality-scores
 * Fetch quality scores for multiple prompts (for library cards)
 * Query param: promptIds (comma-separated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptIdsParam = searchParams.get('promptIds');
    
    if (!promptIdsParam) {
      return NextResponse.json(
        { error: 'promptIds query parameter required' },
        { status: 400 }
      );
    }

    const promptIds = promptIdsParam.split(',').filter(Boolean);
    
    if (promptIds.length === 0) {
      return NextResponse.json({ scores: {} });
    }

    const db = await getDb();
    
    // Get prompts by id or slug to get their MongoDB _id
    const prompts = await db.collection('prompts').find({
      $or: [
        { id: { $in: promptIds } },
        { slug: { $in: promptIds } },
      ],
    }).toArray();

    const promptIdMap = new Map<string, string>();
    prompts.forEach((p: any) => {
      const key = p.id || p.slug;
      if (key) {
        promptIdMap.set(key, p._id.toString());
      }
    });

    const mongoIds = Array.from(promptIdMap.values());
    
    if (mongoIds.length === 0) {
      return NextResponse.json({ scores: {} });
    }

    // Aggregate test results to get average scores per prompt
    const results = await db
      .collection('prompt_test_results')
      .aggregate([
        {
          $match: {
            promptId: { $in: mongoIds },
          },
        },
        {
          $group: {
            _id: '$promptId',
            averageScore: { $avg: '$qualityScore' },
            testCount: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Build response map: promptId -> { averageScore, testCount }
    const scores: Record<string, { averageScore: number; testCount: number }> = {};
    
    results.forEach((result: any) => {
      // Find the original promptId from the MongoDB _id
      for (const [originalId, mongoId] of promptIdMap.entries()) {
        if (mongoId === result._id) {
          scores[originalId] = {
            averageScore: Math.round(result.averageScore * 10) / 10,
            testCount: result.testCount,
          };
          break;
        }
      }
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching quality scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality scores' },
      { status: 500 }
    );
  }
}

