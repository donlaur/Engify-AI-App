/**
 * CQRS Bus Tests
 *
 * Tests for the CQRS bus implementation, including:
 * - Command and query registration
 * - Handler execution
 * - Validation
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CQRSBus } from '../bus';
import {
  ICommand,
  IQuery,
  ICommandHandler,
  IQueryHandler,
  ICommandResult,
  IQueryResult,
  ICommandValidator,
  IQueryValidator,
  ICommandValidationResult,
  IQueryValidationResult,
} from '../types';

// Test command and query interfaces
interface TestCommand extends ICommand {
  readonly type: 'TestCommand';
  readonly data: string;
}

interface TestQuery extends IQuery {
  readonly type: 'TestQuery';
  readonly filter: string;
}

// Test handlers
class TestCommandHandler implements ICommandHandler<TestCommand, string> {
  async handle(command: TestCommand): Promise<ICommandResult<string>> {
    return {
      success: true,
      data: `Processed: ${command.data}`,
      correlationId: command.correlationId,
      timestamp: new Date(),
    };
  }
}

class TestQueryHandler implements IQueryHandler<TestQuery, string[]> {
  async handle(query: TestQuery): Promise<IQueryResult<string[]>> {
    return {
      success: true,
      data: [`Result for ${query.filter}`],
      totalCount: 1,
      correlationId: query.correlationId,
      timestamp: new Date(),
    };
  }
}

// Test validators
class TestCommandValidator implements ICommandValidator<TestCommand> {
  async validate(command: TestCommand): Promise<ICommandValidationResult> {
    const errors = [];

    if (!command.data || command.data.trim().length === 0) {
      errors.push({
        field: 'data',
        message: 'Data is required',
        code: 'REQUIRED_DATA',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

class TestQueryValidator implements IQueryValidator<TestQuery> {
  async validate(query: TestQuery): Promise<IQueryValidationResult> {
    const errors = [];

    if (!query.filter || query.filter.trim().length === 0) {
      errors.push({
        field: 'filter',
        message: 'Filter is required',
        code: 'REQUIRED_FILTER',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

describe('CQRSBus', () => {
  let bus: CQRSBus;
  let commandHandler: TestCommandHandler;
  let queryHandler: TestQueryHandler;
  let commandValidator: TestCommandValidator;
  let queryValidator: TestQueryValidator;

  beforeEach(() => {
    bus = new CQRSBus();
    commandHandler = new TestCommandHandler();
    queryHandler = new TestQueryHandler();
    commandValidator = new TestCommandValidator();
    queryValidator = new TestQueryValidator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Handler Registration', () => {
    it('should register command handlers', () => {
      bus.registerCommandHandler('TestCommand', commandHandler);
      // No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register query handlers', () => {
      bus.registerQueryHandler('TestQuery', queryHandler);
      // No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register command validators', () => {
      bus.registerCommandValidator('TestCommand', commandValidator);
      // No error means registration succeeded
      expect(true).toBe(true);
    });

    it('should register query validators', () => {
      bus.registerQueryValidator('TestQuery', queryValidator);
      // No error means registration succeeded
      expect(true).toBe(true);
    });
  });

  describe('Command Execution', () => {
    beforeEach(() => {
      bus.registerCommandHandler('TestCommand', commandHandler);
      bus.registerCommandValidator('TestCommand', commandValidator);
    });

    it('should execute valid commands successfully', async () => {
      const command: TestCommand = {
        type: 'TestCommand',
        data: 'test data',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Processed: test data');
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should fail for invalid commands', async () => {
      const command: TestCommand = {
        type: 'TestCommand',
        data: '', // Invalid empty data
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should fail for unregistered command types', async () => {
      // Create a new bus instance without handlers
      const emptyBus = new CQRSBus();

      const command: TestCommand = {
        type: 'TestCommand',
        data: 'test data',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await emptyBus.send(command);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No handler found');
    });

    it('should handle handler execution errors', async () => {
      const errorHandler = new (class
        implements ICommandHandler<TestCommand, string>
      {
        async handle(): Promise<ICommandResult<string>> {
          throw new Error('Handler execution failed');
        }
      })();

      bus.registerCommandHandler('TestCommand', errorHandler);

      const command: TestCommand = {
        type: 'TestCommand',
        data: 'test data',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Handler execution failed');
    });
  });

  describe('Query Execution', () => {
    beforeEach(() => {
      bus.registerQueryHandler('TestQuery', queryHandler);
      bus.registerQueryValidator('TestQuery', queryValidator);
    });

    it('should execute valid queries successfully', async () => {
      const query: TestQuery = {
        type: 'TestQuery',
        filter: 'test filter',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.sendQuery(query);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['Result for test filter']);
      expect(result.totalCount).toBe(1);
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should fail for invalid queries', async () => {
      const query: TestQuery = {
        type: 'TestQuery',
        filter: '', // Invalid empty filter
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.sendQuery(query);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.correlationId).toBe('test-correlation-id');
    });

    it('should fail for unregistered query types', async () => {
      // Create a new bus instance without handlers
      const emptyBus = new CQRSBus();

      const query: TestQuery = {
        type: 'TestQuery',
        filter: 'test filter',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await emptyBus.sendQuery(query);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No handler found');
    });

    it('should handle handler execution errors', async () => {
      const errorHandler = new (class
        implements IQueryHandler<TestQuery, string[]>
      {
        async handle(): Promise<IQueryResult<string[]>> {
          throw new Error('Query handler execution failed');
        }
      })();

      bus.registerQueryHandler('TestQuery', errorHandler);

      const query: TestQuery = {
        type: 'TestQuery',
        filter: 'test filter',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.sendQuery(query);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query handler execution failed');
    });
  });

  describe('Validation', () => {
    it('should skip validation when no validator is registered', async () => {
      bus.registerCommandHandler('TestCommand', commandHandler);
      // Don't register validator

      const command: TestCommand = {
        type: 'TestCommand',
        data: '', // Invalid data, but no validator
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Processed: ');
    });

    it('should handle validator errors gracefully', async () => {
      const errorValidator = new (class
        implements ICommandValidator<TestCommand>
      {
        async validate(): Promise<ICommandValidationResult> {
          throw new Error('Validator error');
        }
      })();

      bus.registerCommandHandler('TestCommand', commandHandler);
      bus.registerCommandValidator('TestCommand', errorValidator);

      const command: TestCommand = {
        type: 'TestCommand',
        data: 'test data',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validator error');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for command results', async () => {
      bus.registerCommandHandler('TestCommand', commandHandler);
      bus.registerCommandValidator('TestCommand', commandValidator);

      const command: TestCommand = {
        type: 'TestCommand',
        data: 'test data',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.send(command);

      if (result.success && result.data) {
        // TypeScript should know result.data is string
        expect(typeof result.data).toBe('string');
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('should maintain type safety for query results', async () => {
      bus.registerQueryHandler('TestQuery', queryHandler);
      bus.registerQueryValidator('TestQuery', queryValidator);

      const query: TestQuery = {
        type: 'TestQuery',
        filter: 'test filter',
        timestamp: new Date(),
        correlationId: 'test-correlation-id',
      };

      const result = await bus.sendQuery(query);

      if (result.success && result.data) {
        // TypeScript should know result.data is string[]
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
      }
    });
  });
});
