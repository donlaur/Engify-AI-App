import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ExecutionContextManager } from '../context/ExecutionContextManager';
import { ExecutionStrategyFactory } from '../factory/ExecutionStrategyFactory';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import { AIRequest, ExecutionContext } from '../interfaces/IExecutionStrategy';

// Mock AI Provider Factory
jest.mock('@/lib/ai/v2/factory/AIProviderFactory');

describe('Execution Strategy System', () => {
  let contextManager: ExecutionContextManager;
  let strategyFactory: ExecutionStrategyFactory;
  let mockAIProviderFactory: jest.Mocked<AIProviderFactory>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock AI provider factory
    mockAIProviderFactory = {
      create: jest.fn(),
      getAvailableProviders: jest
        .fn()
        .mockReturnValue(['openai', 'claude', 'gemini']),
      registerProvider: jest.fn(),
      unregisterProvider: jest.fn(),
    } as unknown as jest.Mocked<AIProviderFactory>;

    // Create strategy factory
    strategyFactory = new ExecutionStrategyFactory(mockAIProviderFactory);

    // Create context manager
    contextManager = new ExecutionContextManager(mockAIProviderFactory);

    // Register strategies
    const strategies = strategyFactory.getAvailableStrategies();
    for (const strategyName of strategies) {
      const strategy = strategyFactory.getStrategy(strategyName);
      if (strategy) {
        contextManager.registerStrategy(strategy);
      }
    }
  });

  describe('Strategy Registration', () => {
    it('should register all default strategies', () => {
      const strategies = contextManager.getStrategies();
      expect(strategies).toHaveLength(4);

      const strategyNames = strategies.map((s) => s.name);
      expect(strategyNames).toContain('streaming');
      expect(strategyNames).toContain('batch');
      expect(strategyNames).toContain('cache');
      expect(strategyNames).toContain('hybrid');
    });

    it('should validate all strategies', () => {
      const validation = contextManager.validateStrategies();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Strategy Selection', () => {
    const mockRequest: AIRequest = {
      prompt: 'Test prompt',
      maxTokens: 1000,
      temperature: 0.7,
    };

    const mockContext: ExecutionContext = {
      userId: 'test-user',
      requestId: 'test-request',
      priority: 'normal',
    };

    beforeEach(() => {
      // Mock AI provider response
      mockAIProviderFactory.create.mockReturnValue({
        name: 'openai',
        provider: 'openai',
        execute: jest.fn().mockResolvedValue({
          content: 'Test response',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          cost: { input: 0.001, output: 0.002, total: 0.003 },
          latency: 1000,
          provider: 'openai',
          model: 'gpt-3.5-turbo',
        }),
        validateRequest: jest.fn().mockReturnValue(true),
      } as unknown as jest.Mocked<AIProviderFactory>);
    });

    it('should select cache strategy for repeated requests', () => {
      const contextWithMetadata = {
        ...mockContext,
        metadata: { isRepeated: true },
      };

      const strategy = contextManager.selectStrategy(
        mockRequest,
        contextWithMetadata
      );
      expect(strategy?.name).toBe('cache');
    });

    it('should select streaming strategy for urgent requests', () => {
      const urgentContext = {
        ...mockContext,
        priority: 'urgent' as const,
      };

      const strategy = contextManager.selectStrategy(
        mockRequest,
        urgentContext
      );
      expect(strategy?.name).toBe('streaming');
    });

    it('should select batch strategy for normal priority requests', () => {
      const strategy = contextManager.selectStrategy(mockRequest, mockContext);
      expect(strategy?.name).toBe('batch');
    });

    it('should fallback to hybrid strategy when others cannot handle', () => {
      const complexRequest = {
        ...mockRequest,
        maxTokens: 10000, // Too large for most strategies
        stream: true,
      };

      const strategy = contextManager.selectStrategy(
        complexRequest,
        mockContext
      );
      expect(strategy?.name).toBe('hybrid');
    });
  });

  describe('Strategy Execution', () => {
    const mockRequest: AIRequest = {
      prompt: 'Test prompt',
      maxTokens: 1000,
      temperature: 0.7,
    };

    const mockContext: ExecutionContext = {
      userId: 'test-user',
      requestId: 'test-request',
      priority: 'normal',
    };

    beforeEach(() => {
      mockAIProviderFactory.create.mockReturnValue({
        name: 'openai',
        provider: 'openai',
        execute: jest.fn().mockResolvedValue({
          content: 'Test response',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          cost: { input: 0.001, output: 0.002, total: 0.003 },
          latency: 1000,
          provider: 'openai',
          model: 'gpt-3.5-turbo',
        }),
        validateRequest: jest.fn().mockReturnValue(true),
      } as unknown as jest.Mocked<AIProviderFactory>);
    });

    it('should execute request successfully', async () => {
      const result = await contextManager.execute(
        mockRequest,
        mockContext,
        'openai'
      );

      expect(result).toBeDefined();
      expect(result.response.content).toBe('Test response');
      expect(result.strategy).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle execution errors gracefully', async () => {
      mockAIProviderFactory.create.mockReturnValue(null);

      await expect(
        contextManager.execute(mockRequest, mockContext, 'invalid-provider')
      ).rejects.toThrow('AI provider not found');
    });

    it('should validate request before execution', async () => {
      const invalidRequest = {
        ...mockRequest,
        prompt: '', // Empty prompt should fail validation
      };

      await expect(
        contextManager.execute(invalidRequest, mockContext, 'openai')
      ).rejects.toThrow('Request validation failed');
    });
  });

  describe('Strategy Performance', () => {
    it('should provide execution statistics', () => {
      const stats = contextManager.getStats();

      expect(stats.totalStrategies).toBe(4);
      expect(stats.enabledStrategies).toBeGreaterThan(0);
      expect(stats.strategyNames).toHaveLength(4);
    });

    it('should estimate execution times', () => {
      const mockRequest: AIRequest = {
        prompt: 'Test prompt',
        maxTokens: 1000,
      };

      const mockContext: ExecutionContext = {
        userId: 'test-user',
        requestId: 'test-request',
        priority: 'normal',
      };

      const strategies = contextManager.getStrategies();

      for (const strategy of strategies) {
        const estimatedTime = strategy.getEstimatedTime(
          mockRequest,
          mockContext
        );
        expect(estimatedTime).toBeGreaterThan(0);
        expect(typeof estimatedTime).toBe('number');
      }
    });
  });

  describe('Strategy Configuration', () => {
    it('should allow strategy configuration', () => {
      const strategies = contextManager.getStrategies();

      for (const strategy of strategies) {
        expect(strategy.config).toBeDefined();
        expect(strategy.config.name).toBe(strategy.name);
        expect(typeof strategy.config.enabled).toBe('boolean');
        expect(typeof strategy.config.priority).toBe('number');
      }
    });

    it('should respect strategy enabled/disabled state', () => {
      const mockRequest: AIRequest = {
        prompt: 'Test prompt',
        maxTokens: 1000,
      };

      const mockContext: ExecutionContext = {
        userId: 'test-user',
        requestId: 'test-request',
        priority: 'normal',
      };

      const strategies = contextManager.getStrategies();
      const enabledStrategies = strategies.filter((s) => s.config.enabled);
      const disabledStrategies = strategies.filter((s) => !s.config.enabled);

      // Enabled strategies should be able to handle requests
      for (const strategy of enabledStrategies) {
        expect(strategy.canHandle(mockRequest, mockContext)).toBe(true);
      }

      // Disabled strategies should not be able to handle requests
      for (const strategy of disabledStrategies) {
        expect(strategy.canHandle(mockRequest, mockContext)).toBe(false);
      }
    });
  });
});
