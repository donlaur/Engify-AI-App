/**
 * CQRS Bus Implementation
 *
 * Central dispatcher for commands and queries in the CQRS pattern.
 * Handles routing, validation, and execution of commands and queries.
 */

import {
  ICommand,
  IQuery,
  ICommandResult,
  IQueryResult,
  ICommandHandler,
  IQueryHandler,
  ICQRSBus,
  IHandlerRegistry,
  ICommandValidationResult,
  IQueryValidationResult,
  ICommandValidator,
  IQueryValidator,
} from './types';

/**
 * CQRS Bus implementation
 */
export class CQRSBus implements ICQRSBus, IHandlerRegistry {
  private commandHandlers = new Map<
    string,
    ICommandHandler<unknown, unknown>
  >();
  private queryHandlers = new Map<string, IQueryHandler<unknown, unknown>>();
  private commandValidators = new Map<string, ICommandValidator<unknown>>();
  private queryValidators = new Map<string, IQueryValidator<unknown>>();

  /**
   * Register a command handler
   */
  registerCommandHandler<TCommand extends ICommand, TResult = unknown>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void {
    this.commandHandlers.set(
      commandType,
      handler as ICommandHandler<unknown, unknown>
    );
  }

  /**
   * Register a query handler
   */
  registerQueryHandler<TQuery extends IQuery, TResult = unknown>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void {
    this.queryHandlers.set(
      queryType,
      handler as IQueryHandler<unknown, unknown>
    );
  }

  /**
   * Register a command validator
   */
  registerCommandValidator<TCommand extends ICommand>(
    commandType: string,
    validator: ICommandValidator<TCommand>
  ): void {
    this.commandValidators.set(
      commandType,
      validator as ICommandValidator<unknown>
    );
  }

  /**
   * Register a query validator
   */
  registerQueryValidator<TQuery extends IQuery>(
    queryType: string,
    validator: IQueryValidator<TQuery>
  ): void {
    this.queryValidators.set(queryType, validator as IQueryValidator<unknown>);
  }

  /**
   * Send a command
   */
  async send<TCommand extends ICommand, TResult = unknown>(
    command: TCommand
  ): Promise<ICommandResult<TResult>> {
    try {
      // Validate command
      const validationResult = await this.validateCommand(command);
      if (!validationResult.isValid) {
        return this.createErrorResult(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
          command.correlationId
        );
      }

      // Get handler
      const handler = this.commandHandlers.get(command.type);
      if (!handler) {
        return this.createErrorResult(
          `No handler found for command type: ${command.type}`,
          command.correlationId
        );
      }

      // Execute command
      const result = await (
        handler as ICommandHandler<TCommand, TResult>
      ).handle(command);
      return result;
    } catch (error) {
      console.error('Command execution error:', error);
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        command.correlationId
      );
    }
  }

  /**
   * Send a query
   */
  async send<TQuery extends IQuery, TResult = unknown>(
    query: TQuery
  ): Promise<IQueryResult<TResult>> {
    try {
      // Validate query
      const validationResult = await this.validateQuery(query);
      if (!validationResult.isValid) {
        return this.createQueryErrorResult(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
          query.correlationId
        );
      }

      // Get handler
      const handler = this.queryHandlers.get(query.type);
      if (!handler) {
        return this.createQueryErrorResult(
          `No handler found for query type: ${query.type}`,
          query.correlationId
        );
      }

      // Execute query
      const result = await (handler as IQueryHandler<TQuery, TResult>).handle(
        query
      );
      return result;
    } catch (error) {
      console.error('Query execution error:', error);
      return this.createQueryErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        query.correlationId
      );
    }
  }

  /**
   * Validate a command
   */
  private async validateCommand(
    command: ICommand
  ): Promise<ICommandValidationResult> {
    const validator = this.commandValidators.get(command.type);
    if (!validator) {
      return { isValid: true, errors: [] };
    }
    return await validator.validate(command);
  }

  /**
   * Validate a query
   */
  private async validateQuery(query: IQuery): Promise<IQueryValidationResult> {
    const validator = this.queryValidators.get(query.type);
    if (!validator) {
      return { isValid: true, errors: [] };
    }
    return await validator.validate(query);
  }

  /**
   * Create error result for commands
   */
  private createErrorResult(
    error: string,
    correlationId?: string
  ): ICommandResult {
    return {
      success: false,
      error,
      correlationId,
      timestamp: new Date(),
    };
  }

  /**
   * Create error result for queries
   */
  private createQueryErrorResult(
    error: string,
    correlationId?: string
  ): IQueryResult {
    return {
      success: false,
      error,
      correlationId,
      timestamp: new Date(),
    };
  }
}

/**
 * Singleton CQRS bus instance
 */
export const cqrsBus = new CQRSBus();
