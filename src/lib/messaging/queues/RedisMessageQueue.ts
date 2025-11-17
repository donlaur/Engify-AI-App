/**
 * Redis Message Queue Implementation
 *
 * High-performance message queue using Redis for async processing,
 * event-driven architecture, and distributed system communication.
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logging/logger';
import {
  IMessageQueue,
  IMessage,
  IMessageHandler,
  // MessageResult,
  QueueStats,
  QueueConfig,
  MessageQueueError,
  DeadLetterMessage,
  DeadLetterError,
  // QueueConnectionError,
  // MessageProcessingError,
} from '../types';

/**
 * Redis Message Queue Implementation
 */
export class RedisMessageQueue implements IMessageQueue {
  private redis: Redis;
  private handlers = new Map<string, IMessageHandler>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;

  constructor(
    public readonly name: string,
    public readonly type: 'redis' = 'redis',
    private config: QueueConfig,
    redisClient?: Redis
  ) {
    this.redis =
      redisClient ||
      new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: 3,
      });

    this.setupErrorHandling();
  }

  /**
   * Publish a message to the queue
   */
  async publish(message: IMessage): Promise<void> {
    try {
      const messageKey = this.getMessageKey(message.id);
      const queueKey = this.getQueueKey();

      // Store message data
      await this.redis.hset(messageKey, {
        id: message.id,
        type: message.type,
        priority: message.priority,
        status: message.status,
        payload: JSON.stringify(message.payload),
        metadata: JSON.stringify(message.metadata),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        correlationId: message.correlationId || '',
        replyTo: message.replyTo || '',
        ttl: message.ttl?.toString() || '',
        retryCount: message.retryCount.toString(),
        maxRetries: message.maxRetries.toString(),
      });

      // Add to priority queue
      const priorityScore = this.getPriorityScore(message.priority);
      await this.redis.zadd(queueKey, priorityScore, message.id);

      // Set TTL if specified
      if (message.ttl) {
        await this.redis.expire(messageKey, Math.ceil(message.ttl / 1000));
      }

      // Update queue stats
      await this.updateQueueStats('published');
    } catch (error) {
      throw new MessageQueueError(
        `Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'publish',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Subscribe to messages with a handler
   */
  async subscribe(handler: IMessageHandler): Promise<void> {
    this.handlers.set(handler.handlerName, handler);

    if (!this.isProcessing) {
      await this.startProcessing();
    }
  }

  /**
   * Unsubscribe a handler
   */
  async unsubscribe(handlerName: string): Promise<void> {
    this.handlers.delete(handlerName);

    if (this.handlers.size === 0) {
      await this.stopProcessing();
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const statsKey = this.getStatsKey();
      const stats = await this.redis.hgetall(statsKey);

      return {
        totalMessages: parseInt(stats.totalMessages || '0'),
        pendingMessages: parseInt(stats.pendingMessages || '0'),
        processingMessages: parseInt(stats.processingMessages || '0'),
        completedMessages: parseInt(stats.completedMessages || '0'),
        failedMessages: parseInt(stats.failedMessages || '0'),
        deadLetterMessages: parseInt(stats.deadLetterMessages || '0'),
        averageProcessingTime: parseFloat(stats.averageProcessingTime || '0'),
        throughput: parseFloat(stats.throughput || '0'),
        lastProcessedAt: stats.lastProcessedAt
          ? new Date(stats.lastProcessedAt)
          : null,
      };
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get queue stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getStats',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Purge all messages from the queue
   */
  async purge(): Promise<void> {
    try {
      const queueKey = this.getQueueKey();
      // @ts-expect-error - intentionally unused, kept for potential future use
      const _pattern = this.getMessageKeyPattern();

      // Get all message IDs
      const messageIds = await this.redis.zrange(queueKey, 0, -1);

      if (messageIds.length > 0) {
        // Delete all message data
        const keys = messageIds.map((id) => this.getMessageKey(id));
        await this.redis.del(...keys);

        // Clear the queue
        await this.redis.del(queueKey);
      }

      // Reset stats
      await this.resetQueueStats();
    } catch (error) {
      throw new MessageQueueError(
        `Failed to purge queue: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'purge',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Pause message processing
   */
  async pause(): Promise<void> {
    await this.stopProcessing();
  }

  /**
   * Resume message processing
   */
  async resume(): Promise<void> {
    if (this.handlers.size > 0) {
      await this.startProcessing();
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(id: string): Promise<IMessage | null> {
    try {
      const messageKey = this.getMessageKey(id);
      const messageData = await this.redis.hgetall(messageKey);

      if (Object.keys(messageData).length === 0) {
        return null;
      }

      return this.deserializeMessage(messageData);
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getMessage',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<boolean> {
    try {
      const messageKey = this.getMessageKey(id);
      const queueKey = this.getQueueKey();

      // Remove from queue
      await this.redis.zrem(queueKey, id);

      // Delete message data
      const deleted = await this.redis.del(messageKey);

      return deleted > 0;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'deleteMessage',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retry a failed message
   */
  async retryMessage(id: string): Promise<void> {
    try {
      const message = await this.getMessage(id);
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.retryCount >= message.maxRetries) {
        throw new Error('Message has exceeded maximum retry count');
      }

      // Update retry count and status
      const updatedMessage: IMessage = {
        ...message,
        retryCount: message.retryCount + 1,
        status: 'pending',
        updatedAt: new Date(),
      };

      // Update in Redis
      const messageKey = this.getMessageKey(id);
      await this.redis.hset(messageKey, {
        retryCount: updatedMessage.retryCount.toString(),
        status: updatedMessage.status,
        updatedAt: updatedMessage.updatedAt.toISOString(),
      });

      // Re-add to queue
      const queueKey = this.getQueueKey();
      const priorityScore = this.getPriorityScore(updatedMessage.priority);
      await this.redis.zadd(queueKey, priorityScore, id);
    } catch (error) {
      throw new MessageQueueError(
        `Failed to retry message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'retryMessage',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Publish multiple messages in batch
   */
  async publishBatch(messages: IMessage[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      for (const message of messages) {
        const messageKey = this.getMessageKey(message.id);
        const queueKey = this.getQueueKey();

        // Store message data
        pipeline.hset(messageKey, {
          id: message.id,
          type: message.type,
          priority: message.priority,
          status: message.status,
          payload: JSON.stringify(message.payload),
          metadata: JSON.stringify(message.metadata),
          createdAt: message.createdAt.toISOString(),
          updatedAt: message.updatedAt.toISOString(),
          correlationId: message.correlationId || '',
          replyTo: message.replyTo || '',
          ttl: message.ttl?.toString() || '',
          retryCount: message.retryCount.toString(),
          maxRetries: message.maxRetries.toString(),
        });

        // Add to priority queue
        const priorityScore = this.getPriorityScore(message.priority);
        pipeline.zadd(queueKey, priorityScore, message.id);

        // Set TTL if specified
        if (message.ttl) {
          pipeline.expire(messageKey, Math.ceil(message.ttl / 1000));
        }
      }

      await pipeline.exec();
      await this.updateQueueStats('published', messages.length);
    } catch (error) {
      throw new MessageQueueError(
        `Failed to publish batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'publishBatch',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get pending messages
   */
  async getPendingMessages(limit: number = 10): Promise<IMessage[]> {
    try {
      const queueKey = this.getQueueKey();
      const messageIds = await this.redis.zrange(queueKey, 0, limit - 1);

      const messages: IMessage[] = [];
      for (const id of messageIds) {
        const message = await this.getMessage(id);
        if (message) {
          messages.push(message);
        }
      }

      return messages;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get pending messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getPendingMessages',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Start message processing
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(
      () => this.processMessages(),
      this.config.visibilityTimeout || 1000
    );
  }

  /**
   * Stop message processing
   */
  private async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
  }

  /**
   * Process messages from the queue
   */
  private async processMessages(): Promise<void> {
    try {
      const messages = await this.getPendingMessages(this.config.batchSize);

      for (const message of messages) {
        await this.processMessage(message);
      }
    } catch (error) {
      logger.error('Error processing messages', { 
        queue: this.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: IMessage): Promise<void> {
    const startTime = Date.now();

    try {
      // Find appropriate handler
      const handler = this.findHandler(message);
      if (!handler) {
        logger.warn('No handler found for message type', { 
          queue: this.name,
          messageType: message.type,
          messageId: message.id,
        });
        return;
      }

      // Update message status to processing
      await this.updateMessageStatus(message.id, 'processing');

      // Process the message
      const result = await handler.handle(message);

      // Update message status based on result
      if (result.success) {
        await this.updateMessageStatus(message.id, 'completed');
        await this.updateQueueStats('completed');
      } else {
        await this.handleMessageFailure(
          message,
          result.error || 'Unknown error'
        );
      }

      // Update processing time stats
      const processingTime = Date.now() - startTime;
      await this.updateProcessingTimeStats(processingTime);
    } catch (error) {
      await this.handleMessageFailure(
        message,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Find appropriate handler for message
   */
  private findHandler(message: IMessage): IMessageHandler | null {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(message)) {
        return handler;
      }
    }
    return null;
  }

  /**
   * Handle message processing failure
   */
  private async handleMessageFailure(
    message: IMessage,
    error: string
  ): Promise<void> {
    if (message.retryCount < message.maxRetries) {
      // Retry the message
      await this.retryMessage(message.id);
      await this.updateQueueStats('retrying');
    } else {
      // Move to dead letter queue
      await this.moveToDLQ(message, error);
      await this.updateMessageStatus(message.id, 'dead_letter');
      await this.updateQueueStats('dead_letter');

      logger.error('Message moved to dead letter queue', {
        queue: this.name,
        messageId: message.id,
        error,
      });
    }
  }

  /**
   * Update message status
   */
  private async updateMessageStatus(id: string, status: string): Promise<void> {
    const messageKey = this.getMessageKey(id);
    await this.redis.hset(messageKey, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update queue statistics
   */
  private async updateQueueStats(
    operation: string,
    count: number = 1
  ): Promise<void> {
    const statsKey = this.getStatsKey();
    const pipeline = this.redis.pipeline();

    switch (operation) {
      case 'published':
        pipeline.hincrby(statsKey, 'totalMessages', count);
        pipeline.hincrby(statsKey, 'pendingMessages', count);
        break;
      case 'completed':
        pipeline.hincrby(statsKey, 'completedMessages', count);
        pipeline.hincrby(statsKey, 'pendingMessages', -count);
        break;
      case 'failed':
        pipeline.hincrby(statsKey, 'failedMessages', count);
        pipeline.hincrby(statsKey, 'pendingMessages', -count);
        break;
      case 'retrying':
        pipeline.hincrby(statsKey, 'pendingMessages', count);
        break;
      case 'dead_letter':
        pipeline.hincrby(statsKey, 'deadLetterMessages', count);
        pipeline.hincrby(statsKey, 'pendingMessages', -count);
        break;
    }

    pipeline.hset(statsKey, 'lastProcessedAt', new Date().toISOString());
    await pipeline.exec();
  }

  /**
   * Update processing time statistics
   */
  private async updateProcessingTimeStats(
    processingTime: number
  ): Promise<void> {
    const statsKey = this.getStatsKey();
    const currentAvg = await this.redis.hget(statsKey, 'averageProcessingTime');
    const currentCount = await this.redis.hget(statsKey, 'completedMessages');

    const count = parseInt(currentCount || '0');
    const avg = parseFloat(currentAvg || '0');

    const newAvg =
      count > 0 ? (avg * count + processingTime) / (count + 1) : processingTime;

    await this.redis.hset(statsKey, 'averageProcessingTime', newAvg.toString());
  }

  /**
   * Reset queue statistics
   */
  private async resetQueueStats(): Promise<void> {
    const statsKey = this.getStatsKey();
    await this.redis.del(statsKey);
  }

  /**
   * Get priority score for Redis sorted set
   */
  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'normal':
        return 2;
      case 'low':
        return 1;
      default:
        return 2;
    }
  }

  /**
   * Generate Redis keys
   */
  private getQueueKey(): string {
    return `mq:queue:${this.name}`;
  }

  private getMessageKey(id: string): string {
    return `mq:message:${this.name}:${id}`;
  }

  private getMessageKeyPattern(): string {
    return `mq:message:${this.name}:*`;
  }

  private getStatsKey(): string {
    return `mq:stats:${this.name}`;
  }

  private getDLQKey(messageId: string): string {
    return `dlq:${this.name}:${messageId}`;
  }

  private getDLQSetKey(): string {
    return `dlq:${this.name}:set`;
  }

  /**
   * Move a message to the dead letter queue
   */
  async moveToDLQ(message: IMessage, reason: string): Promise<void> {
    try {
      const dlqKey = this.getDLQKey(message.id);
      const dlqSetKey = this.getDLQSetKey();
      const now = new Date();

      // Store DLQ message with metadata
      const dlqMessage: DeadLetterMessage = {
        message,
        reason,
        failedAt: now,
        originalQueue: this.name,
      };

      // Store in Redis
      await this.redis.hset(dlqKey, {
        messageId: message.id,
        messageType: message.type,
        priority: message.priority,
        payload: JSON.stringify(message.payload),
        metadata: JSON.stringify(message.metadata),
        reason,
        failedAt: now.toISOString(),
        originalQueue: this.name,
        retryCount: message.retryCount.toString(),
        createdAt: message.createdAt.toISOString(),
        correlationId: message.correlationId || '',
      });

      // Set TTL to 30 days (2592000 seconds)
      await this.redis.expire(dlqKey, 2592000);

      // Add to DLQ set with timestamp score for ordering
      await this.redis.zadd(dlqSetKey, now.getTime(), message.id);

      // Remove from main queue
      const queueKey = this.getQueueKey();
      await this.redis.zrem(queueKey, message.id);

      logger.info('Message moved to DLQ', {
        queue: this.name,
        messageId: message.id,
        reason,
      });
    } catch (error) {
      throw new DeadLetterError(
        `Failed to move message to DLQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        message.id,
        reason,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get messages from the dead letter queue
   */
  async getDLQMessages(limit: number = 50, offset: number = 0): Promise<DeadLetterMessage[]> {
    try {
      const dlqSetKey = this.getDLQSetKey();

      // Get message IDs from sorted set (newest first)
      const messageIds = await this.redis.zrevrange(
        dlqSetKey,
        offset,
        offset + limit - 1
      );

      const dlqMessages: DeadLetterMessage[] = [];

      for (const messageId of messageIds) {
        const dlqKey = this.getDLQKey(messageId);
        const data = await this.redis.hgetall(dlqKey);

        if (Object.keys(data).length > 0) {
          const message: IMessage = {
            id: data.messageId,
            type: data.messageType as import('../types').MessageType,
            priority: data.priority as import('../types').MessagePriority,
            status: 'dead_letter',
            payload: JSON.parse(data.payload),
            metadata: JSON.parse(data.metadata),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.failedAt),
            correlationId: data.correlationId || undefined,
            replyTo: undefined,
            ttl: undefined,
            retryCount: parseInt(data.retryCount),
            maxRetries: this.config.maxRetries,
          };

          dlqMessages.push({
            message,
            reason: data.reason,
            failedAt: new Date(data.failedAt),
            originalQueue: data.originalQueue,
          });
        }
      }

      return dlqMessages;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get DLQ messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getDLQMessages',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get DLQ statistics
   */
  async getDLQStats(): Promise<{
    totalMessages: number;
    oldestMessage: Date | null;
    newestMessage: Date | null;
  }> {
    try {
      const dlqSetKey = this.getDLQSetKey();

      const total = await this.redis.zcard(dlqSetKey);

      let oldestMessage: Date | null = null;
      let newestMessage: Date | null = null;

      if (total > 0) {
        // Get oldest (lowest score)
        const oldest = await this.redis.zrange(dlqSetKey, 0, 0, 'WITHSCORES');
        if (oldest.length >= 2) {
          oldestMessage = new Date(parseInt(oldest[1]));
        }

        // Get newest (highest score)
        const newest = await this.redis.zrevrange(dlqSetKey, 0, 0, 'WITHSCORES');
        if (newest.length >= 2) {
          newestMessage = new Date(parseInt(newest[1]));
        }
      }

      return {
        totalMessages: total,
        oldestMessage,
        newestMessage,
      };
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get DLQ stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getDLQStats',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Replay a message from the dead letter queue
   */
  async replayFromDLQ(messageId: string): Promise<void> {
    try {
      const dlqKey = this.getDLQKey(messageId);
      const dlqSetKey = this.getDLQSetKey();

      // Get DLQ message data
      const data = await this.redis.hgetall(dlqKey);

      if (Object.keys(data).length === 0) {
        throw new Error('Message not found in DLQ');
      }

      // Recreate the message with reset retry count
      const message: IMessage = {
        id: data.messageId,
        type: data.messageType as import('../types').MessageType,
        priority: data.priority as import('../types').MessagePriority,
        status: 'pending',
        payload: JSON.parse(data.payload),
        metadata: JSON.parse(data.metadata),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(),
        correlationId: data.correlationId || undefined,
        replyTo: undefined,
        ttl: undefined,
        retryCount: 0, // Reset retry count
        maxRetries: this.config.maxRetries,
      };

      // Publish back to the queue
      await this.publish(message);

      // Remove from DLQ
      await this.redis.del(dlqKey);
      await this.redis.zrem(dlqSetKey, messageId);

      // Update stats
      await this.updateQueueStats('dead_letter', -1);

      logger.info('Message replayed from DLQ', {
        queue: this.name,
        messageId,
      });
    } catch (error) {
      throw new DeadLetterError(
        `Failed to replay message from DLQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageId,
        'replay_failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a message from the dead letter queue
   */
  async deleteDLQMessage(messageId: string): Promise<boolean> {
    try {
      const dlqKey = this.getDLQKey(messageId);
      const dlqSetKey = this.getDLQSetKey();

      const deleted = await this.redis.del(dlqKey);
      await this.redis.zrem(dlqSetKey, messageId);

      if (deleted > 0) {
        await this.updateQueueStats('dead_letter', -1);
      }

      return deleted > 0;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to delete DLQ message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'deleteDLQMessage',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Purge all messages from the dead letter queue
   */
  async purgeDLQ(): Promise<void> {
    try {
      const dlqSetKey = this.getDLQSetKey();

      // Get all message IDs
      const messageIds = await this.redis.zrange(dlqSetKey, 0, -1);

      if (messageIds.length > 0) {
        // Delete all DLQ messages
        const keys = messageIds.map((id) => this.getDLQKey(id));
        await this.redis.del(...keys);

        // Clear the DLQ set
        await this.redis.del(dlqSetKey);

        // Reset dead letter stats
        const statsKey = this.getStatsKey();
        await this.redis.hset(statsKey, 'deadLetterMessages', '0');
      }

      logger.info('DLQ purged', {
        queue: this.name,
        messagesDeleted: messageIds.length,
      });
    } catch (error) {
      throw new MessageQueueError(
        `Failed to purge DLQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'purgeDLQ',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Deserialize message from Redis data
   */
  private deserializeMessage(data: Record<string, string>): IMessage {
    return {
      id: data.id,
      type: data.type as import('../types').MessageType,
      priority: data.priority as import('../types').MessagePriority,
      status: data.status as import('../types').MessageStatus,
      payload: JSON.parse(data.payload) as unknown,
      metadata: JSON.parse(data.metadata) as import('../types').MessageMetadata,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      correlationId: data.correlationId || undefined,
      replyTo: data.replyTo || undefined,
      ttl: data.ttl ? parseInt(data.ttl) : undefined,
      retryCount: parseInt(data.retryCount),
      maxRetries: parseInt(data.maxRetries),
    };
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { 
        queue: this.name,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected', { queue: this.name });
    });

    this.redis.on('disconnect', () => {
      logger.warn('Redis disconnected', { queue: this.name });
    });
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopProcessing();
    this.redis.disconnect();
  }
}
