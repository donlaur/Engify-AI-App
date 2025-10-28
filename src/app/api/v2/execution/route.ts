import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ExecutionContextManager } from '@/lib/execution/context/ExecutionContextManager';
import { ExecutionStrategyFactory } from '@/lib/execution/factory/ExecutionStrategyFactory';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import {
  ExecutionContext,
  AIRequest,
} from '@/lib/execution/interfaces/IExecutionStrategy';

// Request validation schema
const ExecuteRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8000).optional(),
  stream: z.boolean().optional(),
  provider: z.string().min(1, 'Provider is required'),
  strategy: z
    .enum(['auto', 'streaming', 'batch', 'cache', 'hybrid'])
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;

// Initialize execution system
const aiProviderFactory = new AIProviderFactory();
const strategyFactory = new ExecutionStrategyFactory(aiProviderFactory);
const contextManager = new ExecutionContextManager(aiProviderFactory);

// Register strategies
const strategies = strategyFactory.getAvailableStrategies();
for (const strategyName of strategies) {
  const strategy = strategyFactory.getStrategy(strategyName);
  if (strategy) {
    contextManager.registerStrategy(strategy);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ExecuteRequestSchema.parse(body);

    // Create execution context
    const context: ExecutionContext = {
      userId: 'anonymous', // TODO: Get from auth
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: validatedData.priority || 'normal',
      metadata: validatedData.metadata || {},
    };

    // Create AI request
    const aiRequest: AIRequest = {
      prompt: validatedData.prompt,
      systemPrompt: validatedData.systemPrompt,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
      stream: validatedData.stream,
    };

    // Select execution strategy
    let selectedStrategy;
    if (validatedData.strategy && validatedData.strategy !== 'auto') {
      selectedStrategy = strategyFactory.getStrategy(validatedData.strategy);
      if (
        !selectedStrategy ||
        !selectedStrategy.canHandle(aiRequest, context)
      ) {
        return NextResponse.json(
          {
            error: `Strategy '${validatedData.strategy}' cannot handle this request`,
          },
          { status: 400 }
        );
      }
    } else {
      selectedStrategy = contextManager.selectStrategy(aiRequest, context);
      if (!selectedStrategy) {
        return NextResponse.json(
          { error: 'No suitable execution strategy found' },
          { status: 400 }
        );
      }
    }

    // Execute request
    const result = await selectedStrategy.execute(
      aiRequest,
      context,
      validatedData.provider
    );

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        content: result.response.content,
        usage: result.response.usage,
        cost: result.response.cost,
        latency: result.response.latency,
        provider: result.response.provider,
        model: result.response.model,
        strategy: result.strategy,
        executionTime: result.executionTime,
        cacheHit: result.cacheHit || false,
        streamed: result.streamed || false,
        batchSize: result.batchSize || 1,
      },
      metadata: {
        requestId: context.requestId,
        selectedStrategy: selectedStrategy.name,
        availableStrategies: contextManager.getStrategies().map((s) => s.name),
        executionStats: contextManager.getStats(),
      },
    });
  } catch (error) {
    console.error('Execution API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'strategies':
        return NextResponse.json({
          success: true,
          data: {
            availableStrategies: contextManager.getStrategies().map((s) => ({
              name: s.name,
              config: s.config,
              canHandle: s.canHandle(
                { prompt: 'test', maxTokens: 1000 },
                { userId: 'test', requestId: 'test', priority: 'normal' }
              ),
              estimatedTime: s.getEstimatedTime(
                { prompt: 'test', maxTokens: 1000 },
                { userId: 'test', requestId: 'test', priority: 'normal' }
              ),
            })),
            stats: contextManager.getStats(),
            validation: contextManager.validateStrategies(),
          },
        });

      case 'recommendations':
        const prompt = url.searchParams.get('prompt') || 'test prompt';
        const priority = url.searchParams.get('priority') || 'normal';
        const maxTokens = parseInt(url.searchParams.get('maxTokens') || '1000');

        const recommendations = strategyFactory.getStrategyRecommendations(
          { prompt, maxTokens },
          {
            userId: 'test',
            requestId: 'test',
            priority: priority as 'low' | 'normal' | 'high' | 'urgent',
          }
        );

        return NextResponse.json({
          success: true,
          data: recommendations,
        });

      case 'health':
        const validation = contextManager.validateStrategies();
        return NextResponse.json({
          success: true,
          data: {
            status: validation.valid ? 'healthy' : 'unhealthy',
            strategies: contextManager.getStats(),
            validation,
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Execution Strategy API v1',
            endpoints: {
              'POST /': 'Execute AI request with strategy selection',
              'GET ?action=strategies': 'Get available strategies',
              'GET ?action=recommendations': 'Get strategy recommendations',
              'GET ?action=health': 'Health check',
            },
            availableStrategies: contextManager
              .getStrategies()
              .map((s) => s.name),
          },
        });
    }
  } catch (error) {
    console.error('Execution API GET error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
