/**
 * QStash Callback Webhook
 * 
 * Handles success callbacks from QStash after message processing.
 */

import { NextRequest, NextResponse } from 'next/server';

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
    
    console.log(`QStash success callback for queue ${queueName}:`, callbackData);
    
    // Update queue statistics or perform other success actions
    // In a real implementation, you might update metrics, send notifications, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully',
    });
    
  } catch (error) {
    console.error('QStash callback processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
