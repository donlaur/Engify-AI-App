import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { RedisMessageQueue } from '@/lib/messaging/queues/RedisMessageQueue';

/**
 * Admin Dashboard Stats API
 *
 * Provides efficient statistics for the admin dashboard using countDocuments()
 * instead of fetching and counting all records.
 *
 * This endpoint replaces the inefficient pattern of fetching ALL records
 * from multiple collections just to count them.
 */

interface RecentActivity {
  type: 'user' | 'content';
  title: string;
  subtitle: string;
  timestamp: Date;
  id: string;
}

// GET: Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can view dashboard stats
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      await auditLog({
        action: 'unauthorized_access',
        userId: session?.user?.email || 'unknown',
        resource: 'admin_stats',
        severity: 'warning',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          message: 'Unauthorized attempt to access admin stats',
          role,
        },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `admin-stats-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const db = await getDb();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeRecent = searchParams.get('includeRecent') !== 'false'; // default true

    // Count documents in parallel for efficiency
    // Using Promise.all to run all counts simultaneously
    const [
      usersCount,
      contentCount,
      promptsCount,
      patternsCount,
      aiModelsCount,
      aiToolsCount,
      auditLogsCount,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('learning_content').countDocuments(),
      db.collection('prompts').countDocuments(),
      db.collection('patterns').countDocuments(),
      db.collection('ai_models').countDocuments(),
      db.collection('ai_tools').countDocuments(),
      db.collection('audit_logs').countDocuments(),
    ]);

    // Get DLQ stats from Redis (separate from MongoDB)
    let dlqCount = 0;
    try {
      const dlqQueue = new RedisMessageQueue('default', 'redis', {
        name: 'default',
        type: 'redis',
        maxRetries: 3,
        retryDelay: 1000,
        visibilityTimeout: 30000,
        batchSize: 10,
        concurrency: 5,
        enableDeadLetter: true,
        enableMetrics: true,
      });
      const dlqStats = await dlqQueue.getDLQStats();
      dlqCount = dlqStats.totalMessages || 0;
    } catch (error) {
      // DLQ stats are optional - log but don't fail the request
      logger.error('Failed to fetch DLQ stats', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Build stats response
    const stats = {
      users: usersCount,
      content: contentCount,
      prompts: promptsCount,
      patterns: patternsCount,
      aiModels: aiModelsCount,
      aiTools: aiToolsCount,
      auditLogs: auditLogsCount,
      dlqMessages: dlqCount,
    };

    // Optionally fetch recent activity
    let recentActivity: RecentActivity[] = [];
    if (includeRecent) {
      const [recentUsers, recentContent] = await Promise.all([
        db
          .collection('users')
          .find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .project({ _id: 1, name: 1, email: 1, createdAt: 1 })
          .toArray(),
        db
          .collection('learning_content')
          .find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .project({ _id: 1, title: 1, type: 1, createdAt: 1 })
          .toArray(),
      ]);

      // Map recent users to activity items
      const userActivity: RecentActivity[] = recentUsers.map((u) => ({
        type: 'user' as const,
        title: u.name || u.email || 'Unknown User',
        subtitle: 'New user registered',
        timestamp: u.createdAt ? new Date(u.createdAt) : new Date(),
        id: u._id.toString(),
      }));

      // Map recent content to activity items
      const contentActivity: RecentActivity[] = recentContent.map((c) => ({
        type: 'content' as const,
        title: c.title || 'Untitled',
        subtitle: `New ${c.type || 'content'} created`,
        timestamp: c.createdAt ? new Date(c.createdAt) : new Date(),
        id: c._id.toString(),
      }));

      // Combine and sort by timestamp
      recentActivity = [...userActivity, ...contentActivity]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
    }

    // Audit log for stats access
    await auditLog({
      action: 'admin_settings_viewed',
      userId: session?.user?.email || 'unknown',
      resource: 'admin_stats',
      severity: 'info',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        message: 'Admin stats viewed',
        includeRecent,
      },
    });

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
    });
  } catch (error) {
    logger.apiError('/api/admin/stats', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
