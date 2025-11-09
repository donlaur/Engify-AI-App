/**
 * Prompts Static JSON Loader
 *
 * Loads prompts from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 *
 * IMPORTANT: Uses fetch (not filesystem) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR. Filesystem access is only available at runtime.
 */

import type { Prompt } from '@/lib/db/schemas/prompt';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';

interface PromptsJsonData {
  version: string;
  generatedAt: string;
  totalPrompts: number;
  prompts: Prompt[];
  totals: {
    byCategory: Record<string, number>;
    byRole: Record<string, number>;
    byPattern: Record<string, number>;
    featured: number;
    public: number;
  };
}

const JSON_FILE_URL = '/data/prompts.json'; // Public URL path
const BACKUP_JSON_PATH = '/data/prompts-backup.json'; // Immutable backup (committed to git)
const MAX_AGE_MS = 3600000; // 1 hour - consider JSON stale after this

/**
 * Load prompts from static JSON file (production-fast)
 * Uses fetch to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadPromptsFromJson(): Promise<Prompt[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    // For client-side, skip JSON loading and use MongoDB directly
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      const fs = await import('fs/promises');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'prompts.json');
      
      try {
        const fileContent = await fs.readFile(jsonPath, 'utf-8');
        const data: PromptsJsonData = JSON.parse(fileContent);
        
        // NO STALENESS CHECK - Content rarely changes, so age doesn't matter
        // If content changes, regenerate JSON manually or via cron
        // This prevents false "stale" errors that waste Vercel builds
        
        logger.debug('Loaded prompts from static JSON', {
          count: data.prompts.length,
          generatedAt: data.generatedAt,
        });
        
        return data.prompts;
      } catch (fsError) {
        // File doesn't exist or can't be read - fall through to MongoDB
        throw new Error(`Failed to read JSON file: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`);
      }
    }

    // Client-side: skip JSON loading, use MongoDB directly
    // JSON loading from client-side requires fetch which can have auth issues
    throw new Error('Client-side JSON loading disabled - use MongoDB');
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load prompts from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const backupPath = path.join(process.cwd(), 'public', 'data', 'prompts-backup.json');
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData: PromptsJsonData = JSON.parse(backupContent);
      
      logger.info('Successfully loaded prompts from backup', {
        count: backupData.prompts.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return backupData.prompts;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await promptRepository.getAll();
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
 * Load a single prompt by ID or slug from static JSON
 * Returns null if not found (caller handles MongoDB fallback)
 */
export async function loadPromptFromJson(
  idOrSlug: string
): Promise<Prompt | null> {
  try {
    const prompts = await loadPromptsFromJson();
    const prompt = prompts.find(
      (p) =>
        p.id === idOrSlug ||
        p.slug === idOrSlug ||
        (p.slug && p.slug === idOrSlug)
    );

    if (prompt) {
      logger.debug('Found prompt in JSON', { idOrSlug, title: prompt.title });
      return prompt;
    }

    // Not found in JSON - return null (caller will try MongoDB)
    return null;
  } catch (error) {
    // JSON loading failed - throw so caller can handle MongoDB fallback
    logger.warn('Failed to load prompt from JSON', {
      idOrSlug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
