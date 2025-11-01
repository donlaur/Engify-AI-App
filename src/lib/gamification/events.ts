/**
 * Gamification Event Publisher
 * 
 * Publishes gamification events to QStash for async processing
 * This keeps the main request fast while XP/achievements are calculated in background
 */

import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';
import { IMessage, MessagePriority } from '@/lib/messaging/types';
import { logger } from '@/lib/logging/logger';

export type GamificationAction = 
  | 'prompt_used'
  | 'pattern_learned'
  | 'prompt_favorited'
  | 'challenge_completed';

export interface GamificationEvent {
  userId: string;
  action: GamificationAction;
  metadata?: {
    promptId?: string;
    promptTitle?: string;
    patternName?: string;
  };
}

/**
 * Publish gamification event to QStash
 * Non-blocking - returns immediately
 */
export async function publishGamificationEvent(event: GamificationEvent): Promise<void> {
  try {
    // Skip if QStash not configured
    if (!process.env.QSTASH_TOKEN) {
      logger.warn('QStash not configured - gamification event not published', {
        action: event.action,
        userId: event.userId,
      });
      return;
    }

    const queue = new QStashMessageQueue('gamification-events', 'redis', {
      name: 'gamification-events',
      type: 'redis',
      maxRetries: 3,
      retryDelay: 1000,
      visibilityTimeout: 30000,
      batchSize: 10,
      concurrency: 5,
      enableDeadLetter: true,
      enableMetrics: true,
    });

    const message: IMessage = {
      id: `gamification-${event.userId}-${Date.now()}`,
      type: 'event',
      payload: event,
      priority: 'normal' as MessagePriority,
      status: 'pending',
      metadata: {
        source: 'gamification',
        version: '1.0.0',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    await queue.publish(message);

    logger.info('Gamification event published', {
      userId: event.userId,
      action: event.action,
    });
  } catch (error) {
    // Don't fail the main request if event publishing fails
    logger.error('Failed to publish gamification event', {
      error: error instanceof Error ? error.message : String(error),
      userId: event.userId,
      action: event.action,
    });
  }
}

/**
 * Convenience methods for common events
 */
export const gamificationEvents = {
  promptUsed: (userId: string, promptId: string, promptTitle: string) =>
    publishGamificationEvent({
      userId,
      action: 'prompt_used',
      metadata: { promptId, promptTitle },
    }),

  patternLearned: (userId: string, patternName: string) =>
    publishGamificationEvent({
      userId,
      action: 'pattern_learned',
      metadata: { patternName },
    }),

  promptFavorited: (userId: string, promptId: string, promptTitle: string) =>
    publishGamificationEvent({
      userId,
      action: 'prompt_favorited',
      metadata: { promptId, promptTitle },
    }),

  challengeCompleted: (userId: string) =>
    publishGamificationEvent({
      userId,
      action: 'challenge_completed',
    }),
};

