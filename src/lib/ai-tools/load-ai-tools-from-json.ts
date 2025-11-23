/**
 * AI Tools Static JSON Loader
 *
 * Loads AI tools from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 *
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import type { AITool } from '@/lib/db/schemas/ai-tool';
import { aiToolService } from '@/lib/services/AIToolService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

interface AIToolsJsonData {
  version: string;
  generatedAt: string;
  totalTools: number;
  tools: AITool[];
  totals: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    active: number;
    deprecated: number;
    sunset: number;
  };
}

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'ai-tools.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'ai-tools-backup.json');

/**
 * Load AI tools from static JSON file (production-fast)
 * Uses filesystem read to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadAIToolsFromJson(): Promise<AITool[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    // For client-side, skip JSON loading and use MongoDB directly
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      try {
        const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
        const data: AIToolsJsonData = JSON.parse(fileContent);
        
        // NO STALENESS CHECK - Content rarely changes, so age doesn't matter
        // If content changes, regenerate JSON manually or via cron
        // This prevents false "stale" errors that waste Vercel builds
        
        logger.debug('Loaded AI tools from static JSON', {
          count: data.tools.length,
          generatedAt: data.generatedAt,
        });
        
        return data.tools;
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
    logger.warn('Failed to load AI tools from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const backupContent = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
      const backupData: AIToolsJsonData = JSON.parse(backupContent);
      
      logger.info('Successfully loaded AI tools from backup', {
        count: backupData.tools.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return backupData.tools;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await aiToolService.find({});
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
 * Load a single AI tool by ID or slug from static JSON
 * Returns null if not found (caller handles MongoDB fallback)
 */
export async function loadAIToolFromJson(
  idOrSlug: string
): Promise<AITool | null> {
  try {
    const tools = await loadAIToolsFromJson();
    const tool = tools.find(
      (t) =>
        t.id === idOrSlug ||
        t.slug === idOrSlug ||
        (t.slug && t.slug === idOrSlug)
    );

    if (tool) {
      logger.debug('Found AI tool in JSON', { idOrSlug, name: tool.name });
      return tool;
    }

    // Not found in JSON - return null (caller will try MongoDB)
    return null;
  } catch (error) {
    // JSON loading failed - throw so caller can handle MongoDB fallback
    logger.warn('Failed to load AI tool from JSON', {
      idOrSlug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

