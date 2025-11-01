/**
 * Gamification Tracking API
 * 
 * POST /api/gamification/track - Track user actions and award XP
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { gamificationService } from '@/lib/services/GamificationService';

const trackEventSchema = z.object({
  action: z.enum(['prompt_used', 'prompt_favorited', 'prompt_unfavorited', 'pattern_learned']),
  promptId: z.string().optional(),
  promptTitle: z.string().optional(),
  patternName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, promptId, promptTitle, patternName } = trackEventSchema.parse(body);
    
    let result;
    
    switch (action) {
      case 'prompt_used':
        if (!promptId || !promptTitle) {
          return NextResponse.json(
            { error: 'promptId and promptTitle required for prompt_used' },
            { status: 400 }
          );
        }
        await gamificationService.trackPromptUsed(session.user.id, promptId, promptTitle);
        result = { message: 'Prompt usage tracked', xpEarned: 10 };
        break;
        
      case 'prompt_favorited':
        if (!promptId || !promptTitle) {
          return NextResponse.json(
            { error: 'promptId and promptTitle required for prompt_favorited' },
            { status: 400 }
          );
        }
        await gamificationService.trackPromptFavorited(session.user.id, promptId, promptTitle, true);
        result = { message: 'Prompt favorited tracked', xpEarned: 5 };
        break;
        
      case 'prompt_unfavorited':
        if (!promptId || !promptTitle) {
          return NextResponse.json(
            { error: 'promptId and promptTitle required for prompt_unfavorited' },
            { status: 400 }
          );
        }
        await gamificationService.trackPromptFavorited(session.user.id, promptId, promptTitle, false);
        result = { message: 'Prompt unfavorited tracked', xpEarned: 0 };
        break;
        
      case 'pattern_learned':
        if (!patternName) {
          return NextResponse.json(
            { error: 'patternName required for pattern_learned' },
            { status: 400 }
          );
        }
        await gamificationService.trackPatternLearned(session.user.id, patternName);
        result = { message: 'Pattern learned tracked', xpEarned: 25 };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Get updated stats
    const stats = await gamificationService.getUserStats(session.user.id);
    
    return NextResponse.json({
      success: true,
      ...result,
      stats: {
        xp: stats.xp,
        level: stats.level,
        currentStreak: stats.currentStreak,
      },
    });
  } catch (error) {
    console.error('Error tracking gamification event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

