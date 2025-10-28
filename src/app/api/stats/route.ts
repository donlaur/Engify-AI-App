import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import type { Db } from 'mongodb';

/**
 * GET /api/stats
 * Get platform statistics
 */
export async function GET() {
  try {
    // Try MongoDB first with timeout
    try {
      const dbPromise = getMongoDb();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
      );

      const db = (await Promise.race([dbPromise, timeoutPromise])) as Db;

      // Direct DB access in API routes for performance
      const [promptCount, patternCount, pathwayCount, userCount] =
        await Promise.all([
          db.collection('prompts').countDocuments(),
          db.collection('patterns').countDocuments(),
          db.collection('pathways').countDocuments(),
          db.collection('users').countDocuments(),
        ]);

      // Get most viewed prompts
      const topPrompts = await db
        .collection('prompts')
        .find()
        .sort({ views: -1 })
        .limit(5)
        .toArray();

      // Get most popular categories
      const categoryStats = await db
        .collection('prompts')
        .aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .toArray();

      return NextResponse.json({
        stats: {
          prompts: promptCount,
          patterns: patternCount,
          pathways: pathwayCount,
          users: userCount,
        },
        topPrompts: topPrompts.map((p) => ({
          id: p._id,
          title: p.title,
          views: p.views,
          rating: p.rating,
        })),
        categories: categoryStats.map((c) => ({
          name: c._id,
          count: c.count,
        })),
        source: 'mongodb',
      });
    } catch (dbError) {
      // Fallback to static data
      const { seedPrompts } = await import('@/data/seed-prompts');
      const { promptPatterns } = await import('@/data/prompt-patterns');
      const { learningPathways } = await import('@/data/learning-pathways');

      // Count by category
      const categoryCount: Record<string, number> = {};
      seedPrompts.forEach((p) => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      });

      const categories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return NextResponse.json({
        stats: {
          prompts: seedPrompts.length,
          patterns: promptPatterns.length,
          pathways: learningPathways.length,
          users: 0,
        },
        topPrompts: seedPrompts.slice(0, 5).map((p) => ({
          id: p.id,
          title: p.title,
          views: 0,
          rating: 0,
        })),
        categories,
        source: 'static',
      });
    }
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
