/**
 * QStash Message Processing Webhook
 *
 * Handles incoming messages from QStash and processes them through
 * the appropriate message handlers.
 *
 * Features:
 * - Message validation and parsing
 * - Automatic retry handling
 * - Error logging and monitoring
 * - Audit trail for compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';
import { QueueConfig } from '@/lib/messaging/types';
import { auditLog } from '@/lib/logging/audit';

// Global queue instances (in production, use proper DI container)
const queues = new Map<string, QStashMessageQueue>();

/**
 * Get or create a QStash queue instance
 */
function getQueue(queueName: string): QStashMessageQueue {
  if (!queues.has(queueName)) {
    const config: QueueConfig = {
      name: queueName,
      type: 'redis',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 30000,
      batchSize: 10,
      concurrency: 5,
      enableDeadLetter: true,
      enableMetrics: true,
    };

    const queue = new QStashMessageQueue(queueName, 'redis', config);
    queues.set(queueName, queue);
  }

  const queue = queues.get(queueName);
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  return queue;
}

/**
 * POST /api/messaging/[queueName]/process
 * Process a message from QStash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string } }
) {
  const startTime = Date.now();
  let messageId = 'unknown';
  let queueName = 'unknown';

  try {
    queueName = params.queueName;
    const queue = getQueue(queueName);

    // Parse and validate the QStash message
    const messageData = await request.json();
    messageId = messageData.messageId || messageData.id || 'unknown';

    // Log incoming message for audit trail
    await auditLog({
      action: 'message_received',
      severity: 'info',
      metadata: {
        queueName,
        messageId,
        messageType: messageData.type || 'unknown',
        source: 'qstash',
      },
    });

    // Validate message structure
    if (!messageData.payload) {
      await auditLog({
        action: 'message_validation_failed',
        severity: 'warning',
        metadata: {
          queueName,
          messageId,
          reason: 'missing_payload',
        },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message: missing payload',
        },
        { status: 400 }
      );
    }

    // Process the message
    const result = await queue.processMessage(messageData);
    const processingTime = Date.now() - startTime;

    // Log result for audit trail
    await auditLog({
      action: result.success ? 'message_processed' : 'message_failed',
      severity: result.success ? 'info' : 'error',
      metadata: {
        queueName,
        messageId,
        processingTime,
        error: result.error,
      },
    });

    // Return success response to QStash
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Message processed successfully' : result.error,
      processingTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log error for monitoring
    await auditLog({
      action: 'message_processing_error',
      severity: 'error',
      metadata: {
        queueName,
        messageId,
        processingTime,
        error: errorMessage,
      },
    });

    // eslint-disable-next-line no-console
    console.error('QStash message processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTime,
      },
      { status: 500 }
    );
  }
}
