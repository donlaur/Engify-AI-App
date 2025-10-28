/**
 * Resilience Decorator Implementation
 *
 * Combines Circuit Breaker with Retry, Timeout, and Bulkhead patterns
 * to provide comprehensive resilience for distributed systems.
 */

import {
  IResilienceDecorator,
  ResilienceConfig,
  ResilienceResult,
  RetryConfig,
  BulkheadConfig,
  TimeoutConfig,
  CircuitBreakerConfig,
} from './types';
import { CircuitBreakerManager } from './CircuitBreakerManager';
import { CircuitBreaker } from './CircuitBreaker';

/**
 * Resilience Decorator Implementation
 */
export class ResilienceDecorator implements IResilienceDecorator {
  private circuitBreakerManager: CircuitBreakerManager;
  private activeOperations = new Map<string, Promise<any>>();
  private operationQueue: Array<() => Promise<any>> = [];
  private maxConcurrency: number;
  private maxQueueSize: number;
  private queueTimeout: number;

  constructor(
    public readonly name: string,
    private config: ResilienceConfig
  ) {
    this.circuitBreakerManager = new CircuitBreakerManager(`${name}-manager`);
    this.maxConcurrency = config.bulkhead?.maxConcurrency || 10;
    this.maxQueueSize = config.bulkhead?.maxQueueSize || 100;
    this.queueTimeout = config.bulkhead?.queueTimeout || 30000;
  }

  /**
   * Decorate an operation with resilience patterns
   */
  async decorate<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig
  ): Promise<ResilienceResult<T>> {
    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | null = null;

    // Update configuration
    this.updateConfig(config);

    try {
      // Apply bulkhead pattern
      const result = await this.executeWithBulkhead(async () => {
        // Apply retry pattern
        return await this.executeWithRetry(async () => {
          attempts++;
          // Apply circuit breaker pattern
          return await this.executeWithCircuitBreaker(operation);
        });
      });

      const totalExecutionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        attempts,
        totalExecutionTime,
        circuitState: 'closed', // Will be updated by circuit breaker
        timestamp: new Date(),
      };

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      lastError = error instanceof Error ? error : new Error('Unknown error');

      return {
        success: false,
        error: lastError.message,
        attempts,
        totalExecutionTime,
        circuitState: 'open', // Will be updated by circuit breaker
        timestamp: new Date(),
      };
    }
  }

  /**
   * Decorate an operation with fallback
   */
  async decorateWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    config: ResilienceConfig
  ): Promise<ResilienceResult<T>> {
    const result = await this.decorate(operation, config);
    
    if (result.success) {
      return result;
    }
    
    // Try fallback operation
    try {
      const fallbackResult = await fallback();
      
      return {
        success: true,
        data: fallbackResult,
        attempts: result.attempts,
        totalExecutionTime: result.totalExecutionTime,
        circuitState: result.circuitState,
        fromCache: true,
        timestamp: new Date(),
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Primary operation failed: ${result.error}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        attempts: result.attempts,
        totalExecutionTime: result.totalExecutionTime,
        circuitState: result.circuitState,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: ResilienceConfig): void {
    this.config = { ...this.config, ...config };
    
    // Update bulkhead settings
    if (config.bulkhead) {
      this.maxConcurrency = config.bulkhead.maxConcurrency;
      this.maxQueueSize = config.bulkhead.maxQueueSize;
      this.queueTimeout = config.bulkhead.queueTimeout;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ResilienceConfig {
    return { ...this.config };
  }

  /**
   * Execute operation with circuit breaker
   */
  private async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.circuitBreaker) {
      return await operation();
    }

    const circuitName = this.config.circuitBreaker.name;
    let circuit = this.circuitBreakerManager.getCircuit(circuitName);
    
    if (!circuit) {
      circuit = this.circuitBreakerManager.createCircuit(this.config.circuitBreaker);
    }

    const result = await circuit.execute(operation);
    
    if (!result.success) {
      throw new Error(result.error || 'Circuit breaker operation failed');
    }

    return result.data as T;
  }

  /**
   * Execute operation with retry pattern
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.retry) {
      return await operation();
    }

    const { maxAttempts, baseDelay, maxDelay, backoffMultiplier, jitter } = this.config.retry;
    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on the last attempt
        if (attempt === maxAttempts - 1) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        // Add jitter if enabled
        const finalDelay = jitter ? delay + Math.random() * delay * 0.1 : delay;

        await this.sleep(finalDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Execute operation with bulkhead pattern
   */
  private async executeWithBulkhead<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.bulkhead) {
      return await operation();
    }

    // Check if we can execute immediately
    if (this.activeOperations.size < this.maxConcurrency) {
      return await this.executeOperation(operation);
    }

    // Check if queue has space
    if (this.operationQueue.length >= this.maxQueueSize) {
      throw new Error('Bulkhead queue is full');
    }

    // Queue the operation
    return new Promise((resolve, reject) => {
      const queuedOperation = async () => {
        try {
          const result = await this.executeOperation(operation);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.operationQueue.push(queuedOperation);

      // Set timeout for queued operation
      setTimeout(() => {
        const index = this.operationQueue.indexOf(queuedOperation);
        if (index > -1) {
          this.operationQueue.splice(index, 1);
          reject(new Error('Bulkhead operation timed out'));
        }
      }, this.queueTimeout);

      // Try to process queued operations
      this.processQueue();
    });
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.timeout) {
      return await operation();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const timeoutMs = this.config.timeout?.timeout || 5000;
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, this.config.timeout?.timeout || 5000);

      operation()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Execute an operation and track it
   */
  private async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
    const operationId = `op-${Date.now()}-${Math.random()}`;
    
    try {
      const promise = this.executeWithTimeout(operation);
      this.activeOperations.set(operationId, promise);
      
      const result = await promise;
      return result;
    } finally {
      this.activeOperations.delete(operationId);
      // Try to process queued operations
      this.processQueue();
    }
  }

  /**
   * Process queued operations
   */
  private processQueue(): void {
    while (this.operationQueue.length > 0 && this.activeOperations.size < this.maxConcurrency) {
      const operation = this.operationQueue.shift();
      if (operation) {
        operation();
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current metrics
   */
  getMetrics(): {
    activeOperations: number;
    queuedOperations: number;
    circuitBreakerMetrics: Record<string, any>;
  } {
    return {
      activeOperations: this.activeOperations.size,
      queuedOperations: this.operationQueue.length,
      circuitBreakerMetrics: this.circuitBreakerManager.getGlobalMetrics(),
    };
  }

  /**
   * Reset all circuit breakers
   */
  reset(): void {
    this.circuitBreakerManager.resetAll();
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Wait for active operations to complete
    await Promise.allSettled(Array.from(this.activeOperations.values()));
    
    // Clear queue
    this.operationQueue = [];
    this.activeOperations.clear();
  }
}
