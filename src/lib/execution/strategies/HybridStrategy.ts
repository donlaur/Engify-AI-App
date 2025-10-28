import {
  IExecutionStrategy,
  ExecutionContext,
  ExecutionResult,
  AIRequest,
  StrategyConfig,
} from '../interfaces/IExecutionStrategy';
import { StreamingStrategy } from './StreamingStrategy';
import { BatchStrategy } from './BatchStrategy';
import { CacheStrategy } from './CacheStrategy';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

/**
 * Hybrid execution strategy that adaptively chooses the best strategy
 */
export class HybridStrategy implements IExecutionStrategy {
  public readonly name = 'hybrid';
  public readonly config: StrategyConfig;

  private strategies: Map<string, IExecutionStrategy> = new Map();
  private executionHistory: Map<string, ExecutionMetrics> = new Map();

  constructor(
    private factory: AIProviderFactory,
    config?: Partial<StrategyConfig>
  ) {
    this.config = {
      name: 'hybrid',
      enabled: true,
      priority: 1, // Lowest priority - only used when others can't handle
      conditions: {
        userTier: 'any',
      },
      ...config,
    };

    // Initialize sub-strategies
    this.initializeStrategies();
  }

  /**
   * Execute AI request using the best available strategy
   */
  async execute(
    request: AIRequest,
    context: ExecutionContext,
    provider: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Select the best strategy
    const selectedStrategy = this.selectBestStrategy(request, context);

    if (!selectedStrategy) {
      throw new Error('No suitable execution strategy found');
    }

    try {
      // Execute using selected strategy
      const result = await selectedStrategy.execute(request, context, provider);

      // Record execution metrics
      this.recordExecutionMetrics(
        selectedStrategy.name,
        result.executionTime,
        context.userId,
        request
      );

      // Add hybrid-specific metadata
      result.strategy = `${this.name}:${selectedStrategy.name}`;
      result.executionTime = Date.now() - startTime;

      return result;
    } catch (error) {
      // Try fallback strategy
      const fallbackStrategy = this.selectFallbackStrategy(
        request,
        context,
        selectedStrategy.name
      );

      if (fallbackStrategy) {
        try {
          const fallbackResult = await fallbackStrategy.execute(
            request,
            context,
            provider
          );
          fallbackResult.strategy = `${this.name}:${fallbackStrategy.name}:fallback`;
          fallbackResult.executionTime = Date.now() - startTime;

          // Record fallback execution
          this.recordExecutionMetrics(
            `${fallbackStrategy.name}:fallback`,
            fallbackResult.executionTime,
            context.userId,
            request
          );

          return fallbackResult;
        } catch (fallbackError) {
          throw new Error(
            `Both primary and fallback strategies failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      throw error;
    }
  }

  /**
   * Check if this strategy can handle the request
   */
  canHandle(request: AIRequest, context: ExecutionContext): boolean {
    if (!this.config.enabled) return false;

    // Hybrid can handle any request if at least one sub-strategy can
    return Array.from(this.strategies.values()).some((strategy) =>
      strategy.canHandle(request, context)
    );
  }

  /**
   * Get strategy priority
   */
  getPriority(_request: AIRequest, _context: ExecutionContext): number {
    // Hybrid has lowest priority - only used when others can't handle
    return this.config.priority;
  }

  /**
   * Validate request
   */
  validateRequest(request: AIRequest, context: ExecutionContext): boolean {
    return !!(
      request.prompt &&
      request.prompt.length > 0 &&
      context.userId &&
      context.requestId
    );
  }

  /**
   * Get estimated execution time
   */
  getEstimatedTime(request: AIRequest, context: ExecutionContext): number {
    const selectedStrategy = this.selectBestStrategy(request, context);

    if (selectedStrategy) {
      return selectedStrategy.getEstimatedTime(request, context);
    }

    // Default estimate if no strategy can handle
    return 5000; // 5 seconds
  }

  /**
   * Initialize sub-strategies
   */
  private initializeStrategies(): void {
    // Create sub-strategies
    const streamingStrategy = new StreamingStrategy(this.factory);
    const batchStrategy = new BatchStrategy(this.factory);
    const cacheStrategy = new CacheStrategy(this.factory);

    // Register strategies
    this.strategies.set(streamingStrategy.name, streamingStrategy);
    this.strategies.set(batchStrategy.name, batchStrategy);
    this.strategies.set(cacheStrategy.name, cacheStrategy);
  }

  /**
   * Select the best strategy for the request
   */
  private selectBestStrategy(
    request: AIRequest,
    context: ExecutionContext
  ): IExecutionStrategy | null {
    const availableStrategies = Array.from(this.strategies.values())
      .filter((strategy) => strategy.canHandle(request, context))
      .sort((a, b) => {
        // Sort by priority first
        const priorityDiff =
          b.getPriority(request, context) - a.getPriority(request, context);
        if (priorityDiff !== 0) return priorityDiff;

        // Then by historical performance
        const aMetrics = this.getStrategyMetrics(a.name, context.userId);
        const bMetrics = this.getStrategyMetrics(b.name, context.userId);

        return (
          (bMetrics?.averageSuccessRate || 0) -
          (aMetrics?.averageSuccessRate || 0)
        );
      });

    return availableStrategies.length > 0 ? availableStrategies[0] : null;
  }

  /**
   * Select fallback strategy
   */
  private selectFallbackStrategy(
    request: AIRequest,
    context: ExecutionContext,
    failedStrategyName: string
  ): IExecutionStrategy | null {
    const availableStrategies = Array.from(this.strategies.values())
      .filter(
        (strategy) =>
          strategy.name !== failedStrategyName &&
          strategy.canHandle(request, context)
      )
      .sort(
        (a, b) =>
          b.getPriority(request, context) - a.getPriority(request, context)
      );

    return availableStrategies.length > 0 ? availableStrategies[0] : null;
  }

  /**
   * Record execution metrics
   */
  private recordExecutionMetrics(
    strategyName: string,
    executionTime: number,
    userId: string,
    _request: AIRequest
  ): void {
    const key = `${strategyName}:${userId}`;
    const metrics = this.executionHistory.get(key) || {
      strategyName,
      userId,
      totalExecutions: 0,
      successfulExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      averageSuccessRate: 0,
      lastExecution: Date.now(),
    };

    metrics.totalExecutions++;
    metrics.successfulExecutions++;
    metrics.totalExecutionTime += executionTime;
    metrics.averageExecutionTime =
      metrics.totalExecutionTime / metrics.totalExecutions;
    metrics.averageSuccessRate =
      metrics.successfulExecutions / metrics.totalExecutions;
    metrics.lastExecution = Date.now();

    this.executionHistory.set(key, metrics);
  }

  /**
   * Get strategy metrics for user
   */
  private getStrategyMetrics(
    strategyName: string,
    userId: string
  ): ExecutionMetrics | null {
    const key = `${strategyName}:${userId}`;
    return this.executionHistory.get(key) || null;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalStrategies: number;
    totalExecutions: number;
    strategyBreakdown: Record<
      string,
      {
        executions: number;
        successRate: number;
        averageTime: number;
      }
    >;
    userBreakdown: Record<
      string,
      {
        executions: number;
        favoriteStrategy: string;
      }
    >;
  } {
    const strategyBreakdown: Record<
      string,
      {
        executions: number;
        successRate: number;
        averageTime: number;
      }
    > = {};
    const userBreakdown: Record<
      string,
      {
        executions: number;
        favoriteStrategy: string;
      }
    > = {};
    let totalExecutions = 0;

    for (const metrics of this.executionHistory.values()) {
      // Strategy breakdown
      if (!strategyBreakdown[metrics.strategyName]) {
        strategyBreakdown[metrics.strategyName] = {
          executions: 0,
          successRate: 0,
          averageTime: 0,
        };
      }

      strategyBreakdown[metrics.strategyName].executions +=
        metrics.totalExecutions;
      strategyBreakdown[metrics.strategyName].successRate =
        metrics.averageSuccessRate;
      strategyBreakdown[metrics.strategyName].averageTime =
        metrics.averageExecutionTime;

      // User breakdown
      if (!userBreakdown[metrics.userId]) {
        userBreakdown[metrics.userId] = {
          executions: 0,
          favoriteStrategy: metrics.strategyName,
        };
      }

      userBreakdown[metrics.userId].executions += metrics.totalExecutions;

      // Update favorite strategy (most used)
      const currentFavorite = userBreakdown[metrics.userId].favoriteStrategy;
      const currentMetrics = this.executionHistory.get(
        `${currentFavorite}:${metrics.userId}`
      );
      if (
        !currentMetrics ||
        metrics.totalExecutions > currentMetrics.totalExecutions
      ) {
        userBreakdown[metrics.userId].favoriteStrategy = metrics.strategyName;
      }

      totalExecutions += metrics.totalExecutions;
    }

    return {
      totalStrategies: this.strategies.size,
      totalExecutions,
      strategyBreakdown,
      userBreakdown,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Cleanup sub-strategies
    for (const strategy of this.strategies.values()) {
      if (strategy.cleanup) {
        await strategy.cleanup();
      }
    }

    // Clear execution history (keep only recent entries)
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    for (const [key, metrics] of this.executionHistory.entries()) {
      if (metrics.lastExecution < cutoffTime) {
        this.executionHistory.delete(key);
      }
    }
  }
}

/**
 * Execution metrics interface
 */
interface ExecutionMetrics {
  strategyName: string;
  userId: string;
  totalExecutions: number;
  successfulExecutions: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  averageSuccessRate: number;
  lastExecution: number;
}
