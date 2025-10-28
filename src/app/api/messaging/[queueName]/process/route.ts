/**
 * QStash Message Processing Webhook
 * 
 * Handles incoming messages from QStash and processes them through
 * the appropriate message handlers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';
import { MessageFactory } from '@/lib/messaging/MessageFactory';
import { QueueConfig } from '@/lib/messaging/types';

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
  
  return queues.get(queueName)!;
}

/**
 * POST /api/messaging/[queueName]/process
 * Process a message from QStash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string } }
) {
  try {
    const queueName = params.queueName;
    const queue = getQueue(queueName);
    
    // Parse the QStash message
    const messageData = await request.json();
    
    // Process the message
    const result = await queue.processMessage(messageData);
    
    // Return success response to QStash
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Message processed successfully' : result.error,
      processingTime: result.processingTime,
    });
    
  } catch (error) {
    console.error('QStash message processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
