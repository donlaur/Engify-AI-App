/**
 * Pattern Repository
 * 
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to Pattern schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { Pattern } from '@/lib/db/schemas/pattern';

interface PatternDocument {
  _id?: unknown;
  id?: string;
  name: string;
  category: 'FOUNDATIONAL' | 'STRUCTURAL' | 'COGNITIVE' | 'ITERATIVE';
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  example?: string | { before: string; after: string; explanation: string };
  useCases?: string[];
  relatedPatterns?: string[];
  icon?: string;
  shortDescription?: string;
  fullDescription?: string;
  howItWorks?: string;
  bestPractices?: string[];
  commonMistakes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  // Include ALL possible fields from MongoDB
  [key: string]: unknown;
}

/**
 * Pattern Processor
 * Transforms MongoDB documents to Pattern entities
 */
class PatternProcessor implements ContentProcessor<PatternDocument, Pattern> {
  process(raw: PatternDocument): Pattern {
    return {
      id: raw.id || (raw._id ? String(raw._id) : ''),
      name: raw.name,
      category: raw.category,
      level: raw.level,
      description: raw.description,
      example: raw.example || undefined,
      useCases: raw.useCases || [],
      relatedPatterns: raw.relatedPatterns || [],
      icon: raw.icon,
      shortDescription: raw.shortDescription,
      fullDescription: raw.fullDescription,
      howItWorks: raw.howItWorks,
      bestPractices: raw.bestPractices || [],
      commonMistakes: raw.commonMistakes || [],
      createdAt: raw.createdAt || new Date(),
      updatedAt: raw.updatedAt || new Date(),
    };
  }

  processMany(raw: PatternDocument[]): Pattern[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Pattern Repository
 * Unified retrieval using BaseRepository pattern
 */
export class PatternRepository
  extends BaseRepository<PatternDocument>
  implements ContentRepository<Pattern>
{
  private processor: PatternProcessor;

  constructor() {
    super('patterns');
    this.processor = new PatternProcessor();
  }

  /**
   * Get all patterns
   */
  async getAll(): Promise<Pattern[]> {
    const documents = await this.find({}, { sort: { category: 1, name: 1 } });
    return this.processor.processMany(documents);
  }

  /**
   * Get pattern by ID or name
   */
  async getById(idOrName: string): Promise<Pattern | null> {
    const document = await this.findOne({
      $or: [{ id: idOrName }, { name: idOrName }, { _id: idOrName as any }],
    });
    return document ? this.processor.process(document) : null;
  }

  /**
   * Get pattern by slug (alias for getById)
   */
  async getBySlug(slug: string): Promise<Pattern | null> {
    return this.getById(slug);
  }

  /**
   * Count patterns
   */
  async count(): Promise<number> {
    return this.countDocuments({});
  }

  /**
   * Search patterns by name/description
   */
  async search(query: string): Promise<Pattern[]> {
    const documents = await this.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get patterns by category
   */
  async getByCategory(category: string): Promise<Pattern[]> {
    const documents = await this.find({
      category: category as Pattern['category'],
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get patterns by level
   */
  async getByLevel(level: string): Promise<Pattern[]> {
    const documents = await this.find({
      level: level as Pattern['level'],
    });
    return this.processor.processMany(documents);
  }
}

// Export singleton instance
export const patternRepository = new PatternRepository();
