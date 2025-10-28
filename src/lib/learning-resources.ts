/**
 * Learning Resources Service
 * Fetches from MongoDB with JSON fallback
 */

import { connectDB } from './db/mongodb';
import {
  LearningResource,
  ILearningResource,
} from './db/models/LearningResource';
import learningResourcesData from '@/data/learning-resources.json';

/**
 * Get all learning resources
 * Tries MongoDB first, falls back to JSON
 */
export async function getLearningResources(): Promise<ILearningResource[]> {
  try {
    await connectDB();
    const resources = await LearningResource.find()
      .sort({ featured: -1, order: 1 })
      .lean<ILearningResource[]>();

    if (resources && resources.length > 0) {
      console.log(
        `✅ Loaded ${resources.length} learning resources from MongoDB`
      );
      return resources;
    }

    // Fallback to JSON
    console.warn('⚠️  No resources in MongoDB, using JSON fallback');
    return learningResourcesData.resources as unknown as ILearningResource[];
  } catch (error) {
    console.error('❌ MongoDB error, using JSON fallback:', error);
    return learningResourcesData.resources as unknown as ILearningResource[];
  }
}

/**
 * Get learning resources by category
 */
export async function getLearningResourcesByCategory(
  category: string
): Promise<ILearningResource[]> {
  try {
    await connectDB();
    const resources = await LearningResource.find({ category })
      .sort({ order: 1 })
      .lean<ILearningResource[]>();

    if (resources && resources.length > 0) {
      return resources;
    }

    // Fallback to JSON
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.category === category);
  } catch (error) {
    console.error('Error fetching by category, using JSON fallback:', error);
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.category === category);
  }
}

/**
 * Get learning resources by level
 */
export async function getLearningResourcesByLevel(
  level: string
): Promise<ILearningResource[]> {
  try {
    await connectDB();
    const resources = await LearningResource.find({ level })
      .sort({ order: 1 })
      .lean<ILearningResource[]>();

    if (resources && resources.length > 0) {
      return resources;
    }

    // Fallback to JSON
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.level === level);
  } catch (error) {
    console.error('Error fetching by level, using JSON fallback:', error);
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.level === level);
  }
}

/**
 * Get featured learning resources
 */
export async function getFeaturedLearningResources(): Promise<
  ILearningResource[]
> {
  try {
    await connectDB();
    const resources = await LearningResource.find({ featured: true })
      .sort({ order: 1 })
      .limit(6)
      .lean<ILearningResource[]>();

    if (resources && resources.length > 0) {
      return resources;
    }

    // Fallback to JSON
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.featured).slice(0, 6);
  } catch (error) {
    console.error('Error fetching featured, using JSON fallback:', error);
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.filter((r) => r.featured).slice(0, 6);
  }
}

/**
 * Search learning resources
 */
export async function searchLearningResources(
  query: string
): Promise<ILearningResource[]> {
  try {
    await connectDB();
    const resources = await LearningResource.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    })
      .sort({ featured: -1, order: 1 })
      .lean<ILearningResource[]>();

    if (resources) {
      return resources;
    }

    // Fallback to JSON
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    const lowerQuery = query.toLowerCase();
    return jsonResources.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching, using JSON fallback:', error);
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    const lowerQuery = query.toLowerCase();
    return jsonResources.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

/**
 * Get resource by ID
 */
export async function getLearningResourceById(
  id: string
): Promise<ILearningResource | null> {
  try {
    await connectDB();
    const resource = await LearningResource.findOne({
      id,
    }).lean<ILearningResource>();

    if (resource) {
      return resource;
    }

    // Fallback to JSON
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.find((r) => r.id === id) || null;
  } catch (error) {
    console.error('Error fetching by ID, using JSON fallback:', error);
    const jsonResources =
      learningResourcesData.resources as unknown as ILearningResource[];
    return jsonResources.find((r) => r.id === id) || null;
  }
}
