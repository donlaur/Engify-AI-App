/**
 * Observability Middleware
 *
 * Automatic instrumentation for Next.js API routes:
 * - Request ID injection
 * - Performance timing
 * - Error tracking
 * - Metrics recording
 * - Context propagation
 *
 * Usage in API route:
 *   import { withObservability } from '@/lib/observability/middleware';
 *
 *   async function handler(request: Request) {
 *     // your code
 *   }
 *
 *   export const GET = withObservability(handler, { operation: 'getUserProfile' });
 */

import { NextRequest, NextResponse } from 'next/server';
import { RequestContext, createRequestContext } from './request-context';
import { observabilityLogger } from './enhanced-logger';
import { errorTracker, ErrorCategory } from './error-tracker';
import { recordRouteMetric } from './metrics';
import { performanceMonitor } from './performance-monitor';
import { rateLimitTracker } from './rate-limit-tracker';

export interface ObservabilityOptions {
  operation?: string;
  category?: ErrorCategory;
  skipLogging?: boolean;
  skipMetrics?: boolean;
  getUserId?: (request: Request) => Promise<string | undefined> | string | undefined;
}

/**
 * Wrap API route handler with observability
 */
export function withObservability<T = unknown>(
  handler: (request: Request, context?: unknown) => Promise<Response | T>,
  options: ObservabilityOptions = {}
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    const startTime = Date.now();
    const method = request.method;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Get user ID if provided
    let userId: string | undefined;
    if (options.getUserId) {
      try {
        userId = await options.getUserId(request);
      } catch (error) {
        observabilityLogger.warn('Failed to get user ID', { error });
      }
    }

    // Create request context
    const requestContext = createRequestContext(request, {
      userId,
      operation: options.operation || pathname,
    });

    // Run handler with context
    return RequestContext.run(requestContext, async () => {
      const requestId = requestContext.requestId;

      // Log request start
      if (!options.skipLogging) {
        observabilityLogger.info('API request started', {
          method,
          pathname,
          userId,
        });
      }

      try {
        // Execute handler
        const result = await handler(request, context);
        const durationMs = Date.now() - startTime;

        // Convert result to Response if needed
        let response: Response;
        if (result instanceof Response) {
          response = result;
        } else {
          response = NextResponse.json(result);
        }

        const statusCode = response.status;

        // Add request ID to response headers
        const headersWithRequestId = new Headers(response.headers);
        headersWithRequestId.set('X-Request-ID', requestId);

        // Create new response with updated headers
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headersWithRequestId,
        });

        // Log request completion
        if (!options.skipLogging) {
          observabilityLogger.apiRequest(
            method,
            pathname,
            statusCode,
            durationMs,
            { userId }
          );
        }

        // Record metrics
        if (!options.skipMetrics) {
          const success = statusCode >= 200 && statusCode < 400;
          recordRouteMetric(pathname, durationMs, success);
          performanceMonitor.record(pathname, durationMs, {
            method,
            statusCode,
            success,
            userId,
          });
        }

        return response;
      } catch (error) {
        const durationMs = Date.now() - startTime;

        // Track error
        errorTracker.trackError(error, options.category, {
          method,
          pathname,
          userId,
          durationMs,
        });

        // Log error
        observabilityLogger.error(
          `API request failed: ${pathname}`,
          error,
          {
            method,
            pathname,
            userId,
            durationMs,
          }
        );

        // Record metrics
        if (!options.skipMetrics) {
          recordRouteMetric(pathname, durationMs, false);
          performanceMonitor.record(pathname, durationMs, {
            method,
            statusCode: 500,
            success: false,
            userId,
          });
        }

        // Return error response
        const errorMessage =
          error instanceof Error ? error.message : 'Internal server error';
        const response = NextResponse.json(
          {
            error: errorMessage,
            requestId,
          },
          { status: 500 }
        );

        // Add request ID to error response
        response.headers.set('X-Request-ID', requestId);

        return response;
      }
    });
  };
}

/**
 * Middleware for Next.js middleware.ts
 */
export function observabilityMiddleware(request: NextRequest) {
  const requestId = RequestContext.generateRequestId();
  const response = NextResponse.next();

  // Add request ID to response headers
  response.headers.set('X-Request-ID', requestId);

  // Add CORS headers if needed
  response.headers.set('Access-Control-Expose-Headers', 'X-Request-ID');

  return response;
}

/**
 * Helper to extract user ID from session
 */
export async function getUserIdFromSession(request: Request): Promise<string | undefined> {
  try {
    // This is a placeholder - adjust based on your auth implementation
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // Extract user ID from JWT or session token
      // This would need to be implemented based on your auth system
      return undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Rate limiting wrapper with observability
 */
export function withRateLimit<T>(
  handler: (request: Request, context?: unknown) => Promise<Response | T>,
  options: {
    limit: number;
    windowMs: number;
    keyGenerator?: (request: Request) => string;
  } & ObservabilityOptions
) {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

  return withObservability(async (request: Request, context?: unknown) => {
    const key = options.keyGenerator
      ? options.keyGenerator(request)
      : request.headers.get('x-forwarded-for') || 'anonymous';

    const now = Date.now();
    const entry = rateLimitMap.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetAt) {
      rateLimitMap.delete(key);
    }

    const current = entry && now <= entry.resetAt ? entry : { count: 0, resetAt: now + options.windowMs };

    // Check rate limit
    if (current.count >= options.limit) {
      observabilityLogger.rateLimit(key, options.limit, current.count, true);
      rateLimitTracker.record(key, options.limit, current.count, true);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: options.limit,
          resetAt: new Date(current.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // Increment counter
    current.count++;
    rateLimitMap.set(key, current);

    // Log rate limit status and track metric
    observabilityLogger.rateLimit(key, options.limit, current.count, false);
    rateLimitTracker.record(key, options.limit, current.count, false);

    // Execute handler
    return handler(request, context);
  }, options);
}

/**
 * Health check wrapper (skips logging and metrics)
 */
export function withHealthCheck(
  handler: (request: Request) => Promise<Response>
) {
  return withObservability(handler, {
    operation: 'health_check',
    skipLogging: true,
    skipMetrics: true,
  });
}
