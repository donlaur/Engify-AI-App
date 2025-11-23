/**
 * Recommendation Repository
 *
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to Recommendation schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { Recommendation } from '@/lib/workflows/recommendation-schema';

interface RecommendationDocument {
  _id?: unknown;
  id?: string;
  slug?: string;
  title: string;
  recommendationStatement: string;
  description: string;
  whyThisMatters: string;
  whenToApply: string;
  implementationGuidance?: string;
  relatedWorkflows?: string[];
  relatedGuardrails?: string[];
  relatedPainPoints?: string[];
  relatedPrompts?: string[];
  relatedPatterns?: string[];
  researchCitations?: Array<{
    source: string;
    summary: string;
    url?: string;
    verified?: boolean;
  }>;
  primaryKeywords?: string[];
  recommendationKeywords?: string[];
  solutionKeywords?: string[];
  keywords?: string[];
  category?: 'best-practices' | 'strategic-guidance' | 'tool-selection' | 'team-structure' | 'process-optimization' | 'risk-mitigation';
  audience?: string[];
  priority?: 'high' | 'medium' | 'low';
  status?: 'draft' | 'published';
  datePublished?: string;
  dateModified?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Recommendation Processor
 * Transforms MongoDB documents to Recommendation entities
 */
class RecommendationProcessor implements ContentProcessor<RecommendationDocument, Recommendation> {
  process(raw: RecommendationDocument): Recommendation {
    return {
      id: raw.id || (raw._id ? String(raw._id) : ''),
      slug: raw.slug || '',
      title: raw.title,
      recommendationStatement: raw.recommendationStatement,
      description: raw.description,
      whyThisMatters: raw.whyThisMatters,
      whenToApply: raw.whenToApply,
      implementationGuidance: raw.implementationGuidance,
      relatedWorkflows: raw.relatedWorkflows || [],
      relatedGuardrails: raw.relatedGuardrails || [],
      relatedPainPoints: raw.relatedPainPoints || [],
      relatedPrompts: raw.relatedPrompts || [],
      relatedPatterns: raw.relatedPatterns || [],
      researchCitations: raw.researchCitations || [],
      primaryKeywords: raw.primaryKeywords || [],
      recommendationKeywords: raw.recommendationKeywords || [],
      solutionKeywords: raw.solutionKeywords || [],
      keywords: raw.keywords || [],
      category: raw.category || 'best-practices',
      audience: raw.audience || [],
      priority: raw.priority || 'medium',
      status: raw.status || 'draft',
      datePublished: raw.datePublished,
      dateModified: raw.dateModified,
    };
  }

  processMany(raw: RecommendationDocument[]): Recommendation[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Recommendation Repository
 * Unified retrieval using BaseRepository pattern
 */
export class RecommendationRepository
  extends BaseRepository<RecommendationDocument>
  implements ContentRepository<Recommendation>
{
  private processor: RecommendationProcessor;

  constructor() {
    super('recommendations');
    this.processor = new RecommendationProcessor();
  }

  /**
   * Get all recommendations
   * Public content - organizationId is null for all users
   */
  async getAll(): Promise<Recommendation[]> {
    const documents = await this.find({
      organizationId: null, // Public content - intentionally null for all users
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get recommendation by ID
   * Public content - organizationId is null for all users
   */
  async getById(id: string): Promise<Recommendation | null> {
    const document = await this.findOne({
      id,
      organizationId: null, // Public content - intentionally null for all users
    });
    if (!document) {
      return null;
    }
    return this.processor.process(document);
  }

  /**
   * Get recommendation by slug
   * Public content - organizationId is null for all users
   */
  async getBySlug(slug: string): Promise<Recommendation | null> {
    const document = await this.findOne({
      slug,
      organizationId: null, // Public content - intentionally null for all users
    });
    if (!document) {
      return null;
    }
    return this.processor.process(document);
  }

  /**
   * Count recommendations
   */
  async count(): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({});
  }

  /**
   * Search recommendations
   */
  async search(query: string): Promise<Recommendation[]> {
    const documents = await this.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { recommendationStatement: { $regex: query, $options: 'i' } },
      ],
    });
    return this.processor.processMany(documents);
  }
}

// Singleton instance
export const recommendationRepository = new RecommendationRepository();

