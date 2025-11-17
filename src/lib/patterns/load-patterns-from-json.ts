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
const BACKUP_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'patterns-backup.json'); // Immutable backup

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
    
    // NO STALENESS CHECK - Content rarely changes, so age doesn't matter
    // If content changes, regenerate JSON manually or via cron
    // This prevents false "stale" errors that waste Vercel builds

    logger.debug('Loaded patterns from static JSON', {
      count: data.patterns.length,
      generatedAt: data.generatedAt,
    });
    
    return data.patterns;
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load patterns from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    try {
      const backupContent = await fs.readFile(BACKUP_JSON_PATH, 'utf-8');
      const backupData: PatternsJsonData = JSON.parse(backupContent);
      
      logger.info('Successfully loaded patterns from immutable backup', {
        count: backupData.patterns.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return backupData.patterns;
    } catch (backupError) {
      // LAST RESORT: Try MongoDB (M0 tier unreliable, may hit connection limits)
      logger.error('Backup failed, trying MongoDB as last resort', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await patternRepository.getAll();
      } catch (dbError) {
        logger.error('CRITICAL: All fallbacks failed (JSON, Backup, MongoDB)', {
          dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
        // Return empty array as absolute last resort to prevent site crash
        return [];
      }
    }
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
