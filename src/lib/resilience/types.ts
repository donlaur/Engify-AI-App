/**
 * Circuit Breaker Types and Interfaces
 *
 * Defines comprehensive circuit breaker infrastructure for fault tolerance,
 * resilience, and graceful degradation in distributed systems.
 */

/**
 * Circuit Breaker States
 */
export type CircuitBreakerState = 
  | 'closed'      // Normal operation, requests pass through
  | 'open'         // Circuit is open, requests fail fast
  | 'half-open';  // Testing if service has recovered

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  readonly name: string;
  readonly failureThreshold: number;        // Number of failures before opening
  readonly successThreshold: number;        // Number of successes to close from half-open
  readonly timeout: number;                 // Time in ms before trying half-open
  readonly requestTimeout: number;          // Timeout for individual requests
  readonly volumeThreshold: number;         // Minimum requests before considering failure rate
  readonly errorThresholdPercentage: number; // Percentage of failures to trigger open
  readonly resetTimeout: number;            // Time in ms before attempting reset
  readonly monitoringPeriod: number;        // Time window for monitoring metrics
}

/**
 * Circuit Breaker Metrics
 */
export interface CircuitBreakerMetrics {
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly totalRequests: number;
  readonly failureRate: number;
  readonly lastFailureTime: Date | null;
  readonly lastSuccessTime: Date | null;
  readonly stateChangedAt: Date;
  readonly nextAttemptTime: Date | null;
}

/**
 * Circuit Breaker Result
 */
export interface CircuitBreakerResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly circuitState: CircuitBreakerState;
  readonly executionTime: number;
  readonly timestamp: Date;
  readonly fromCache?: boolean;
}

/**
 * Circuit Breaker Error Types
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly circuitName: string,
    public readonly state: CircuitBreakerState,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitOpenError extends CircuitBreakerError {
  constructor(circuitName: string, nextAttemptTime: Date) {
    super(
      `Circuit breaker '${circuitName}' is open. Next attempt at ${nextAttemptTime.toISOString()}`,
      circuitName,
      'open'
    );
    this.name = 'CircuitOpenError';
  }
}

export class CircuitTimeoutError extends CircuitBreakerError {
  constructor(circuitName: string, timeout: number) {
    super(
      `Circuit breaker '${circuitName}' request timed out after ${timeout}ms`,
      circuitName,
      'closed'
    );
    this.name = 'CircuitTimeoutError';
  }
}

/**
 * Circuit Breaker Interface
 */
export interface ICircuitBreaker {
  readonly name: string;
  readonly config: CircuitBreakerConfig;
  
  // Core operations
  execute<T>(operation: () => Promise<T>): Promise<CircuitBreakerResult<T>>;
  executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>>;
  
  // State management
  getState(): CircuitBreakerState;
  getMetrics(): CircuitBreakerMetrics;
  reset(): void;
  forceOpen(): void;
  forceClose(): void;
  
  // Event handling
  onStateChange(callback: (state: CircuitBreakerState) => void): void;
  onFailure(callback: (error: Error) => void): void;
  onSuccess(callback: (result: any) => void): void;
}

/**
 * Circuit Breaker Event Handlers
 */
export interface ICircuitBreakerEventHandler {
  onStateChange(state: CircuitBreakerState, circuitName: string): void;
  onFailure(error: Error, circuitName: string): void;
  onSuccess(result: any, circuitName: string): void;
  onTimeout(timeout: number, circuitName: string): void;
}

/**
 * Circuit Breaker Manager Interface
 */
export interface ICircuitBreakerManager {
  readonly name: string;
  
  // Circuit management
  createCircuit(config: CircuitBreakerConfig): ICircuitBreaker;
  getCircuit(name: string): ICircuitBreaker | null;
  removeCircuit(name: string): boolean;
  listCircuits(): string[];
  
  // Global operations
  resetAll(): void;
  getGlobalMetrics(): Record<string, CircuitBreakerMetrics>;
  
  // Event handling
  registerEventHandler(handler: ICircuitBreakerEventHandler): void;
  unregisterEventHandler(handler: ICircuitBreakerEventHandler): void;
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  readonly maxAttempts: number;
  readonly baseDelay: number;           // Base delay in ms
  readonly maxDelay: number;            // Maximum delay in ms
  readonly backoffMultiplier: number;   // Exponential backoff multiplier
  readonly jitter: boolean;             // Add random jitter to delays
}

/**
 * Bulkhead Configuration
 */
export interface BulkheadConfig {
  readonly name: string;
  readonly maxConcurrency: number;      // Maximum concurrent operations
  readonly maxQueueSize: number;        // Maximum queued operations
  readonly queueTimeout: number;        // Timeout for queued operations
}

/**
 * Timeout Configuration
 */
export interface TimeoutConfig {
  readonly name: string;
  readonly timeout: number;             // Timeout in ms
  readonly abortSignal?: AbortSignal;  // Abort signal for cancellation
}

/**
 * Resilience Patterns Configuration
 */
export interface ResilienceConfig {
  readonly circuitBreaker?: CircuitBreakerConfig;
  readonly retry?: RetryConfig;
  readonly bulkhead?: BulkheadConfig;
  readonly timeout?: TimeoutConfig;
}

/**
 * Resilience Result
 */
export interface ResilienceResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly attempts: number;
  readonly totalExecutionTime: number;
  readonly circuitState: CircuitBreakerState;
  readonly fromCache?: boolean;
  readonly timestamp: Date;
}

/**
 * Resilience Decorator Interface
 */
export interface IResilienceDecorator {
  readonly name: string;
  
  // Decorator methods
  decorate<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig
  ): Promise<ResilienceResult<T>>;
  
  decorateWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    config: ResilienceConfig
  ): Promise<ResilienceResult<T>>;
  
  // Configuration
  updateConfig(config: ResilienceConfig): void;
  getConfig(): ResilienceConfig;
}

/**
 * Health Check Interface
 */
export interface IHealthCheck {
  readonly name: string;
  readonly timeout: number;
  
  check(): Promise<HealthCheckResult>;
}

/**
 * Health Check Result
 */
export interface HealthCheckResult {
  readonly healthy: boolean;
  readonly responseTime: number;
  readonly error?: string;
  readonly timestamp: Date;
  readonly metadata?: Record<string, any>;
}

/**
 * Service Discovery Interface
 */
export interface IServiceDiscovery {
  readonly name: string;
  
  // Service management
  registerService(service: ServiceInfo): Promise<void>;
  unregisterService(serviceId: string): Promise<void>;
  discoverServices(serviceName: string): Promise<ServiceInfo[]>;
  
  // Health monitoring
  getHealthyServices(serviceName: string): Promise<ServiceInfo[]>;
  getServiceHealth(serviceId: string): Promise<HealthCheckResult>;
}

/**
 * Service Information
 */
export interface ServiceInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly endpoint: string;
  readonly healthCheckEndpoint?: string;
  readonly metadata?: Record<string, any>;
  readonly tags?: string[];
  readonly lastSeen: Date;
}

/**
 * Load Balancer Interface
 */
export interface ILoadBalancer {
  readonly name: string;
  readonly strategy: LoadBalancingStrategy;
  
  selectService(services: ServiceInfo[]): ServiceInfo | null;
  updateServiceHealth(serviceId: string, healthy: boolean): void;
}

/**
 * Load Balancing Strategies
 */
export type LoadBalancingStrategy = 
  | 'round-robin'
  | 'random'
  | 'least-connections'
  | 'weighted-round-robin'
  | 'ip-hash'
  | 'consistent-hash';

/**
 * Circuit Breaker Registry Interface
 */
export interface ICircuitBreakerRegistry {
  readonly name: string;
  
  // Registry operations
  register(circuit: ICircuitBreaker): void;
  unregister(name: string): boolean;
  get(name: string): ICircuitBreaker | null;
  getAll(): ICircuitBreaker[];
  
  // Bulk operations
  resetAll(): void;
  getGlobalState(): Record<string, CircuitBreakerState>;
  getGlobalMetrics(): Record<string, CircuitBreakerMetrics>;
}
