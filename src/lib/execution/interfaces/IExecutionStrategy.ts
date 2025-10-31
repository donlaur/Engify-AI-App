import {
  AIRequest,
  AIResponse,
  AIProvider,
} from '@/lib/ai/v2/interfaces/AIProvider';

// Re-export AIRequest for convenience (Phase 2: Export missing types)
export type { AIRequest, AIResponse };

export interface ProviderFactory {
  create(providerName: string): AIProvider;
}

/**
 * Execution context for strategy decisions
 */
export interface ExecutionContext {
  userId: string;
  requestId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timeout?: number;
  retryCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Execution result with strategy-specific information
 */
export interface ExecutionResult {
  response: AIResponse;
  strategy: string;
  executionTime: number;
  cacheHit?: boolean;
  batchSize?: number;
  streamed?: boolean;
}

/**
 * Strategy configuration for different execution patterns
 */
export interface StrategyConfig {
  name: string;
  enabled: boolean;
  priority: number;
  conditions?: {
    maxTokens?: number;
    minTokens?: number;
    userTier?: string;
    timeOfDay?: string;
  };
}

/**
 * Base interface for all execution strategies
 */
export interface IExecutionStrategy {
  readonly name: string;
  readonly config: StrategyConfig;

  /**
   * Execute AI request using this strategy
   */
  execute(
    request: AIRequest,
    context: ExecutionContext,
    provider: string
  ): Promise<ExecutionResult>;

  /**
   * Check if this strategy can handle the given request
   */
  canHandle(request: AIRequest, context: ExecutionContext): boolean;

  /**
   * Get strategy priority for request selection
   */
  getPriority(request: AIRequest, context: ExecutionContext): number;

  /**
   * Validate request before execution
   */
  validateRequest(request: AIRequest, context: ExecutionContext): boolean;

  /**
   * Get estimated execution time
   */
  getEstimatedTime(request: AIRequest, context: ExecutionContext): number;

  /**
   * Cleanup resources after execution
   */
  cleanup?(): Promise<void>;
}

/**
 * Streaming-specific interface for real-time execution
 */
export interface IStreamingStrategy extends IExecutionStrategy {
  /**
   * Execute with streaming support
   */
  executeStream(
    request: AIRequest,
    context: ExecutionContext,
    provider: string,
    onChunk: (chunk: string) => void,
    onComplete: (result: ExecutionResult) => void,
    onError: (error: Error) => void
  ): Promise<void>;
}

/**
 * Batch-specific interface for bulk processing
 */
export interface IBatchStrategy extends IExecutionStrategy {
  /**
   * Add request to batch queue
   */
  addToBatch(
    request: AIRequest,
    context: ExecutionContext,
    provider: string
  ): Promise<string>;

  /**
   * Process entire batch
   */
  processBatch(batchId: string): Promise<ExecutionResult[]>;

  /**
   * Get batch status
   */
  getBatchStatus(batchId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    size: number;
    completed: number;
    estimatedCompletion?: Date;
  }>;
}

/**
 * Cache-specific interface for response caching
 */
export interface ICacheStrategy extends IExecutionStrategy {
  /**
   * Check if request can be served from cache
   */
  getCachedResponse(
    request: AIRequest,
    context: ExecutionContext
  ): Promise<ExecutionResult | null>;

  /**
   * Store response in cache
   */
  cacheResponse(
    request: AIRequest,
    context: ExecutionContext,
    result: ExecutionResult
  ): Promise<void>;

  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern: string): Promise<void>;
}
