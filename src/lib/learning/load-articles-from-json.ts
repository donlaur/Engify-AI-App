/**
 * Articles/Learning Resources Static JSON Loader
 *
 * Loads articles from static JSON file (fast, no cold starts)
 * Falls back to MongoDB if JSON doesn't exist or is stale
 *
 * IMPORTANT: Uses filesystem (not fetch) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR. Filesystem access is only available at runtime.
 */

import type { LearningResource } from '@/lib/learning/mongodb-learning';
import { learningResourceRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

interface LearningResourceExport {
  id: string;
  title: string;
  description: string;
  content?: string; // JSON uses "content" not "contentHtml"
  slug: string; // Top-level slug, also in seo
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
  views?: number;
  status?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    slug?: string;
    canonicalUrl?: string;
  };
}

interface ArticlesJsonData {
  version: string;
  generatedAt: string;
  totalResources: number;
  resources: LearningResourceExport[]; // JSON uses "resources" not "articles"
  totals?: {
    byCategory?: Record<string, number>;
    byStatus?: Record<string, number>;
  };
}

/**
 * Load articles from static JSON file (production-fast)
 * Uses filesystem to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to MongoDB if JSON unavailable or stale
 */
export async function loadArticlesFromJson(): Promise<LearningResource[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    // For client-side, skip JSON loading and use MongoDB directly
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'learning.json');
      
      try {
        const fileContent = await fs.readFile(jsonPath, 'utf-8');
        const data: ArticlesJsonData = JSON.parse(fileContent);
        
        // NO STALENESS CHECK - Content rarely changes, so age doesn't matter
        // If content changes, regenerate JSON manually or via cron
        // This prevents false "stale" errors that waste Vercel builds
        
        logger.debug('Loaded articles from static JSON', {
          count: data.resources.length,
          generatedAt: data.generatedAt,
        });
        
        // Map JSON structure to LearningResource interface
        return data.resources.map((resource) => {
          // Parse dates safely
          let publishedAt: Date | undefined;
          let createdAt: Date;
          let updatedAt: Date;
          
          try {
            publishedAt = resource.publishedAt 
              ? (typeof resource.publishedAt === 'string' 
                  ? new Date(resource.publishedAt) 
                  : resource.publishedAt instanceof Date 
                    ? resource.publishedAt 
                    : undefined)
              : undefined;
          } catch {
            publishedAt = undefined;
          }
          
          try {
            updatedAt = resource.updatedAt 
              ? (typeof resource.updatedAt === 'string' 
                  ? new Date(resource.updatedAt) 
                  : resource.updatedAt instanceof Date 
                    ? resource.updatedAt 
                    : new Date())
              : new Date();
          } catch {
            updatedAt = new Date();
          }
          
          createdAt = updatedAt; // Use updatedAt as createdAt if not provided
          
          return {
            id: resource.id,
            title: resource.title,
            description: resource.description,
            category: resource.category || 'guide',
            type: 'article' as const,
            level: 'intermediate' as const, // Default, can be enhanced later
            tags: resource.tags || [],
            author: resource.author,
            featured: false, // Default, can be enhanced later
            status: (resource.status as 'active' | 'inactive') || 'active',
            contentHtml: resource.content || '', // Ensure contentHtml is always a string
            seo: {
              metaTitle: resource.seo?.metaTitle || resource.title,
              metaDescription: resource.seo?.metaDescription || resource.description,
              keywords: resource.seo?.keywords || resource.tags || [],
              slug: resource.seo?.slug || resource.slug,
              canonicalUrl: resource.seo?.canonicalUrl || `https://engify.ai/learn/${resource.slug}`,
              ogImage: resource.seo?.ogImage,
            },
            views: resource.views || 0,
            shares: 0, // Default
            publishedAt,
            createdAt,
            updatedAt,
          };
        });
      } catch (fsError) {
        // File doesn't exist or can't be read - fall through to backup
        throw new Error(`Failed to read JSON file: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`);
      }
    }

    // Client-side: skip JSON loading, use MongoDB directly
    // JSON loading from client-side requires fetch which can have auth issues
    throw new Error('Client-side JSON loading disabled - use MongoDB');
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load articles from JSON, using immutable backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      // Using static import
      const backupPath = path.join(process.cwd(), 'public', 'data', 'learning-backup.json');
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData: ArticlesJsonData = JSON.parse(backupContent);
      
      logger.info('Successfully loaded articles from backup', {
        count: backupData.resources.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      // Map JSON structure to LearningResource interface
      return backupData.resources.map((resource) => {
        // Parse dates safely
        let publishedAt: Date | undefined;
        let createdAt: Date;
        let updatedAt: Date;
        
        try {
          publishedAt = resource.publishedAt 
            ? (typeof resource.publishedAt === 'string' 
                ? new Date(resource.publishedAt) 
                : resource.publishedAt instanceof Date 
                  ? resource.publishedAt 
                  : undefined)
            : undefined;
        } catch {
          publishedAt = undefined;
        }
        
        try {
          updatedAt = resource.updatedAt 
            ? (typeof resource.updatedAt === 'string' 
                ? new Date(resource.updatedAt) 
                : resource.updatedAt instanceof Date 
                  ? resource.updatedAt 
                  : new Date())
            : new Date();
        } catch {
          updatedAt = new Date();
        }
        
        createdAt = updatedAt; // Use updatedAt as createdAt if not provided
        
        return {
          id: resource.id,
          title: resource.title,
          description: resource.description,
          category: resource.category || 'guide',
          type: 'article' as const,
          level: 'intermediate' as const,
          tags: resource.tags || [],
          author: resource.author,
          featured: false,
          status: (resource.status as 'active' | 'inactive') || 'active',
          contentHtml: resource.content || '', // Ensure contentHtml is always a string
          seo: {
            metaTitle: resource.seo?.metaTitle || resource.title,
            metaDescription: resource.seo?.metaDescription || resource.description,
            keywords: resource.seo?.keywords || resource.tags || [],
            slug: resource.seo?.slug || resource.slug,
            canonicalUrl: resource.seo?.canonicalUrl || `https://engify.ai/learn/${resource.slug}`,
            ogImage: resource.seo?.ogImage,
          },
          views: resource.views || 0,
          shares: 0,
          publishedAt,
          createdAt,
          updatedAt,
        };
      });
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        return await learningResourceRepository.getAll();
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
 * Load a single article by slug from static JSON
 * Returns null if not found (caller handles MongoDB fallback)
 */
export async function loadArticleFromJson(
  slug: string
): Promise<LearningResource | null> {
  try {
    const articles = await loadArticlesFromJson();
    const article = articles.find(
      (a) =>
        a.seo?.slug === slug ||
        a.id === slug
    );

    if (article) {
      logger.debug('Found article in JSON', { slug, title: article.title });
      return article;
    }

    // Not found in JSON - return null (caller will try MongoDB)
    return null;
  } catch (error) {
    // JSON loading failed - throw so caller can handle MongoDB fallback
    logger.warn('Failed to load article from JSON', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

