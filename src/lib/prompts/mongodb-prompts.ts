/**
 * MongoDB Prompt Fetching Utilities
 *
 * All prompts are stored in MongoDB, not in code files.
 * Use these utilities to fetch prompts from the database.
 */

import { getDb } from '@/lib/mongodb';
import type { Prompt } from '@/lib/schemas/prompt';

/**
 * Fetch all public prompts from MongoDB
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = db.collection('prompts');

    const prompts = await collection
      .find({ isPublic: true })
      .sort({ isFeatured: -1, views: -1 })
      .toArray();

    return prompts.map((p) => ({
      id: p.id || p._id.toString(),
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || p.stats?.averageRating || 0,
      ratingCount: p.ratingCount || p.stats?.totalRatings || 0,
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    })) as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts from MongoDB:', error);
    // Return empty array if MongoDB fails (app should handle empty state)
    return [];
  }
}

/**
 * Fetch a single prompt by ID from MongoDB
 */
export async function getPromptById(id: string): Promise<Prompt | null> {
  try {
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = db.collection('prompts');

    const prompt = await collection.findOne({
      $or: [{ id }, { _id: id }],
    });

    if (!prompt) {
      return null;
    }

    return {
      id: prompt.id || prompt._id.toString(),
      slug: prompt.slug,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      role: prompt.role,
      pattern: prompt.pattern,
      tags: prompt.tags || [],
      isFeatured: prompt.isFeatured || false,
      views: prompt.views || 0,
      rating: prompt.rating || prompt.stats?.averageRating || 0,
      ratingCount: prompt.ratingCount || prompt.stats?.totalRatings || 0,
      createdAt: prompt.createdAt || new Date(),
      updatedAt: prompt.updatedAt || new Date(),
    } as Prompt;
  } catch (error) {
    console.error('Error fetching prompt from MongoDB:', error);
    return null;
  }
}

/**
 * Fetch prompts by category from MongoDB
 */
export async function getPromptsByCategory(
  category: string
): Promise<Prompt[]> {
  try {
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = db.collection('prompts');

    const prompts = await collection
      .find({
        category: category.toLowerCase(),
        isPublic: true,
      })
      .sort({ isFeatured: -1, views: -1 })
      .limit(100)
      .toArray();

    return prompts.map((p) => ({
      id: p.id || p._id.toString(),
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || p.stats?.averageRating || 0,
      ratingCount: p.ratingCount || p.stats?.totalRatings || 0,
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    })) as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    return [];
  }
}

/**
 * Fetch prompts by role from MongoDB
 */
export async function getPromptsByRole(role: string): Promise<Prompt[]> {
  try {
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = db.collection('prompts');

    const prompts = await collection
      .find({
        role: role.toLowerCase(),
        isPublic: true,
      })
      .sort({ isFeatured: -1, views: -1 })
      .limit(100)
      .toArray();

    return prompts.map((p) => ({
      id: p.id || p._id.toString(),
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || p.stats?.averageRating || 0,
      ratingCount: p.ratingCount || p.stats?.totalRatings || 0,
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    })) as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts by role:', error);
    return [];
  }
}
