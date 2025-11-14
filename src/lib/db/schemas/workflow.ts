/**
 * Workflow MongoDB Schema
 * 
 * Similar structure to prompts but with workflow-specific fields
 */

import type { Workflow } from '@/lib/workflows/workflow-schema';

export interface WorkflowDocument {
  _id?: unknown;
  id?: string;
  slug: string;
  title: string;
  category: Workflow['category'];
  audience: Workflow['audience'];
  problemStatement: string;
  manualChecklist: string[];
  relatedResources?: Workflow['relatedResources'];
  researchCitations?: Workflow['researchCitations'];
  painPointIds?: string[];
  painPointKeywords?: string[];
  seoStrategy?: Workflow['seoStrategy'];
  eEatSignals?: Workflow['eEatSignals'];
  automationTeaser?: string;
  cta?: Workflow['cta'];
  status: Workflow['status'];
  createdAt?: Date;
  updatedAt?: Date;
  // Include ALL possible fields from MongoDB
  [key: string]: unknown;
}

export type { Workflow };

