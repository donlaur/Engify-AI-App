/**
 * Gemini Research API
 * Endpoint to trigger Gemini deep research
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  conductGeminiResearch,
  researchPromptPatterns,
} from '@/lib/ai/gemini-integration-v2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/research/gemini
 * Conduct Gemini deep research
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      context,
      depth = 'standard',
      outputFormat = 'markdown',
      preset,
    } = body;

    // Check for preset research types
    if (preset === 'prompt-patterns') {
      const result = await researchPromptPatterns();

      return NextResponse.json({
        success: true,
        result,
      });
    }

    // Custom research
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const result = await conductGeminiResearch({
      topic,
      context,
      depth,
      outputFormat,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Gemini research error:', errorMessage);

    return NextResponse.json(
      {
        error: 'Research failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/gemini?preset=prompt-patterns
 * Get preset research results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preset = searchParams.get('preset');

    if (preset === 'prompt-patterns') {
      const result = await researchPromptPatterns();

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json({ error: 'Invalid preset' }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Gemini research error:', errorMessage);

    return NextResponse.json(
      {
        error: 'Research failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
