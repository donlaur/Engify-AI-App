import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import {
  getWorkbenchToolContract,
  type ContractToolId,
} from '@/lib/workbench/contracts';
import {
  startWorkbenchRun,
  completeWorkbenchRun,
} from '@/lib/services/workbenchRuns';

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
  toolId: z.string().optional(),
  runId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let session: { user?: { id?: string } } | null = null;
  let workbenchRunId: string | null = null;
  let contractBudgetCents = 0;
  let contractMaxTokens = 0;
  let contractCostPerToken = 0;
  let toolId: string | null = null;

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

    toolId = request.toolId ?? null;

    if (toolId) {
      const contract = getWorkbenchToolContract(toolId as ContractToolId);
      if (!contract) {
        return NextResponse.json(
          {
            error: 'Tool contract not configured',
            message: `No workbench contract found for tool "${toolId}"`,
          },
          { status: 400 }
        );
      }

      workbenchRunId = request.runId ?? randomUUID();
      contractBudgetCents = contract.maxCostCents;
      contractMaxTokens = contract.maxTotalTokens;
      contractCostPerToken = contract.costPerTokenCents;

      const startResult = await startWorkbenchRun({
        toolId,
        userId: session?.user?.id ?? null,
        budgetCents: contract.maxCostCents,
        contractVersion: contract.version,
        runId: workbenchRunId,
        prompt: request.prompt,
        metadata: {
          provider: request.provider,
        },
      });

      if (startResult.status === 'replay') {
        await completeWorkbenchRun({
          runId: startResult.runId,
          status: 'replay',
          error: 'Workbench run replay detected',
        });

        return NextResponse.json(
          {
            error: 'Replay detected',
            runId: startResult.runId,
          },
          { status: 409 }
        );
      }
    }

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

    const usage = response.usage ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const totalTokens = usage.totalTokens ??
      ((usage.promptTokens ?? 0) + (usage.completionTokens ?? 0));

    let costCents = Math.round((response.cost?.total ?? 0) * 100);
    if (costCents === 0 && totalTokens > 0 && contractCostPerToken > 0) {
      costCents = Math.round(totalTokens * contractCostPerToken);
    }

     if (toolId && workbenchRunId) {
       // Check cost budget first (primary constraint)
       if (costCents > contractBudgetCents) {
         await completeWorkbenchRun({
           runId: workbenchRunId,
           status: 'budget_exceeded',
           totalTokens,
           inputTokens: usage.promptTokens ?? null,
           outputTokens: usage.completionTokens ?? null,
           provider: response.provider,
           model: response.model,
           costCents,
           error: `Cost ${costCents} exceeds contract budget ${contractBudgetCents}`,
         });

         return NextResponse.json(
           {
             error: 'Workbench execution exceeded cost budget',
             runId: workbenchRunId,
             maxCostCents: contractBudgetCents,
             actualCostCents: costCents,
           },
           { status: 403 }
         );
       }

       // Check token budget second (secondary constraint)
       if (totalTokens > contractMaxTokens) {
         await completeWorkbenchRun({
           runId: workbenchRunId,
           status: 'budget_exceeded',
           totalTokens,
           inputTokens: usage.promptTokens ?? null,
           outputTokens: usage.completionTokens ?? null,
           provider: response.provider,
           model: response.model,
           costCents,
           error: `Token usage ${totalTokens} exceeds contract maximum ${contractMaxTokens}`,
         });

         return NextResponse.json(
           {
             error: 'Workbench execution exceeded token budget',
             runId: workbenchRunId,
             maxTokens: contractMaxTokens,
             actualTokens: totalTokens,
           },
           { status: 403 }
         );
       }
     }

    const duration = Date.now() - startTime;
    logger.apiRequest('/api/v2/ai/execute', {
      userId: session?.user?.id,
      method: 'POST',
      statusCode: 200,
      duration,
      provider: response.provider,
    });

    // Return successful response
    const responseBody = {
      success: true,
      response: response.content,
      usage: response.usage,
      cost: response.cost,
      latency: response.latency,
      provider: response.provider,
      model: response.model,
      runId: workbenchRunId,
    } as const;

    if (toolId && workbenchRunId) {
      await completeWorkbenchRun({
        runId: workbenchRunId,
        status: 'success',
        costCents,
        provider: response.provider,
        model: response.model,
        inputTokens: usage.promptTokens ?? null,
        outputTokens: usage.completionTokens ?? null,
        totalTokens,
        metadata: {
          latency: response.latency,
        },
      });
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('/api/v2/ai/execute', error, {
      userId: session?.user?.id,
      method: 'POST',
      duration,
    });

    if (toolId && workbenchRunId) {
      await completeWorkbenchRun({
        runId: workbenchRunId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

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
