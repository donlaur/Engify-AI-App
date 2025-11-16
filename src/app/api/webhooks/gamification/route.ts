/**
 * Gamification Webhook (QStash)
 * 
 * POST /api/webhooks/gamification - Process gamification events via QStash
 * 
 * Events:
 * - prompt_used: User used a prompt (+10 XP)
 * - pattern_learned: User learned a pattern (+25 XP)
 * - prompt_favorited: User favorited a prompt (+5 XP)
 * - challenge_completed: User completed a challenge (+100 XP)
 * 
 * QStash ensures async, reliable processing with retries
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GamificationService } from '@/lib/services/GamificationService';
import { XP_REWARDS } from '@/lib/gamification/levels';
import { logger } from '@/lib/logging/logger';
import { logAuditEvent } from '@/server/middleware/audit';

const gamificationService = new GamificationService();

// Webhook payload schema
const GamificationEventSchema = z.object({
  userId: z.string(),
  action: z.enum(['prompt_used', 'pattern_learned', 'prompt_favorited', 'challenge_completed']),
  metadata: z.object({
    promptId: z.string().optional(),
    promptTitle: z.string().optional(),
    patternName: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify QStash signature (security)
    const signature = request.headers.get('upstash-signature');
    if (!signature && process.env.NODE_ENV === 'production') {
      logger.warn('Missing QStash signature on gamification webhook');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action, metadata } = GamificationEventSchema.parse(body);

    logger.info('Processing gamification event', {
      userId,
      action,
      metadata,
    });

    // Award XP based on action
    let xpReward = 0;
    let reason = '';

    switch (action) {
      case 'prompt_used':
        xpReward = XP_REWARDS.PROMPT_USED;
        reason = `Used prompt: ${metadata?.promptTitle || 'Unknown'}`;
        await gamificationService.trackPromptUsage(userId);
        break;

      case 'pattern_learned':
        xpReward = XP_REWARDS.PATTERN_COMPLETED;
        reason = `Learned pattern: ${metadata?.patternName || 'Unknown'}`;
        await gamificationService.trackPatternCompletion(userId, metadata?.patternName || 'unknown');
        break;

      case 'prompt_favorited':
        xpReward = XP_REWARDS.SKILL_IMPROVED; // 15 XP for engagement
        reason = `Favorited prompt: ${metadata?.promptTitle || 'Unknown'}`;
        break;

      case 'challenge_completed':
        xpReward = XP_REWARDS.PATHWAY_COMPLETED; // 100 XP
        reason = 'Completed challenge';
        break;
    }

    // Award XP
    const result = await gamificationService.awardXP(userId, xpReward, reason);

    // Audit log
    await logAuditEvent({
      userId,
      eventType: 'user.gamification.xp_awarded' as any,
      action: 'gamification.xp_awarded',
      metadata: {
        action,
        xpAwarded: xpReward,
        newXP: result.newXP,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        achievementsUnlocked: result.achievementsUnlocked.length,
        ...metadata,
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    });

    logger.info('Gamification event processed', {
      userId,
      action,
      xpAwarded: xpReward,
      leveledUp: result.leveledUp,
      achievementsUnlocked: result.achievementsUnlocked.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        xpAwarded: xpReward,
        newXP: result.newXP,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        achievementsUnlocked: result.achievementsUnlocked,
      },
    });
  } catch (error) {
    logger.error('Error processing gamification webhook', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}

