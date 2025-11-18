/**
 * Example API Route with Full Observability
 *
 * This route demonstrates all observability features:
 * - Automatic request tracing
 * - Structured logging
 * - Performance monitoring
 * - Error tracking
 * - Business metrics
 * - Database timing
 * - AI provider timing
 *
 * This is a reference implementation showing best practices.
 */

import {
  withObservability,
  observabilityLogger,
  withDbTiming,
  withAiTiming,
  errorTracker,
  ErrorCategory,
  RequestContext,
} from '@/lib/observability';

interface ExampleRequestBody {
  action: string;
  data?: Record<string, unknown>;
}

async function handler(request: Request) {
  try {
    // Get request context
    const context = RequestContext.get();
    const requestId = context?.requestId;

    observabilityLogger.info('Processing example request', {
      action: 'start',
    });

    // Parse request body
    const body: ExampleRequestBody = await request.json();

    // Log business metric for feature usage
    observabilityLogger.business('example_feature_used', {
      metadata: {
        action: body.action,
        hasData: !!body.data,
      },
    });

    // Simulate database query with timing
    const dbResult = await withDbTiming(
      'examples',
      'find',
      async () => {
        // Simulate DB operation
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { count: 42, items: [] };
      },
      {
        filters: body.data,
      }
    );

    // Simulate AI provider call with timing
    const aiResult = await withAiTiming(
      'openai',
      'gpt-4',
      async () => {
        // Simulate AI call
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { response: 'Example AI response' };
      },
      {
        cost: 0.002,
        tokens: 100,
      }
    );

    // Update request context with custom metadata
    RequestContext.updateMetadata({
      dbRecords: dbResult.count,
      aiTokens: 100,
    });

    // Log successful completion
    observabilityLogger.info('Example request completed successfully', {
      dbRecords: dbResult.count,
      aiResponse: aiResult.response,
    });

    // Log business metric for successful completion
    observabilityLogger.business('example_completed', {
      metadata: {
        action: body.action,
        success: true,
      },
    });

    return Response.json({
      success: true,
      requestId,
      data: {
        db: dbResult,
        ai: aiResult,
      },
    });
  } catch (error) {
    // Error is automatically tracked by withObservability
    // But you can add additional context here
    errorTracker.trackError(error, ErrorCategory.INTERNAL, {
      additionalContext: 'Example route error',
    });

    // Log business metric for failure
    observabilityLogger.business('example_failed', {
      metadata: {
        success: false,
      },
    });

    throw error;
  }
}

// Export with observability wrapper
export const POST = withObservability(handler, {
  operation: 'exampleOperation',
  category: ErrorCategory.INTERNAL,
});
