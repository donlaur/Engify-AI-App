/**
 * MongoDB Pattern Fetching Utilities
 *
 * All patterns are stored in MongoDB.
 * Use these utilities to fetch patterns from the database.
 */

import { getDb } from '@/lib/mongodb';
import type { Pattern } from '@/lib/db/schemas/pattern';

/**
 * Fetch all patterns from MongoDB
 */
export async function getAllPatterns(): Promise<Pattern[]> {
  try {
    const db = await getDb();
    const collection = db.collection('patterns');

    const patterns = await collection
      .find({})
      .sort({ category: 1, name: 1 })
      .toArray();

    return patterns.map((p) => ({
      id: p.id || p._id?.toString() || '',
      name: p.name,
      category: p.category,
      level: p.level,
      description: p.description,
      example: p.example,
      useCases: p.useCases || [],
      relatedPatterns: p.relatedPatterns || [],
      icon: p.icon,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      howItWorks: p.howItWorks,
      bestPractices: p.bestPractices || [],
      commonMistakes: p.commonMistakes || [],
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    })) as Pattern[];
  } catch (error) {
    console.error('Error fetching patterns from MongoDB:', error);
    return [];
  }
}

/**
 * Fetch a single pattern by ID or name from MongoDB
 */
export async function getPatternById(idOrName: string): Promise<Pattern | null> {
  try {
    const db = await getDb();
    const collection = db.collection('patterns');

    const pattern = await collection.findOne({
      $or: [
        { id: idOrName },
        { name: idOrName },
        { _id: idOrName },
      ],
    });

    if (!pattern) {
      return null;
    }

    return {
      id: pattern.id || pattern._id?.toString() || '',
      name: pattern.name,
      category: pattern.category,
      level: pattern.level,
      description: pattern.description,
      example: pattern.example,
      useCases: pattern.useCases || [],
      relatedPatterns: pattern.relatedPatterns || [],
      icon: pattern.icon,
      shortDescription: pattern.shortDescription,
      fullDescription: pattern.fullDescription,
      howItWorks: pattern.howItWorks,
      bestPractices: pattern.bestPractices || [],
      commonMistakes: pattern.commonMistakes || [],
      createdAt: pattern.createdAt || new Date(),
      updatedAt: pattern.updatedAt || new Date(),
    } as Pattern;
  } catch (error) {
    console.error('Error fetching pattern from MongoDB:', error);
    return null;
  }
}
