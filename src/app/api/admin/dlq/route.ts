/**
 * Dead Letter Queue Admin API
 *
 * Provides endpoints for viewing, replaying, and managing failed messages
 * in the dead letter queue.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { RedisMessageQueue } from '@/lib/messaging/queues/RedisMessageQueue';
import { logger } from '@/lib/logging/logger';

/**
 * GET /api/admin/dlq
 * Get DLQ messages and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role (adjust based on your auth system)
    // @ts-expect-error - role might not be in session type
    if (session.user.role !== 'admin' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queueName = searchParams.get('queue') || 'default';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');

    // Create queue instance
    const queue = new RedisMessageQueue(queueName, 'redis', {
      name: queueName,
      type: 'redis',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 30000,
      batchSize: 10,
      concurrency: 5,
      enableDeadLetter: true,
      enableMetrics: true,
    });

    // Handle different actions
    if (action === 'stats') {
      const stats = await queue.getDLQStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Get DLQ messages
    const messages = await queue.getDLQMessages(limit, offset);
    const stats = await queue.getDLQStats();

    return NextResponse.json({
      success: true,
      data: {
        messages,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.totalMessages,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get DLQ data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get DLQ data',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/dlq
 * Replay or delete messages from DLQ
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    // @ts-expect-error - role might not be in session type
    if (session.user.role !== 'admin' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, queueName, messageId, messageIds } = body;

    if (!queueName) {
      return NextResponse.json(
        { success: false, error: 'Queue name is required' },
        { status: 400 }
      );
    }

    // Create queue instance
    const queue = new RedisMessageQueue(queueName, 'redis', {
      name: queueName,
      type: 'redis',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 30000,
      batchSize: 10,
      concurrency: 5,
      enableDeadLetter: true,
      enableMetrics: true,
    });

    switch (action) {
      case 'replay': {
        if (!messageId) {
          return NextResponse.json(
            { success: false, error: 'Message ID is required' },
            { status: 400 }
          );
        }
        await queue.replayFromDLQ(messageId);
        logger.info('Message replayed from DLQ', {
          queue: queueName,
          messageId,
          user: session.user.email,
        });
        return NextResponse.json({
          success: true,
          message: 'Message replayed successfully',
        });
      }

      case 'replayBulk': {
        if (!messageIds || !Array.isArray(messageIds)) {
          return NextResponse.json(
            { success: false, error: 'Message IDs array is required' },
            { status: 400 }
          );
        }

        const results = {
          succeeded: 0,
          failed: 0,
          errors: [] as string[],
        };

        for (const id of messageIds) {
          try {
            await queue.replayFromDLQ(id);
            results.succeeded++;
          } catch (error) {
            results.failed++;
            results.errors.push(
              `${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        logger.info('Bulk replay from DLQ', {
          queue: queueName,
          results,
          user: session.user.email,
        });

        return NextResponse.json({
          success: true,
          data: results,
        });
      }

      case 'delete': {
        if (!messageId) {
          return NextResponse.json(
            { success: false, error: 'Message ID is required' },
            { status: 400 }
          );
        }
        const deleted = await queue.deleteDLQMessage(messageId);
        logger.info('Message deleted from DLQ', {
          queue: queueName,
          messageId,
          deleted,
          user: session.user.email,
        });
        return NextResponse.json({
          success: true,
          message: deleted ? 'Message deleted successfully' : 'Message not found',
        });
      }

      case 'purge': {
        await queue.purgeDLQ();
        logger.warn('DLQ purged', {
          queue: queueName,
          user: session.user.email,
        });
        return NextResponse.json({
          success: true,
          message: 'DLQ purged successfully',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Failed to perform DLQ operation', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform operation',
      },
      { status: 500 }
    );
  }
}
