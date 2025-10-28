import {
  IExecutionStrategy,
  ExecutionContext,
  AIRequest,
  StrategyConfig,
} from '../interfaces/IExecutionStrategy';
import { StreamingStrategy } from '../strategies/StreamingStrategy';
import { BatchStrategy } from '../strategies/BatchStrategy';
import { CacheStrategy } from '../strategies/CacheStrategy';
import { HybridStrategy } from '../strategies/HybridStrategy';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

/**
 * Factory for creating and managing execution strategies
 */
export class ExecutionStrategyFactory {
  private strategies: Map<string, IExecutionStrategy> = new Map();
  private factory: AIProviderFactory;

  constructor(factory: AIProviderFactory) {
    this.factory = factory;
    this.initializeDefaultStrategies();
  }

  /**
   * Create a strategy by name
   */
  createStrategy(
    name: string,
    config?: Partial<StrategyConfig>
  ): IExecutionStrategy | null {
    switch (name.toLowerCase()) {
      case 'streaming':
        return new StreamingStrategy(this.factory, config);

      case 'batch':
        return new BatchStrategy(this.factory, config);

      case 'cache':
        return new CacheStrategy(this.factory, config);

      case 'hybrid':
        return new HybridStrategy(this.factory, config);

      default:
        return null;
    }
  }

  /**
   * Register a custom strategy
   */
  registerStrategy(strategy: IExecutionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Get strategy by name
   */
  getStrategy(name: string): IExecutionStrategy | null {
    return this.strategies.get(name) || null;
  }

  /**
   * Get strategies that can handle a request
   */
  getCompatibleStrategies(
    request: AIRequest,
    context: ExecutionContext
  ): IExecutionStrategy[] {
    return Array.from(this.strategies.values())
      .filter((strategy) => strategy.canHandle(request, context))
      .sort(
        (a, b) =>
          b.getPriority(request, context) - a.getPriority(request, context)
      );
  }

  /**
   * Get the best strategy for a request
   */
  getBestStrategy(
    request: AIRequest,
    context: ExecutionContext
  ): IExecutionStrategy | null {
    const compatibleStrategies = this.getCompatibleStrategies(request, context);
    return compatibleStrategies.length > 0 ? compatibleStrategies[0] : null;
  }

  /**
   * Initialize default strategies
   */
  private initializeDefaultStrategies(): void {
    // Create and register default strategies
    const streamingStrategy = new StreamingStrategy(this.factory);
    const batchStrategy = new BatchStrategy(this.factory);
    const cacheStrategy = new CacheStrategy(this.factory);
    const hybridStrategy = new HybridStrategy(this.factory);

    this.strategies.set(streamingStrategy.name, streamingStrategy);
    this.strategies.set(batchStrategy.name, batchStrategy);
    this.strategies.set(cacheStrategy.name, cacheStrategy);
    this.strategies.set(hybridStrategy.name, hybridStrategy);
  }
}
