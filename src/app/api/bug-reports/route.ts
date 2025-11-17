import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Validation schema
const bugReportSchema = z.object({
  intent: z.string().min(1, 'Intent is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pageUrl: z.string().url('Invalid page URL'),
  selector: z.string().optional(),
  elementText: z.string().optional(),
  elementSize: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  timestamp: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      logger.warn('Unauthorized bug report submission attempt', {
        ip: getClientIp(request),
        url: request.url,
      });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Rate limiting - 10 bug reports per hour for authenticated users
    const identifier = session.user.id;
    const rateLimitResult = await checkRateLimit(identifier, 'authenticated');

    if (!rateLimitResult.allowed) {
      logger.warn('Bug report rate limit exceeded', {
        userId: session.user.id,
        email: session.user.email,
      });
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': '3600',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          }
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = bugReportSchema.parse(body);

    // Connect to database
    const db = await getDb();

    // Insert bug report with authenticated user ID
    const result = await db.collection('bug_reports').insertOne({
      userId: session.user.id,
      intent: validatedData.intent,
      description: validatedData.description,
      pageUrl: validatedData.pageUrl,
      selector: validatedData.selector || null,
      elementText: validatedData.elementText || null,
      elementSize: validatedData.elementSize || null,
      timestamp: validatedData.timestamp || new Date().toISOString(),
      userAgent: validatedData.userAgent || request.headers.get('user-agent') || null,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info('Bug report submitted', {
      userId: session.user.id,
      reportId: result.insertedId,
      pageUrl: validatedData.pageUrl,
    });

    return NextResponse.json({
      success: true,
      reportId: result.insertedId,
      message: 'Bug report submitted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    logger.error('Error submitting bug report', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: (await auth())?.user?.id,
    });

    return handleApiError(error, request);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      logger.warn('Unauthorized bug reports access attempt', {
        ip: getClientIp(request),
        url: request.url,
      });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Rate limiting
    const identifier = session.user.id;
    const rateLimitResult = await checkRateLimit(identifier, 'authenticated');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': '3600',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const status = searchParams.get('status');

    // Connect to database
    const db = await getDb();

    // Build query - filter by authenticated user ID
    const query: { userId: string; status?: string } = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    // Get bug reports
    const reports = await db
      .collection('bug_reports')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    logger.info('Bug reports retrieved', {
      userId: session.user.id,
      count: reports.length,
      status: status || 'all',
    });

    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    }, { headers: corsHeaders });
  } catch (error) {
    logger.error('Error fetching bug reports', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: (await auth())?.user?.id,
    });

    return handleApiError(error, request);
  }
}
