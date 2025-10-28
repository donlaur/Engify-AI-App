/**
 * QStash Message Queue Tests
 *
 * Tests for QStash integration with webhook processing,
 * message handling, and error scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QStashMessageQueue } from '../queues/QStashMessageQueue';
import { MessageFactory } from '../MessageFactory';
import { QueueConfig, IMessageHandler, MessageResult } from '../types';

// Mock fetch
global.fetch = vi.fn();

describe('QStash Message Queue', () => {
  let queue: QStashMessageQueue;
  let config: QueueConfig;
  let factory: MessageFactory;

  beforeEach(() => {
    // Mock environment variables
    process.env.QSTASH_URL = 'https://qstash.upstash.io/v2';
    process.env.QSTASH_TOKEN = 'test-token';
    process.env.QSTASH_WEBHOOK_URL = 'https://example.com';

    config = {
      name: 'test-queue',
      type: 'redis',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 100,
      batchSize: 5,
      concurrency: 2,
      enableDeadLetter: true,
      enableMetrics: true,
    };

    factory = new MessageFactory();
    queue = new QStashMessageQueue('test-queue', 'redis', config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Publishing Messages', () => {
    it('should publish a message successfully', async () => {
      const message = factory.createMessage('event', { data: 'test' });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messageId: message.id }),
      });

      await queue.publish(message);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://qstash.upstash.io/v2/publish',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining(message.id),
        })
      );
    });

    it('should publish batch messages', async () => {
      const messages = [
        factory.createMessage('event', { data: 'test1' }),
        factory.createMessage('event', { data: 'test2' }),
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await queue.publishBatch(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://qstash.upstash.io/v2/publish/batch',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('messages'),
        })
      );
    });

    it('should handle publish errors', async () => {
      const message = factory.createMessage('event', { data: 'test' });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request'),
      });

      await expect(queue.publish(message)).rejects.toThrow('QStash request failed');
    });
  });

  describe('Message Processing', () => {
    it('should process messages successfully', async () => {
      const messageData = {
        messageId: 'test-message-id',
        type: 'event',
        priority: 'normal',
        payload: { data: 'test' },
        metadata: { source: 'test' },
        correlationId: 'test-correlation',
        replyTo: '',
        retryCount: 0,
        maxRetries: 3,
      };

      const result = await queue.processMessage(messageData);

      expect(result.success).toBe(false); // No handler registered
      expect(result.error).toContain('No handler found');
    });

    it('should process messages with handlers', async () => {
      const handler: IMessageHandler = {
        messageType: 'event',
        handlerName: 'test-handler',
        handle: async (message) => ({
          success: true,
          data: 'processed',
          processingTime: 10,
          timestamp: new Date(),
        }),
        canHandle: (message) => message.type === 'event',
      };

      await queue.subscribe(handler);

      const messageData = {
        messageId: 'test-message-id',
        type: 'event',
        priority: 'normal',
        payload: { data: 'test' },
        metadata: { source: 'test' },
        correlationId: 'test-correlation',
        replyTo: '',
        retryCount: 0,
        maxRetries: 3,
      };

      const result = await queue.processMessage(messageData);

      expect(result.success).toBe(true);
      expect(result.data).toBe('processed');
    });

    it('should handle processing errors', async () => {
      const handler: IMessageHandler = {
        messageType: 'event',
        handlerName: 'failing-handler',
        handle: async () => {
          throw new Error('Processing failed');
        },
        canHandle: (message) => message.type === 'event',
      };

      await queue.subscribe(handler);

      const messageData = {
        messageId: 'test-message-id',
        type: 'event',
        priority: 'normal',
        payload: { data: 'test' },
        metadata: { source: 'test' },
        correlationId: 'test-correlation',
        replyTo: '',
        retryCount: 0,
        maxRetries: 3,
      };

      const result = await queue.processMessage(messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing failed');
    });
  });

  describe('Queue Management', () => {
    it('should get queue statistics', async () => {
      // Mock Redis stats response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(['totalMessages', '5', 'pendingMessages', '2']),
      });

      const stats = await queue.getQueueStats();

      expect(stats.totalMessages).toBe(5);
      expect(stats.pendingMessages).toBe(2);
    });

    it('should handle missing statistics gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Redis unavailable'));

      const stats = await queue.getQueueStats();

      expect(stats.totalMessages).toBe(0);
      expect(stats.pendingMessages).toBe(0);
    });

    it('should purge queue', async () => {
      // QStash doesn't support purging all messages, only resetting stats
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await queue.purge();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should pause and resume processing', async () => {
      await queue.pause();
      await queue.resume();
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Message Operations', () => {
    it('should get message by ID', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
          'id', 'test-id',
          'type', 'event',
          'priority', 'normal',
          'status', 'pending',
          'payload', '{"data":"test"}',
          'metadata', '{"source":"test"}',
          'createdAt', '2023-01-01T00:00:00.000Z',
          'updatedAt', '2023-01-01T00:00:00.000Z',
          'correlationId', '',
          'replyTo', '',
          'ttl', '',
          'retryCount', '0',
          'maxRetries', '3',
        ]),
      });

      const message = await queue.getMessage('test-id');

      // Debug: Check what URL was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://qstash.upstash.io/v2/redis/hgetall/qstash:message:test-queue:test-id',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );

      expect(message).toBeDefined();
      expect(message?.id).toBe('test-id');
      expect(message?.type).toBe('event');
    });

    it('should return null for non-existent message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const message = await queue.getMessage('non-existent');

      expect(message).toBeNull();
    });

    it('should delete message', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(1),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(1),
        });

      const deleted = await queue.deleteMessage('test-id');

      expect(deleted).toBe(true);
    });

    it('should retry failed message', async () => {
      const message = factory.createMessage('event', { data: 'test' });
      message.retryCount = 1;
      message.maxRetries = 3;

      // Clear any previous mocks and re-establish fetch mock
      vi.clearAllMocks();
      global.fetch = vi.fn();

      // Mock getMessage to return the message
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
          'id', message.id,
          'type', message.type,
          'priority', message.priority,
          'status', message.status,
          'payload', JSON.stringify(message.payload),
          'metadata', JSON.stringify(message.metadata),
          'createdAt', message.createdAt.toISOString(),
          'updatedAt', message.updatedAt.toISOString(),
          'correlationId', message.correlationId || '',
          'replyTo', message.replyTo || '',
          'ttl', message.ttl?.toString() || '',
          'retryCount', message.retryCount.toString(),
          'maxRetries', message.maxRetries.toString(),
        ]),
      });

      // Mock the publish call for retry
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await queue.retryMessage(message.id);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const message = factory.createMessage('event', { data: 'test' });
      
      // Clear any previous mocks and re-establish fetch mock
      vi.clearAllMocks();
      global.fetch = vi.fn();
      
      // Mock the main publish request to fail
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(queue.publish(message)).rejects.toThrow('QStash request failed');
    });

    it('should handle invalid responses', async () => {
      const message = factory.createMessage('event', { data: 'test' });
      
      // Clear any previous mocks and re-establish fetch mock
      vi.clearAllMocks();
      global.fetch = vi.fn();
      
      // Mock the main publish request to return invalid response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      });

      await expect(queue.publish(message)).rejects.toThrow('QStash request failed');
    });

    it('should handle missing credentials', () => {
      delete process.env.QSTASH_TOKEN;

      expect(() => {
        new QStashMessageQueue('test-queue', 'redis', config);
      }).toThrow('QStash token not found');
    });
  });

  describe('Priority Handling', () => {
    it('should set correct delays based on priority', async () => {
      const criticalMessage = factory.createMessage('event', { data: 'critical' }, {
        priority: 'critical',
      });
      
      const lowMessage = factory.createMessage('event', { data: 'low' }, {
        priority: 'low',
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await queue.publish(criticalMessage);
      await queue.publish(lowMessage);

      // Check that critical message has 0s delay and low message has 30s delay
      const calls = (global.fetch as any).mock.calls;
      expect(calls[0][1].body).toContain('"delay":"0s"');
      expect(calls[1][1].body).toContain('"delay":"30s"');
    });
  });
});
