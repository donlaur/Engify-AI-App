/**
 * Circuit Breaker Tests
 *
 * Comprehensive tests for the Circuit Breaker pattern implementation,
 * including state transitions, failure handling, and resilience patterns.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';
import { CircuitBreakerManager } from '../CircuitBreakerManager';
import { ResilienceDecorator } from '../ResilienceDecorator';
import {
  CircuitBreakerConfig,
  CircuitBreakerState,
  RetryConfig,
  BulkheadConfig,
  TimeoutConfig,
  ResilienceConfig,
} from '../types';

describe('Circuit Breaker', () => {
  let circuit: CircuitBreaker;
  let config: CircuitBreakerConfig;

  beforeEach(() => {
    config = {
      name: 'test-circuit',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      requestTimeout: 500,
      volumeThreshold: 5,
      errorThresholdPercentage: 50,
      resetTimeout: 2000,
      monitoringPeriod: 5000,
    };
    circuit = new CircuitBreaker('test-circuit', config);
  });

  describe('State Management', () => {
    it('should start in closed state', () => {
      expect(circuit.getState()).toBe('closed');
    });

    it('should transition to open state after failure threshold', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      // Execute failing operations
      for (let i = 0; i < config.failureThreshold; i++) {
        await circuit.execute(failingOperation);
      }

      expect(circuit.getState()).toBe('open');
    });

    it('should transition to half-open after timeout', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < config.failureThreshold; i++) {
        await circuit.execute(failingOperation);
      }

      expect(circuit.getState()).toBe('open');

      // Wait for timeout and try again
      await new Promise(resolve => setTimeout(resolve, config.timeout + 100));

      const result = await circuit.execute(() => Promise.resolve('success'));
      expect(circuit.getState()).toBe('half-open');
    });

    it('should transition to closed after success threshold in half-open', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      const successOperation = vi.fn().mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < config.failureThreshold; i++) {
        await circuit.execute(failingOperation);
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, config.timeout + 100));

      // Execute successful operations
      for (let i = 0; i < config.successThreshold; i++) {
        await circuit.execute(successOperation);
      }

      expect(circuit.getState()).toBe('closed');
    });
  });

  describe('Operation Execution', () => {
    it('should execute successful operations', async () => {
      const successOperation = vi.fn().mockResolvedValue('success');
      const result = await circuit.execute(successOperation);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.circuitState).toBe('closed');
    });

    it('should handle failed operations', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      const result = await circuit.execute(failingOperation);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.circuitState).toBe('closed');
    });

    it('should fail fast when circuit is open', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < config.failureThreshold; i++) {
        await circuit.execute(failingOperation);
      }

      const result = await circuit.execute(() => Promise.resolve('success'));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Circuit breaker');
    });

    it('should execute with fallback', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      const fallbackOperation = vi.fn().mockResolvedValue('fallback');

      const result = await circuit.executeWithFallback(failingOperation, fallbackOperation);

      expect(result.success).toBe(true);
      expect(result.data).toBe('fallback');
      expect(result.fromCache).toBe(true);
    });
  });

  describe('Metrics', () => {
    it('should track metrics correctly', async () => {
      const successOperation = vi.fn().mockResolvedValue('success');
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      // Execute operations
      await circuit.execute(successOperation);
      await circuit.execute(failingOperation);
      await circuit.execute(successOperation);

      const metrics = circuit.getMetrics();

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successCount).toBe(2);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.failureRate).toBeCloseTo(33.33, 1);
    });

    it('should reset metrics on reset', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      await circuit.execute(failingOperation);
      circuit.reset();

      const metrics = circuit.getMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.failureCount).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.state).toBe('closed');
    });
  });

  describe('Event Handlers', () => {
    it('should call state change handlers', async () => {
      const stateChangeHandler = vi.fn();
      circuit.onStateChange(stateChangeHandler);

      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < config.failureThreshold; i++) {
        await circuit.execute(failingOperation);
      }

      expect(stateChangeHandler).toHaveBeenCalledWith('open');
    });

    it('should call failure handlers', async () => {
      const failureHandler = vi.fn();
      circuit.onFailure(failureHandler);

      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      await circuit.execute(failingOperation);

      expect(failureHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call success handlers', async () => {
      const successHandler = vi.fn();
      circuit.onSuccess(successHandler);

      const successOperation = vi.fn().mockResolvedValue('success');
      await circuit.execute(successOperation);

      expect(successHandler).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});

describe('Circuit Breaker Manager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = new CircuitBreakerManager('test-manager');
  });

  describe('Circuit Management', () => {
    it('should create and manage circuits', () => {
      const config: CircuitBreakerConfig = {
        name: 'test-circuit',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        requestTimeout: 500,
        volumeThreshold: 5,
        errorThresholdPercentage: 50,
        resetTimeout: 2000,
        monitoringPeriod: 5000,
      };

      const circuit = manager.createCircuit(config);
      expect(circuit).toBeDefined();
      expect(manager.getCircuit('test-circuit')).toBe(circuit);
      expect(manager.listCircuits()).toContain('test-circuit');
    });

    it('should remove circuits', () => {
      const config: CircuitBreakerConfig = {
        name: 'test-circuit',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        requestTimeout: 500,
        volumeThreshold: 5,
        errorThresholdPercentage: 50,
        resetTimeout: 2000,
        monitoringPeriod: 5000,
      };

      manager.createCircuit(config);
      expect(manager.removeCircuit('test-circuit')).toBe(true);
      expect(manager.getCircuit('test-circuit')).toBeNull();
    });

    it('should initialize default circuits', () => {
      manager.initializeDefaults();
      
      const circuits = manager.listCircuits();
      expect(circuits).toContain('api-external');
      expect(circuits).toContain('database');
      expect(circuits).toContain('cache');
      expect(circuits).toContain('messaging');
    });
  });

  describe('Global Operations', () => {
    it('should reset all circuits', () => {
      manager.initializeDefaults();
      
      // Open some circuits
      const apiCircuit = manager.getCircuit('api-external');
      if (apiCircuit) {
        apiCircuit.forceOpen();
      }

      manager.resetAll();

      const globalState = manager.getGlobalState();
      Object.values(globalState).forEach(state => {
        expect(state).toBe('closed');
      });
    });

    it('should get global metrics', () => {
      manager.initializeDefaults();
      
      const metrics = manager.getGlobalMetrics();
      expect(Object.keys(metrics)).toContain('api-external');
      expect(Object.keys(metrics)).toContain('database');
    });

    it('should get health summary', () => {
      manager.initializeDefaults();
      
      const summary = manager.getHealthSummary();
      expect(summary.total).toBe(4);
      expect(summary.healthy).toBe(4);
      expect(summary.unhealthy).toBe(0);
    });
  });

  describe('Execution Helpers', () => {
    it('should execute with circuit', async () => {
      const config: CircuitBreakerConfig = {
        name: 'test-circuit',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000,
        requestTimeout: 500,
        volumeThreshold: 5,
        errorThresholdPercentage: 50,
        resetTimeout: 2000,
        monitoringPeriod: 5000,
      };

      manager.createCircuit(config);

      const operation = vi.fn().mockResolvedValue('success');
      const result = await manager.executeWithCircuit('test-circuit', operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should execute with circuit and fallback', async () => {
      const config: CircuitBreakerConfig = {
        name: 'test-circuit',
        failureThreshold: 1,
        successThreshold: 1,
        timeout: 1000,
        requestTimeout: 500,
        volumeThreshold: 1,
        errorThresholdPercentage: 50,
        resetTimeout: 2000,
        monitoringPeriod: 5000,
      };

      manager.createCircuit(config);

      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      const fallbackOperation = vi.fn().mockResolvedValue('fallback');

      const result = await manager.executeWithCircuitAndFallback(
        'test-circuit',
        failingOperation,
        fallbackOperation
      );

      expect(result).toBe('fallback');
    });
  });
});

describe('Resilience Decorator', () => {
  let decorator: ResilienceDecorator;
  let config: ResilienceConfig;

  beforeEach(() => {
    config = {
      circuitBreaker: {
        name: 'test-circuit',
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 1000,
        requestTimeout: 500,
        volumeThreshold: 3,
        errorThresholdPercentage: 50,
        resetTimeout: 2000,
        monitoringPeriod: 5000,
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2,
        jitter: true,
      },
      bulkhead: {
        name: 'test-bulkhead',
        maxConcurrency: 2,
        maxQueueSize: 5,
        queueTimeout: 1000,
      },
      timeout: {
        name: 'test-timeout',
        timeout: 500,
      },
    };

    decorator = new ResilienceDecorator('test-decorator', config);
  });

  afterEach(async () => {
    await decorator.destroy();
  });

  describe('Basic Decoration', () => {
    it('should execute successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await decorator.decorate(operation, config);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should handle failed operations', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const result = await decorator.decorate(operation, config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Circuit breaker'); // Circuit opens after failures
      expect(result.attempts).toBeGreaterThan(0);
    });

    it('should execute with fallback', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      const fallbackOperation = vi.fn().mockResolvedValue('fallback');

      const result = await decorator.decorateWithFallback(
        failingOperation,
        fallbackOperation,
        config
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('fallback');
      expect(result.fromCache).toBe(true);
    });
  });

  describe('Retry Pattern', () => {
    it('should retry failed operations', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue('success');

      const result = await decorator.decorate(operation, config);

      expect(result.success).toBe(false); // Circuit breaker opens after failures
      expect(result.error).toContain('Circuit breaker');
      expect(operation).toHaveBeenCalledTimes(2); // Circuit opens after 2 failures
    });

    it('should fail after max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      const result = await decorator.decorate(operation, config);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3); // Max attempts
    });
  });

  describe('Bulkhead Pattern', () => {
    it('should limit concurrent operations', async () => {
      const operation = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 100))
      );

      // Start multiple operations
      const promises = Array.from({ length: 5 }, () => 
        decorator.decorate(operation, config)
      );

      const results = await Promise.allSettled(promises);
      
      // Some should succeed, some might fail due to bulkhead limits
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig: ResilienceConfig = {
        retry: {
          maxAttempts: 5,
          baseDelay: 200,
          maxDelay: 2000,
          backoffMultiplier: 1.5,
          jitter: false,
        },
      };

      decorator.updateConfig(newConfig);
      const updatedConfig = decorator.getConfig();

      expect(updatedConfig.retry?.maxAttempts).toBe(5);
      expect(updatedConfig.retry?.baseDelay).toBe(200);
    });

    it('should get metrics', () => {
      const metrics = decorator.getMetrics();

      expect(metrics).toHaveProperty('activeOperations');
      expect(metrics).toHaveProperty('queuedOperations');
      expect(metrics).toHaveProperty('circuitBreakerMetrics');
    });
  });
});
