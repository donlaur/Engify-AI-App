/**
 * Content Strategy Q&A API
 * Allows admins to ask AI about content strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { contentStrategyQA } from '@/lib/content/content-strategy-qa';
import { z } from 'zod';

const StrategyQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  context: z.string().optional(),
  modelId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // RBAC: Admin only
  const r = await RBACPresets.requireAdmin()(request);
  if (r) return r;

  try {
    const body = await request.json();
    const validated = StrategyQuestionSchema.parse(body);

    // Ask AI
    const answer = await contentStrategyQA.askQuestion(validated);

    return NextResponse.json({
      success: true,
      ...answer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Content strategy Q&A error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to answer question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET: Get available models
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireAdmin()(request);
  if (r) return r;

  try {
    const models = await contentStrategyQA.getAvailableModels();

    return NextResponse.json({
      success: true,
      models: models.map(m => ({
        id: m.id,
        name: m.displayName,
        provider: m.provider,
        cost: {
          input: m.costPer1kInputTokens,
          output: m.costPer1kOutputTokens,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
