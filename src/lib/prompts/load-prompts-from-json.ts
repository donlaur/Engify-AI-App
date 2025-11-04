/**
 * Prompts Static JSON Loader
 * 
 * Loads prompts from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 * 
 * Similar to patterns JSON loader - solves cold start problem
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';
const JSON_URL = '/data/prompts.json';
const MAX_AGE_MS = 3600000; // 1 hour - consider JSON stale after this

/**
 * Load prompts from static JSON file (production-fast)
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadPromptsFromJson(): Promise<Prompt[]> {
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
      throw new Error(`Failed to fetch prompts.json: ${response.status}`);
    }

    const data: PromptsJsonData = await response.json();
    
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

