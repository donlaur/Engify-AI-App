/**
 * In-Memory Message Queue Implementation
 *
 * Simple in-memory message queue for testing and development.
 * Not suitable for production use due to lack of persistence.
 */

import {
  IMessageQueue,
  IMessage,
  IMessageHandler,
  // MessageResult,
  QueueStats,
  QueueConfig,
  MessageQueueError,
} from '../types';

/**
 * In-Memory Message Queue Implementation
 */
export class InMemoryMessageQueue implements IMessageQueue {
  private messages = new Map<string, IMessage>();
  private handlers = new Map<string, IMessageHandler>();
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private stats: {
    totalMessages: number;
    pendingMessages: number;
    processingMessages: number;
    completedMessages: number;
    failedMessages: number;
    deadLetterMessages: number;
    averageProcessingTime: number;
    throughput: number;
    lastProcessedAt: Date | null;
  } = {
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

  constructor(
    public readonly name: string,
    public readonly type: 'memory' = 'memory',
    private config: QueueConfig
  ) {}

  /**
   * Publish a message to the queue
   */
  async publish(message: IMessage): Promise<void> {
    try {
      this.messages.set(message.id, message);
      this.stats.totalMessages++;
      this.stats.pendingMessages++;
      this.stats.lastProcessedAt = new Date();

      // Start processing if not already running
      if (!this.isProcessing && this.handlers.size > 0) {
        await this.startProcessing();
      }
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
    return { ...this.stats };
  }

  /**
   * Purge all messages from the queue
   */
  async purge(): Promise<void> {
    try {
      this.messages.clear();
      this.stats = {
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
    return this.messages.get(id) || null;
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<boolean> {
    const deleted = this.messages.delete(id);
    if (deleted) {
      this.stats.pendingMessages = Math.max(0, this.stats.pendingMessages - 1);
    }
    return deleted;
  }

  /**
   * Retry a failed message
   */
  async retryMessage(id: string): Promise<void> {
    try {
      const message = this.messages.get(id);
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

      this.messages.set(id, updatedMessage);
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
        this.messages.set(message.id, message);
      }

      this.stats.totalMessages += messages.length;
      this.stats.pendingMessages += messages.length;
      this.stats.lastProcessedAt = new Date();

      // Start processing if not already running
      if (!this.isProcessing && this.handlers.size > 0) {
        await this.startProcessing();
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
    const pendingMessages = Array.from(this.messages.values())
      .filter((message) => message.status === 'pending')
      .sort((a, b) => {
        // Sort by priority (critical first)
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, limit);

    return pendingMessages;
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
        this.stats.completedMessages++;
        this.stats.pendingMessages = Math.max(
          0,
          this.stats.pendingMessages - 1
        );
      } else {
        await this.handleMessageFailure(
          message,
          result.error || 'Unknown error'
        );
      }

      // Update processing time stats
      const processingTime = Date.now() - startTime;
      this.updateProcessingTimeStats(processingTime);
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
    } else {
      // Move to dead letter queue
      await this.updateMessageStatus(message.id, 'dead_letter');
      this.stats.deadLetterMessages++;
      this.stats.pendingMessages = Math.max(0, this.stats.pendingMessages - 1);

      console.error(
        `Message ${message.id} moved to dead letter queue: ${error}`
      );
    }
  }

  /**
   * Update message status
   */
  private async updateMessageStatus(id: string, status: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      const updatedMessage: IMessage = {
        ...message,
        status: status as IMessage['status'],
        updatedAt: new Date(),
      };
      this.messages.set(id, updatedMessage);

      // Update processing stats
      if (status === 'processing') {
        this.stats.processingMessages++;
      } else if (
        status === 'completed' ||
        status === 'failed' ||
        status === 'dead_letter'
      ) {
        this.stats.processingMessages = Math.max(
          0,
          this.stats.processingMessages - 1
        );
      }
    }
  }

  /**
   * Update processing time statistics
   */
  private updateProcessingTimeStats(processingTime: number): void {
    const count = this.stats.completedMessages;
    const avg = this.stats.averageProcessingTime;

    this.stats.averageProcessingTime =
      count > 0 ? (avg * count + processingTime) / (count + 1) : processingTime;
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    await this.stopProcessing();
    this.messages.clear();
    this.handlers.clear();
  }
}
