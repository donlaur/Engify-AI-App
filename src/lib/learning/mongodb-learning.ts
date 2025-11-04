/**
 * MongoDB Learning Resource Fetching Utilities
 *
 * All learning resources (articles, guides, tutorials) are stored in MongoDB.
 * Use these utilities to fetch learning resources from the database.
 */

import { getDb } from '@/lib/mongodb';

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
 */
export async function getAllLearningResources(): Promise<LearningResource[]> {
  try {
    const db = await getDb();
    const collection = db.collection('learning_resources');

    const resources = await collection
      .find({ status: 'active' })
      .sort({ featured: -1, publishedAt: -1 })
      .toArray();

    return resources.map((r) => ({
      id: r.id || r._id?.toString() || '',
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type,
      level: r.level,
      duration: r.duration,
      tags: r.tags || [],
      author: r.author,
      source: r.source,
      featured: r.featured || false,
      status: r.status || 'active',
      contentHtml: r.contentHtml,
      seo: r.seo,
      views: r.views || 0,
      shares: r.shares || 0,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt || new Date(),
      updatedAt: r.updatedAt || new Date(),
    })) as LearningResource[];
  } catch (error) {
    console.error('Error fetching learning resources from MongoDB:', error);
    return [];
  }
}

/**
 * Fetch a single learning resource by slug from MongoDB
 */
export async function getLearningResourceBySlug(slug: string): Promise<LearningResource | null> {
  try {
    const db = await getDb();
    const collection = db.collection('learning_resources');

    const resource = await collection.findOne({
      'seo.slug': slug,
      status: 'active',
    });

    if (!resource) {
      return null;
    }

    return {
      id: resource.id || resource._id?.toString() || '',
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      level: resource.level,
      duration: resource.duration,
      tags: resource.tags || [],
      author: resource.author,
      source: resource.source,
      featured: resource.featured || false,
      status: resource.status || 'active',
      contentHtml: resource.contentHtml,
      seo: resource.seo,
      views: resource.views || 0,
      shares: resource.shares || 0,
      publishedAt: resource.publishedAt,
      createdAt: resource.createdAt || new Date(),
      updatedAt: resource.updatedAt || new Date(),
    } as LearningResource;
  } catch (error) {
    console.error('Error fetching learning resource from MongoDB:', error);
    return null;
  }
}
