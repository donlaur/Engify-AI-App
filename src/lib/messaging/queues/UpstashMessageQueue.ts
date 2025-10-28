/**
 * Upstash Redis Adapter for Message Queue
 *
 * HTTP-based Redis adapter using Upstash REST API for serverless environments.
 * Provides the same interface as RedisMessageQueue but uses HTTP requests.
 */

import {
  IMessageQueue,
  IMessage,
  IMessageHandler,
  MessageResult,
  QueueStats,
  QueueConfig,
  MessageQueueError,
  QueueConnectionError,
} from '../types';

/**
 * Upstash Redis Message Queue Implementation
 */
export class UpstashMessageQueue implements IMessageQueue {
  private handlers = new Map<string, IMessageHandler>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private baseUrl: string;
  private authToken: string;

  constructor(
    public readonly name: string,
    public readonly type: 'redis' = 'redis',
    private config: QueueConfig
  ) {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL || '';
    this.authToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

    if (!this.baseUrl || !this.authToken) {
      throw new QueueConnectionError(
        'Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.',
        this.name
      );
    }
  }

  /**
   * Make HTTP request to Upstash Redis
   */
  private async makeRequest(command: string, args: string[] = []): Promise<any> {
    const url = `${this.baseUrl}/${command}`;
    const body = args.length > 0 ? args : [];

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new MessageQueueError(
        `Upstash request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'request',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Publish a message to the queue
   */
  async publish(message: IMessage): Promise<void> {
    try {
      const messageKey = this.getMessageKey(message.id);
      const queueKey = this.getQueueKey();
      
      // Store message data using HSET
      const messageData = {
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
      };

      // Use HSET to store message data
      const hsetArgs = [messageKey];
      for (const [key, value] of Object.entries(messageData)) {
        hsetArgs.push(key, value);
      }
      await this.makeRequest('HSET', hsetArgs);

      // Add to priority queue using ZADD
      const priorityScore = this.getPriorityScore(message.priority);
      await this.makeRequest('ZADD', [queueKey, priorityScore.toString(), message.id]);

      // Set TTL if specified
      if (message.ttl) {
        await this.makeRequest('EXPIRE', [messageKey, Math.ceil(message.ttl / 1000).toString()]);
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
      const stats = await this.makeRequest('HGETALL', [statsKey]);
      
      // Convert array to object
      const statsObj: Record<string, string> = {};
      for (let i = 0; i < stats.length; i += 2) {
        statsObj[stats[i]] = stats[i + 1];
      }
      
      return {
        totalMessages: parseInt(statsObj.totalMessages || '0'),
        pendingMessages: parseInt(statsObj.pendingMessages || '0'),
        processingMessages: parseInt(statsObj.processingMessages || '0'),
        completedMessages: parseInt(statsObj.completedMessages || '0'),
        failedMessages: parseInt(statsObj.failedMessages || '0'),
        deadLetterMessages: parseInt(statsObj.deadLetterMessages || '0'),
        averageProcessingTime: parseFloat(statsObj.averageProcessingTime || '0'),
        throughput: parseFloat(statsObj.throughput || '0'),
        lastProcessedAt: statsObj.lastProcessedAt ? new Date(statsObj.lastProcessedAt) : null,
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
      
      // Get all message IDs
      const messageIds = await this.makeRequest('ZRANGE', [queueKey, '0', '-1']);
      
      if (messageIds.length > 0) {
        // Delete all message data
        const keys = messageIds.map((id: string) => this.getMessageKey(id));
        await this.makeRequest('DEL', keys);
        
        // Clear the queue
        await this.makeRequest('DEL', [queueKey]);
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
      const messageData = await this.makeRequest('HGETALL', [messageKey]);
      
      if (messageData.length === 0) {
        return null;
      }
      
      // Convert array to object
      const messageObj: Record<string, string> = {};
      for (let i = 0; i < messageData.length; i += 2) {
        messageObj[messageData[i]] = messageData[i + 1];
      }
      
      return this.deserializeMessage(messageObj);
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
      await this.makeRequest('ZREM', [queueKey, id]);
      
      // Delete message data
      const deleted = await this.makeRequest('DEL', [messageKey]);
      
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
      
      // Update in Upstash
      const messageKey = this.getMessageKey(id);
      await this.makeRequest('HMSET', [
        messageKey,
        'retryCount',
        updatedMessage.retryCount.toString(),
        'status',
        updatedMessage.status,
        'updatedAt',
        updatedMessage.updatedAt.toISOString(),
      ]);
      
      // Re-add to queue
      const queueKey = this.getQueueKey();
      const priorityScore = this.getPriorityScore(updatedMessage.priority);
      await this.makeRequest('ZADD', [queueKey, priorityScore.toString(), id]);
      
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
      for (const message of messages) {
        await this.publish(message);
      }
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
      const messageIds = await this.makeRequest('ZRANGE', [queueKey, '0', (limit - 1).toString()]);
      
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
      console.error('Error processing messages:', error);
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
        console.warn(`No handler found for message type: ${message.type}`);
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
        await this.handleMessageFailure(message, result.error || 'Unknown error');
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
  private async handleMessageFailure(message: IMessage, error: string): Promise<void> {
    if (message.retryCount < message.maxRetries) {
      // Retry the message
      await this.retryMessage(message.id);
      await this.updateQueueStats('retrying');
    } else {
      // Move to dead letter queue
      await this.updateMessageStatus(message.id, 'dead_letter');
      await this.updateQueueStats('dead_letter');
      
      console.error(`Message ${message.id} moved to dead letter queue: ${error}`);
    }
  }

  /**
   * Update message status
   */
  private async updateMessageStatus(id: string, status: string): Promise<void> {
    const messageKey = this.getMessageKey(id);
    await this.makeRequest('HMSET', [
      messageKey,
      'status',
      status,
      'updatedAt',
      new Date().toISOString(),
    ]);
  }

  /**
   * Update queue statistics
   */
  private async updateQueueStats(operation: string, count: number = 1): Promise<void> {
    const statsKey = this.getStatsKey();
    
    switch (operation) {
      case 'published':
        await this.makeRequest('HINCRBY', [statsKey, 'totalMessages', count.toString()]);
        await this.makeRequest('HINCRBY', [statsKey, 'pendingMessages', count.toString()]);
        break;
      case 'completed':
        await this.makeRequest('HINCRBY', [statsKey, 'completedMessages', count.toString()]);
        await this.makeRequest('HINCRBY', [statsKey, 'pendingMessages', (-count).toString()]);
        break;
      case 'failed':
        await this.makeRequest('HINCRBY', [statsKey, 'failedMessages', count.toString()]);
        await this.makeRequest('HINCRBY', [statsKey, 'pendingMessages', (-count).toString()]);
        break;
      case 'retrying':
        await this.makeRequest('HINCRBY', [statsKey, 'pendingMessages', count.toString()]);
        break;
      case 'dead_letter':
        await this.makeRequest('HINCRBY', [statsKey, 'deadLetterMessages', count.toString()]);
        await this.makeRequest('HINCRBY', [statsKey, 'pendingMessages', (-count).toString()]);
        break;
    }
    
    await this.makeRequest('HMSET', [
      statsKey,
      'lastProcessedAt',
      new Date().toISOString(),
    ]);
  }

  /**
   * Update processing time statistics
   */
  private async updateProcessingTimeStats(processingTime: number): Promise<void> {
    const statsKey = this.getStatsKey();
    const currentAvg = await this.makeRequest('HGET', [statsKey, 'averageProcessingTime']);
    const currentCount = await this.makeRequest('HGET', [statsKey, 'completedMessages']);
    
    const count = parseInt(currentCount || '0');
    const avg = parseFloat(currentAvg || '0');
    
    const newAvg = count > 0 ? (avg * count + processingTime) / (count + 1) : processingTime;
    
    await this.makeRequest('HMSET', [
      statsKey,
      'averageProcessingTime',
      newAvg.toString(),
    ]);
  }

  /**
   * Reset queue statistics
   */
  private async resetQueueStats(): Promise<void> {
    const statsKey = this.getStatsKey();
    await this.makeRequest('DEL', [statsKey]);
  }

  /**
   * Get priority score for Redis sorted set
   */
  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
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

  private getStatsKey(): string {
    return `mq:stats:${this.name}`;
  }

  /**
   * Deserialize message from Redis data
   */
  private deserializeMessage(data: Record<string, string>): IMessage {
    return {
      id: data.id,
      type: data.type as any,
      priority: data.priority as any,
      status: data.status as any,
      payload: JSON.parse(data.payload),
      metadata: JSON.parse(data.metadata),
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
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopProcessing();
  }
}
