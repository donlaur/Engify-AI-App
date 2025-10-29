/**
 * QStash Callback Webhook
 *
 * Handles success callbacks from QStash after message processing.
 *
 * Features:
 * - Success confirmation logging
 * - Metrics tracking
 * - Audit trail for compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditLog } from '@/lib/logging/audit';

/**
 * POST /api/messaging/[queueName]/callback
 * Handle success callback from QStash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { queueName: string } }
) {
  try {
    const queueName = params.queueName;
    const callbackData = await request.json();
    const messageId = callbackData.messageId || callbackData.id || 'unknown';

    // Log success callback for audit trail
    await auditLog({
      action: 'message_callback_received',
      severity: 'info',
      details: {
        queueName,
        messageId,
        status: callbackData.status || 'success',
        ...(callbackData.metadata || {}),
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(
        `QStash success callback for queue ${queueName}:`,
        callbackData
      );
    }

    // Update queue statistics or perform other success actions
    // In a real implementation, you might update metrics, send notifications, etc.

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully',
      messageId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log error for monitoring
    await auditLog({
      action: 'callback_processing_error',
      severity: 'error',
      details: {
        queueName: params.queueName,
        error: errorMessage,
      },
    });

    // eslint-disable-next-line no-console
    console.error('QStash callback processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
