/**
 * Message Queue Types and Interfaces
 *
 * Defines comprehensive messaging infrastructure for async processing,
 * event-driven architecture, and distributed system communication.
 */

/**
 * Message Types
 */
export type MessageType =
  | 'command'
  | 'query'
  | 'event'
  | 'notification'
  | 'task'
  | 'job';

/**
 * Message Priority Levels
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Message Status
 */
export type MessageStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'dead_letter';

/**
 * Base Message Interface
 */
export interface IMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly priority: MessagePriority;
  readonly status: MessageStatus;
  readonly payload: unknown;
  readonly metadata: MessageMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly correlationId?: string;
  readonly replyTo?: string;
  readonly ttl?: number; // Time to live in milliseconds
  readonly retryCount: number;
  readonly maxRetries: number;
}

/**
 * Message Metadata
 */
export interface MessageMetadata {
  readonly source: string;
  readonly version: string;
  readonly tags?: string[];
  readonly headers?: Record<string, string>;
  readonly traceId?: string;
  readonly spanId?: string;
}

/**
 * Message Handler Interface
 */
export interface IMessageHandler<_T = unknown> {
  readonly messageType: MessageType;
  readonly handlerName: string;

  handle(message: IMessage): Promise<MessageResult>;
  canHandle(message: IMessage): boolean;
}

/**
 * Message Result
 */
export interface MessageResult {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
  readonly processingTime: number;
  readonly timestamp: Date;
}

/**
 * Message Queue Interface
 */
export interface IMessageQueue {
  readonly name: string;
  readonly type: QueueType;

  // Basic operations
  publish(message: IMessage): Promise<void>;
  subscribe(handler: IMessageHandler): Promise<void>;
  unsubscribe(handlerName: string): Promise<void>;

  // Queue management
  getQueueStats(): Promise<QueueStats>;
  purge(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;

  // Message management
  getMessage(id: string): Promise<IMessage | null>;
  deleteMessage(id: string): Promise<boolean>;
  retryMessage(id: string): Promise<void>;

  // Batch operations
  publishBatch(messages: IMessage[]): Promise<void>;
  getPendingMessages(limit?: number): Promise<IMessage[]>;
}

/**
 * Queue Types
 */
export type QueueType = 'memory' | 'redis' | 'rabbitmq' | 'sqs' | 'kafka';

/**
 * Queue Statistics
 */
export interface QueueStats {
  readonly totalMessages: number;
  readonly pendingMessages: number;
  readonly processingMessages: number;
  readonly completedMessages: number;
  readonly failedMessages: number;
  readonly deadLetterMessages: number;
  readonly averageProcessingTime: number;
  readonly throughput: number; // messages per second
  readonly lastProcessedAt: Date | null;
}

/**
 * Message Queue Configuration
 */
export interface QueueConfig {
  readonly name: string;
  readonly type: QueueType;
  readonly maxRetries: number;
  readonly retryDelay: number; // milliseconds
  readonly deadLetterQueue?: string;
  readonly visibilityTimeout: number; // milliseconds
  readonly batchSize: number;
  readonly concurrency: number;
  readonly enableDeadLetter: boolean;
  readonly enableMetrics: boolean;
}

/**
 * Dead Letter Queue Interface
 */
export interface IDeadLetterQueue {
  readonly name: string;

  add(message: IMessage, reason: string): Promise<void>;
  getMessages(limit?: number): Promise<DeadLetterMessage[]>;
  retryMessage(id: string): Promise<void>;
  deleteMessage(id: string): Promise<boolean>;
  purge(): Promise<void>;
}

/**
 * Dead Letter Message
 */
export interface DeadLetterMessage {
  readonly message: IMessage;
  readonly reason: string;
  readonly failedAt: Date;
  readonly originalQueue: string;
}

/**
 * Message Broker Interface
 */
export interface IMessageBroker {
  readonly name: string;

  // Queue management
  createQueue(config: QueueConfig): Promise<IMessageQueue>;
  deleteQueue(name: string): Promise<void>;
  getQueue(name: string): Promise<IMessageQueue | null>;
  listQueues(): Promise<string[]>;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Health and monitoring
  getHealth(): Promise<BrokerHealth>;
  getMetrics(): Promise<BrokerMetrics>;
}

/**
 * Broker Health
 */
export interface BrokerHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly details: string;
  readonly lastChecked: Date;
  readonly uptime: number;
}

/**
 * Broker Metrics
 */
export interface BrokerMetrics {
  readonly totalQueues: number;
  readonly totalMessages: number;
  readonly activeConnections: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly networkLatency: number;
}

/**
 * Message Queue Error Types
 */
export class MessageQueueError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly queueName?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'MessageQueueError';
  }
}

export class MessageProcessingError extends MessageQueueError {
  constructor(
    message: string,
    public readonly messageId: string,
    public readonly handlerName: string,
    originalError?: Error
  ) {
    super(message, 'process', undefined, originalError);
    this.name = 'MessageProcessingError';
  }
}

export class QueueConnectionError extends MessageQueueError {
  constructor(message: string, queueName: string, originalError?: Error) {
    super(message, 'connect', queueName, originalError);
    this.name = 'QueueConnectionError';
  }
}

export class DeadLetterError extends MessageQueueError {
  constructor(
    message: string,
    public readonly messageId: string,
    public readonly reason: string,
    originalError?: Error
  ) {
    super(message, 'dead_letter', undefined, originalError);
    this.name = 'DeadLetterError';
  }
}

/**
 * Message Factory Interface
 */
export interface IMessageFactory {
  createMessage(
    type: MessageType,
    payload: unknown,
    options?: Partial<MessageOptions>
  ): IMessage;

  createCommand(
    commandType: string,
    payload: unknown,
    options?: Partial<MessageOptions>
  ): IMessage;

  createEvent(
    eventType: string,
    payload: unknown,
    options?: Partial<MessageOptions>
  ): IMessage;

  createNotification(
    notificationType: string,
    payload: unknown,
    options?: Partial<MessageOptions>
  ): IMessage;
}

/**
 * Message Options
 */
export interface MessageOptions {
  readonly priority: MessagePriority;
  readonly ttl: number;
  readonly maxRetries: number;
  readonly correlationId?: string;
  readonly replyTo?: string;
  readonly tags?: string[];
  readonly headers?: Record<string, string>;
}

/**
 * Message Router Interface
 */
export interface IMessageRouter {
  readonly name: string;

  route(message: IMessage): Promise<string[]>; // Returns queue names
  addRoute(rule: RoutingRule): void;
  removeRoute(ruleId: string): void;
  getRoutes(): RoutingRule[];
}

/**
 * Routing Rule
 */
export interface RoutingRule {
  readonly id: string;
  readonly name: string;
  readonly condition: (message: IMessage) => boolean;
  readonly targetQueues: string[];
  readonly priority: number;
  readonly enabled: boolean;
}

/**
 * Message Scheduler Interface
 */
export interface IMessageScheduler {
  readonly name: string;

  schedule(
    message: IMessage,
    delay: number,
    options?: ScheduleOptions
  ): Promise<string>; // Returns schedule ID

  scheduleAt(
    message: IMessage,
    scheduledAt: Date,
    options?: ScheduleOptions
  ): Promise<string>;

  cancel(scheduleId: string): Promise<boolean>;
  getScheduledMessages(): Promise<ScheduledMessage[]>;
}

/**
 * Schedule Options
 */
export interface ScheduleOptions {
  readonly timezone?: string;
  readonly recurring?: RecurringOptions;
  readonly maxExecutions?: number;
}

/**
 * Recurring Options
 */
export interface RecurringOptions {
  readonly pattern: string; // Cron-like pattern
  readonly endDate?: Date;
  readonly maxExecutions?: number;
}

/**
 * Scheduled Message
 */
export interface ScheduledMessage {
  readonly id: string;
  readonly message: IMessage;
  readonly scheduledAt: Date;
  readonly executedAt?: Date;
  readonly status: 'scheduled' | 'executed' | 'cancelled' | 'failed';
  readonly recurring?: RecurringOptions;
}
