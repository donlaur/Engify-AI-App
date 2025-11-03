import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/aws/lambda';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';

/**
 * POST /api/agents/scrum-meeting
 * Engineering Leadership Discussion Prep Tool
 * 
 * Get multi-perspective analysis on engineering problems from:
 * - Director of Engineering (strategic, ROI, organizational impact)
 * - Engineering Manager (team adoption, workflow integration)
 * - Tech Lead (technical feasibility, tool selection)
 * - Architect (system architecture, scalability, security)
 * 
 * Use Case: Prepare for engineering leadership meetings, ARB reviews, or 
 * engineering+product leadership discussions by getting comprehensive perspectives 
 * before the meeting.
 * 
 * Beta: 5-minute timeout, GPT-4o-mini, RAG-enhanced with prompt library context
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

    const { situation, context = '' } = await request.json();
    
    if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
      return NextResponse.json(
        { error: 'Situation is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Invoke Python Lambda (5-minute timeout)
    const lambdaFunctionName = process.env.MULTI_AGENT_LAMBDA_FUNCTION_NAME || 'engify-ai-integration-workbench';
    
    logger.debug('Invoking Lambda for multi-perspective engineering leadership analysis', {
      functionName: lambdaFunctionName,
      situationLength: situation.length,
      hasContext: !!context,
    });

    const result = await invokeLambda(lambdaFunctionName, {
      situation: situation.trim(),
      context: context.trim(),
    });

    return NextResponse.json({
      success: true,
      session_id: result.session_id,
      summary: result.summary,
      conversation: result.conversation,
      turn_count: result.turn_count,
    });
  } catch (error) {
    logger.apiError('Engineering leadership analysis error', error, {
      route: '/api/agents/scrum-meeting',
      method: 'POST',
    });

    return NextResponse.json(
      { 
        error: 'Failed to run multi-perspective analysis', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

