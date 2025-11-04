/**
 * Patterns Data Access Layer
 * 
 * Tries static JSON first (fast, no cold starts)
 * Falls back to MongoDB if JSON unavailable
 * 
 * This solves the cold start problem by using static JSON files
 * similar to the breeding site's approach
 */

import { loadPatternsFromJson } from './load-patterns-from-json';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import type { Pattern } from '@/lib/db/schemas/pattern';
import { logger } from '@/lib/logging/logger';

/**
 * Fetch all patterns from static JSON (fast) or MongoDB (fallback)
 * @deprecated Use patternRepository.getAll() for direct MongoDB access
 * Use this function for fast static JSON loading with MongoDB fallback
 */
export async function getAllPatterns(): Promise<Pattern[]> {
  try {
    // Try static JSON first (fast, no cold starts)
    return await loadPatternsFromJson();
  } catch (error) {
    // Fallback to MongoDB (reliable, always works)
    logger.debug('Using MongoDB fallback for patterns', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return patternRepository.getAll();
  }
}

/**
 * Fetch a single pattern by ID or name from static JSON or MongoDB
 * @deprecated Use patternRepository.getById() for direct MongoDB access
 * Use this function for fast static JSON loading with MongoDB fallback
 */
export async function getPatternById(idOrName: string): Promise<Pattern | null> {
  try {
    const patterns = await loadPatternsFromJson();
    return patterns.find(p => p.id === idOrName || p.name === idOrName) || null;
  } catch (error) {
    // Fallback to MongoDB
    return patternRepository.getById(idOrName);
  }
}
