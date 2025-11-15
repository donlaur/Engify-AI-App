import { z } from 'zod';

export const WORKFLOW_CATEGORIES = [
  'ai-behavior',
  'code-quality',
  'communication',
  'community',
  'enablement',
  'governance',
  'guardrails',
  'memory',
  'process',
  'risk-management',
  'security',
] as const;

export const GUARDRAIL_SUBCATEGORIES = [
  'data-integrity',
  'security',
  'performance',
  'availability',
  'financial',
  'integration',
  'testing',
] as const;

export const GUARDRAIL_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
] as const;

export const WORKFLOW_AUDIENCES = [
  'analysts',
  'architects',
  'engineering-managers',
  'engineers',
  'executives',
  'platform',
  'product-managers',
  'qa',
  'security',
] as const;

export const WORKFLOW_STATUSES = ['draft', 'published', 'coming_soon'] as const;

export const WORKFLOW_CTA_TYPES = ['copy', 'download', 'external'] as const;

export const WorkflowCtaSchema = z
  .object({
    label: z.string().min(1, 'CTA label is required'),
    type: z.enum(WORKFLOW_CTA_TYPES),
    href: z.string().url().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'external' && !value.href) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'External CTAs require an href value',
        path: ['href'],
      });
    }
  });

export const WorkflowRelatedResourcesSchema = z.object({
  prompts: z.array(z.string().min(1)).optional(),
  patterns: z.array(z.string().min(1)).optional(),
  learn: z.array(z.string().min(1)).optional(),
  adjacentWorkflows: z.array(z.string().min(1)).optional(),
});

export const WorkflowResearchCitationSchema = z.object({
  source: z.string().min(1, 'Citation source is required'),
  summary: z.string().min(1, 'Citation summary is required'),
  url: z.string().url().optional(), // Verified source URL for SEO
  verified: z.boolean().default(false), // Whether the source has been verified
});

export const WorkflowSeoStrategySchema = z.object({
  painPointFocus: z.string().min(1, 'SEO pain point focus is required'),
  keywordPhrases: z.array(z.string().min(1)).default([]),
  measurementPlan: z.string().min(1, 'Measurement plan is required'),
});

export const WorkflowEEATSignalsSchema = z.object({
  experience: z.string().min(1).optional(),
  expertise: z.string().min(1).optional(),
  authoritativeness: z.string().min(1).optional(),
  trustworthiness: z.string().min(1).optional(),
});

// Guardrail-specific schemas
export const GuardrailEarlyDetectionSchema = z.object({
  cicd: z.string().optional(),
  static: z.string().optional(),
  runtime: z.string().optional(),
});

export const GuardrailMitigationSchema = z.array(z.string().min(1)).length(3);

export const WorkflowSchema = z.object({
  slug: z
    .string()
    .min(1, 'Workflow slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase, numbers, hyphen)'),
  title: z.string().min(1, 'Workflow title is required'),
  category: z.enum(WORKFLOW_CATEGORIES),
  // Guardrail-specific fields (optional for regular workflows)
  subcategory: z.enum(GUARDRAIL_SUBCATEGORIES).optional(),
  severity: z.enum(GUARDRAIL_SEVERITIES).optional(),
  earlyDetection: GuardrailEarlyDetectionSchema.optional(),
  mitigation: GuardrailMitigationSchema.optional(),
  audience: z.array(z.enum(WORKFLOW_AUDIENCES)).min(1, 'Specify at least one audience'),
  problemStatement: z.string().min(1, 'Problem statement is required'),
  manualChecklist: z
    .array(z.string().min(1, 'Checklist items must not be empty'))
    .min(1, 'Provide at least one checklist item'),
  relatedResources: WorkflowRelatedResourcesSchema.default({}),
  researchCitations: z.array(WorkflowResearchCitationSchema).default([]),
  painPointIds: z.array(z.string().min(1)).default([]),
  painPointKeywords: z.array(z.string().min(1)).default([]),
  seoStrategy: WorkflowSeoStrategySchema.optional(),
  eEatSignals: WorkflowEEATSignalsSchema.optional(),
  automationTeaser: z.string().min(1).optional(),
  cta: WorkflowCtaSchema.optional(),
  status: z.enum(WORKFLOW_STATUSES).default('draft'),
});

export const WorkflowsJsonSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().min(1),
  totalWorkflows: z.number().int().nonnegative(),
  workflows: z.array(WorkflowSchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowCta = z.infer<typeof WorkflowCtaSchema>;
export type WorkflowRelatedResources = z.infer<typeof WorkflowRelatedResourcesSchema>;
export type WorkflowResearchCitation = z.infer<typeof WorkflowResearchCitationSchema>;
export type WorkflowSeoStrategy = z.infer<typeof WorkflowSeoStrategySchema>;
export type WorkflowEEATSignals = z.infer<typeof WorkflowEEATSignalsSchema>;
export type WorkflowsJsonData = z.infer<typeof WorkflowsJsonSchema>;

export function validateWorkflowsJson(data: unknown): WorkflowsJsonData {
  return WorkflowsJsonSchema.parse(data);
}
