/**
 * Pain Point Repository
 *
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to PainPoint schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { PainPoint } from '@/lib/workflows/pain-point-schema';

interface PainPointDocument {
  _id?: unknown;
  id?: string;
  slug?: string;
  title: string;
  description: string;
  coreProblem?: string;
  problemStatement: string;
  impact?: string;
  examples?: string[];
  expandedExamples?: Array<{ title: string; description: string }>;
  solutionWorkflows?: Array<{
    workflowId: string;
    title: string;
    painPointItSolves: string;
    whyItWorks: string;
  }>;
  relatedWorkflows?: string[];
  relatedPrompts?: string[];
  relatedPatterns?: string[];
  researchCitations?: Array<{
    source: string;
    summary: string;
    url?: string;
    verified?: boolean;
  }>;
  primaryKeywords?: string[];
  painPointKeywords?: string[];
  solutionKeywords?: string[];
  keywords?: string[];
  status?: 'draft' | 'published';
  datePublished?: string;
  dateModified?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Pain Point Processor
 * Transforms MongoDB documents to PainPoint entities
 */
class PainPointProcessor implements ContentProcessor<PainPointDocument, PainPoint> {
  process(raw: PainPointDocument): PainPoint {
    return {
      id: raw.id || (raw._id ? String(raw._id) : ''),
      slug: raw.slug || '',
      title: raw.title,
      description: raw.description,
      coreProblem: raw.coreProblem,
      problemStatement: raw.problemStatement,
      impact: raw.impact,
      examples: raw.examples || [],
      expandedExamples: raw.expandedExamples || [],
      solutionWorkflows: raw.solutionWorkflows || [],
      relatedWorkflows: raw.relatedWorkflows || [],
      relatedPrompts: raw.relatedPrompts || [],
      relatedPatterns: raw.relatedPatterns || [],
      researchCitations: (raw.researchCitations || []).map(citation => ({
        source: citation.source,
        summary: citation.summary,
        url: citation.url,
        verified: citation.verified ?? false,
      })),
      primaryKeywords: raw.primaryKeywords || [],
      painPointKeywords: raw.painPointKeywords || [],
      solutionKeywords: raw.solutionKeywords || [],
      keywords: raw.keywords || [],
      status: raw.status || 'draft',
      datePublished: raw.datePublished,
      dateModified: raw.dateModified,
    };
  }

  processMany(raw: PainPointDocument[]): PainPoint[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Pain Point Repository
 * Unified retrieval using BaseRepository pattern
 */
export class PainPointRepository
  extends BaseRepository<PainPointDocument>
  implements ContentRepository<PainPoint>
{
  private processor: PainPointProcessor;

  constructor() {
    super('pain_points');
    this.processor = new PainPointProcessor();
  }

  /**
   * Get all pain points
   * Public content - organizationId is null for all users
   */
  async getAll(): Promise<PainPoint[]> {
    const documents = await this.find({
      organizationId: null, // Public content - intentionally null for all users
    });
    return this.processor.processMany(documents);
  }

  /**
   * Get pain point by ID
   * Public content - organizationId is null for all users
   */
  async getById(id: string): Promise<PainPoint | null> {
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
   * Get pain point by slug
   * Public content - organizationId is null for all users
   */
  async getBySlug(slug: string): Promise<PainPoint | null> {
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
   * Count pain points
   */
  async count(): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({});
  }

  /**
   * Search pain points
   */
  async search(query: string): Promise<PainPoint[]> {
    const documents = await this.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { problemStatement: { $regex: query, $options: 'i' } },
      ],
    });
    return this.processor.processMany(documents);
  }
}

// Singleton instance
export const painPointRepository = new PainPointRepository();

