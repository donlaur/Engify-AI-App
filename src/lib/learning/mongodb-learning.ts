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
  return learningResourceRepository.getAll();
}

/**
 * Fetch a single learning resource by slug from MongoDB
 * @deprecated Use learningResourceRepository.getBySlug() instead
 */
export async function getLearningResourceBySlug(
  slug: string
): Promise<LearningResource | null> {
  return learningResourceRepository.getBySlug(slug);
}
