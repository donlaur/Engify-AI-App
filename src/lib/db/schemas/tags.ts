/**
 * Tag Taxonomy Schemas
 * Comprehensive tag validation for content discoverability and SEO
 */

import { z } from 'zod';

export const RoleTag = z.enum([
  'junior-engineer',
  'mid-engineer',
  'senior-engineer',
  'staff-engineer',
  'engineering-manager',
  'director',
  'vp-engineering',
  'cto',
  'product-manager',
  'designer',
  'qa-engineer',
  'devops',
]);

export const CategoryTag = z.enum([
  'engineering',
  'product',
  'design',
  'marketing',
  'sales',
  'operations',
  'leadership',
  'code-generation',
  'testing',
  'architecture',
  'debugging',
  'documentation',
  'refactoring',
  'performance',
  'security',
  'code-review',
]);

export const PatternTag = z.enum([
  'craft',
  'kernel',
  'chain-of-thought',
  'few-shot',
  'zero-shot',
  'persona',
  'context-window',
  'role-prompting',
  'tree-of-thought',
  'self-consistency',
  'meta-prompting',
  'rag',
  'cot',
  'react',
  'reflection',
]);

export const SkillTag = z.enum([
  'debugging',
  'architecture',
  'code-review',
  'refactoring',
  'testing',
  'documentation',
  'performance',
  'security',
  'api-design',
  'system-design',
  'frontend',
  'backend',
  'database',
  'devops',
]);

export const UseCaseTag = z.enum([
  'onboarding',
  '1-on-1s',
  'okrs',
  'retros',
  'tech-debt',
  'incident-response',
  'planning',
  'communication',
  'pips',
  'conflict-resolution',
  'facilitation',
  'code-quality',
  'team-building',
]);

export const DifficultyTag = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const Tag = z.union([
  RoleTag,
  CategoryTag,
  PatternTag,
  SkillTag,
  UseCaseTag,
  DifficultyTag,
]);

export type RoleTag = z.infer<typeof RoleTag>;
export type CategoryTag = z.infer<typeof CategoryTag>;
export type PatternTag = z.infer<typeof PatternTag>;
export type SkillTag = z.infer<typeof SkillTag>;
export type UseCaseTag = z.infer<typeof UseCaseTag>;
export type DifficultyTag = z.infer<typeof DifficultyTag>;
export type Tag = z.infer<typeof Tag>;

/**
 * Validate tags array for a prompt
 * Should have 4-8 tags: 1 role + 1 category + 2-5 skills/patterns/use-cases
 */
export const PromptTagsSchema = z.array(Tag).min(4).max(8);

export type PromptTags = z.infer<typeof PromptTagsSchema>;
