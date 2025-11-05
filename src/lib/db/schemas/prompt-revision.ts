/**
 * Prompt Revision Schema
 * Tracks all changes to prompts for history and audit purposes
 */

import { z } from 'zod';

export const PromptRevisionSchema = z.object({
  _id: z.string().optional(),
  promptId: z.string(), // References prompt.id
  revisionNumber: z.number().int().positive(),
  changes: z.object({
    field: z.string(), // e.g., 'title', 'content', 'description'
    oldValue: z.string().optional(),
    newValue: z.string().optional(),
    changeType: z.enum(['created', 'updated', 'deleted', 'enriched']),
  }).array(),
  changedBy: z.string().optional(), // userId or 'system'
  changeReason: z.string().optional(), // e.g., 'Enrichment based on audit feedback'
  // Snapshot of prompt at this revision
  snapshot: z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    category: z.string(),
    role: z.string().optional(),
    pattern: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Include enrichment fields
    caseStudies: z.array(z.any()).optional(),
    bestTimeToUse: z.array(z.string()).optional(),
    recommendedModel: z.array(z.any()).optional(),
    useCases: z.array(z.string()).optional(),
    examples: z.array(z.any()).optional(),
    bestPractices: z.array(z.string()).optional(),
  }),
  createdAt: z.date(),
  metadata: z.record(z.unknown()).optional(), // Additional metadata
});

export type PromptRevision = z.infer<typeof PromptRevisionSchema>;

/**
 * Create a revision from prompt changes
 */
export function createRevision(
  promptId: string,
  oldPrompt: any,
  newPrompt: any,
  changedBy?: string,
  changeReason?: string
): Omit<PromptRevision, '_id' | 'createdAt'> {
  const changes: PromptRevision['changes'] = [];
  
  // Compare fields and track changes
  const fieldsToTrack = [
    'title', 'description', 'content', 'category', 'role', 'pattern',
    'caseStudies', 'bestTimeToUse', 'recommendedModel', 'useCases',
    'examples', 'bestPractices', 'whenNotToUse', 'difficulty', 'estimatedTime'
  ];

  fieldsToTrack.forEach(field => {
    const oldValue = oldPrompt[field];
    const newValue = newPrompt[field];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        oldValue: oldValue ? JSON.stringify(oldValue).substring(0, 500) : undefined,
        newValue: newValue ? JSON.stringify(newValue).substring(0, 500) : undefined,
        changeType: oldValue === undefined ? 'created' : newValue === undefined ? 'deleted' : 'updated',
      });
    }
  });

  // Determine revision number (will be set by database)
  return {
    promptId,
    revisionNumber: 0, // Will be incremented by database
    changes,
    changedBy: changedBy || 'system',
    changeReason: changeReason || 'Prompt updated',
    snapshot: {
      title: newPrompt.title,
      description: newPrompt.description,
      content: newPrompt.content,
      category: newPrompt.category,
      role: newPrompt.role,
      pattern: newPrompt.pattern,
      tags: newPrompt.tags,
      caseStudies: newPrompt.caseStudies,
      bestTimeToUse: Array.isArray(newPrompt.bestTimeToUse) ? newPrompt.bestTimeToUse : undefined,
      recommendedModel: newPrompt.recommendedModel,
      useCases: newPrompt.useCases,
      examples: newPrompt.examples,
      bestPractices: newPrompt.bestPractices,
    },
  };
}

