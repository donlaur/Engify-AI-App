/**
 * Message Factory Implementation
 *
 * Factory for creating different types of messages with proper defaults
 * and validation for the message queue system.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IMessageFactory,
  IMessage,
  MessageType,
  // MessagePriority,
  MessageOptions,
  MessageMetadata,
} from './types';

/**
 * Message Factory Implementation
 */
export class MessageFactory implements IMessageFactory {
  constructor(
    private defaultSource: string = 'engify-ai-app',
    private defaultVersion: string = '1.0.0'
  ) {}

  /**
   * Create a generic message
   */
  createMessage(
    type: MessageType,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    const now = new Date();
    const id = uuidv4();

    return {
      id,
      type,
      priority: options.priority || 'normal',
      status: 'pending',
      payload,
      metadata: this.createMetadata(options),
      createdAt: now,
      updatedAt: now,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      ttl: options.ttl,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
    };
  }

  /**
   * Create a command message
   */
  createCommand(
    commandType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'command',
      {
        commandType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: 'high',
        ...options,
      }
    );
  }

  /**
   * Create an event message
   */
  createEvent(
    eventType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'event',
      {
        eventType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: 'normal',
        ...options,
      }
    );
  }

  /**
   * Create a notification message
   */
  createNotification(
    notificationType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'notification',
      {
        notificationType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: options.priority || 'normal',
        ...options,
      }
    );
  }

  /**
   * Create a task message
   */
  createTask(
    taskType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'task',
      {
        taskType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: options.priority || 'normal',
        ...options,
      }
    );
  }

  /**
   * Create a job message
   */
  createJob(
    jobType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'job',
      {
        jobType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: options.priority || 'low',
        ...options,
      }
    );
  }

  /**
   * Create a query message
   */
  createQuery(
    queryType: string,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(
      'query',
      {
        queryType,
        ...(typeof payload === 'object' && payload !== null ? payload : {}),
      },
      {
        priority: 'high',
        ...options,
      }
    );
  }

  /**
   * Create metadata for a message
   */
  private createMetadata(options: Partial<MessageOptions>): MessageMetadata {
    return {
      source: this.defaultSource,
      version: this.defaultVersion,
      tags: options.tags,
      headers: options.headers,
      traceId: options.headers?.traceId,
      spanId: options.headers?.spanId,
    };
  }

  /**
   * Create a high priority message
   */
  createHighPriorityMessage(
    type: MessageType,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      priority: 'high',
      ...options,
    });
  }

  /**
   * Create a critical priority message
   */
  createCriticalMessage(
    type: MessageType,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      priority: 'critical',
      ...options,
    });
  }

  /**
   * Create a message with custom TTL
   */
  createMessageWithTTL(
    type: MessageType,
    payload: unknown,
    ttl: number,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      ttl,
      ...options,
    });
  }

  /**
   * Create a message with correlation ID
   */
  createCorrelatedMessage(
    type: MessageType,
    payload: unknown,
    correlationId: string,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      correlationId,
      ...options,
    });
  }

  /**
   * Create a reply message
   */
  createReply(
    originalMessage: IMessage,
    payload: unknown,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage('event', payload, {
      correlationId: originalMessage.correlationId,
      replyTo: originalMessage.replyTo,
      priority: originalMessage.priority,
      ...options,
    });
  }

  /**
   * Create a retry message
   */
  createRetryMessage(
    originalMessage: IMessage,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return {
      ...originalMessage,
      id: uuidv4(), // New ID for retry
      retryCount: originalMessage.retryCount + 1,
      status: 'pending',
      updatedAt: new Date(),
      ...options,
    };
  }

  /**
   * Create a batch of messages
   */
  createBatch(
    type: MessageType,
    payloads: unknown[],
    options: Partial<MessageOptions> = {}
  ): IMessage[] {
    return payloads.map((payload) =>
      this.createMessage(type, payload, options)
    );
  }

  /**
   * Create a scheduled message
   */
  createScheduledMessage(
    type: MessageType,
    payload: unknown,
    scheduledAt: Date,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    const message = this.createMessage(type, payload, options);

    // Add scheduling metadata
    return {
      ...message,
      metadata: {
        ...message.metadata,
        headers: {
          ...message.metadata.headers,
          'scheduled-at': scheduledAt.toISOString(),
        },
      },
    };
  }

  /**
   * Create a message with custom headers
   */
  createMessageWithHeaders(
    type: MessageType,
    payload: unknown,
    headers: Record<string, string>,
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      headers: {
        ...options.headers,
        ...headers,
      },
      ...options,
    });
  }

  /**
   * Create a message with tags
   */
  createTaggedMessage(
    type: MessageType,
    payload: unknown,
    tags: string[],
    options: Partial<MessageOptions> = {}
  ): IMessage {
    return this.createMessage(type, payload, {
      tags: [...(options.tags || []), ...tags],
      ...options,
    });
  }

  /**
   * Validate message payload
   */
  validatePayload(payload: unknown): boolean {
    try {
      JSON.stringify(payload);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get default options for message type
   */
  getDefaultOptions(type: MessageType): Partial<MessageOptions> {
    switch (type) {
      case 'command':
        return {
          priority: 'high',
          maxRetries: 3,
          ttl: 300000, // 5 minutes
        };
      case 'query':
        return {
          priority: 'high',
          maxRetries: 2,
          ttl: 60000, // 1 minute
        };
      case 'event':
        return {
          priority: 'normal',
          maxRetries: 1,
          ttl: 600000, // 10 minutes
        };
      case 'notification':
        return {
          priority: 'normal',
          maxRetries: 2,
          ttl: 300000, // 5 minutes
        };
      case 'task':
        return {
          priority: 'normal',
          maxRetries: 3,
          ttl: 1800000, // 30 minutes
        };
      case 'job':
        return {
          priority: 'low',
          maxRetries: 5,
          ttl: 3600000, // 1 hour
        };
      default:
        return {
          priority: 'normal',
          maxRetries: 3,
          ttl: 300000, // 5 minutes
        };
    }
  }
}
