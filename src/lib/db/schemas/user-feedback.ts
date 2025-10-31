/**
 * User Feedback Schema
 * 
 * Two-tier rating system:
 * 1. Quick Feedback: Like/helpful (immediate, low friction)
 * 2. Detailed Rating: 1-5 stars (after usage, more thoughtful)
 * 
 * Purpose:
 * - Improve content quality
 * - Train recommendation system
 * - Build RAG training data
 * - Identify high/low performing prompts
 */

import { z } from 'zod';

// ============================================================================
// TIER 1: QUICK FEEDBACK (Low Friction)
// ============================================================================

export const QuickFeedbackSchema = z.object({
  userId: z.string().optional(), // Optional for anonymous users
  organizationId: z.string().optional(), // Multi-tenant support (Day 4 requirement)
  promptId: z.string().describe('Prompt being rated'),
  
  // Quick action types
  action: z.enum([
    'like',              // Simple heart/like
    'save',              // Add to collection
    'helpful',           // "Was this helpful?" yes
    'not-helpful',       // "Was this helpful?" no
    'share',             // Shared with team
  ]),
  
  // Context
  timestamp: z.date(),
  sessionId: z.string().optional(),
  
  // Metadata for analysis
  metadata: z.object({
    timeOnPage: z.number().optional(),      // Seconds spent viewing
    scrollDepth: z.number().optional(),     // 0-100%
    copiedContent: z.boolean().optional(),  // Did they copy the prompt?
    source: z.string().optional(),          // Where they found it (search, browse, etc.)
  }).optional(),
});

export type QuickFeedback = z.infer<typeof QuickFeedbackSchema>;

// ============================================================================
// TIER 2: DETAILED RATING (After Usage)
// ============================================================================

export const DetailedRatingSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(), // Multi-tenant support (Day 4 requirement)
  promptId: z.string(),
  
  // Star rating (1-5)
  rating: z.number().min(1).max(5).int().describe('Overall quality rating'),
  
  // Specific dimensions (optional but encouraged)
  dimensions: z.object({
    clarity: z.number().min(1).max(5).optional(),           // How clear were instructions?
    usefulness: z.number().min(1).max(5).optional(),        // How useful was the result?
    completeness: z.number().min(1).max(5).optional(),      // How complete was it?
    accuracy: z.number().min(1).max(5).optional(),          // Was output accurate?
  }).optional(),
  
  // Context about usage
  usageContext: z.object({
    aiModel: z.string().optional(),                    // Which model did they use?
    modelCost: z.number().optional(),                  // What did it cost?
    timeToComplete: z.number().optional(),             // How long did it take?
    iterationCount: z.number().optional(),             // How many tries?
    achievedGoal: z.boolean().optional(),              // Did it solve their problem?
  }).optional(),
  
  // Optional feedback
  comment: z.string().max(500).optional(),             // What worked/didn't work
  tags: z.array(z.string()).optional(),                // User-added tags
  
  // Improvement suggestions
  suggestedImprovements: z.array(z.enum([
    'add-examples',
    'simplify-language',
    'more-context',
    'better-structure',
    'add-edge-cases',
    'reduce-verbosity',
    'other',
  ])).optional(),
  
  // Metadata
  timestamp: z.date(),
  sessionId: z.string().optional(),
});

export type DetailedRating = z.infer<typeof DetailedRatingSchema>;

// ============================================================================
// AGGREGATE SCORES (Computed)
// ============================================================================

export const PromptScoreAggregateSchema = z.object({
  promptId: z.string(),
  
  // Quick feedback totals
  quickFeedback: z.object({
    likes: z.number(),
    saves: z.number(),
    helpful: z.number(),
    notHelpful: z.number(),
    shares: z.number(),
    totalInteractions: z.number(),
  }),
  
  // Detailed ratings
  detailedRatings: z.object({
    averageRating: z.number(),               // Mean of all ratings
    ratingCount: z.number(),                 // Total ratings
    ratingDistribution: z.object({           // How many of each
      stars1: z.number(),
      stars2: z.number(),
      stars3: z.number(),
      stars4: z.number(),
      stars5: z.number(),
    }),
    
    // Dimension averages
    averageClarity: z.number().optional(),
    averageUsefulness: z.number().optional(),
    averageCompleteness: z.number().optional(),
    averageAccuracy: z.number().optional(),
  }),
  
  // Computed scores for ranking/recommendations
  overallScore: z.number(),                  // Combined score (0-100)
  confidenceScore: z.number(),               // How confident are we? (more ratings = higher)
  trendingScore: z.number().optional(),      // Recent activity spike
  
  // Quality indicators
  qualityFlags: z.object({
    isHighQuality: z.boolean(),              // Overall score >= 80
    needsImprovement: z.boolean(),           // Overall score < 60
    hasIssues: z.boolean(),                  // Many "not helpful" ratings
    isPopular: z.boolean(),                  // High engagement
  }),
  
  // Training data readiness
  ragReadiness: z.object({
    isReady: z.boolean(),                    // Ready for RAG training?
    score: z.number(),                       // RAG quality score (0-100)
    reasoning: z.string(),                   // Why/why not ready
  }),
  
  lastUpdated: z.date(),
});

export type PromptScoreAggregate = z.infer<typeof PromptScoreAggregateSchema>;

// ============================================================================
// USER FEEDBACK PREFERENCES
// ============================================================================

export const UserFeedbackPreferencesSchema = z.object({
  userId: z.string(),
  
  // Consent
  allowFeedbackCollection: z.boolean().default(true),
  allowAnonymousTracking: z.boolean().default(true),
  
  // Notification preferences
  notifyOnPromptUpdates: z.boolean().default(false),        // Tell me when prompts I liked improve
  notifyOnSimilarContent: z.boolean().default(false),       // Suggest similar prompts
  
  // Privacy
  shareWithCommunity: z.boolean().default(false),           // Show my ratings publicly
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserFeedbackPreferences = z.infer<typeof UserFeedbackPreferencesSchema>;

// ============================================================================
// FEEDBACK ANALYTICS (for system improvement)
// ============================================================================

export const FeedbackAnalyticsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.date(),
  endDate: z.date(),
  
  metrics: z.object({
    totalQuickFeedback: z.number(),
    totalDetailedRatings: z.number(),
    averageRating: z.number(),
    
    // Trends
    ratingTrend: z.enum(['improving', 'stable', 'declining']),
    
    // Top/bottom performers
    topPrompts: z.array(z.object({
      promptId: z.string(),
      title: z.string(),
      score: z.number(),
    })),
    bottomPrompts: z.array(z.object({
      promptId: z.string(),
      title: z.string(),
      score: z.number(),
      issues: z.array(z.string()),
    })),
    
    // User engagement
    activeRaters: z.number(),
    averageRatingsPerUser: z.number(),
    
    // Content quality
    promptsNeedingImprovement: z.number(),
    promptsReadyForRAG: z.number(),
  }),
  
  generatedAt: z.date(),
});

export type FeedbackAnalytics = z.infer<typeof FeedbackAnalyticsSchema>;

// ============================================================================
// MONGODB COLLECTION NAMES
// ============================================================================

export const FEEDBACK_COLLECTIONS = {
  QUICK_FEEDBACK: 'prompt_quick_feedback',
  DETAILED_RATINGS: 'prompt_detailed_ratings',
  SCORE_AGGREGATES: 'prompt_score_aggregates',
  USER_PREFERENCES: 'user_feedback_preferences',
  ANALYTICS: 'feedback_analytics',
} as const;

// ============================================================================
// MONGODB INDEXES
// ============================================================================

export const FEEDBACK_INDEXES = [
  // Quick feedback
  { collection: FEEDBACK_COLLECTIONS.QUICK_FEEDBACK, index: { promptId: 1, timestamp: -1 } },
  { collection: FEEDBACK_COLLECTIONS.QUICK_FEEDBACK, index: { userId: 1, timestamp: -1 } },
  { collection: FEEDBACK_COLLECTIONS.QUICK_FEEDBACK, index: { action: 1 } },
  
  // Detailed ratings
  { collection: FEEDBACK_COLLECTIONS.DETAILED_RATINGS, index: { promptId: 1, timestamp: -1 } },
  { collection: FEEDBACK_COLLECTIONS.DETAILED_RATINGS, index: { userId: 1, timestamp: -1 } },
  { collection: FEEDBACK_COLLECTIONS.DETAILED_RATINGS, index: { rating: 1 } },
  { collection: FEEDBACK_COLLECTIONS.DETAILED_RATINGS, index: { 'usageContext.aiModel': 1 } },
  
  // Aggregates (for fast retrieval)
  { collection: FEEDBACK_COLLECTIONS.SCORE_AGGREGATES, index: { promptId: 1 }, unique: true },
  { collection: FEEDBACK_COLLECTIONS.SCORE_AGGREGATES, index: { overallScore: -1 } },
  { collection: FEEDBACK_COLLECTIONS.SCORE_AGGREGATES, index: { 'qualityFlags.isHighQuality': 1 } },
  { collection: FEEDBACK_COLLECTIONS.SCORE_AGGREGATES, index: { 'ragReadiness.isReady': 1 } },
  
  // User preferences
  { collection: FEEDBACK_COLLECTIONS.USER_PREFERENCES, index: { userId: 1 }, unique: true },
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate overall score from quick feedback and ratings
 * Formula: Weighted average of engagement and quality
 */
export function calculateOverallScore(
  quickFeedback: PromptScoreAggregate['quickFeedback'],
  detailedRatings: PromptScoreAggregate['detailedRatings']
): number {
  // Engagement score (0-40 points)
  const totalEngagement = quickFeedback.totalInteractions;
  const positiveEngagement = quickFeedback.likes + quickFeedback.saves + quickFeedback.helpful;
  const engagementRatio = totalEngagement > 0 ? positiveEngagement / totalEngagement : 0;
  const engagementScore = engagementRatio * 40;
  
  // Quality score (0-60 points)
  const hasRatings = detailedRatings.ratingCount > 0;
  const qualityScore = hasRatings ? (detailedRatings.averageRating / 5) * 60 : 0;
  
  // Overall: engagement (40%) + quality (60%)
  return Math.round(engagementScore + qualityScore);
}

/**
 * Calculate confidence score based on sample size
 * More ratings = higher confidence
 */
export function calculateConfidenceScore(
  quickFeedbackCount: number,
  detailedRatingCount: number
): number {
  const totalFeedback = quickFeedbackCount + (detailedRatingCount * 3); // Detailed ratings worth more
  
  if (totalFeedback < 5) return 20;
  if (totalFeedback < 10) return 40;
  if (totalFeedback < 25) return 60;
  if (totalFeedback < 50) return 80;
  return 100;
}

/**
 * Determine if prompt is ready for RAG training
 */
export function calculateRAGReadiness(
  aggregate: Omit<PromptScoreAggregate, 'ragReadiness'>
): PromptScoreAggregate['ragReadiness'] {
  const { overallScore, confidenceScore, detailedRatings } = aggregate;
  
  // Criteria for RAG readiness:
  // 1. High overall score (>= 75)
  // 2. Sufficient ratings (confidence >= 60)
  // 3. Positive feedback ratio
  // 4. No major quality flags
  
  const meetsQualityThreshold = overallScore >= 75;
  const hasSufficientData = confidenceScore >= 60;
  const hasPositiveRatings = detailedRatings.averageRating >= 4.0;
  const hasManyRatings = detailedRatings.ratingCount >= 10;
  
  const score = (
    (meetsQualityThreshold ? 30 : 0) +
    (hasSufficientData ? 25 : 0) +
    (hasPositiveRatings ? 30 : 0) +
    (hasManyRatings ? 15 : 0)
  );
  
  const isReady = score >= 80;
  
  let reasoning = '';
  if (!meetsQualityThreshold) reasoning = 'Overall score too low (need >= 75)';
  else if (!hasSufficientData) reasoning = 'Insufficient feedback data (need more ratings)';
  else if (!hasPositiveRatings) reasoning = 'Average rating below 4.0 stars';
  else if (!hasManyRatings) reasoning = 'Need at least 10 detailed ratings';
  else reasoning = 'Meets all quality criteria for RAG training';
  
  return { isReady, score, reasoning };
}

