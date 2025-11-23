/**
 * AI Models Static JSON Loader
 *
 * Loads AI models from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 *
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import type { AIModel } from '@/lib/db/schemas/ai-model';
import { aiModelService } from '@/lib/services/AIModelService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

interface AIModelsJsonData {
  version: string;
  generatedAt: string;
  totalModels: number;
  models: AIModel[];
  totals: {
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    active: number;
    deprecated: number;
    sunset: number;
  };
}

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'ai-models.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'ai-models-backup.json');

/**
 * Load AI models from static JSON file (production-fast)
 * Uses filesystem read to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadAIModelsFromJson(): Promise<AIModel[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    // For client-side, skip JSON loading and use MongoDB directly
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      try {
        const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
        const data: AIModelsJsonData = JSON.parse(fileContent);
        
        // NO STALENESS CHECK - Content rarely changes, so age doesn't matter
        // If content changes, regenerate JSON manually or via cron
        // This prevents false "stale" errors that waste Vercel builds
        
        logger.debug('Loaded AI models from static JSON', {
          count: data.models.length,
          generatedAt: data.generatedAt,
        });
        
        return data.models;
      } catch (fsError) {
        // File doesn't exist or can't be read - fall through to backup/MongoDB
        throw new Error(`Failed to read JSON file: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`);
      }
    }

    // Client-side: skip JSON loading, use MongoDB directly
    // JSON loading from client-side requires fetch which can have auth issues
    throw new Error('Client-side JSON loading disabled - use MongoDB');
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load AI models from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const backupContent = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
      const backupData: AIModelsJsonData = JSON.parse(backupContent);
      
      logger.info('Successfully loaded AI models from backup', {
        count: backupData.models.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return backupData.models;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await aiModelService.find({});
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

/**
 * Load a single AI model by ID or slug from static JSON
 * Returns null if not found (caller handles MongoDB fallback)
 */
export async function loadAIModelFromJson(
  idOrSlug: string
): Promise<AIModel | null> {
  try {
    const models = await loadAIModelsFromJson();
    const model = models.find(
      (m) =>
        m.id === idOrSlug ||
        m.slug === idOrSlug ||
        (m.slug && m.slug === idOrSlug)
    );

    if (model) {
      logger.debug('Found AI model in JSON', { idOrSlug, displayName: model.displayName });
      return model;
    }

    // Not found in JSON - return null (caller will try MongoDB)
    return null;
  } catch (error) {
    // JSON loading failed - throw so caller can handle MongoDB fallback
    logger.warn('Failed to load AI model from JSON', {
      idOrSlug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

