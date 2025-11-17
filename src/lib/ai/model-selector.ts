/**
 * AI Model Selector
 * Intelligently selects the best AI model based on context, task, and availability
 */

import { AI_MODELS, AIModel } from './providers';

export type TaskType = 
  | 'chat'
  | 'code-review'
  | 'code-generation'
  | 'debugging'
  | 'documentation'
  | 'analysis'
  | 'creative'
  | 'summarization'
  | 'translation';

export interface ModelSelectionCriteria {
  taskType: TaskType;
  promptLength: number;
  maxOutputTokens?: number;
  requiresVision?: boolean;
  requiresJSON?: boolean;
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  userPreference?: string; // User's preferred model
  availableKeys?: string[]; // Which provider keys are available
  prioritizeCost?: boolean;
  prioritizeSpeed?: boolean;
  prioritizeQuality?: boolean;
}

export interface ModelRecommendation {
  model: AIModel;
  score: number;
  reasons: string[];
  estimatedCost: number;
  estimatedLatency: number;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Task-specific model recommendations
 */
const TASK_MODEL_PREFERENCES: Record<TaskType, string[]> = {
  'chat': ['gpt-4o-mini', 'claude-3-haiku', 'groq-llama-3.1-8b', 'gemini-2.0-flash-exp'],
  'code-review': ['claude-3-5-sonnet', 'gpt-4o-mini', 'groq-llama-3.1-70b'],
  'code-generation': ['claude-3-5-sonnet', 'gpt-4o-mini', 'groq-llama-3.1-70b'],
  'debugging': ['claude-3-5-sonnet', 'gpt-4o-mini', 'groq-llama-3.1-70b'],
  'documentation': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-2.0-flash-exp'],
  'analysis': ['claude-3-5-sonnet', 'gemini-2.0-flash-exp', 'gpt-4o-mini'],
  'creative': ['claude-3-5-sonnet', 'gpt-4o-mini', 'mistral-small'],
  'summarization': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-2.0-flash-exp'],
  'translation': ['gpt-4o-mini', 'gemini-2.0-flash-exp', 'claude-3-haiku'],
};

/**
 * Intelligently select the best AI model
 */
export function selectBestModel(criteria: ModelSelectionCriteria): ModelRecommendation {
  // Get all available models
  const availableModels = Object.values(AI_MODELS);
  
  // Score each model
  const scoredModels = availableModels.map(model => ({
    model,
    score: scoreModel(model, criteria),
    reasons: getSelectionReasons(model, criteria),
    estimatedCost: estimateCost(model, criteria),
    estimatedLatency: estimateLatency(model, criteria),
    confidence: calculateConfidence(model, criteria),
  }));

  // Sort by score (highest first)
  scoredModels.sort((a, b) => b.score - a.score);

  // Return best match
  return scoredModels[0];
}

/**
 * Get multiple model recommendations
 */
export function getModelRecommendations(
  criteria: ModelSelectionCriteria,
  count: number = 3
): ModelRecommendation[] {
  const availableModels = Object.values(AI_MODELS);
  
  const scoredModels = availableModels.map(model => ({
    model,
    score: scoreModel(model, criteria),
    reasons: getSelectionReasons(model, criteria),
    estimatedCost: estimateCost(model, criteria),
    estimatedLatency: estimateLatency(model, criteria),
    confidence: calculateConfidence(model, criteria),
  }));

  scoredModels.sort((a, b) => b.score - a.score);

  return scoredModels.slice(0, count);
}

/**
 * Score a model based on criteria
 */
function scoreModel(model: AIModel, criteria: ModelSelectionCriteria): number {
  let score = 0;

  // Task type match (40 points)
  const preferredModels = TASK_MODEL_PREFERENCES[criteria.taskType] || [];
  const taskIndex = preferredModels.indexOf(model.id);
  if (taskIndex !== -1) {
    score += 40 - (taskIndex * 10); // First choice gets 40, second 30, etc.
  }

  // Context window (20 points)
  const estimatedTokens = Math.ceil(criteria.promptLength / 4) + (criteria.maxOutputTokens || 2000);
  if (model.contextWindow >= estimatedTokens) {
    const utilization = estimatedTokens / model.contextWindow;
    score += 20 * (1 - utilization); // Better score for more headroom
  } else {
    score -= 50; // Severe penalty if context too small
  }

  // Cost efficiency (15 points)
  if (criteria.prioritizeCost || criteria.userTier === 'free') {
    const costScore = 1 - (model.inputCostPer1M / 5); // Normalize to 0-1
    score += 15 * Math.max(0, costScore);
  }

  // Speed (10 points)
  if (criteria.prioritizeSpeed) {
    if (model.provider === 'groq') score += 10; // Groq is fastest
    else if (model.provider === 'openai') score += 7;
    else if (model.provider === 'google') score += 5;
  }

  // Quality (10 points)
  if (criteria.prioritizeQuality) {
    if (model.tier === 'premium') score += 10;
    else if (model.tier === 'affordable') score += 5;
  }

  // Features (5 points each)
  if (criteria.requiresVision && model.supportsVision) score += 5;
  if (criteria.requiresJSON && model.supportsJSON) score += 5;
  if (model.supportsStreaming) score += 3;

  // Recommended flag (5 points)
  if (model.recommended) score += 5;

  // User tier compatibility (10 points)
  if (criteria.userTier === 'free' && model.tier === 'free') score += 10;
  else if (criteria.userTier === 'free' && model.tier === 'affordable') score += 5;
  else if (criteria.userTier === 'pro' && model.tier === 'premium') score += 10;

  // Available keys (20 points)
  if (criteria.availableKeys?.includes(model.provider)) {
    score += 20;
  } else {
    score -= 30; // Penalty if key not available
  }

  // User preference (30 points bonus)
  if (criteria.userPreference === model.id) {
    score += 30;
  }

  return Math.max(0, score);
}

/**
 * Get reasons for model selection
 */
function getSelectionReasons(model: AIModel, criteria: ModelSelectionCriteria): string[] {
  const reasons: string[] = [];

  // Task match
  const preferredModels = TASK_MODEL_PREFERENCES[criteria.taskType] || [];
  if (preferredModels.includes(model.id)) {
    reasons.push(`Optimized for ${criteria.taskType}`);
  }

  // Cost
  if (model.tier === 'free') {
    reasons.push('Free tier available');
  } else if (model.inputCostPer1M < 0.5) {
    reasons.push('Very affordable');
  }

  // Speed
  if (model.provider === 'groq') {
    reasons.push('Fastest inference (500+ tokens/sec)');
  }

  // Context
  if (model.contextWindow >= 100000) {
    reasons.push(`Large context window (${(model.contextWindow / 1000).toFixed(0)}K tokens)`);
  }

  // Features
  if (model.supportsVision && criteria.requiresVision) {
    reasons.push('Supports vision/images');
  }
  if (model.supportsJSON && criteria.requiresJSON) {
    reasons.push('Native JSON support');
  }

  // Quality
  if (model.tier === 'premium') {
    reasons.push('Premium quality');
  }

  return reasons;
}

/**
 * Estimate cost for request
 */
function estimateCost(model: AIModel, criteria: ModelSelectionCriteria): number {
  const inputTokens = Math.ceil(criteria.promptLength / 4);
  const outputTokens = criteria.maxOutputTokens || 2000;
  
  const inputCost = (inputTokens / 1000000) * model.inputCostPer1M;
  const outputCost = (outputTokens / 1000000) * model.outputCostPer1M;
  
  return inputCost + outputCost;
}

/**
 * Estimate latency for request
 */
function estimateLatency(model: AIModel, criteria: ModelSelectionCriteria): number {
  const outputTokens = criteria.maxOutputTokens || 2000;
  
  // Base latency by provider (milliseconds)
  const baseLatency: Record<string, number> = {
    groq: 500,      // Fastest
    openai: 2000,
    google: 1500,
    anthropic: 2500,
    perplexity: 3000,
    together: 2000,
    mistral: 2000,
  };

  const base = baseLatency[model.provider] || 2000;
  
  // Add time for output tokens (rough estimate)
  const tokensPerSecond = model.provider === 'groq' ? 500 : 50;
  const outputTime = (outputTokens / tokensPerSecond) * 1000;
  
  return base + outputTime;
}

/**
 * Calculate confidence in selection
 */
function calculateConfidence(model: AIModel, criteria: ModelSelectionCriteria): 'low' | 'medium' | 'high' {
  let confidence = 0;

  // Task match
  const preferredModels = TASK_MODEL_PREFERENCES[criteria.taskType] || [];
  if (preferredModels.indexOf(model.id) === 0) confidence += 3;
  else if (preferredModels.includes(model.id)) confidence += 2;

  // Context fit
  const estimatedTokens = Math.ceil(criteria.promptLength / 4) + (criteria.maxOutputTokens || 2000);
  if (model.contextWindow >= estimatedTokens * 2) confidence += 2;
  else if (model.contextWindow >= estimatedTokens) confidence += 1;

  // Available key
  if (criteria.availableKeys?.includes(model.provider)) confidence += 2;

  // Recommended
  if (model.recommended) confidence += 1;

  if (confidence >= 7) return 'high';
  if (confidence >= 4) return 'medium';
  return 'low';
}

/**
 * Detect task type from prompt
 */
export function detectTaskType(prompt: string): TaskType {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('review') && (lowerPrompt.includes('code') || lowerPrompt.includes('pr'))) {
    return 'code-review';
  }
  if (lowerPrompt.includes('write code') || lowerPrompt.includes('implement') || lowerPrompt.includes('function')) {
    return 'code-generation';
  }
  if (lowerPrompt.includes('debug') || lowerPrompt.includes('error') || lowerPrompt.includes('bug')) {
    return 'debugging';
  }
  if (lowerPrompt.includes('document') || lowerPrompt.includes('readme') || lowerPrompt.includes('api doc')) {
    return 'documentation';
  }
  if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analysis') || lowerPrompt.includes('evaluate')) {
    return 'analysis';
  }
  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return 'summarization';
  }
  if (lowerPrompt.includes('translate')) {
    return 'translation';
  }
  if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('story')) {
    return 'creative';
  }

  return 'chat'; // Default
}

/**
 * Auto-select model (convenience function)
 */
export function autoSelectModel(
  prompt: string,
  userTier: 'free' | 'basic' | 'pro' | 'enterprise' = 'free',
  availableKeys: string[] = ['openai', 'anthropic', 'google', 'groq']
): ModelRecommendation {
  const taskType = detectTaskType(prompt);
  
  return selectBestModel({
    taskType,
    promptLength: prompt.length,
    maxOutputTokens: 2000,
    userTier,
    availableKeys,
    prioritizeCost: userTier === 'free',
    prioritizeSpeed: false,
    prioritizeQuality: userTier === 'pro' || userTier === 'enterprise',
  });
}
