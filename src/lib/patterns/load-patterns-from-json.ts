/**
 * Load Patterns from Static JSON
 * 
 * Similar to breeding site's static JSON approach
 * Fast loading without MongoDB cold starts
 * 
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import type { Pattern } from '@/lib/db/schemas/pattern';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

interface PatternsJsonData {
  version: string;
  generatedAt: string;
  totalPatterns: number;
  patterns: Pattern[];
  totals: {
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
    totalPromptsUsingPatterns: number;
  };
}

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'patterns.json');
const MAX_AGE_MS = 3600000; // 1 hour - consider JSON stale after this

/**
 * Load patterns from static JSON file (production-fast)
 * Uses filesystem read to avoid DYNAMIC_SERVER_USAGE errors
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadPatternsFromJson(): Promise<Pattern[]> {
  try {
    // Read directly from filesystem (works in both dev and production)
    const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const data: PatternsJsonData = JSON.parse(fileContent);
    
    // Check if JSON is stale (older than 1 hour)
    const generatedAt = new Date(data.generatedAt);
    const ageMs = Date.now() - generatedAt.getTime();
    
    if (ageMs > MAX_AGE_MS) {
      logger.warn('Patterns JSON is stale, falling back to MongoDB', {
        ageHours: (ageMs / 3600000).toFixed(2),
      });
      // Fall through to MongoDB fallback
      throw new Error('JSON is stale');
    }

    logger.debug('Loaded patterns from static JSON', {
      count: data.patterns.length,
      generatedAt: data.generatedAt,
    });
    
    return data.patterns;
  } catch (error) {
    // Fallback to MongoDB if JSON unavailable
    logger.warn('Failed to load patterns from JSON, using MongoDB fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return patternRepository.getAll();
  }
}

/**
 * Load a single pattern by ID from static JSON
 */
export async function loadPatternFromJson(id: string): Promise<Pattern | null> {
  try {
    const patterns = await loadPatternsFromJson();
    return patterns.find(p => p.id === id || p.name === id) || null;
  } catch (error) {
    // Fallback to MongoDB
    return patternRepository.getById(id);
  }
}
