/**
 * Prompts Data Access Layer
 *
 * Tries static JSON first (fast, no cold starts)
 * Falls back to MongoDB if JSON unavailable
 *
 * This solves the cold start problem by using static JSON files
 * similar to the breeding site's approach
 */

import { loadPromptsFromJson } from './load-prompts-from-json';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import type { Prompt } from '@/lib/schemas/prompt';
import { logger } from '@/lib/logging/logger';

/**
 * Fetch all prompts from static JSON (fast) or MongoDB (fallback)
 * @deprecated Use promptRepository.getAll() for direct MongoDB access
 * Use this function for fast static JSON loading with MongoDB fallback
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    // Try static JSON first (fast, no cold starts)
    return await loadPromptsFromJson();
  } catch (error) {
    // Fallback to MongoDB (reliable, always works)
    logger.debug('Using MongoDB fallback for prompts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    try {
      return promptRepository.getAll();
    } catch (mongoError) {
      // During build, return empty array to avoid build failures
      if (mongoError instanceof Error && mongoError.message.includes('BUILD_MODE')) {
        logger.warn('Build mode detected, returning empty prompts array');
        return [];
      }
      throw mongoError;
    }
  }
}

/**
 * Fetch a single prompt by ID or slug from MongoDB directly
 * For detail pages, we skip JSON loading to avoid DYNAMIC_SERVER_USAGE errors
 * MongoDB is reliable and works in all environments (static gen, ISR, runtime)
 *
 * STRATEGY: MongoDB only for detail pages (reliable, no static generation issues)
 */
export async function getPromptById(idOrSlug: string): Promise<Prompt | null> {
  // For detail pages, use MongoDB directly to avoid DYNAMIC_SERVER_USAGE
  // JSON loading causes issues during static generation/ISR
  try {
    return await promptRepository.getById(idOrSlug);
  } catch (error) {
    // During build, return null to avoid build failures
    if (error instanceof Error && error.message.includes('BUILD_MODE')) {
      logger.warn('Build mode detected, returning null for prompt lookup');
      return null;
    }
    
    logger.error('MongoDB lookup failed for prompt', {
      idOrSlug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Fetch prompts by category from static JSON or MongoDB
 * @deprecated Use promptRepository.getByCategory() for direct MongoDB access
 */
export async function getPromptsByCategory(
  category: string
): Promise<Prompt[]> {
  try {
    const prompts = await loadPromptsFromJson();
    return prompts.filter((p) => p.category === category);
  } catch (error) {
    // Fallback to MongoDB
    try {
      return promptRepository.getByCategory(category);
    } catch (mongoError) {
      // During build, return empty array to avoid build failures
      if (mongoError instanceof Error && mongoError.message.includes('BUILD_MODE')) {
        logger.warn('Build mode detected, returning empty category prompts array');
        return [];
      }
      throw mongoError;
    }
  }
}

/**
 * Fetch prompts by role from static JSON or MongoDB
 * @deprecated Use promptRepository.getByRole() for direct MongoDB access
 */
export async function getPromptsByRole(role: string): Promise<Prompt[]> {
  try {
    const prompts = await loadPromptsFromJson();
    return prompts.filter((p) => p.role === role);
  } catch (error) {
    // Fallback to MongoDB
    try {
      return promptRepository.getByRole(role);
    } catch (mongoError) {
      // During build, return empty array to avoid build failures
      if (mongoError instanceof Error && mongoError.message.includes('BUILD_MODE')) {
        logger.warn('Build mode detected, returning empty role prompts array');
        return [];
      }
      throw mongoError;
    }
  }
}
