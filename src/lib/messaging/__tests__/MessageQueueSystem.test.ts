/**
 * Message Queue System Tests
 *
 * Comprehensive tests for the messaging infrastructure including
 * Redis and in-memory queue implementations, message factory, and broker.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MessageBroker } from '../MessageBroker';
import { MessageFactory } from '../MessageFactory';
import { InMemoryMessageQueue } from './queues/InMemoryMessageQueue';
import { RedisMessageQueue } from './queues/RedisMessageQueue';
import {
  IMessageHandler,
  MessageResult,
  QueueConfig,
  MessageType,
  MessagePriority,
} from '../types';

// Mock Redis
vi.mock('ioredis', () => {
  const mockRedis = {
    hset: vi.fn().mockResolvedValue(1),
    hgetall: vi.fn().mockResolvedValue({}),
    zadd: vi.fn().mockResolvedValue(1),
    zrange: vi.fn().mockResolvedValue([]),
    zrem: vi.fn().mockResolvedValue(1),
    del: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
    info: vi.fn().mockResolvedValue('used_memory:1024'),
    pipeline: vi.fn().mockReturnValue({
      hset: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      hincrby: vi.fn().mockReturnThis(),
      hset: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 1]]),
    }),
    disconnect: vi.fn(),
    on: vi.fn(),
  };
  
  return {
    default: vi.fn(() => mockRedis),
  };
});

describe('Message Factory', () => {
  let factory: MessageFactory;

  beforeEach(() => {
    factory = new MessageFactory();
  });

  describe('createMessage', () => {
    it('should create a basic message with default values', () => {
      const message = factory.createMessage('event', { data: 'test' });

      expect(message.id).toBeDefined();
      expect(message.type).toBe('event');
      expect(message.priority).toBe('normal');
      expect(message.status).toBe('pending');
      expect(message.payload).toEqual({ data: 'test' });
      expect(message.retryCount).toBe(0);
      expect(message.maxRetries).toBe(3);
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a message with custom options', () => {
      const message = factory.createMessage('command', { action: 'test' }, {
        priority: 'high',
        maxRetries: 5,
        ttl: 60000,
        correlationId: 'test-correlation',
      });

      expect(message.priority).toBe('high');
      expect(message.maxRetries).toBe(5);
      expect(message.ttl).toBe(60000);
      expect(message.correlationId).toBe('test-correlation');
    });
  });

  describe('createCommand', () => {
    it('should create a command message', () => {
      const message = factory.createCommand('CreateUser', { name: 'John' });

      expect(message.type).toBe('command');
      expect(message.priority).toBe('high');
      expect(message.payload).toEqual({
        commandType: 'CreateUser',
        name: 'John',
      });
    });
  });

  describe('createEvent', () => {
    it('should create an event message', () => {
      const message = factory.createEvent('UserCreated', { userId: '123' });

      expect(message.type).toBe('event');
      expect(message.priority).toBe('normal');
      expect(message.payload).toEqual({
        eventType: 'UserCreated',
        userId: '123',
      });
    });
  });

  describe('createNotification', () => {
    it('should create a notification message', () => {
      const message = factory.createNotification('EmailSent', { to: 'user@example.com' });

      expect(message.type).toBe('notification');
      expect(message.payload).toEqual({
        notificationType: 'EmailSent',
        to: 'user@example.com',
      });
    });
  });

  describe('validation', () => {
    it('should validate payload correctly', () => {
      expect(factory.validatePayload({ data: 'test' })).toBe(true);
      expect(factory.validatePayload('string')).toBe(true);
      expect(factory.validatePayload(123)).toBe(true);
      expect(factory.validatePayload(null)).toBe(true);
    });
  });
});

describe('In-Memory Message Queue', () => {
  let queue: InMemoryMessageQueue;
  let config: QueueConfig;

  beforeEach(() => {
    config = {
      name: 'test-queue',
      type: 'memory',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 100,
      batchSize: 5,
      concurrency: 2,
      enableDeadLetter: true,
      enableMetrics: true,
    };
    queue = new InMemoryMessageQueue('test-queue', 'memory', config);
  });

  afterEach(async () => {
    await queue.destroy();
  });

  describe('publish', () => {
    it('should publish a message successfully', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);

      const stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(1);
      expect(stats.pendingMessages).toBe(1);
    });

    it('should publish multiple messages', async () => {
      const factory = new MessageFactory();
      const messages = [
        factory.createMessage('event', { data: 'test1' }),
        factory.createMessage('event', { data: 'test2' }),
      ];

      await queue.publishBatch(messages);

      const stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(2);
      expect(stats.pendingMessages).toBe(2);
    });
  });

  describe('subscribe and processing', () => {
    it('should process messages with handlers', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      let processedMessage: any = null;
      const handler: IMessageHandler = {
        messageType: 'event',
        handlerName: 'test-handler',
        handle: async (msg) => {
          processedMessage = msg;
          return {
            success: true,
            data: 'processed',
            processingTime: 10,
            timestamp: new Date(),
          };
        },
        canHandle: (msg) => msg.type === 'event',
      };

      await queue.subscribe(handler);
      await queue.publish(message);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(processedMessage).toBeDefined();
      expect(processedMessage.payload.data).toBe('test');

      const stats = await queue.getQueueStats();
      expect(stats.completedMessages).toBe(1);
      expect(stats.pendingMessages).toBe(0);
    });

    it('should handle message processing failures', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      const handler: IMessageHandler = {
        messageType: 'event',
        handlerName: 'failing-handler',
        handle: async () => {
          throw new Error('Processing failed');
        },
        canHandle: (msg) => msg.type === 'event',
      };

      await queue.subscribe(handler);
      await queue.publish(message);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = await queue.getQueueStats();
      expect(stats.failedMessages).toBe(0); // Should retry first
      expect(stats.pendingMessages).toBe(1); // Message should be retried
    });
  });

  describe('queue management', () => {
    it('should get queue statistics', async () => {
      const stats = await queue.getQueueStats();
      
      expect(stats.totalMessages).toBe(0);
      expect(stats.pendingMessages).toBe(0);
      expect(stats.completedMessages).toBe(0);
      expect(stats.failedMessages).toBe(0);
      expect(stats.deadLetterMessages).toBe(0);
    });

    it('should purge all messages', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);
      
      let stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(1);

      await queue.purge();
      
      stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(0);
    });

    it('should pause and resume processing', async () => {
      await queue.pause();
      // Processing should be stopped
      
      await queue.resume();
      // Processing should be resumed
    });
  });

  describe('message operations', () => {
    it('should get a message by ID', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);
      
      const retrievedMessage = await queue.getMessage(message.id);
      expect(retrievedMessage).toBeDefined();
      expect(retrievedMessage?.id).toBe(message.id);
    });

    it('should delete a message', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);
      
      const deleted = await queue.deleteMessage(message.id);
      expect(deleted).toBe(true);
      
      const retrievedMessage = await queue.getMessage(message.id);
      expect(retrievedMessage).toBeNull();
    });

    it('should retry a failed message', async () => {
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);
      
      await queue.retryMessage(message.id);
      
      const retrievedMessage = await queue.getMessage(message.id);
      expect(retrievedMessage?.retryCount).toBe(1);
      expect(retrievedMessage?.status).toBe('pending');
    });
  });
});

describe('Message Broker', () => {
  let broker: MessageBroker;

  beforeEach(() => {
    broker = new MessageBroker('test-broker');
  });

  afterEach(async () => {
    await broker.destroy();
  });

  describe('queue management', () => {
    it('should create and manage queues', async () => {
      const config: QueueConfig = {
        name: 'test-queue',
        type: 'memory',
        maxRetries: 3,
        retryDelay: 1000,
        visibilityTimeout: 100,
        batchSize: 5,
        concurrency: 2,
        enableDeadLetter: true,
        enableMetrics: true,
      };

      const queue = await broker.createQueue(config);
      expect(queue).toBeDefined();
      expect(queue.name).toBe('test-queue');

      const retrievedQueue = await broker.getQueue('test-queue');
      expect(retrievedQueue).toBe(queue);

      const queueNames = await broker.listQueues();
      expect(queueNames).toContain('test-queue');
    });

    it('should delete queues', async () => {
      const config: QueueConfig = {
        name: 'test-queue',
        type: 'memory',
        maxRetries: 3,
        retryDelay: 1000,
        visibilityTimeout: 100,
        batchSize: 5,
        concurrency: 2,
        enableDeadLetter: true,
        enableMetrics: true,
      };

      await broker.createQueue(config);
      
      let queueNames = await broker.listQueues();
      expect(queueNames).toContain('test-queue');

      await broker.deleteQueue('test-queue');
      
      queueNames = await broker.listQueues();
      expect(queueNames).not.toContain('test-queue');
    });
  });

  describe('broker operations', () => {
    it('should connect and disconnect', async () => {
      await broker.connect();
      expect(broker.isConnected()).toBe(true);

      await broker.disconnect();
      expect(broker.isConnected()).toBe(false);
    });

    it('should get broker health', async () => {
      const health = await broker.getHealth();
      
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
      expect(health.lastChecked).toBeInstanceOf(Date);
      expect(health.uptime).toBeGreaterThan(0);
    });

    it('should get broker metrics', async () => {
      const metrics = await broker.getMetrics();
      
      expect(metrics.totalQueues).toBeDefined();
      expect(metrics.totalMessages).toBeDefined();
      expect(metrics.activeConnections).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.networkLatency).toBeDefined();
    });
  });

  describe('convenience methods', () => {
    it('should get or create queue', async () => {
      const queue = await broker.getOrCreateQueue('test-queue', 'memory');
      expect(queue).toBeDefined();

      const sameQueue = await broker.getOrCreateQueue('test-queue', 'memory');
      expect(sameQueue).toBe(queue);
    });

    it('should get all queue stats', async () => {
      await broker.getOrCreateQueue('test-queue', 'memory');
      
      const stats = await broker.getAllQueueStats();
      expect(stats['test-queue']).toBeDefined();
    });

    it('should purge all queues', async () => {
      const queue = await broker.getOrCreateQueue('test-queue', 'memory');
      const factory = new MessageFactory();
      const message = factory.createMessage('event', { data: 'test' });

      await queue.publish(message);
      
      let stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(1);

      await broker.purgeAllQueues();
      
      stats = await queue.getQueueStats();
      expect(stats.totalMessages).toBe(0);
    });
  });
});

describe('Integration Tests', () => {
  let broker: MessageBroker;
  let factory: MessageFactory;

  beforeEach(() => {
    broker = new MessageBroker('integration-test');
    factory = new MessageFactory();
  });

  afterEach(async () => {
    await broker.destroy();
  });

  it('should handle complete message flow', async () => {
    // Create queue
    const queue = await broker.getOrCreateQueue('integration-queue', 'memory');

    // Create handler
    const processedMessages: any[] = [];
    const handler: IMessageHandler = {
      messageType: 'event',
      handlerName: 'integration-handler',
      handle: async (message) => {
        processedMessages.push(message);
        return {
          success: true,
          data: 'processed',
          processingTime: 10,
          timestamp: new Date(),
        };
      },
      canHandle: (message) => message.type === 'event',
    };

    // Subscribe handler
    await queue.subscribe(handler);

    // Publish messages
    const messages = [
      factory.createEvent('UserCreated', { userId: '1' }),
      factory.createEvent('UserUpdated', { userId: '2' }),
      factory.createCommand('DeleteUser', { userId: '3' }),
    ];

    for (const message of messages) {
      await queue.publish(message);
    }

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify results
    expect(processedMessages).toHaveLength(2); // Only events should be processed
    expect(processedMessages[0]?.payload.eventType).toBe('UserCreated');
    expect(processedMessages[1]?.payload.eventType).toBe('UserUpdated');

    const stats = await queue.getQueueStats();
    expect(stats.completedMessages).toBe(2);
    expect(stats.pendingMessages).toBe(1); // Command should remain unprocessed
  });

  it('should handle message priorities', async () => {
    const queue = await broker.getOrCreateQueue('priority-queue', 'memory');

    const processedOrder: string[] = [];
    const handler: IMessageHandler = {
      messageType: 'event',
      handlerName: 'priority-handler',
      handle: async (message) => {
        processedOrder.push(message.payload.priority);
        return {
          success: true,
          data: 'processed',
          processingTime: 10,
          timestamp: new Date(),
        };
      },
      canHandle: () => true,
    };

    await queue.subscribe(handler);

    // Publish messages with different priorities
    const messages = [
      factory.createMessage('event', { priority: 'low' }, { priority: 'low' }),
      factory.createMessage('event', { priority: 'critical' }, { priority: 'critical' }),
      factory.createMessage('event', { priority: 'normal' }, { priority: 'normal' }),
      factory.createMessage('event', { priority: 'high' }, { priority: 'high' }),
    ];

    for (const message of messages) {
      await queue.publish(message);
    }

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 300));

    // Critical should be processed first
    expect(processedOrder[0]).toBe('critical');
  });
});
