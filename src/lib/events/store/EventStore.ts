/**
 * MongoDB Event Store Implementation
 *
 * Stores events in MongoDB with proper indexing and concurrency control.
 * Implements the Event Store pattern for Event Sourcing.
 */

import { MongoClient, Db, Collection } from 'mongodb';
import {
  IEventStore,
  IEvent,
  ConcurrencyError,
  EventStoreError,
} from '../types';

/**
 * MongoDB Event Store
 */
export class MongoDBEventStore implements IEventStore {
  private db: Db;
  private eventsCollection: Collection<IEvent>;

  constructor(
    private mongoClient: MongoClient,
    databaseName: string = 'engify_events'
  ) {
    this.db = mongoClient.db(databaseName);
    this.eventsCollection = this.db.collection<IEvent>('events');

    // Create indexes for performance
    this.createIndexes();
  }

  /**
   * Create database indexes for optimal performance
   */
  private async createIndexes(): Promise<void> {
    try {
      await this.eventsCollection.createIndex({ aggregateId: 1, version: 1 });
      await this.eventsCollection.createIndex({ eventType: 1, timestamp: 1 });
      await this.eventsCollection.createIndex({ timestamp: 1 });
      await this.eventsCollection.createIndex({ eventId: 1 }, { unique: true });
    } catch (error) {
      console.warn('Failed to create indexes:', error);
    }
  }

  /**
   * Save events for an aggregate with concurrency control
   */
  async saveEvents(
    aggregateId: string,
    events: IEvent[],
    expectedVersion: number
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const session = this.mongoClient.startSession();

    try {
      await session.withTransaction(async () => {
        // Check current version
        const currentVersion = await this.getCurrentVersion(aggregateId);

        if (currentVersion !== expectedVersion) {
          throw new ConcurrencyError(
            aggregateId,
            expectedVersion,
            currentVersion
          );
        }

        // Insert events
        await this.eventsCollection.insertMany(events, { session });
      });
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        throw error;
      }
      throw new EventStoreError(
        `Failed to save events for aggregate ${aggregateId}`,
        error as Error
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get events for an aggregate
   */
  async getEvents(
    aggregateId: string,
    fromVersion: number = 0
  ): Promise<IEvent[]> {
    try {
      const events = await this.eventsCollection
        .find({
          aggregateId,
          version: { $gte: fromVersion },
        })
        .sort({ version: 1 })
        .toArray();

      return events;
    } catch (error) {
      throw new EventStoreError(
        `Failed to get events for aggregate ${aggregateId}`,
        error as Error
      );
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: string,
    fromTimestamp?: Date
  ): Promise<IEvent[]> {
    try {
      const query: Record<string, unknown> = { eventType };

      if (fromTimestamp) {
        query.timestamp = { $gte: fromTimestamp };
      }

      const events = await this.eventsCollection
        .find(query)
        .sort({ timestamp: 1 })
        .toArray();

      return events;
    } catch (error) {
      throw new EventStoreError(
        `Failed to get events by type ${eventType}`,
        error as Error
      );
    }
  }

  /**
   * Get all events
   */
  async getAllEvents(fromTimestamp?: Date): Promise<IEvent[]> {
    try {
      const query: Record<string, unknown> = {};

      if (fromTimestamp) {
        query.timestamp = { $gte: fromTimestamp };
      }

      const events = await this.eventsCollection
        .find(query)
        .sort({ timestamp: 1 })
        .toArray();

      return events;
    } catch (error) {
      throw new EventStoreError('Failed to get all events', error as Error);
    }
  }

  /**
   * Get current version of an aggregate
   */
  private async getCurrentVersion(aggregateId: string): Promise<number> {
    try {
      const lastEvent = await this.eventsCollection.findOne(
        { aggregateId },
        { sort: { version: -1 } }
      );

      return lastEvent ? lastEvent.version : -1;
    } catch (error) {
      throw new EventStoreError(
        `Failed to get current version for aggregate ${aggregateId}`,
        error as Error
      );
    }
  }

  /**
   * Get event count for an aggregate
   */
  async getEventCount(aggregateId: string): Promise<number> {
    try {
      return await this.eventsCollection.countDocuments({ aggregateId });
    } catch (error) {
      throw new EventStoreError(
        `Failed to get event count for aggregate ${aggregateId}`,
        error as Error
      );
    }
  }

  /**
   * Delete events for an aggregate (for testing/cleanup)
   */
  async deleteEvents(aggregateId: string): Promise<void> {
    try {
      await this.eventsCollection.deleteMany({ aggregateId });
    } catch (error) {
      throw new EventStoreError(
        `Failed to delete events for aggregate ${aggregateId}`,
        error as Error
      );
    }
  }
}

/**
 * In-Memory Event Store (for testing)
 */
export class InMemoryEventStore implements IEventStore {
  private events: Map<string, IEvent[]> = new Map();

  async saveEvents(
    aggregateId: string,
    events: IEvent[],
    expectedVersion: number
  ): Promise<void> {
    const currentEvents = this.events.get(aggregateId) || [];
    const currentVersion = currentEvents.length - 1;

    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(aggregateId, expectedVersion, currentVersion);
    }

    const newEvents = [...currentEvents, ...events];
    this.events.set(aggregateId, newEvents);
  }

  async getEvents(
    aggregateId: string,
    fromVersion: number = 0
  ): Promise<IEvent[]> {
    const events = this.events.get(aggregateId) || [];
    return events.filter((event) => event.version >= fromVersion);
  }

  async getEventsByType(
    eventType: string,
    fromTimestamp?: Date
  ): Promise<IEvent[]> {
    const allEvents: IEvent[] = [];

    for (const events of this.events.values()) {
      allEvents.push(...events);
    }

    return allEvents.filter((event) => {
      if (event.eventType !== eventType) return false;
      if (fromTimestamp && event.timestamp < fromTimestamp) return false;
      return true;
    });
  }

  async getAllEvents(fromTimestamp?: Date): Promise<IEvent[]> {
    const allEvents: IEvent[] = [];

    for (const events of this.events.values()) {
      allEvents.push(...events);
    }

    if (fromTimestamp) {
      return allEvents.filter((event) => event.timestamp >= fromTimestamp);
    }

    return allEvents;
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events.clear();
  }
}
