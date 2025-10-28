/**
 * Circuit Breaker Manager Implementation
 *
 * Manages multiple circuit breakers and provides centralized monitoring,
 * configuration, and event handling for resilience patterns.
 */

import {
  ICircuitBreakerManager,
  ICircuitBreaker,
  CircuitBreakerConfig,
  CircuitBreakerMetrics,
  CircuitBreakerState,
  ICircuitBreakerEventHandler,
} from './types';
import { CircuitBreaker } from './CircuitBreaker';

/**
 * Circuit Breaker Manager Implementation
 */
export class CircuitBreakerManager implements ICircuitBreakerManager {
  private circuits = new Map<string, ICircuitBreaker>();
  private eventHandlers: ICircuitBreakerEventHandler[] = [];

  constructor(public readonly name: string = 'default-manager') {}

  /**
   * Create a new circuit breaker
   */
  createCircuit(config: CircuitBreakerConfig): ICircuitBreaker {
    if (this.circuits.has(config.name)) {
      throw new Error(`Circuit breaker '${config.name}' already exists`);
    }

    const circuit = new CircuitBreaker(config.name, config);
    
    // Register global event handlers
    this.eventHandlers.forEach(handler => {
      circuit.onStateChange(state => handler.onStateChange(state, config.name));
      circuit.onFailure(error => handler.onFailure(error, config.name));
      circuit.onSuccess(result => handler.onSuccess(result, config.name));
    });

    this.circuits.set(config.name, circuit);
    
    console.log(`Created circuit breaker '${config.name}'`);
    return circuit;
  }

  /**
   * Get a circuit breaker by name
   */
  getCircuit(name: string): ICircuitBreaker | null {
    return this.circuits.get(name) || null;
  }

  /**
   * Remove a circuit breaker
   */
  removeCircuit(name: string): boolean {
    const removed = this.circuits.delete(name);
    if (removed) {
      console.log(`Removed circuit breaker '${name}'`);
    }
    return removed;
  }

  /**
   * List all circuit breaker names
   */
  listCircuits(): string[] {
    return Array.from(this.circuits.keys());
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuits.forEach(circuit => {
      circuit.reset();
    });
    console.log('Reset all circuit breakers');
  }

  /**
   * Get global metrics for all circuit breakers
   */
  getGlobalMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    this.circuits.forEach((circuit, name) => {
      metrics[name] = circuit.getMetrics();
    });
    
    return metrics;
  }

  /**
   * Register a global event handler
   */
  registerEventHandler(handler: ICircuitBreakerEventHandler): void {
    this.eventHandlers.push(handler);
    
    // Register handler with existing circuits
    this.circuits.forEach((circuit, name) => {
      circuit.onStateChange(state => handler.onStateChange(state, name));
      circuit.onFailure(error => handler.onFailure(error, name));
      circuit.onSuccess(result => handler.onSuccess(result, name));
    });
  }

  /**
   * Unregister an event handler
   */
  unregisterEventHandler(handler: ICircuitBreakerEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get global state of all circuit breakers
   */
  getGlobalState(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {};
    
    this.circuits.forEach((circuit, name) => {
      states[name] = circuit.getState();
    });
    
    return states;
  }

  /**
   * Get circuit breakers by state
   */
  getCircuitsByState(state: CircuitBreakerState): ICircuitBreaker[] {
    return Array.from(this.circuits.values()).filter(
      circuit => circuit.getState() === state
    );
  }

  /**
   * Get unhealthy circuit breakers (open or half-open)
   */
  getUnhealthyCircuits(): ICircuitBreaker[] {
    return Array.from(this.circuits.values()).filter(
      circuit => circuit.getState() !== 'closed'
    );
  }

  /**
   * Force open all circuit breakers
   */
  forceOpenAll(): void {
    this.circuits.forEach(circuit => {
      circuit.forceOpen();
    });
    console.log('Forced open all circuit breakers');
  }

  /**
   * Force close all circuit breakers
   */
  forceCloseAll(): void {
    this.circuits.forEach(circuit => {
      circuit.forceClose();
    });
    console.log('Forced close all circuit breakers');
  }

  /**
   * Get circuit breaker health summary
   */
  getHealthSummary(): {
    total: number;
    healthy: number;
    unhealthy: number;
    open: number;
    halfOpen: number;
    closed: number;
  } {
    const total = this.circuits.size;
    let healthy = 0;
    let unhealthy = 0;
    let open = 0;
    let halfOpen = 0;
    let closed = 0;

    this.circuits.forEach(circuit => {
      const state = circuit.getState();
      
      if (state === 'closed') {
        healthy++;
        closed++;
      } else {
        unhealthy++;
        if (state === 'open') {
          open++;
        } else if (state === 'half-open') {
          halfOpen++;
        }
      }
    });

    return {
      total,
      healthy,
      unhealthy,
      open,
      halfOpen,
      closed,
    };
  }

  /**
   * Execute operation with circuit breaker
   */
  async executeWithCircuit<T>(
    circuitName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getCircuit(circuitName);
    if (!circuit) {
      throw new Error(`Circuit breaker '${circuitName}' not found`);
    }

    const result = await circuit.execute(operation);
    
    if (!result.success) {
      throw new Error(result.error || 'Circuit breaker operation failed');
    }

    return result.data as T;
  }

  /**
   * Execute operation with circuit breaker and fallback
   */
  async executeWithCircuitAndFallback<T>(
    circuitName: string,
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getCircuit(circuitName);
    if (!circuit) {
      throw new Error(`Circuit breaker '${circuitName}' not found`);
    }

    const result = await circuit.executeWithFallback(operation, fallback);
    
    if (!result.success) {
      throw new Error(result.error || 'Circuit breaker operation failed');
    }

    return result.data as T;
  }

  /**
   * Create default circuit breaker configurations
   */
  static createDefaultConfigs(): Record<string, CircuitBreakerConfig> {
    return {
      'api-external': {
        name: 'api-external',
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 60000, // 1 minute
        requestTimeout: 10000, // 10 seconds
        volumeThreshold: 10,
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30 seconds
        monitoringPeriod: 60000, // 1 minute
      },
      'database': {
        name: 'database',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 30000, // 30 seconds
        requestTimeout: 5000, // 5 seconds
        volumeThreshold: 5,
        errorThresholdPercentage: 60,
        resetTimeout: 15000, // 15 seconds
        monitoringPeriod: 30000, // 30 seconds
      },
      'cache': {
        name: 'cache',
        failureThreshold: 10,
        successThreshold: 5,
        timeout: 15000, // 15 seconds
        requestTimeout: 2000, // 2 seconds
        volumeThreshold: 20,
        errorThresholdPercentage: 40,
        resetTimeout: 10000, // 10 seconds
        monitoringPeriod: 30000, // 30 seconds
      },
      'messaging': {
        name: 'messaging',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 45000, // 45 seconds
        requestTimeout: 15000, // 15 seconds
        volumeThreshold: 5,
        errorThresholdPercentage: 50,
        resetTimeout: 20000, // 20 seconds
        monitoringPeriod: 60000, // 1 minute
      },
    };
  }

  /**
   * Initialize with default circuit breakers
   */
  initializeDefaults(): void {
    const defaultConfigs = CircuitBreakerManager.createDefaultConfigs();
    
    Object.values(defaultConfigs).forEach(config => {
      this.createCircuit(config);
    });
    
    console.log('Initialized default circuit breakers');
  }
}
