/**
 * Load Patterns from Static JSON
 * 
 * Similar to breeding site's static JSON approach
 * Fast loading without MongoDB cold starts
 */

import type { Pattern } from '@/lib/db/schemas/pattern';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';

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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';
const JSON_URL = '/data/patterns.json';
const MAX_AGE_MS = 3600000; // 1 hour - consider JSON stale after this

/**
 * Load patterns from static JSON file (production-fast)
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadPatternsFromJson(): Promise<Pattern[]> {
  try {
    // In production, fetch from public URL (Vercel serves /public/data/*)
    // In development, use localhost
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? APP_URL 
      : 'http://localhost:3000';
    
    const url = `${baseUrl}${JSON_URL}`;
    
    const response = await fetch(url, {
      cache: 'force-cache', // Cache aggressively - JSON changes infrequently
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patterns.json: ${response.status}`);
    }

    const data: PatternsJsonData = await response.json();
    
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

