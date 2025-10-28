/**
 * Event Sourcing Types and Interfaces
 *
 * Defines the core types for Event Sourcing pattern implementation.
 * Event Sourcing stores all changes as a sequence of events.
 */

/**
 * Base Event Interface
 */
export interface IEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly data: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Event Store Interface
 */
export interface IEventStore {
  saveEvents(
    aggregateId: string,
    events: IEvent[],
    expectedVersion: number
  ): Promise<void>;

  getEvents(aggregateId: string, fromVersion?: number): Promise<IEvent[]>;

  getEventsByType(eventType: string, fromTimestamp?: Date): Promise<IEvent[]>;

  getAllEvents(fromTimestamp?: Date): Promise<IEvent[]>;
}

/**
 * Event Handler Interface
 */
export interface IEventHandler<TEvent extends IEvent = IEvent> {
  readonly eventType: string;
  handle(event: TEvent): Promise<void>;
}

/**
 * Event Bus Interface
 */
export interface IEventBus {
  publish(event: IEvent): Promise<void>;
  publishMany(events: IEvent[]): Promise<void>;
  subscribe<TEvent extends IEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>
  ): void;
  unsubscribe(eventType: string, handler: IEventHandler): void;
}

/**
 * Projection Interface
 */
export interface IProjection {
  readonly name: string;
  readonly version: number;

  handle(event: IEvent): Promise<void>;
  reset(): Promise<void>;
  getState(): Promise<Record<string, unknown>>;
}

/**
 * Snapshot Interface
 */
export interface ISnapshot {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
}

/**
 * Snapshot Store Interface
 */
export interface ISnapshotStore {
  saveSnapshot(snapshot: ISnapshot): Promise<void>;
  getSnapshot(aggregateId: string): Promise<ISnapshot | null>;
  deleteSnapshots(aggregateId: string): Promise<void>;
}

/**
 * Event Sourcing Configuration
 */
export interface EventSourcingConfig {
  readonly snapshotThreshold: number;
  readonly eventStoreType: 'memory' | 'mongodb' | 'postgresql';
  readonly enableSnapshots: boolean;
  readonly enableProjections: boolean;
}

/**
 * Event Store Error Types
 */
export class ConcurrencyError extends Error {
  constructor(
    public readonly aggregateId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super(
      `Concurrency conflict for aggregate ${aggregateId}. Expected version ${expectedVersion}, but was ${actualVersion}`
    );
    this.name = 'ConcurrencyError';
  }
}

export class EventStoreError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'EventStoreError';
  }
}
