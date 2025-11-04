/**
 * MongoDB Pattern Fetching Utilities (DEPRECATED)
 *
 * ⚠️ USE @/lib/db/repositories/PatternRepository INSTEAD
 * 
 * This file is kept for backward compatibility but should be migrated
 * to use the unified repository pattern.
 * 
 * @deprecated Use patternRepository from @/lib/db/repositories/ContentService
 */

import { patternRepository } from '@/lib/db/repositories/ContentService';
import type { Pattern } from '@/lib/db/schemas/pattern';

/**
 * Fetch all patterns from MongoDB
 * @deprecated Use patternRepository.getAll() instead
 */
export async function getAllPatterns(): Promise<Pattern[]> {
  return patternRepository.getAll();
}

/**
 * Fetch a single pattern by ID or name from MongoDB
 * @deprecated Use patternRepository.getById() instead
 */
export async function getPatternById(idOrName: string): Promise<Pattern | null> {
  return patternRepository.getById(idOrName);
}
