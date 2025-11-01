/**
 * QStash Message Handler for Gamification Events
 * 
 * Processes gamification events from QStash queue
 * Routes to gamification webhook for processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Received gamification event from QStash', {
      messageId: body.messageId,
      type: body.type,
    });

    // Forward to gamification webhook for processing
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/gamification`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QStash-Message-Id': body.messageId || '',
      },
      body: JSON.stringify(body.payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Error processing gamification event', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}

