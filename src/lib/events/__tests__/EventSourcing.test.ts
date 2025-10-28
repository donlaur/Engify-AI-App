/**
 * Event Sourcing Tests
 *
 * Comprehensive tests for Event Sourcing pattern implementation.
 * Tests event store, event bus, aggregates, and handlers.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryEventStore } from '../store/EventStore';
import { EventBus } from '../store/EventBus';
import { UserAggregate } from '../UserAggregate';
import { UserCreatedEvent, UserPlanChangedEvent } from '../UserEvents';
import {
  UserStatisticsHandler,
  UserNotificationHandler,
  UserIntegrationHandler,
} from '../handlers/UserEventHandlers';

describe('Event Sourcing', () => {
  describe('InMemoryEventStore', () => {
    let eventStore: InMemoryEventStore;

    beforeEach(() => {
      eventStore = new InMemoryEventStore();
    });

    it('should save and retrieve events', async () => {
      // Arrange
      const aggregateId = 'user-123';
      const events = [
        {
          eventId: 'event-1',
          eventType: 'UserCreated',
          aggregateId,
          aggregateType: 'User',
          version: 0,
          timestamp: new Date(),
          data: {
            userId: aggregateId,
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        {
          eventId: 'event-2',
          eventType: 'UserUpdated',
          aggregateId,
          aggregateType: 'User',
          version: 1,
          timestamp: new Date(),
          data: { userId: aggregateId, changes: { name: 'Updated Name' } },
        },
      ];

      // Act
      await eventStore.saveEvents(aggregateId, events, -1);
      const retrievedEvents = await eventStore.getEvents(aggregateId);

      // Assert
      expect(retrievedEvents).toHaveLength(2);
      expect(retrievedEvents[0]?.eventType).toBe('UserCreated');
      expect(retrievedEvents[1]?.eventType).toBe('UserUpdated');
    });

    it('should handle concurrency conflicts', async () => {
      // Arrange
      const aggregateId = 'user-123';
      const events1 = [
        {
          eventId: 'event-1',
          eventType: 'UserCreated',
          aggregateId,
          aggregateType: 'User',
          version: 0,
          timestamp: new Date(),
          data: {
            userId: aggregateId,
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      ];

      const events2 = [
        {
          eventId: 'event-2',
          eventType: 'UserUpdated',
          aggregateId,
          aggregateType: 'User',
          version: 1,
          timestamp: new Date(),
          data: { userId: aggregateId, changes: { name: 'Updated Name' } },
        },
      ];

      // Act
      await eventStore.saveEvents(aggregateId, events1, -1);

      // Assert
      await expect(
        eventStore.saveEvents(aggregateId, events2, -1)
      ).rejects.toThrow('Concurrency conflict');
    });

    it('should get events by type', async () => {
      // Arrange
      const aggregateId = 'user-123';
      const events = [
        {
          eventId: 'event-1',
          eventType: 'UserCreated',
          aggregateId,
          aggregateType: 'User',
          version: 0,
          timestamp: new Date(),
          data: {
            userId: aggregateId,
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        {
          eventId: 'event-2',
          eventType: 'UserUpdated',
          aggregateId,
          aggregateType: 'User',
          version: 1,
          timestamp: new Date(),
          data: { userId: aggregateId, changes: { name: 'Updated Name' } },
        },
      ];

      await eventStore.saveEvents(aggregateId, events, -1);

      // Act
      const userCreatedEvents = await eventStore.getEventsByType('UserCreated');

      // Assert
      expect(userCreatedEvents).toHaveLength(1);
      expect(userCreatedEvents[0]?.eventType).toBe('UserCreated');
    });
  });

  describe('EventBus', () => {
    let eventBus: EventBus;

    beforeEach(() => {
      eventBus = new EventBus();
    });

    it('should publish and handle events', async () => {
      // Arrange
      const handler = {
        eventType: 'UserCreated',
        handle: vi.fn(),
      };

      eventBus.subscribe('UserCreated', handler);

      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      // Act
      await eventBus.publish(event);

      // Assert
      expect(handler.handle).toHaveBeenCalledWith(event);
    });

    it('should handle multiple handlers for same event type', async () => {
      // Arrange
      const handler1 = {
        eventType: 'UserCreated',
        handle: vi.fn(),
      };
      const handler2 = {
        eventType: 'UserCreated',
        handle: vi.fn(),
      };

      eventBus.subscribe('UserCreated', handler1);
      eventBus.subscribe('UserCreated', handler2);

      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      // Act
      await eventBus.publish(event);

      // Assert
      expect(handler1.handle).toHaveBeenCalledWith(event);
      expect(handler2.handle).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe handlers', async () => {
      // Arrange
      const handler = {
        eventType: 'UserCreated',
        handle: vi.fn(),
      };

      eventBus.subscribe('UserCreated', handler);
      eventBus.unsubscribe('UserCreated', handler);

      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      // Act
      await eventBus.publish(event);

      // Assert
      expect(handler.handle).not.toHaveBeenCalled();
    });
  });

  describe('UserAggregate', () => {
    it('should create user and generate events', () => {
      // Arrange
      const aggregate = new UserAggregate();

      // Act
      aggregate.createUser(
        'user-123',
        'test@example.com',
        'Test User',
        'user',
        'free',
        undefined,
        'correlation-123'
      );

      // Assert
      const state = aggregate.getState();
      expect(state.id).toBe('user-123');
      expect(state.email).toBe('test@example.com');
      expect(state.name).toBe('Test User');
      expect(state.role).toBe('user');
      expect(state.plan).toBe('free');
      expect(state.version).toBe(0);

      const events = aggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.eventType).toBe('UserCreated');
      expect(events[0]?.aggregateId).toBe('user-123');
    });

    it('should update user and generate events', () => {
      // Arrange
      const aggregate = new UserAggregate();
      aggregate.createUser('user-123', 'test@example.com', 'Test User');

      // Act
      aggregate.updateUser({ name: 'Updated Name' }, 'correlation-456');

      // Assert
      const state = aggregate.getState();
      expect(state.name).toBe('Updated Name');
      expect(state.version).toBe(1);

      const events = aggregate.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]?.eventType).toBe('UserUpdated');
    });

    it('should change plan and generate events', () => {
      // Arrange
      const aggregate = new UserAggregate();
      aggregate.createUser(
        'user-123',
        'test@example.com',
        'Test User',
        'user',
        'free'
      );

      // Act
      aggregate.changePlan('pro', 'correlation-789');

      // Assert
      const state = aggregate.getState();
      expect(state.plan).toBe('pro');
      expect(state.version).toBe(1);

      const events = aggregate.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]?.eventType).toBe('UserPlanChanged');
    });

    it('should delete user and generate events', () => {
      // Arrange
      const aggregate = new UserAggregate();
      aggregate.createUser('user-123', 'test@example.com', 'Test User');

      // Act
      aggregate.deleteUser('correlation-999');

      // Assert
      const state = aggregate.getState();
      expect(state.deletedAt).toBeDefined();
      expect(state.version).toBe(1);

      const events = aggregate.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]?.eventType).toBe('UserDeleted');
    });

    it('should reconstruct state from events', () => {
      // Arrange
      const events = [
        {
          eventId: 'event-1',
          eventType: 'UserCreated',
          aggregateId: 'user-123',
          aggregateType: 'User',
          version: 0,
          timestamp: new Date(),
          data: {
            userId: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
            plan: 'free',
          },
        },
        {
          eventId: 'event-2',
          eventType: 'UserUpdated',
          aggregateId: 'user-123',
          aggregateType: 'User',
          version: 1,
          timestamp: new Date(),
          data: { userId: 'user-123', changes: { name: 'Updated Name' } },
        },
      ];

      // Act
      const aggregate = new UserAggregate(events);

      // Assert
      const state = aggregate.getState();
      expect(state.id).toBe('user-123');
      expect(state.email).toBe('test@example.com');
      expect(state.name).toBe('Updated Name');
      expect(state.version).toBe(1);
    });

    it('should prevent operations on deleted user', () => {
      // Arrange
      const aggregate = new UserAggregate();
      aggregate.createUser('user-123', 'test@example.com', 'Test User');
      aggregate.deleteUser();

      // Act & Assert
      expect(() => {
        aggregate.updateUser({ name: 'New Name' });
      }).toThrow('Cannot update deleted user');
    });
  });

  describe('User Event Handlers', () => {
    let statisticsHandler: UserStatisticsHandler;
    let notificationHandler: UserNotificationHandler;
    let integrationHandler: UserIntegrationHandler;

    beforeEach(() => {
      statisticsHandler = new UserStatisticsHandler();
      notificationHandler = new UserNotificationHandler();
      integrationHandler = new UserIntegrationHandler();
    });

    it('should handle user created event in statistics handler', async () => {
      // Arrange
      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          plan: 'free',
        },
      } as UserCreatedEvent;

      // Act
      await statisticsHandler.handle(event);

      // Assert
      const stats = statisticsHandler.getStatistics();
      expect(stats.totalUsers).toBe(1);
      expect(stats.usersByPlan.free).toBe(1);
      expect(stats.usersByRole.user).toBe(1);
    });

    it('should handle user plan changed event in statistics handler', async () => {
      // Arrange
      const event = {
        eventId: 'event-1',
        eventType: 'UserPlanChanged',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 1,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          oldPlan: 'free',
          newPlan: 'pro',
          changedAt: new Date(),
        },
      } as UserPlanChangedEvent;

      // Act
      await statisticsHandler.handle(event);

      // Assert
      const stats = statisticsHandler.getStatistics();
      expect(stats.usersByPlan.free).toBe(-1);
      expect(stats.usersByPlan.pro).toBe(1);
    });

    it('should handle user created event in notification handler', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          plan: 'free',
        },
      } as UserCreatedEvent;

      // Act
      await notificationHandler.handle(event);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        '[NOTIFICATION] Welcome email sent to test@example.com'
      );

      consoleSpy.mockRestore();
    });

    it('should handle user created event in integration handler', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const event = {
        eventId: 'event-1',
        eventType: 'UserCreated',
        aggregateId: 'user-123',
        aggregateType: 'User',
        version: 0,
        timestamp: new Date(),
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          plan: 'free',
        },
      } as UserCreatedEvent;

      // Act
      await integrationHandler.handle(event);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INTEGRATION] Creating Stripe customer for user user-123'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Event Sourcing Integration', () => {
    it('should integrate event store, event bus, and aggregate', async () => {
      // Arrange
      const eventStore = new InMemoryEventStore();
      const eventBus = new EventBus();
      const statisticsHandler = new UserStatisticsHandler();

      eventBus.subscribe('UserCreated', statisticsHandler);

      const aggregate = new UserAggregate();

      // Act
      aggregate.createUser('user-123', 'test@example.com', 'Test User');

      const events = aggregate.getUncommittedEvents();
      await eventStore.saveEvents('user-123', events, -1);

      await eventBus.publishMany(events);
      aggregate.markEventsAsCommitted();

      // Assert
      const storedEvents = await eventStore.getEvents('user-123');
      expect(storedEvents).toHaveLength(1);

      const stats = statisticsHandler.getStatistics();
      expect(stats.totalUsers).toBe(1);

      const state = aggregate.getState();
      expect(state.id).toBe('user-123');
      expect(state.email).toBe('test@example.com');
    });
  });
});
