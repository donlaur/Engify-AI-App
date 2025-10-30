/**
 * Circuit Breaker Implementation
 *
 * Provides fault tolerance and resilience for distributed systems by
 * implementing the Circuit Breaker pattern with configurable thresholds,
 * timeouts, and state management.
 */

import {
  ICircuitBreaker,
  CircuitBreakerConfig,
  CircuitBreakerState,
  CircuitBreakerMetrics,
  CircuitBreakerResult,
  // CircuitBreakerError,
  CircuitOpenError,
  CircuitTimeoutError,
  ICircuitBreakerEventHandler,
} from './types';

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker implements ICircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private totalRequests = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private stateChangedAt = new Date();
  private nextAttemptTime: Date | null = null;
  private eventHandlers: ICircuitBreakerEventHandler[] = [];

  constructor(
    public readonly name: string,
    public readonly config: CircuitBreakerConfig
  ) {}

  /**
   * Execute an operation through the circuit breaker
   */
  async execute<T>(
    operation: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();

    try {
      // Check if circuit is open
      if (this.state === 'open') {
        if (
          this.nextAttemptTime &&
          Date.now() < this.nextAttemptTime.getTime()
        ) {
          throw new CircuitOpenError(this.name, this.nextAttemptTime);
        }

        // Try to transition to half-open
        this.transitionToState('half-open');
      }

      // Execute the operation with timeout
      const result = await this.executeWithTimeout(operation);

      // Record success
      this.recordSuccess();

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        circuitState: this.state,
        executionTime,
        timestamp: new Date(),
      };
    } catch (error) {
      // Record failure
      this.recordFailure(
        error instanceof Error ? error : new Error('Unknown error')
      );

      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        circuitState: this.state,
        executionTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Execute an operation with fallback
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>> {
    const result = await this.execute(operation);

    if (result.success) {
      return result;
    }

    // If circuit breaker fails, try fallback
    try {
      const fallbackResult = await fallback();

      return {
        success: true,
        data: fallbackResult,
        circuitState: this.state,
        executionTime: result.executionTime,
        timestamp: new Date(),
        fromCache: true,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Primary operation failed: ${result.error}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        circuitState: this.state,
        executionTime: result.executionTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const failureRate =
      this.totalRequests > 0
        ? (this.failureCount / this.totalRequests) * 100
        : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      failureRate,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.totalRequests = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = null;
    this.transitionToState('closed');
  }

  /**
   * Force circuit breaker to open state
   */
  forceOpen(): void {
    this.transitionToState('open');
    this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
  }

  /**
   * Force circuit breaker to closed state
   */
  forceClose(): void {
    this.transitionToState('closed');
    this.nextAttemptTime = null;
  }

  /**
   * Register event handler
   */
  onStateChange(callback: (state: CircuitBreakerState) => void): void {
    this.eventHandlers.push({
      onStateChange: (state, _circuitName) => callback(state),
      onFailure: () => {},
      onSuccess: () => {},
      onTimeout: () => {},
    });
  }

  /**
   * Register failure event handler
   */
  onFailure(callback: (error: Error) => void): void {
    this.eventHandlers.push({
      onStateChange: () => {},
      onFailure: (error, _circuitName) => callback(error),
      onSuccess: () => {},
      onTimeout: () => {},
    });
  }

  /**
   * Register success event handler
   */
  onSuccess(callback: (result: unknown) => void): void {
    this.eventHandlers.push({
      onStateChange: () => {},
      onFailure: () => {},
      onSuccess: (result, _circuitName) => callback(result),
      onTimeout: () => {},
    });
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new CircuitTimeoutError(this.name, this.config.requestTimeout));
      }, this.config.requestTimeout);

      operation()
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Record a successful operation
   */
  private recordSuccess(): void {
    this.successCount++;
    this.totalRequests++;
    this.lastSuccessTime = new Date();

    // Notify event handlers
    this.eventHandlers.forEach((handler) => {
      try {
        handler.onSuccess({ timestamp: new Date() }, this.config.name);
      } catch (error) {
        console.warn('Error in success event handler:', error);
      }
    });

    // Check if we should transition from half-open to closed
    if (
      this.state === 'half-open' &&
      this.successCount >= this.config.successThreshold
    ) {
      this.transitionToState('closed');
    }
  }

  /**
   * Record a failed operation
   */
  private recordFailure(error: Error): void {
    this.failureCount++;
    this.totalRequests++;
    this.lastFailureTime = new Date();

    // Notify event handlers
    this.eventHandlers.forEach((handler) => {
      try {
        handler.onFailure(error, this.config.name);
      } catch (handlerError) {
        console.warn('Error in failure event handler:', handlerError);
      }
    });

    // Check if we should open the circuit
    if (this.shouldOpenCircuit()) {
      this.transitionToState('open');
      this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
    }
  }

  /**
   * Check if circuit should be opened
   */
  private shouldOpenCircuit(): boolean {
    // Check failure threshold
    if (this.failureCount >= this.config.failureThreshold) {
      return true;
    }

    // Check failure rate threshold
    if (this.totalRequests >= this.config.volumeThreshold) {
      const failureRate = (this.failureCount / this.totalRequests) * 100;
      if (failureRate >= this.config.errorThresholdPercentage) {
        return true;
      }
    }

    return false;
  }

  /**
   * Transition to a new state
   */
  private transitionToState(newState: CircuitBreakerState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.stateChangedAt = new Date();

      // Notify event handlers
      this.eventHandlers.forEach((handler) => {
        try {
          handler.onStateChange(newState, this.name);
        } catch (error) {
          console.warn('Error in state change event handler:', error);
        }
      });

      console.log(
        `Circuit breaker '${this.name}' transitioned from ${oldState} to ${newState}`
      );
    }
  }
}
