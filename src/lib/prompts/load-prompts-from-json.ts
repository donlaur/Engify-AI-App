/**
 * Prompts Static JSON Loader
 * 
 * Loads prompts from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 * 
 * IMPORTANT: Uses filesystem read (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR.
 */

import type { Prompt } from '@/lib/db/schemas/prompt';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

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

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'prompts.json');
const MAX_AGE_MS = 3600000; // 1 hour - consider JSON stale after this

/**
 * Load prompts from static JSON file (production-fast)
 * Uses filesystem read to avoid DYNAMIC_SERVER_USAGE errors
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadPromptsFromJson(): Promise<Prompt[]> {
  try {
    // Read directly from filesystem (works in both dev and production)
    const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const data: PromptsJsonData = JSON.parse(fileContent);
    
    // Check if JSON is stale (older than 1 hour)
    const generatedAt = new Date(data.generatedAt);
    const ageMs = Date.now() - generatedAt.getTime();
    
    if (ageMs > MAX_AGE_MS) {
      logger.warn('Prompts JSON is stale, falling back to MongoDB', {
        ageHours: (ageMs / 3600000).toFixed(2),
      });
      // Fall through to MongoDB fallback
      throw new Error('JSON is stale');
    }

    logger.debug('Loaded prompts from static JSON', {
      count: data.prompts.length,
      generatedAt: data.generatedAt,
    });

    return data.prompts;
  } catch (error) {
    // Fallback to MongoDB if JSON unavailable
    logger.warn('Failed to load prompts from JSON, using MongoDB fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return promptRepository.getAll();
  }
}

/**
 * Load a single prompt by ID or slug from static JSON
 */
export async function loadPromptFromJson(idOrSlug: string): Promise<Prompt | null> {
  try {
    const prompts = await loadPromptsFromJson();
    return prompts.find(p => 
      p.id === idOrSlug || 
      p.slug === idOrSlug ||
      (p.slug && p.slug === idOrSlug)
    ) || null;
  } catch (error) {
    // Fallback to MongoDB
    return promptRepository.getById(idOrSlug);
  }
}

