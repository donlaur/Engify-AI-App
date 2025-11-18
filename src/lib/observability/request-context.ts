/**
 * Request Context and ID Management
 *
 * Provides request ID generation and context propagation for distributed tracing.
 * Uses AsyncLocalStorage for automatic context propagation across async operations.
 *
 * Usage:
 *   import { RequestContext } from '@/lib/observability/request-context';
 *
 *   // In middleware:
 *   RequestContext.run({ requestId, userId, operation }, async () => {
 *     // All code here has access to context
 *     const ctx = RequestContext.get();
 *   });
 */

import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes } from 'crypto';

export interface RequestContextData {
  requestId: string;
  userId?: string;
  operation?: string;
  startTime: number;
  metadata?: Record<string, unknown>;
}

// AsyncLocalStorage for context propagation
const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  /**
   * Generate a unique request ID
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  /**
   * Run code with request context
   */
  static run<T>(
    context: Omit<RequestContextData, 'startTime'> & { startTime?: number },
    callback: () => T
  ): T {
    const fullContext: RequestContextData = {
      ...context,
      startTime: context.startTime || Date.now(),
    };
    return asyncLocalStorage.run(fullContext, callback);
  }

  /**
   * Get current request context
   */
  static get(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Get request ID from context
   */
  static getRequestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  }

  /**
   * Get user ID from context
   */
  static getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Get operation name from context
   */
  static getOperation(): string | undefined {
    return asyncLocalStorage.getStore()?.operation;
  }

  /**
   * Get request duration in milliseconds
   */
  static getDuration(): number | undefined {
    const context = asyncLocalStorage.getStore();
    if (!context) return undefined;
    return Date.now() - context.startTime;
  }

  /**
   * Update context metadata
   */
  static updateMetadata(metadata: Record<string, unknown>): void {
    const context = asyncLocalStorage.getStore();
    if (context) {
      context.metadata = { ...context.metadata, ...metadata };
    }
  }

  /**
   * Get context as log-friendly object
   */
  static toLogContext(): Record<string, unknown> {
    const context = asyncLocalStorage.getStore();
    if (!context) return {};

    return {
      requestId: context.requestId,
      userId: context.userId,
      operation: context.operation,
      duration: Date.now() - context.startTime,
      ...context.metadata,
    };
  }
}

/**
 * Extract request ID from headers (for distributed tracing)
 */
export function getRequestIdFromHeaders(headers: Headers): string | undefined {
  const requestId = headers.get('x-request-id') || headers.get('x-correlation-id') || headers.get('x-trace-id');
  return requestId ?? undefined;
}

/**
 * Create request context from Next.js request
 */
export function createRequestContext(
  request: Request,
  options?: {
    userId?: string;
    operation?: string;
  }
): Omit<RequestContextData, 'startTime'> {
  const headers = request.headers;
  const requestId =
    getRequestIdFromHeaders(headers) || RequestContext.generateRequestId();

  return {
    requestId,
    userId: options?.userId,
    operation: options?.operation || new URL(request.url).pathname,
    metadata: {
      method: request.method,
      url: request.url,
      userAgent: headers.get('user-agent') || undefined,
    },
  };
}
