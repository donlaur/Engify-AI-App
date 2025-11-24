/**
 * MongoDB Learning Resource Fetching Utilities
 *
 * Tries static JSON first (fast, no cold starts)
 * Falls back to MongoDB if JSON unavailable
 *
 * This solves the cold start problem by using static JSON files
 * similar to the prompts/patterns approach
 */

import { learningResourceRepository } from '@/lib/db/repositories/ContentService';
import { loadArticlesFromJson, loadArticleFromJson } from './load-articles-from-json';
import { logger } from '@/lib/logging/logger';

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'course' | 'tutorial' | 'guide' | 'interactive';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  tags: string[];
  author?: string;
  source?: string;
  featured: boolean;
  status: 'active' | 'inactive';
  contentHtml?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
    canonicalUrl: string;
    ogImage?: string;
  };
  views: number;
  shares: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all active learning resources from static JSON (fast) or MongoDB (fallback)
 * Uses JSON first to avoid MongoDB connection timeouts on M0 tier
 */
export async function getAllLearningResources(): Promise<LearningResource[]> {
  try {
    // Try static JSON first (fast, no cold starts, no MongoDB timeouts)
    return await loadArticlesFromJson();
  } catch (error) {
    // Fallback to MongoDB (reliable, always works)
    logger.debug('Using MongoDB fallback for learning resources', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    try {
      return learningResourceRepository.getAll();
    } catch (mongoError) {
      // During build, return empty array to avoid build failures
      if (mongoError instanceof Error && mongoError.message.includes('BUILD_MODE')) {
        logger.warn('Build mode detected, returning empty learning resources array');
        return [];
      }
      throw mongoError;
    }
  }
}

/**
 * Fetch a single learning resource by slug from static JSON (fast) or MongoDB (fallback)
 * Uses JSON first to avoid MongoDB connection timeouts on M0 tier
 */
export async function getLearningResourceBySlug(
  slug: string
): Promise<LearningResource | null> {
  try {
    // Try static JSON first (fast, no MongoDB timeouts)
    const article = await loadArticleFromJson(slug);
    if (article) {
      return article;
    }
    
    // Not found in JSON - try MongoDB
    logger.debug('Article not found in JSON, trying MongoDB', { slug });
    return await learningResourceRepository.getBySlug(slug);
  } catch (error) {
    // JSON loading failed - try MongoDB fallback
    logger.warn('JSON loading failed, using MongoDB fallback', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    try {
      return await learningResourceRepository.getBySlug(slug);
    } catch (mongoError) {
      // During build, return null to avoid build failures
      if (mongoError instanceof Error && mongoError.message.includes('BUILD_MODE')) {
        logger.warn('Build mode detected, returning null for learning resource lookup');
        return null;
      }
      throw mongoError;
    }
  }
}
