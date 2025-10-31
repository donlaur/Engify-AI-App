import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

/**
 * AI Execution API Route (v2)
 *
 * New version using the AIProvider interface and factory pattern.
 * This route demonstrates SOLID principles in action:
 * - Single Responsibility: Just handles HTTP request/response
 * - Open/Closed: Add new providers without modifying this code
 * - Liskov Substitution: All providers are interchangeable
 * - Dependency Inversion: Depends on AIProvider interface, not concrete classes
 */

// Request validation schema
const executeSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  provider: z.string().default('openai'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4096).default(2000),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let session: { user?: { id?: string } } | null = null;

  // Check RBAC permission
  const rbacCheck = await RBACPresets.requireAIExecution()(req);
  if (rbacCheck) {
    return rbacCheck; // Return 403 if no permission
  }

  try {
    session = await auth();
    // Parse and validate request body
    const body = await req.json();
    const request = executeSchema.parse(body);

    // Check if provider exists
    if (!AIProviderFactory.hasProvider(request.provider)) {
      return NextResponse.json(
        {
          error: 'Invalid provider',
          message: `Provider "${request.provider}" not found`,
          availableProviders: AIProviderFactory.getAvailableProviders(),
        },
        { status: 400 }
      );
    }

    // Create provider using factory (Strategy pattern)
    const provider = AIProviderFactory.create(request.provider);

    // Validate request using provider
    if (!provider.validateRequest(request)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Request validation failed',
        },
        { status: 400 }
      );
    }

    // Execute AI request
    const response = await provider.execute(request);

    const duration = Date.now() - startTime;
    logger.apiRequest('/api/v2/ai/execute', {
      userId: session?.user?.id,
      method: 'POST',
      statusCode: 200,
      duration,
      provider: response.provider,
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage,
      cost: response.cost,
      latency: response.latency,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('/api/v2/ai/execute', error, {
      userId: session?.user?.id,
      method: 'POST',
      duration,
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle provider errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Provider error',
          message: error.message,
        },
        { status: 400 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to list available providers
 */
export async function GET(req: NextRequest) {
  // RBAC: workbench:ai_execution permission (same as POST for consistency)
  const rbacCheck = await RBACPresets.requireAIExecution()(req);
  if (rbacCheck) return rbacCheck;

  return NextResponse.json({
    providers: AIProviderFactory.getAvailableProviders(),
    categories: AIProviderFactory.getProvidersByCategory(),
  });
}
