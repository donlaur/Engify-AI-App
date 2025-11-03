import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/aws/lambda';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';

/**
 * POST /api/agents/scrum-meeting
 * Run a scrum meeting simulation with 4 multi-agent system
 * Beta: 5-minute timeout, GPT-4o-mini, simple state management
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (beta: 10 requests/hour for anonymous)
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(ip, 'anonymous');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { agenda, topics = [] } = await request.json();
    
    if (!agenda || typeof agenda !== 'string' || agenda.trim().length === 0) {
      return NextResponse.json(
        { error: 'Agenda is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Invoke Python Lambda (5-minute timeout)
    const lambdaFunctionName = process.env.MULTI_AGENT_LAMBDA_FUNCTION_NAME || 'engify-scrum-meeting-agent';
    
    logger.debug('Invoking Lambda for scrum meeting', {
      functionName: lambdaFunctionName,
      agendaLength: agenda.length,
      topicsCount: topics.length,
    });

    const result = await invokeLambda(lambdaFunctionName, {
      agenda: agenda.trim(),
      topics: Array.isArray(topics) ? topics : [],
    });

    return NextResponse.json({
      success: true,
      meeting_id: result.meeting_id,
      summary: result.summary,
      conversation: result.conversation,
      turn_count: result.turn_count,
    });
  } catch (error) {
    logger.apiError('Scrum meeting error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Failed to run scrum meeting', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

