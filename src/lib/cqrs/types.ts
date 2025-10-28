/**
 * CQRS (Command Query Responsibility Segregation) Types
 *
 * Implements the CQRS pattern for separating read and write operations.
 * This enables:
 * - Optimized read/write performance
 * - Independent scaling of read and write models
 * - Clear separation of concerns
 * - Better maintainability and testability
 *
 * SOLID Principles:
 * - Single Responsibility: Commands handle writes, Queries handle reads
 * - Open/Closed: Can extend with new commands/queries without modifying existing code
 * - Liskov Substitution: All handlers implement the same interface
 * - Interface Segregation: Separate interfaces for commands and queries
 * - Dependency Inversion: Handlers depend on abstractions, not concretions
 */

/**
 * Base command interface for write operations
 */
export interface ICommand {
  readonly type: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly correlationId?: string;
}

/**
 * Base query interface for read operations
 */
export interface IQuery {
  readonly type: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly correlationId?: string;
}

/**
 * Command result interface
 */
export interface ICommandResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly correlationId?: string;
  readonly timestamp: Date;
}

/**
 * Query result interface
 */
export interface IQueryResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly correlationId?: string;
  readonly timestamp: Date;
  readonly totalCount?: number;
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Command handler interface
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = unknown> {
  handle(command: TCommand): Promise<ICommandResult<TResult>>;
}

/**
 * Query handler interface
 */
export interface IQueryHandler<TQuery extends IQuery, TResult = unknown> {
  handle(query: TQuery): Promise<IQueryResult<TResult>>;
}

/**
 * Command bus interface for dispatching commands
 */
export interface ICommandBus {
  send<TCommand extends ICommand, TResult = unknown>(
    command: TCommand
  ): Promise<ICommandResult<TResult>>;
}

/**
 * Query bus interface for dispatching queries
 */
export interface IQueryBus {
  send<TQuery extends IQuery, TResult = unknown>(
    query: TQuery
  ): Promise<IQueryResult<TResult>>;
}

/**
 * CQRS bus interface combining command and query buses
 */
export interface ICQRSBus extends ICommandBus, IQueryBus {}

/**
 * Handler registration interface
 */
export interface IHandlerRegistry {
  registerCommandHandler<TCommand extends ICommand, TResult = unknown>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void;

  registerQueryHandler<TQuery extends IQuery, TResult = unknown>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void;
}

/**
 * Validation error interface
 */
export interface IValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

/**
 * Command validation result
 */
export interface ICommandValidationResult {
  readonly isValid: boolean;
  readonly errors: IValidationError[];
}

/**
 * Query validation result
 */
export interface IQueryValidationResult {
  readonly isValid: boolean;
  readonly errors: IValidationError[];
}

/**
 * Command validator interface
 */
export interface ICommandValidator<TCommand extends ICommand> {
  validate(command: TCommand): Promise<ICommandValidationResult>;
}

/**
 * Query validator interface
 */
export interface IQueryValidator<TQuery extends IQuery> {
  validate(query: TQuery): Promise<IQueryValidationResult>;
}
