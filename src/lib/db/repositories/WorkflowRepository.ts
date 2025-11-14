/**
 * Workflow Repository
 *
 * Retrieval: Raw MongoDB documents
 * Processing: Transform to Workflow schema
 * Formatting: Shape for UI/API
 */

import { BaseRepository } from './BaseRepository';
import type { ContentRepository, ContentProcessor } from './BaseRepository';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import type { WorkflowDocument } from '@/lib/db/schemas/workflow';

/**
 * Workflow Processor
 * Transforms MongoDB documents to Workflow entities
 */
class WorkflowProcessor implements ContentProcessor<WorkflowDocument, Workflow> {
  process(raw: WorkflowDocument): Workflow {
    return {
      slug: raw.slug,
      title: raw.title,
      category: raw.category,
      audience: raw.audience,
      problemStatement: raw.problemStatement,
      manualChecklist: raw.manualChecklist,
      relatedResources: raw.relatedResources || {},
      researchCitations: raw.researchCitations || [],
      painPointIds: raw.painPointIds || [],
      painPointKeywords: raw.painPointKeywords || [],
      seoStrategy: raw.seoStrategy,
      eEatSignals: raw.eEatSignals,
      automationTeaser: raw.automationTeaser,
      cta: raw.cta,
      status: raw.status || 'draft',
    };
  }

  processMany(raw: WorkflowDocument[]): Workflow[] {
    return raw.map((doc) => this.process(doc));
  }
}

/**
 * Workflow Repository
 * Unified retrieval using BaseRepository pattern
 */
export class WorkflowRepository
  extends BaseRepository<WorkflowDocument>
  implements ContentRepository<Workflow>
{
  private processor: WorkflowProcessor;

  constructor() {
    super('workflows');
    this.processor = new WorkflowProcessor();
  }

  /**
   * Get all workflows
   */
  async getAll(): Promise<Workflow[]> {
    const documents = await this.find({});
    return this.processor.processMany(documents);
  }

  /**
   * Get workflow by ID
   */
  async getById(id: string): Promise<Workflow | null> {
    const document = await this.findOne({ id });
    if (!document) {
      return null;
    }
    return this.processor.process(document);
  }

  /**
   * Get workflow by category and slug
   */
  async getByCategoryAndSlug(category: string, slug: string): Promise<Workflow | null> {
    const document = await this.findOne({ category, slug });
    if (!document) {
      return null;
    }
    return this.processor.process(document);
  }

  /**
   * Get workflows by category
   */
  async getByCategory(category: string): Promise<Workflow[]> {
    const documents = await this.find({ category });
    return this.processor.processMany(documents);
  }

  /**
   * Get workflows by audience
   */
  async getByAudience(audience: string): Promise<Workflow[]> {
    const documents = await this.find({ audience: { $in: [audience] } });
    return this.processor.processMany(documents);
  }

  /**
   * Get workflows by status
   */
  async getByStatus(status: Workflow['status']): Promise<Workflow[]> {
    const documents = await this.find({ status });
    return this.processor.processMany(documents);
  }

  /**
   * Count workflows
   */
  async count(): Promise<number> {
    return (await this.getCollection()).countDocuments({});
  }

  /**
   * Search workflows
   */
  async search(query: string): Promise<Workflow[]> {
    const searchRegex = new RegExp(query, 'i');
    const documents = await this.find({
      $or: [
        { title: searchRegex },
        { problemStatement: searchRegex },
        { 'manualChecklist': searchRegex },
      ],
    });
    return this.processor.processMany(documents);
  }

  /**
   * Create or update workflow
   */
  async upsert(workflow: Workflow & { id?: string }): Promise<Workflow> {
    const now = new Date();
    const doc: WorkflowDocument = {
      id: workflow.id || `${workflow.category}-${workflow.slug}`,
      slug: workflow.slug,
      title: workflow.title,
      category: workflow.category,
      audience: workflow.audience,
      problemStatement: workflow.problemStatement,
      manualChecklist: workflow.manualChecklist,
      relatedResources: workflow.relatedResources,
      researchCitations: workflow.researchCitations,
      painPointIds: workflow.painPointIds,
      painPointKeywords: workflow.painPointKeywords,
      seoStrategy: workflow.seoStrategy,
      eEatSignals: workflow.eEatSignals,
      automationTeaser: workflow.automationTeaser,
      cta: workflow.cta,
      status: workflow.status,
      updatedAt: now,
    };

    await (await this.getCollection()).updateOne(
      { slug: workflow.slug, category: workflow.category },
      {
        $set: doc,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return this.processor.process(doc);
  }
}

// Export singleton instance
export const workflowRepository = new WorkflowRepository();

