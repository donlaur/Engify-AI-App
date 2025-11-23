/**
 * Load Pain Points from JSON
 * 
 * Loads pain point data from public/data/pain-points.json
 * Falls back to pain-points-backup.json, then MongoDB
 * 
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import { validatePainPointsJson, type PainPoint } from './pain-point-schema';
import { painPointRepository } from '@/lib/db/repositories/PainPointRepository';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

const MAIN_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'pain-points.json');
const BACKUP_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'pain-points-backup.json');

export async function loadPainPointsFromJson(): Promise<PainPoint[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      try {
        const jsonContent = await fs.readFile(MAIN_JSON_PATH, 'utf-8');
        const jsonData = JSON.parse(jsonContent);
        const validated = validatePainPointsJson(jsonData);
        
        logger.debug('Loaded pain points from static JSON', {
          count: validated.painPoints.length,
          generatedAt: validated.generatedAt,
        });
        
        return validated.painPoints;
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
    logger.warn('Failed to load pain points from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const backupContent = await fs.readFile(BACKUP_JSON_PATH, 'utf-8');
      const backupData = JSON.parse(backupContent);
      const validated = validatePainPointsJson(backupData);
      
      logger.info('Successfully loaded pain points from backup', {
        count: validated.painPoints.length,
        backupGeneratedAt: validated.generatedAt,
      });
      
      return validated.painPoints;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await painPointRepository.getAll();
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

export async function getPainPointBySlug(slug: string): Promise<PainPoint | null> {
  const painPoints = await loadPainPointsFromJson();
  return painPoints.find(pp => pp.slug === slug) || null;
}

export async function getPainPointById(id: string): Promise<PainPoint | null> {
  const painPoints = await loadPainPointsFromJson();
  return painPoints.find(pp => pp.id === id) || null;
}

export async function getPainPointsMetadata() {
  const painPoints = await loadPainPointsFromJson();
  return {
    totalPainPoints: painPoints.length,
    publishedPainPoints: painPoints.filter(pp => pp.status === 'published').length,
  };
}

