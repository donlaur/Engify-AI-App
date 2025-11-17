/**
 * Database Schema Definitions
 *
 * Single source of truth for all database schemas.
 * Uses Zod for runtime validation and TypeScript type inference.
 *
 * NO SCHEMA DRIFT: Types are derived from these schemas.
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Custom Zod schema for MongoDB ObjectId
 */
export const ObjectIdSchema = z.instanceof(ObjectId);

/**
 * User Roles
 */
export const UserRole = z.enum(['user', 'admin', 'owner']);
export type UserRole = z.infer<typeof UserRole>;

/**
 * Subscription Plans
 */
export const SubscriptionPlan = z.enum([
  'free',
  'pro',
  'team',
  'enterprise_starter',
  'enterprise_pro',
  'enterprise_premium',
]);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;

/**
 * User Schema
 */
export const UserSchema = z.object({
  _id: ObjectIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(100),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
  password: z.string().nullable(), // Hashed password for email/password auth
  role: UserRole.default('user'),
  organizationId: ObjectIdSchema.nullable(),
  plan: SubscriptionPlan.default('free'),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Organization Schema (for Team/Enterprise plans)
 */
export const OrganizationSchema = z.object({
  _id: ObjectIdSchema,
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100), // Unique, URL-friendly
  domain: z.string().nullable(), // For SSO
  plan: SubscriptionPlan,
  status: z.enum(['active', 'trial', 'suspended']).default('active'),
  billing: z.object({
    stripeCustomerId: z.string().nullable(),
    contractStart: z.date().nullable(),
    contractEnd: z.date().nullable(),
    seats: z.number().int().positive().default(1),
    usedSeats: z.number().int().nonnegative().default(0),
  }),
  sso: z.object({
    enabled: z.boolean().default(false),
    provider: z.string().nullable(), // 'okta', 'azure_ad', 'google_workspace'
    samlMetadataUrl: z.string().url().nullable(),
  }),
  settings: z.object({
    allowedDomains: z.array(z.string()).default([]),
    dataRetention: z.number().int().positive().default(90), // Days
    auditLogRetention: z.number().int().positive().default(365), // Days
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

/**
 * Prompt Template Category
 */
export const PromptCategory = z.enum([
  'engineering',
  'product',
  'design',
  'marketing',
  'sales',
  'support',
  'general',
]);
export type PromptCategory = z.infer<typeof PromptCategory>;

/**
 * User Role (for prompt templates)
 */
export const PromptRole = z.enum([
  'junior_engineer',
  'mid_engineer',
  'senior_engineer',
  'staff_engineer',
  'principal_engineer',
  'manager',
  'director',
  'vp',
  'cto',
]);
export type PromptRole = z.infer<typeof PromptRole>;

const PromptMediaBase = z.object({
  coverImageUrl: z.string().url().nullable().default(null),
  coverAlt: z.string().max(200).nullable().default(null),
  iconUrl: z.string().url().nullable().default(null),
  iconAlt: z.string().max(100).nullable().default(null),
  palette: z.array(z.string()).default([]),
  generatedAt: z.date().nullable().default(null),
  source: z.enum(['placeholder', 'replicate', 'manual']).default('placeholder'),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const PromptMediaSchema = PromptMediaBase;
export type PromptMedia = z.infer<typeof PromptMediaSchema>;

export const DEFAULT_PROMPT_MEDIA: PromptMedia = {
  coverImageUrl: null,
  coverAlt: null,
  iconUrl: null,
  iconAlt: null,
  palette: [],
  generatedAt: null,
  source: 'placeholder',
  metadata: {},
};

/**
 * Prompt Template Schema
 */
export const PromptTemplateSchema = z.object({
  _id: ObjectIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  content: z.string().min(1),
  category: PromptCategory,
  role: PromptRole,
  tags: z.array(z.string()).default([]),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('beginner'),
  estimatedTime: z.number().int().positive().nullable(), // Minutes
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  authorId: ObjectIdSchema.nullable(), // null for system prompts
  organizationId: ObjectIdSchema.nullable(), // For team/enterprise prompts
  media: PromptMediaSchema.default(DEFAULT_PROMPT_MEDIA).optional(),
  stats: z.object({
    views: z.number().int().nonnegative().default(0),
    favorites: z.number().int().nonnegative().default(0),
    uses: z.number().int().nonnegative().default(0),
    averageRating: z.number().min(0).max(5).default(0),
    totalRatings: z.number().int().nonnegative().default(0),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

/**
 * User Favorite Schema
 */
export const UserFavoriteSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  promptId: ObjectIdSchema,
  createdAt: z.date(),
});

export type UserFavorite = z.infer<typeof UserFavoriteSchema>;

/**
 * Prompt Rating Schema
 */
export const PromptRatingSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  promptId: ObjectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PromptRating = z.infer<typeof PromptRatingSchema>;

/**
 * Learning Pathway Schema
 */
export const LearningPathwaySchema = z.object({
  _id: ObjectIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  role: PromptRole,
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number().int().positive(),
  modules: z.array(
    z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(500),
      prompts: z.array(ObjectIdSchema),
      order: z.number().int().nonnegative(),
      media: PromptMediaSchema.default(DEFAULT_PROMPT_MEDIA).optional(),
    })
  ),
  isPublic: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LearningPathway = z.infer<typeof LearningPathwaySchema>;

/**
 * User Progress Schema
 */
export const UserProgressSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  pathwayId: ObjectIdSchema,
  completedPrompts: z.array(ObjectIdSchema).default([]),
  currentModule: z.number().int().nonnegative().default(0),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  updatedAt: z.date(),
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

/**
 * Audit Log Schema
 */
export const AuditLogSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  organizationId: ObjectIdSchema.nullable(),
  action: z.string().min(1).max(100), // 'user.login', 'prompt.create', etc.
  resource: z.string().max(100).nullable(), // Resource type
  resourceId: z.string().max(100).nullable(), // Resource ID
  metadata: z.record(z.string(), z.unknown()).nullable(), // Additional context
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Web Content Schema (for ingested documents)
 */
export const WebContentSchema = z.object({
  _id: ObjectIdSchema,
  organizationId: ObjectIdSchema.nullable().default(null),
  title: z.string().nullable(),
  description: z.string().nullable(),
  text: z.string().min(1),
  canonicalUrl: z.string().url().nullable(),
  source: z.string().nullable(),
  hash: z.string().min(32),
  lang: z.string().nullable(),
  readingMinutes: z.number().int().positive().nullable(),
  quality: z.object({
    hasTitle: z.boolean(),
    hasDescription: z.boolean(),
    minWordsMet: z.boolean(),
    checks: z.array(z.string()).default([]),
  }),
  reviewStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type WebContent = z.infer<typeof WebContentSchema>;

/**
 * Collection Names
 * Centralized to prevent typos and ensure consistency
 */

/**
 * Content Provenance Schema (ingestion scheduler logs)
 */
export const ContentProvenanceSchema = z.object({
  _id: ObjectIdSchema,
  stage: z.string(),
  source: z.string(),
  status: z.enum(['queued', 'success', 'error']),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date(),
});

export type ContentProvenance = z.infer<typeof ContentProvenanceSchema>;

export const WorkbenchRunStatus = z.enum([
  'pending',
  'success',
  'error',
  'budget_exceeded',
  'replay',
]);

export type WorkbenchRunStatus = z.infer<typeof WorkbenchRunStatus>;

export const WorkbenchRunSchema = z.object({
  _id: ObjectIdSchema,
  runId: z.string().min(8),
  toolId: z.string().min(1),
  userId: z.string().nullable(),
  status: WorkbenchRunStatus,
  budgetCents: z.number().int().nonnegative(),
  costCents: z.number().int().nonnegative().nullable(),
  provider: z.string().nullable(),
  model: z.string().nullable(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
  totalTokens: z.number().int().nonnegative().nullable(),
  promptHash: z.string().nullable(),
  contractVersion: z.number().int().positive(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  error: z.string().nullable().default(null),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});

export type WorkbenchRun = z.infer<typeof WorkbenchRunSchema>;

export const Collections = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  PROMPT_TEMPLATES: 'prompt_templates',
  USER_FAVORITES: 'user_favorites',
  PROMPT_RATINGS: 'prompt_ratings',
  LEARNING_PATHWAYS: 'learning_pathways',
  USER_PROGRESS: 'user_progress',
  AUDIT_LOGS: 'audit_logs',
  WEB_CONTENT: 'web_content',
  CONTENT_PROVENANCE: 'content_provenance',
  WORKBENCH_RUNS: 'workbench_runs',
  API_KEYS: 'api_keys',
} as const;

/**
 * Database Indexes
 * Define all indexes for optimal query performance
 */
export const Indexes = {
  users: [
    { key: { email: 1 }, unique: true },
    { key: { organizationId: 1 } },
    { key: { stripeCustomerId: 1 }, sparse: true },
  ],
  organizations: [
    { key: { slug: 1 }, unique: true },
    { key: { domain: 1 }, sparse: true },
  ],
  prompt_templates: [
    { key: { category: 1, role: 1 } },
    { key: { tags: 1 } },
    { key: { authorId: 1 } },
    { key: { organizationId: 1 }, sparse: true },
    { key: { isPublic: 1, isFeatured: 1 } },
  ],
  user_favorites: [
    { key: { userId: 1, promptId: 1 }, unique: true },
    { key: { promptId: 1 } },
  ],
  prompt_ratings: [
    { key: { userId: 1, promptId: 1 }, unique: true },
    { key: { promptId: 1 } },
  ],
  learning_pathways: [
    { key: { role: 1, difficulty: 1 } },
    { key: { isPublic: 1 } },
  ],
  user_progress: [
    { key: { userId: 1, pathwayId: 1 }, unique: true },
    { key: { pathwayId: 1 } },
  ],
  audit_logs: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { organizationId: 1, createdAt: -1 }, sparse: true },
    { key: { action: 1, createdAt: -1 } },
    { key: { createdAt: -1 } }, // For cleanup/archival
  ],
  web_content: [
    { key: { hash: 1 }, unique: true },
    { key: { canonicalUrl: 1 }, sparse: true },
    { key: { createdAt: -1 } },
  ],
  content_provenance: [
    { key: { stage: 1, createdAt: -1 } },
    { key: { source: 1, createdAt: -1 } },
    { key: { createdAt: -1 } },
  ],
  workbench_runs: [
    { key: { runId: 1 }, unique: true },
    { key: { toolId: 1, createdAt: -1 } },
    { key: { status: 1, createdAt: -1 } },
  ],
} as const;
