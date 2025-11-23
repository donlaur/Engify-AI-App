/**
 * Load Recommendations from JSON
 * 
 * Loads recommendations from public/data/recommendations.json
 * Falls back to backup file, then MongoDB
 * 
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import fs from 'fs/promises';
import path from 'path';
import { validateRecommendationsJson, type RecommendationsJsonData } from './recommendation-schema';
import { recommendationRepository } from '@/lib/db/repositories/RecommendationRepository';
import { logger } from '@/lib/logging/logger';

const recommendationsPath = path.join(process.cwd(), 'public', 'data', 'recommendations.json');
const backupRecommendationsPath = path.join(process.cwd(), 'public', 'data', 'recommendations-backup.json');

export async function loadRecommendationsFromJson(): Promise<RecommendationsJsonData['recommendations']> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      try {
        const fileContents = await fs.readFile(recommendationsPath, 'utf-8');
        const data = JSON.parse(fileContents);
        const validated = validateRecommendationsJson(data);
        
        logger.debug('Loaded recommendations from static JSON', {
          count: validated.recommendations.length,
          generatedAt: validated.generatedAt,
        });
        
        return validated.recommendations;
      } catch (fsError) {
        // File doesn't exist or can't be read - fall through to backup/MongoDB
        throw new Error(`Failed to read JSON file: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`);
      }
    }

    // Client-side: skip JSON loading, use MongoDB directly
    throw new Error('Client-side JSON loading disabled - use MongoDB');
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load recommendations from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const backupContents = await fs.readFile(backupRecommendationsPath, 'utf-8');
      const backupData = JSON.parse(backupContents);
      const validated = validateRecommendationsJson(backupData);
      
      logger.info('Successfully loaded recommendations from backup', {
        count: validated.recommendations.length,
        backupGeneratedAt: validated.generatedAt,
      });
      
      return validated.recommendations;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await recommendationRepository.getAll();
      } catch (dbError) {
        logger.error('CRITICAL: All fallbacks failed', {
          dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
        // Return empty array as absolute last resort to prevent site crash
        return [];
      }
    }
  }
}

export async function getRecommendationBySlug(slug: string) {
  const recommendations = await loadRecommendationsFromJson();
  return recommendations.find((rec) => rec.slug === slug && rec.status === 'published');
}

export async function getPublishedRecommendations() {
  const recommendations = await loadRecommendationsFromJson();
  return recommendations.filter((rec) => rec.status === 'published');
}

