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
    ICommandHandler<ICommand, unknown>
  >();
  private queryHandlers = new Map<string, IQueryHandler<IQuery, unknown>>();
  private commandValidators = new Map<string, ICommandValidator<ICommand>>();
  private queryValidators = new Map<string, IQueryValidator<IQuery>>();

  /**
   * Reset all handlers and validators (for testing)
   */
  reset(): void {
    this.commandHandlers.clear();
    this.queryHandlers.clear();
    this.commandValidators.clear();
    this.queryValidators.clear();
  }

  /**
   * Register a command handler
   */
  registerCommandHandler<TCommand extends ICommand, TResult = unknown>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void {
    this.commandHandlers.set(
      commandType,
      handler as ICommandHandler<ICommand, unknown>
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
      handler as IQueryHandler<IQuery, unknown>
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
      validator as ICommandValidator<ICommand>
    );
  }

  /**
   * Register a query validator
   */
  registerQueryValidator<TQuery extends IQuery>(
    queryType: string,
    validator: IQueryValidator<TQuery>
  ): void {
    this.queryValidators.set(queryType, validator as IQueryValidator<IQuery>);
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
        return this.createErrorResult<TResult>(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
          command.correlationId
        );
      }

      // Get handler
      const handler = this.commandHandlers.get(command.type);
      if (!handler) {
        return this.createErrorResult<TResult>(
          `No handler found for command type: ${command.type}`,
          command.correlationId
        );
      }

      // Execute command
      const result = await (
        handler as ICommandHandler<TCommand, TResult>
      ).handle(command);
      return result as ICommandResult<TResult>;
    } catch (error) {
      console.error('Command execution error:', error);
      return this.createErrorResult<TResult>(
        error instanceof Error ? error.message : 'Unknown error',
        command.correlationId
      );
    }
  }

  /**
   * Send a query
   */
  async sendQuery<TQuery extends IQuery, TResult = unknown>(
    query: TQuery
  ): Promise<IQueryResult<TResult>> {
    try {
      // Validate query
      const validationResult = await this.validateQuery(query);
      if (!validationResult.isValid) {
        return this.createQueryErrorResult<TResult>(
          `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
          query.correlationId
        );
      }

      // Get handler
      const handler = this.queryHandlers.get(query.type);
      if (!handler) {
        return this.createQueryErrorResult<TResult>(
          `No handler found for query type: ${query.type}`,
          query.correlationId
        );
      }

      // Execute query
      const result = await (handler as IQueryHandler<TQuery, TResult>).handle(
        query
      );
      return result as IQueryResult<TResult>;
    } catch (error) {
      console.error('Query execution error:', error);
      return this.createQueryErrorResult<TResult>(
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
  private createErrorResult<TResult = unknown>(
    error: string,
    correlationId?: string
  ): ICommandResult<TResult> {
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
  private createQueryErrorResult<TResult = unknown>(
    error: string,
    correlationId?: string
  ): IQueryResult<TResult> {
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
