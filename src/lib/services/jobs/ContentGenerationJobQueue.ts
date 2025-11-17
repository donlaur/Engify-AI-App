/**
 * Content Generation Job Queue Service
 *
 * Handles background processing of content generation jobs using RedisMessageQueue.
 * Supports batch processing, progress tracking, and error handling.
 */

import { RedisMessageQueue } from '@/lib/messaging/queues/RedisMessageQueue';
import { IMessage, IMessageHandler, MessageResult } from '@/lib/messaging/types';
import { logger } from '@/lib/logging/logger';
import { ContentGeneratorFactory, GeneratorType } from '@/lib/factories/ContentGeneratorFactory';
import { ContentGenerationParams } from '@/lib/services/content/interfaces/IContentGenerator';

/**
 * Content generation job payload
 */
export interface ContentGenerationJobPayload {
  jobId: string;
  organizationId: string;
  generatorType: GeneratorType;
  topics: Array<{
    topic: string;
    category: string;
    targetWordCount?: number;
    keywords?: string[];
  }>;
  userId: string;
  createdAt: string;
}

/**
 * Content generation job status
 */
export interface ContentGenerationJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  totalTopics: number;
  completedTopics: number;
  failedTopics: number;
  results: Array<{
    topic: string;
    status: 'pending' | 'completed' | 'failed';
    contentId?: string;
    error?: string;
    wordCount?: number;
    costUSD?: number;
  }>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Content Generation Job Handler
 *
 * Processes content generation jobs from the queue
 */
class ContentGenerationJobHandler implements IMessageHandler {
  readonly messageType = 'content.generation.batch' as const;
  handlerName = 'ContentGenerationJobHandler';
  private jobStatuses = new Map<string, ContentGenerationJobStatus>();

  canHandle(message: IMessage): boolean {
    return message.type === 'content.generation.batch';
  }

  async handle(message: IMessage): Promise<MessageResult> {
    const payload = message.payload as ContentGenerationJobPayload;

    try {
      logger.info('Processing content generation job', {
        jobId: payload.jobId,
        topicCount: payload.topics.length,
      });

      // Initialize job status
      const jobStatus: ContentGenerationJobStatus = {
        jobId: payload.jobId,
        status: 'processing',
        totalTopics: payload.topics.length,
        completedTopics: 0,
        failedTopics: 0,
        results: payload.topics.map((t) => ({
          topic: t.topic,
          status: 'pending' as const,
        })),
        createdAt: new Date(payload.createdAt),
        startedAt: new Date(),
      };

      this.jobStatuses.set(payload.jobId, jobStatus);

      // Create generator instance
      const generator = ContentGeneratorFactory.createGenerator(
        payload.generatorType,
        { organizationId: payload.organizationId }
      );

      // Process each topic
      for (let i = 0; i < payload.topics.length; i++) {
        const topicConfig = payload.topics[i];

        try {
          const params: ContentGenerationParams = {
            topic: topicConfig.topic,
            category: topicConfig.category,
            targetWordCount: topicConfig.targetWordCount,
            keywords: topicConfig.keywords,
          };

          const result = await generator.generate(params);

          // Update job status
          jobStatus.results[i] = {
            topic: topicConfig.topic,
            status: 'completed',
            contentId: 'generated', // Would be actual DB ID in production
            wordCount: result.metadata.wordCount,
            costUSD: result.metadata.costUSD,
          };

          jobStatus.completedTopics++;

          logger.info('Topic generated successfully', {
            jobId: payload.jobId,
            topic: topicConfig.topic,
            wordCount: result.metadata.wordCount,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          jobStatus.results[i] = {
            topic: topicConfig.topic,
            status: 'failed',
            error: errorMessage,
          };

          jobStatus.failedTopics++;

          logger.error('Topic generation failed', {
            jobId: payload.jobId,
            topic: topicConfig.topic,
            error: errorMessage,
          });
        }

        // Update status in map
        this.jobStatuses.set(payload.jobId, jobStatus);
      }

      // Finalize job status
      jobStatus.completedAt = new Date();
      jobStatus.status =
        jobStatus.failedTopics === 0
          ? 'completed'
          : jobStatus.completedTopics > 0
            ? 'partial'
            : 'failed';

      this.jobStatuses.set(payload.jobId, jobStatus);

      logger.info('Content generation job completed', {
        jobId: payload.jobId,
        status: jobStatus.status,
        completed: jobStatus.completedTopics,
        failed: jobStatus.failedTopics,
      });

      return {
        success: jobStatus.status !== 'failed',
        data: jobStatus,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Content generation job failed', {
        jobId: payload.jobId,
        error: errorMessage,
      });

      // Update job status
      const jobStatus = this.jobStatuses.get(payload.jobId);
      if (jobStatus) {
        jobStatus.status = 'failed';
        jobStatus.error = errorMessage;
        jobStatus.completedAt = new Date();
        this.jobStatuses.set(payload.jobId, jobStatus);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  getJobStatus(jobId: string): ContentGenerationJobStatus | undefined {
    return this.jobStatuses.get(jobId);
  }

  getAllJobStatuses(): ContentGenerationJobStatus[] {
    return Array.from(this.jobStatuses.values());
  }
}

/**
 * Content Generation Job Queue Service
 *
 * Manages the queue and provides high-level API for job submission and status tracking
 */
export class ContentGenerationJobQueueService {
  private queue: RedisMessageQueue;
  private handler: ContentGenerationJobHandler;
  private initialized = false;

  constructor() {
    this.queue = new RedisMessageQueue(
      'content-generation',
      'redis',
      {
        maxRetries: 3,
        visibilityTimeout: 5000,
        batchSize: 5,
        deadLetterQueue: true,
      }
    );

    this.handler = new ContentGenerationJobHandler();
  }

  /**
   * Initialize the queue and start processing
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.queue.subscribe(this.handler);
    this.initialized = true;

    logger.info('Content generation job queue initialized');
  }

  /**
   * Submit a batch content generation job
   */
  async submitBatchJob(payload: {
    organizationId: string;
    generatorType: GeneratorType;
    topics: Array<{
      topic: string;
      category: string;
      targetWordCount?: number;
      keywords?: string[];
    }>;
    userId: string;
  }): Promise<string> {
    const jobId = `cg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const message: IMessage = {
      id: jobId,
      type: 'content.generation.batch',
      priority: 'normal',
      status: 'pending',
      payload: {
        jobId,
        organizationId: payload.organizationId,
        generatorType: payload.generatorType,
        topics: payload.topics,
        userId: payload.userId,
        createdAt: new Date().toISOString(),
      } as ContentGenerationJobPayload,
      metadata: {
        source: 'ContentGenerationJobQueue',
        version: '1.0',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    await this.queue.publish(message);

    logger.info('Batch job submitted', {
      jobId,
      topicCount: payload.topics.length,
    });

    return jobId;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ContentGenerationJobStatus | undefined {
    return this.handler.getJobStatus(jobId);
  }

  /**
   * Get all job statuses
   */
  getAllJobStatuses(): ContentGenerationJobStatus[] {
    return this.handler.getAllJobStatuses();
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return this.queue.getQueueStats();
  }

  /**
   * Shutdown the queue
   */
  async shutdown(): Promise<void> {
    await this.queue.pause();
    this.initialized = false;

    logger.info('Content generation job queue shutdown');
  }
}

// Singleton instance
let jobQueueInstance: ContentGenerationJobQueueService | null = null;

/**
 * Get or create the job queue service instance
 */
export function getContentGenerationJobQueue(): ContentGenerationJobQueueService {
  if (!jobQueueInstance) {
    jobQueueInstance = new ContentGenerationJobQueueService();
  }

  return jobQueueInstance;
}
