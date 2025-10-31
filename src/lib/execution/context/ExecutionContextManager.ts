import {
  IExecutionStrategy,
  ExecutionContext,
  ExecutionResult,
  AIRequest,
  ProviderFactory,
} from '../interfaces/IExecutionStrategy';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

export class ExecutionContextManager {
  private strategies: Map<string, IExecutionStrategy> = new Map();
  constructor(
    private readonly providerFactory: ProviderFactory = AIProviderFactory
  ) {}

  /**
   * Register an execution strategy
   */
  registerStrategy(strategy: IExecutionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Unregister an execution strategy
   */
  unregisterStrategy(name: string): void {
    this.strategies.delete(name);
  }

  /**
   * Get all registered strategies
   */
  getStrategies(): IExecutionStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Select the best strategy for a given request and context
   */
  selectStrategy(
    request: AIRequest,
    context: ExecutionContext
  ): IExecutionStrategy | null {
    const availableStrategies = this.getStrategies()
      .filter((strategy) => strategy.canHandle(request, context))
      .sort(
        (a, b) =>
          b.getPriority(request, context) - a.getPriority(request, context)
      );

    return availableStrategies.length > 0 ? availableStrategies[0] : null;
  }

  /**
   * Execute request using the best available strategy
   */
  async execute(
    request: AIRequest,
    context: ExecutionContext,
    provider: string
  ): Promise<ExecutionResult> {
    const strategy = this.selectStrategy(request, context);

    if (!strategy) {
      throw new Error(
        `No suitable execution strategy found for request: ${context.requestId}`
      );
    }

    // Validate request
    if (!strategy.validateRequest(request, context)) {
      throw new Error(
        `Request validation failed for strategy: ${strategy.name}`
      );
    }

    // Get AI provider
    const aiProvider = this.providerFactory.create(provider);
    if (!aiProvider) {
      throw new Error(`AI provider not found: ${provider}`);
    }

    const startTime = Date.now();

    try {
      // Execute using selected strategy
      const result = await strategy.execute(request, context, provider);

      // Add execution metadata
      result.executionTime = Math.max(1, Date.now() - startTime);
      result.strategy = strategy.name;

      return result;
    } catch (error) {
      // Handle execution errors
      throw new Error(
        `Execution failed with strategy ${strategy.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    totalStrategies: number;
    enabledStrategies: number;
    strategyNames: string[];
  } {
    const strategies = this.getStrategies();
    return {
      totalStrategies: strategies.length,
      enabledStrategies: strategies.filter((s) => s.config.enabled).length,
      strategyNames: strategies.map((s) => s.name),
    };
  }

  /**
   * Validate all strategies
   */
  validateStrategies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const strategy of this.getStrategies()) {
      try {
        // Basic validation
        if (!strategy.name) {
          errors.push(`Strategy missing name`);
        }
        if (!strategy.config) {
          errors.push(`Strategy ${strategy.name} missing config`);
        }
        if (typeof strategy.execute !== 'function') {
          errors.push(`Strategy ${strategy.name} missing execute method`);
        }
      } catch (error) {
        errors.push(
          `Strategy ${strategy.name} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
