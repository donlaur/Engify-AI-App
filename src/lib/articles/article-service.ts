/**
 * Article Service - DRY utilities for fetching and managing articles
 * Centralized service for all article operations across the platform
 */

import { getClient } from '@/lib/mongodb';
import { z } from 'zod';

// Article schema for validation
export const ArticleSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  contentHtml: z.string().optional(),
  slug: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string().optional(),
  publishedAt: z.date().optional(),
  updatedAt: z.date().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  featured: z.boolean().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  views: z.number().default(0),
  seo: z.object({
    slug: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

/**
 * Get article by slug with automatic view count increment
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const article = await collection.findOne({
      'seo.slug': slug,
      status: 'active',
    });

    if (!article) {
      return null;
    }

    // Increment view count asynchronously (non-blocking)
    collection
      .updateOne({ 'seo.slug': slug }, { $inc: { views: 1 } })
      .catch((error) => {
        console.error(`[ArticleService] Failed to increment view count for ${slug}:`, error);
      });

    return article as Article;
  } catch (error) {
    console.error(`[ArticleService] Error fetching article ${slug}:`, error);
    return null;
  }
}

/**
 * Get all active articles with filtering and pagination
 */
export async function getArticles(options: {
  category?: string;
  tag?: string;
  featured?: boolean;
  limit?: number;
  skip?: number;
  sort?: 'recent' | 'popular' | 'alphabetical';
} = {}): Promise<Article[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const query: any = { status: 'active' };

    if (options.category) {
      query.category = options.category;
    }

    if (options.tag) {
      query.tags = options.tag;
    }

    if (options.featured !== undefined) {
      query.featured = options.featured;
    }

    let sortQuery: any = { publishedAt: -1 }; // Default: recent

    if (options.sort === 'popular') {
      sortQuery = { views: -1, publishedAt: -1 };
    } else if (options.sort === 'alphabetical') {
      sortQuery = { title: 1 };
    }

    const articles = await collection
      .find(query)
      .sort(sortQuery)
      .limit(options.limit || 50)
      .skip(options.skip || 0)
      .toArray();

    return articles as Article[];
  } catch (error) {
    console.error('[ArticleService] Error fetching articles:', error);
    return [];
  }
}

/**
 * Get article categories with counts
 */
export async function getArticleCategories(): Promise<{ category: string; count: number }[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const categories = await collection
      .aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return categories.map((c) => ({ category: c._id, count: c.count }));
  } catch (error) {
    console.error('[ArticleService] Error fetching categories:', error);
    return [];
  }
}

/**
 * Get all unique tags
 */
export async function getArticleTags(): Promise<string[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const tags = await collection.distinct('tags', { status: 'active' });
    return tags.sort();
  } catch (error) {
    console.error('[ArticleService] Error fetching tags:', error);
    return [];
  }
}

/**
 * Get related articles based on tags and category
 */
export async function getRelatedArticles(
  currentSlug: string,
  tags: string[],
  category: string,
  limit = 3
): Promise<Article[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const articles = await collection
      .find({
        'seo.slug': { $ne: currentSlug },
        status: 'active',
        $or: [{ tags: { $in: tags } }, { category }],
      })
      .sort({ views: -1 })
      .limit(limit)
      .toArray();

    return articles as Article[];
  } catch (error) {
    console.error(`[ArticleService] Error fetching related articles for ${currentSlug}:`, error);
    return [];
  }
}

/**
 * Search articles by query
 */
export async function searchArticles(query: string, limit = 10): Promise<Article[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    const articles = await collection
      .find({
        status: 'active',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ views: -1 })
      .limit(limit)
      .toArray();

    return articles as Article[];
  } catch (error) {
    console.error(`[ArticleService] Error searching articles with query "${query}":`, error);
    return [];
  }
}

