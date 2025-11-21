/**
 * Client Logging API Endpoint
 * 
 * Receives logs from client components and forwards to centralized logger.
 * This allows client-side code to use structured logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, meta } = body;

    // Validate request
    if (!level || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, message' },
        { status: 400 }
      );
    }

    // Forward to centralized logger
    switch (level) {
      case 'error':
        logger.error(message, meta);
        break;
      case 'warn':
        logger.warn(message, meta);
        break;
      case 'info':
        logger.info(message, meta);
        break;
      case 'debug':
        logger.debug(message, meta);
        break;
      default:
        logger.info(message, { ...meta, originalLevel: level });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the error but don't expose details to client
    logger.error('Failed to process client log', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}

