/**
 * Progress Cache for Content Generation
 * Stores real-time progress updates in Redis/Upstash
 */

import Redis from 'ioredis';

export interface GenerationProgress {
  jobId: string;
  topic: string;
  contentType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  currentSection?: string;
  completedSections: string[];
  totalSections: number;
  progress: number;
  wordCount: number;
  costUSD: number;
  startTime: number;
  logs: string[];
  error?: string;
}

export class ProgressCache {
  private redis: Redis;

  constructor() {
    // Use Upstash Redis in production
    if (process.env.UPSTASH_REDIS_REST_URL) {
      this.redis = new Redis(process.env.UPSTASH_REDIS_REST_URL);
    } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      this.redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      });
    } else {
      throw new Error('Redis configuration missing. Set UPSTASH_REDIS_REST_URL or REDIS_HOST/REDIS_PORT');
    }
  }

  /**
   * Initialize progress for a new job
   */
  async init(jobId: string, topic: string, contentType: string, totalSections: number): Promise<void> {
    const progress: GenerationProgress = {
      jobId,
      topic,
      contentType,
      status: 'processing',
      completedSections: [],
      totalSections,
      progress: 0,
      wordCount: 0,
      costUSD: 0,
      startTime: Date.now(),
      logs: ['🚀 Starting generation...'],
    };

    await this.set(jobId, progress);
  }

  /**
   * Update progress when a section starts
   */
  async startSection(jobId: string, sectionTitle: string): Promise<void> {
    const progress = await this.get(jobId);
    if (!progress) return;

    progress.currentSection = sectionTitle;
    progress.logs.push(`✍️ Generating: ${sectionTitle}...`);
    
    await this.set(jobId, progress);
  }

  /**
   * Update progress when a section completes
   */
  async completeSection(
    jobId: string,
    sectionTitle: string,
    wordCount: number,
    costUSD: number
  ): Promise<void> {
    const progress = await this.get(jobId);
    if (!progress) return;

    progress.completedSections.push(sectionTitle);
    progress.currentSection = undefined;
    progress.wordCount += wordCount;
    progress.costUSD += costUSD;
    progress.progress = Math.round((progress.completedSections.length / progress.totalSections) * 100);
    progress.logs.push(`✅ ${sectionTitle}: ${wordCount} words`);

    await this.set(jobId, progress);
  }

  /**
   * Mark job as completed
   */
  async complete(jobId: string): Promise<void> {
    const progress = await this.get(jobId);
    if (!progress) return;

    const durationMs = Date.now() - progress.startTime;
    const durationSec = Math.round(durationMs / 1000);

    progress.status = 'completed';
    progress.progress = 100;
    progress.logs.push(`✅ Generation complete!`);
    progress.logs.push(`📄 ${progress.wordCount} words in ${durationSec}s`);
    progress.logs.push(`👉 Check the Review tab to view and edit`);

    await this.set(jobId, progress, 300); // Keep for 5 minutes after completion
  }

  /**
   * Mark job as failed
   */
  async fail(jobId: string, error: string): Promise<void> {
    const progress = await this.get(jobId);
    if (!progress) return;

    progress.status = 'failed';
    progress.error = error;
    progress.logs.push(`❌ Generation failed: ${error}`);

    await this.set(jobId, progress, 300); // Keep for 5 minutes after failure
  }

  /**
   * Get progress for a job
   */
  async get(jobId: string): Promise<GenerationProgress | null> {
    const key = this.getKey(jobId);
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  }

  /**
   * Set progress for a job
   */
  private async set(jobId: string, progress: GenerationProgress, ttlSeconds = 3600): Promise<void> {
    const key = this.getKey(jobId);
    await this.redis.setex(key, ttlSeconds, JSON.stringify(progress));
  }

  /**
   * Get Redis key for job
   */
  private getKey(jobId: string): string {
    return `content:generation:progress:${jobId}`;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
