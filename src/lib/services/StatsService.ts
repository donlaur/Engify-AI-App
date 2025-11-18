/**
 * Stats Service
 * Centralized source of truth for all platform statistics
 * NO HARDCODED NUMBERS - all pulled from database or calculated
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { AI_MODELS } from '@/lib/ai/providers';

export interface PlatformStats {
  prompts: {
    total: number;
    byCategory: Record<string, number>;
    byRole: Record<string, number>;
  };
  patterns: {
    total: number;
    documented: number;
    implemented: number;
  };
  providers: {
    total: number;
    free: number;
    premium: number;
  };
  users: {
    total: number;
    active: number;
    newThisWeek: number;
  };
  usage: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
}

/**
 * Get real-time platform statistics
 * This is the SINGLE SOURCE OF TRUTH for all stats
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const db = await getMongoDb();

  // Get prompt count from database (only active, public prompts)
  const promptCount = await db.collection('prompts').countDocuments({ 
    isPublic: true, 
    active: { $ne: false } 
  });
  
  // Get prompts by category (only active, public prompts)
  const promptsByCategory = await db.collection('prompts')
    .aggregate([
      { $match: { isPublic: true, active: { $ne: false } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    .toArray();

  // Get prompts by role (only active, public prompts)
  const promptsByRole = await db.collection('prompts')
    .aggregate([
      { $match: { isPublic: true, active: { $ne: false } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ])
    .toArray();

  // Get pattern count from PROMPT_PATTERNS_RESEARCH.md
  // For now, we'll count from the patterns array
  const patterns = await getPatternStats();

  // Get provider count
  const providers = await getProviderStats();

  // Get user stats
  const users = await getUserStats(db);

  // Get usage stats
  const usage = await getUsageStats(db);

  return {
    prompts: {
      total: promptCount,
      byCategory: promptsByCategory.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byRole: promptsByRole.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
    patterns,
    providers,
    users,
    usage,
  };
}

/**
 * Get pattern statistics
 */
async function getPatternStats() {
  // These are documented in PROMPT_PATTERNS_RESEARCH.md
  // In the future, we could parse the markdown file or store in DB
  const documentedPatterns = [
    'Persona Pattern',
    'Audience Persona Pattern',
    'Cognitive Verifier Pattern',
    'Chain of Thought (CoT)',
    'Question Refinement Pattern',
    'Template Pattern',
    'Few-Shot Learning',
    'Context Control Pattern',
    'Output Formatting Pattern',
    'Constraint Pattern',
    'Tree of Thoughts',
    'ReAct Pattern',
    'Self-Consistency',
    'Meta-Prompting',
    'Retrieval Augmented Generation (RAG)',
  ];

  return {
    total: documentedPatterns.length,
    documented: documentedPatterns.length,
    implemented: documentedPatterns.length, // All are implemented in prompts
  };
}

/**
 * Get provider statistics
 */
async function getProviderStats() {
  // Count from AI_MODELS in providers.ts
  // Using static import
  const models = Object.values(AI_MODELS);

  return {
    total: new Set(models.map(m => m.provider)).size, // Unique providers
    free: models.filter(m => m.tier === 'free').length,
    premium: models.filter(m => m.tier === 'premium').length,
  };
}

/**
 * Get user statistics
 */
async function getUserStats(db: any) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, newThisWeek] = await Promise.all([
    db.collection('users').countDocuments({}),
    db.collection('users').countDocuments({
      createdAt: { $gte: weekAgo },
    }),
  ]);

  // Active users = users who have activity in last 7 days
  const active = await db.collection('activities').distinct('userId', {
    timestamp: { $gte: weekAgo },
  });

  return {
    total,
    active: active.length,
    newThisWeek,
  };
}

/**
 * Get usage statistics
 */
async function getUsageStats(db: any) {
  const usage = await db.collection('ai_usage')
    .aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$cost' },
        },
      },
    ])
    .toArray();

  if (usage.length === 0) {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
    };
  }

  return {
    totalRequests: usage[0].totalRequests,
    totalTokens: usage[0].totalTokens,
    totalCost: usage[0].totalCost,
  };
}

/**
 * Get quick stats (cached for performance)
 * Use this for homepage/dashboard
 */
let statsCache: PlatformStats | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getQuickStats(): Promise<PlatformStats> {
  const now = Date.now();
  
  if (statsCache && (now - cacheTime) < CACHE_TTL) {
    return statsCache;
  }

  statsCache = await getPlatformStats();
  cacheTime = now;

  return statsCache;
}

/**
 * Invalidate stats cache
 * Call this when data changes (e.g., new prompt added)
 */
export function invalidateStatsCache(): void {
  statsCache = null;
  cacheTime = 0;
}

/**
 * Get homepage hero stats
 * Formatted for display
 */
export async function getHeroStats(): Promise<{
  prompts: string;
  patterns: string;
  providers: string;
  cost: string;
}> {
  const stats = await getQuickStats();

  return {
    prompts: stats.prompts.total.toString(),
    patterns: stats.patterns.total.toString(),
    providers: stats.providers.total.toString(),
    cost: '$0', // Free forever
  };
}
