/**
 * QStash Message Queue Implementation
 *
 * HTTP-based message queue using Upstash QStash for serverless environments.
 * Provides reliable message delivery with built-in retry, dead letter queues,
 * and webhook support for serverless architectures.
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
 * QStash Message Queue Implementation
 */
export class QStashMessageQueue implements IMessageQueue {
  private handlers = new Map<string, IMessageHandler>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private baseUrl: string;
  private authToken: string;
  private webhookUrl: string;

  constructor(
    public readonly name: string,
    public readonly type: 'redis' = 'redis',
    // @ts-expect-error - intentionally unused, kept for potential future use
    private _config: QueueConfig
  ) {
    this.baseUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io/v2';
    this.authToken = process.env.QSTASH_TOKEN || '';
    this.webhookUrl = process.env.QSTASH_WEBHOOK_URL || '';

    if (!this.authToken) {
      throw new QueueConnectionError(
        'QStash token not found. Please set QSTASH_TOKEN environment variable.',
        this.name
      );
    }
  }

  /**
   * Make HTTP request to QStash
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<unknown> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      throw new MessageQueueError(
        `QStash request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      const queueUrl = `${this.webhookUrl}/api/messaging/${this.name}/process`;

      const qstashMessage = {
        url: queueUrl,
        body: {
          messageId: message.id,
          type: message.type,
          priority: message.priority,
          payload: message.payload,
          metadata: message.metadata,
          correlationId: message.correlationId,
          replyTo: message.replyTo,
          retryCount: message.retryCount,
          maxRetries: message.maxRetries,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Message-Type': message.type,
          'X-Priority': message.priority,
          'X-Correlation-ID': message.correlationId || '',
        },
        delay: this.getDelayFromPriority(message.priority),
        retries: message.maxRetries,
        callback: `${this.webhookUrl}/api/messaging/${this.name}/callback`,
        failureCallback: `${this.webhookUrl}/api/messaging/${this.name}/failure`,
      };

      await this.makeRequest('/publish', 'POST', qstashMessage);

      // Update local stats (skip in test mode)
      if (process.env.NODE_ENV !== 'test') {
        await this.updateQueueStats('published');
      }
    } catch (error) {
      // If it's already a MessageQueueError, re-throw it
      if (error instanceof MessageQueueError) {
        throw error;
      }

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
      // QStash doesn't provide direct queue stats, so we'll maintain our own
      const statsKey = this.getStatsKey();
      const stats = await this.makeRequest(`/redis/hgetall/${statsKey}`);

      // Convert array to object
      const statsArray = Array.isArray(stats) ? stats : [];
      const statsObj: Record<string, string> = {};
      for (let i = 0; i < statsArray.length; i += 2) {
        if (
          typeof statsArray[i] === 'string' &&
          typeof statsArray[i + 1] === 'string'
        ) {
          statsObj[statsArray[i]] = statsArray[i + 1];
        }
      }

      return {
        totalMessages: parseInt(statsObj.totalMessages || '0'),
        pendingMessages: parseInt(statsObj.pendingMessages || '0'),
        processingMessages: parseInt(statsObj.processingMessages || '0'),
        completedMessages: parseInt(statsObj.completedMessages || '0'),
        failedMessages: parseInt(statsObj.failedMessages || '0'),
        deadLetterMessages: parseInt(statsObj.deadLetterMessages || '0'),
        averageProcessingTime: parseFloat(
          statsObj.averageProcessingTime || '0'
        ),
        throughput: parseFloat(statsObj.throughput || '0'),
        lastProcessedAt: statsObj.lastProcessedAt
          ? new Date(statsObj.lastProcessedAt)
          : null,
      };
    } catch (error) {
      // Return default stats if Redis stats are not available
      return {
        totalMessages: 0,
        pendingMessages: 0,
        processingMessages: 0,
        completedMessages: 0,
        failedMessages: 0,
        deadLetterMessages: 0,
        averageProcessingTime: 0,
        throughput: 0,
        lastProcessedAt: null,
      };
    }
  }

  /**
   * Purge all messages from the queue
   */
  async purge(): Promise<void> {
    try {
      // QStash doesn't support purging all messages, but we can clear our stats
      await this.resetQueueStats();

      // Note: In production, you might want to implement a custom purge endpoint
      // that cancels all pending messages for this queue
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
      // QStash doesn't provide direct message retrieval
      // In a real implementation, you'd store message data in Redis or database
      const messageKey = this.getMessageKey(id);
      const messageData = await this.makeRequest(
        `/redis/hgetall/${messageKey}`
      );

      const messageArray = Array.isArray(messageData) ? messageData : [];
      if (messageArray.length === 0) {
        return null;
      }

      // Convert array to object
      const messageObj: Record<string, string> = {};
      for (let i = 0; i < messageArray.length; i += 2) {
        if (
          typeof messageArray[i] === 'string' &&
          typeof messageArray[i + 1] === 'string'
        ) {
          messageObj[messageArray[i]] = messageArray[i + 1];
        }
      }

      return this.deserializeMessage(messageObj);
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<boolean> {
    try {
      // QStash doesn't support deleting individual messages
      // In a real implementation, you'd mark it as deleted in your storage
      const messageKey = this.getMessageKey(id);
      await this.makeRequest(`/redis/del/${messageKey}`);
      return true;
    } catch (error) {
      return false;
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

      // Create a new message with incremented retry count
      const retryMessage: IMessage = {
        ...message,
        id: `${message.id}-retry-${message.retryCount + 1}`,
        retryCount: message.retryCount + 1,
        status: 'pending',
        updatedAt: new Date(),
      };

      await this.publish(retryMessage);
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
      // QStash supports batch publishing
      const batchMessages = messages.map((message) => ({
        url: `${this.webhookUrl}/api/messaging/${this.name}/process`,
        body: {
          messageId: message.id,
          type: message.type,
          priority: message.priority,
          payload: message.payload,
          metadata: message.metadata,
          correlationId: message.correlationId,
          replyTo: message.replyTo,
          retryCount: message.retryCount,
          maxRetries: message.maxRetries,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Message-Type': message.type,
          'X-Priority': message.priority,
          'X-Correlation-ID': message.correlationId || '',
        },
        delay: this.getDelayFromPriority(message.priority),
        retries: message.maxRetries,
      }));

      await this.makeRequest('/publish/batch', 'POST', {
        messages: batchMessages,
      });

      // Update local stats
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
      // QStash doesn't provide direct pending message retrieval
      // In a real implementation, you'd query your message storage
      const pendingKey = this.getPendingKey();
      const messageIds = await this.makeRequest(
        `/redis/lrange/${pendingKey}/0/${limit - 1}`
      );

      const messages: IMessage[] = [];
      const idsArray = Array.isArray(messageIds) ? messageIds : [];
      for (const id of idsArray) {
        if (typeof id !== 'string') continue;
        const message = await this.getMessage(id);
        if (message) {
          messages.push(message);
        }
      }

      return messages;
    } catch (error) {
      return [];
    }
  }

  /**
   * Process a message (called by webhook)
   */
  async processMessage(messageData: unknown): Promise<MessageResult> {
    const startTime = Date.now();

    try {
      // Type guard for messageData
      if (!messageData || typeof messageData !== 'object') {
        throw new Error('Invalid message data');
      }

      const data = messageData as {
        messageId?: string;
        type?: string;
        priority?: string;
        payload?: unknown;
        metadata?: unknown;
        correlationId?: string;
        replyTo?: string;
        retryCount?: number;
        maxRetries?: number;
      };

      // Convert QStash message to our IMessage format
      const message: IMessage = {
        id: data.messageId || '',
        type: (data.type || 'task') as IMessage['type'],
        priority: (data.priority || 'normal') as IMessage['priority'],
        status: 'processing',
        payload: data.payload,
        metadata: data.metadata as IMessage['metadata'],
        createdAt: new Date(),
        updatedAt: new Date(),
        correlationId: data.correlationId,
        replyTo: data.replyTo,
        retryCount: data.retryCount || 0,
        maxRetries: data.maxRetries || 3,
      };

      // Find appropriate handler
      const handler = this.findHandler(message);
      if (!handler) {
        return {
          success: false,
          error: `No handler found for message type: ${message.type}`,
          processingTime: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Process the message
      const result = await handler.handle(message);

      // Update stats
      if (result.success) {
        await this.updateQueueStats('completed');
      } else {
        await this.updateQueueStats('failed');
      }

      // Update processing time stats
      const processingTime = Date.now() - startTime;
      await this.updateProcessingTimeStats(processingTime);

      return result;
    } catch (error) {
      await this.updateQueueStats('failed');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
      };
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
    // QStash handles processing via webhooks, so we don't need polling
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
   * Get delay from priority
   */
  private getDelayFromPriority(priority: string): string {
    switch (priority) {
      case 'critical':
        return '0s';
      case 'high':
        return '1s';
      case 'normal':
        return '5s';
      case 'low':
        return '30s';
      default:
        return '5s';
    }
  }

  /**
   * Update queue statistics
   */
  private async updateQueueStats(
    operation: string,
    count: number = 1
  ): Promise<void> {
    // Skip stats update in test environment or if Redis is not available
    if (process.env.NODE_ENV === 'test' || !this.baseUrl.includes('upstash')) {
      return;
    }

    const statsKey = this.getStatsKey();

    try {
      switch (operation) {
        case 'published':
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/totalMessages/${count}`
          );
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/pendingMessages/${count}`
          );
          break;
        case 'completed':
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/completedMessages/${count}`
          );
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/pendingMessages/${-count}`
          );
          break;
        case 'failed':
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/failedMessages/${count}`
          );
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/pendingMessages/${-count}`
          );
          break;
        case 'dead_letter':
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/deadLetterMessages/${count}`
          );
          await this.makeRequest(
            `/redis/hincrby/${statsKey}/pendingMessages/${-count}`
          );
          break;
      }

      await this.makeRequest(
        `/redis/hset/${statsKey}/lastProcessedAt/${encodeURIComponent(new Date().toISOString())}`
      );
    } catch (error) {
      // Stats update failure shouldn't break message processing
      console.warn('Failed to update queue stats:', error);
    }
  }

  /**
   * Update processing time statistics
   */
  private async updateProcessingTimeStats(
    processingTime: number
  ): Promise<void> {
    // Skip stats update in test environment or if Redis is not available
    if (process.env.NODE_ENV === 'test' || !this.baseUrl.includes('upstash')) {
      return;
    }

    const statsKey = this.getStatsKey();

    try {
      const currentAvg = await this.makeRequest(
        `/redis/hget/${statsKey}/averageProcessingTime`
      );
      const currentCount = await this.makeRequest(
        `/redis/hget/${statsKey}/completedMessages`
      );

      const count = parseInt(String(currentCount || '0'));
      const avg = parseFloat(String(currentAvg || '0'));

      const newAvg =
        count > 0
          ? (avg * count + processingTime) / (count + 1)
          : processingTime;

      await this.makeRequest(
        `/redis/hset/${statsKey}/averageProcessingTime/${newAvg}`
      );
    } catch (error) {
      console.warn('Failed to update processing time stats:', error);
    }
  }

  /**
   * Reset queue statistics
   */
  private async resetQueueStats(): Promise<void> {
    const statsKey = this.getStatsKey();
    await this.makeRequest(`/redis/del/${statsKey}`);
  }

  /**
   * Generate Redis keys
   * @deprecated Unused - kept for potential future use
   */
  // @ts-expect-error - intentionally unused, kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _getQueueKey(): string {
    return `qstash:queue:${this.name}`;
  }

  private getMessageKey(id: string): string {
    return `qstash:message:${this.name}:${id}`;
  }

  private getStatsKey(): string {
    return `qstash:stats:${this.name}`;
  }

  private getPendingKey(): string {
    return `qstash:pending:${this.name}`;
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
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopProcessing();
  }
}
