/**
 * Message Broker Implementation
 *
 * Central broker for managing multiple message queues and routing messages
 * across different queue types and configurations.
 */

import Redis from 'ioredis';
import {
  IMessageBroker,
  IMessageQueue,
  QueueConfig,
  BrokerHealth,
  BrokerMetrics,
  MessageQueueError,
  QueueConnectionError,
} from './types';
import { RedisMessageQueue } from './queues/RedisMessageQueue';
import { InMemoryMessageQueue } from './queues/InMemoryMessageQueue';

/**
 * Message Broker Implementation
 */
export class MessageBroker implements IMessageBroker {
  private queues = new Map<string, IMessageQueue>();
  private redis?: Redis;
  private isConnected = false;
  private startTime = Date.now();

  constructor(public readonly name: string = 'engify-message-broker') {}

  /**
   * Create a new message queue
   */
  async createQueue(config: QueueConfig): Promise<IMessageQueue> {
    try {
      let queue: IMessageQueue;

      switch (config.type) {
        case 'redis':
          if (!this.redis) {
            this.redis = new Redis({
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
              password: process.env.REDIS_PASSWORD,
              db: parseInt(process.env.REDIS_DB || '0'),
              retryDelayOnFailover: 100,
              maxRetriesPerRequest: 3,
            });
          }
          queue = new RedisMessageQueue(config.name, 'redis', config, this.redis);
          break;

        case 'memory':
          queue = new InMemoryMessageQueue(config.name, 'memory', config);
          break;

        default:
          throw new Error(`Unsupported queue type: ${config.type}`);
      }

      this.queues.set(config.name, queue);
      return queue;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to create queue: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'createQueue',
        config.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete a message queue
   */
  async deleteQueue(name: string): Promise<void> {
    try {
      const queue = this.queues.get(name);
      if (queue) {
        if ('destroy' in queue) {
          await (queue as any).destroy();
        }
        this.queues.delete(name);
      }
    } catch (error) {
      throw new MessageQueueError(
        `Failed to delete queue: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'deleteQueue',
        name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get a message queue by name
   */
  async getQueue(name: string): Promise<IMessageQueue | null> {
    return this.queues.get(name) || null;
  }

  /**
   * List all queue names
   */
  async listQueues(): Promise<string[]> {
    return Array.from(this.queues.keys());
  }

  /**
   * Connect to the broker
   */
  async connect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.ping();
      }
      this.isConnected = true;
    } catch (error) {
      throw new QueueConnectionError(
        `Failed to connect to broker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'broker',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Disconnect from the broker
   */
  async disconnect(): Promise<void> {
    try {
      // Disconnect all queues
      for (const queue of this.queues.values()) {
        if ('destroy' in queue) {
          await (queue as any).destroy();
        }
      }
      
      if (this.redis) {
        this.redis.disconnect();
      }
      
      this.isConnected = false;
    } catch (error) {
      throw new MessageQueueError(
        `Failed to disconnect from broker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'disconnect',
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check if broker is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get broker health status
   */
  async getHealth(): Promise<BrokerHealth> {
    try {
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let details = 'All systems operational';

      // Check Redis connection if used
      if (this.redis) {
        try {
          await this.redis.ping();
        } catch {
          status = 'degraded';
          details = 'Redis connection issues';
        }
      }

      // Check queue health
      const queueCount = this.queues.size;
      if (queueCount === 0) {
        status = 'degraded';
        details = 'No queues configured';
      }

      return {
        status,
        details,
        lastChecked: new Date(),
        uptime: Date.now() - this.startTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date(),
        uptime: Date.now() - this.startTime,
      };
    }
  }

  /**
   * Get broker metrics
   */
  async getMetrics(): Promise<BrokerMetrics> {
    try {
      let totalMessages = 0;
      let memoryUsage = 0;
      let networkLatency = 0;

      // Collect metrics from all queues
      for (const queue of this.queues.values()) {
        try {
          const stats = await queue.getQueueStats();
          totalMessages += stats.totalMessages;
        } catch (error) {
          console.warn(`Failed to get stats for queue: ${error}`);
        }
      }

      // Get Redis metrics if available
      if (this.redis) {
        try {
          const info = await this.redis.info('memory');
          const memoryMatch = info.match(/used_memory:(\d+)/);
          if (memoryMatch?.[1]) {
            memoryUsage = parseInt(memoryMatch[1]);
          }

          // Simple latency test
          const start = Date.now();
          await this.redis.ping();
          networkLatency = Date.now() - start;
        } catch (error) {
          console.warn(`Failed to get Redis metrics: ${error}`);
        }
      }

      return {
        totalQueues: this.queues.size,
        totalMessages,
        activeConnections: this.isConnected ? 1 : 0,
        memoryUsage,
        cpuUsage: 0, // Would need system monitoring
        networkLatency,
      };
    } catch (error) {
      throw new MessageQueueError(
        `Failed to get metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getMetrics',
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get or create a queue with default configuration
   */
  async getOrCreateQueue(
    name: string,
    type: 'redis' | 'memory' = 'redis'
  ): Promise<IMessageQueue> {
    let queue = await this.getQueue(name);
    
    if (!queue) {
      const config: QueueConfig = {
        name,
        type,
        maxRetries: 3,
        retryDelay: 1000,
        visibilityTimeout: 30000,
        batchSize: 10,
        concurrency: 5,
        enableDeadLetter: true,
        enableMetrics: true,
      };
      
      queue = await this.createQueue(config);
    }
    
    return queue;
  }

  /**
   * Publish message to a specific queue
   */
  async publishToQueue(
    queueName: string,
    message: IMessage
  ): Promise<void> {
    const queue = await this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    
    await queue.publish(message);
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [name, queue] of this.queues) {
      try {
        stats[name] = await queue.getQueueStats();
      } catch (error) {
        stats[name] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    return stats;
  }

  /**
   * Purge all queues
   */
  async purgeAllQueues(): Promise<void> {
    for (const queue of this.queues.values()) {
      try {
        await queue.purge();
      } catch (error) {
        console.warn(`Failed to purge queue: ${error}`);
      }
    }
  }

  /**
   * Pause all queues
   */
  async pauseAllQueues(): Promise<void> {
    for (const queue of this.queues.values()) {
      try {
        await queue.pause();
      } catch (error) {
        console.warn(`Failed to pause queue: ${error}`);
      }
    }
  }

  /**
   * Resume all queues
   */
  async resumeAllQueues(): Promise<void> {
    for (const queue of this.queues.values()) {
      try {
        await queue.resume();
      } catch (error) {
        console.warn(`Failed to resume queue: ${error}`);
      }
    }
  }

  /**
   * Cleanup all resources
   */
  async destroy(): Promise<void> {
    await this.disconnect();
    this.queues.clear();
  }
}
