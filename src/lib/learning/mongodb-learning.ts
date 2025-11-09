/**
 * MongoDB Learning Resource Fetching Utilities (DEPRECATED)
 *
 * ⚠️ USE @/lib/db/repositories/LearningResourceRepository INSTEAD
 * 
 * This file is kept for backward compatibility but should be migrated
 * to use the unified repository pattern.
 * 
 * @deprecated Use learningResourceRepository from @/lib/db/repositories/ContentService
 */

import { learningResourceRepository } from '@/lib/db/repositories/ContentService';

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
 * Fetch all active learning resources from MongoDB
 * @deprecated Use learningResourceRepository.getAll() instead
 */
export async function getAllLearningResources(): Promise<LearningResource[]> {
  try {
    return learningResourceRepository.getAll();
  } catch (error) {
    // During build, return empty array to avoid build failures
    if (error instanceof Error && error.message.includes('BUILD_MODE')) {
      console.warn('Build mode detected, returning empty learning resources array');
      return [];
    }
    throw error;
  }
}

/**
 * Fetch a single learning resource by slug from MongoDB
 * @deprecated Use learningResourceRepository.getBySlug() instead
 */
export async function getLearningResourceBySlug(
  slug: string
): Promise<LearningResource | null> {
  try {
    return learningResourceRepository.getBySlug(slug);
  } catch (error) {
    // During build, return null to avoid build failures
    if (error instanceof Error && error.message.includes('BUILD_MODE')) {
      console.warn('Build mode detected, returning null for learning resource lookup');
      return null;
    }
    throw error;
  }
}
