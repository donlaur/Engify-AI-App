/**
 * Prompt Test Fixtures
 *
 * Factory functions and fixtures for creating test prompt data
 */

import { nanoid } from 'nanoid';

export type PromptCategory =
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'creative'
  | 'business'
  | 'education';

export type PromptStatus = 'draft' | 'published' | 'archived';

export interface TestPrompt {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  status?: PromptStatus;
  featured?: boolean;
  userId?: string;
  authorName?: string;
  rating?: number;
  usageCount?: number;
  favoriteCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    pattern?: string;
    version?: string;
    modelRecommendations?: string[];
    expectedOutputFormat?: string;
  };
}

/**
 * Default prompt fixture values
 */
const defaultPrompt: Partial<TestPrompt> = {
  status: 'published',
  featured: false,
  rating: 0,
  usageCount: 0,
  favoriteCount: 0,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Prompt Factory - Create test prompts with custom properties
 *
 * @example
 * const prompt = createPrompt({ category: 'coding' });
 * const featured = createPrompt({ featured: true, rating: 4.8 });
 */
export function createPrompt(overrides: Partial<TestPrompt> = {}): TestPrompt {
  const id = overrides._id || overrides.id || nanoid();
  const title = overrides.title || `Test Prompt ${id.slice(0, 8)}`;
  const description =
    overrides.description || `A test prompt for ${title.toLowerCase()}`;
  const content =
    overrides.content ||
    `You are an expert assistant. Help the user with their request in a clear and concise manner.`;

  return {
    ...defaultPrompt,
    _id: id,
    id,
    title,
    description,
    content,
    category: overrides.category || 'writing',
    tags: overrides.tags || ['test', 'general'],
    ...overrides,
  } as TestPrompt;
}

/**
 * Create multiple prompts at once
 *
 * @example
 * const prompts = createPrompts(5);
 * const codingPrompts = createPrompts(3, { category: 'coding' });
 */
export function createPrompts(
  count: number,
  overrides: Partial<TestPrompt> = {}
): TestPrompt[] {
  return Array.from({ length: count }, () => createPrompt(overrides));
}

/**
 * Pre-defined prompt fixtures for common scenarios
 */
export const promptFixtures = {
  /**
   * Basic writing prompt
   */
  writing: (): TestPrompt =>
    createPrompt({
      title: 'Blog Post Writer',
      description: 'Create engaging blog posts on any topic',
      content:
        'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, well-structured sections, and a compelling conclusion.',
      category: 'writing',
      tags: ['writing', 'blog', 'content'],
      rating: 4.5,
      usageCount: 150,
    }),

  /**
   * Coding assistant prompt
   */
  coding: (): TestPrompt =>
    createPrompt({
      title: 'Code Review Assistant',
      description: 'Get detailed code reviews and suggestions',
      content:
        'Review the following code and provide detailed feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security concerns\n\n[CODE]',
      category: 'coding',
      tags: ['coding', 'review', 'quality'],
      rating: 4.8,
      usageCount: 320,
      metadata: {
        modelRecommendations: ['claude-3', 'gpt-4'],
        expectedOutputFormat: 'markdown',
      },
    }),

  /**
   * Analysis prompt
   */
  analysis: (): TestPrompt =>
    createPrompt({
      title: 'Data Analysis Expert',
      description: 'Analyze data and provide insights',
      content:
        'Analyze the following data and provide:\n1. Key patterns and trends\n2. Statistical insights\n3. Actionable recommendations\n\n[DATA]',
      category: 'analysis',
      tags: ['analysis', 'data', 'insights'],
      rating: 4.2,
      usageCount: 95,
    }),

  /**
   * Creative prompt
   */
  creative: (): TestPrompt =>
    createPrompt({
      title: 'Story Generator',
      description: 'Create imaginative stories',
      content:
        'Write a creative short story based on the theme: [THEME]. Make it engaging and original.',
      category: 'creative',
      tags: ['creative', 'story', 'writing'],
      rating: 4.6,
      usageCount: 210,
      featured: true,
    }),

  /**
   * Business prompt
   */
  business: (): TestPrompt =>
    createPrompt({
      title: 'Business Strategy Advisor',
      description: 'Get strategic business insights',
      content:
        'Analyze the business scenario and provide strategic recommendations for [SITUATION]. Consider market dynamics, competition, and growth opportunities.',
      category: 'business',
      tags: ['business', 'strategy', 'analysis'],
      rating: 4.7,
      usageCount: 180,
    }),

  /**
   * Draft prompt
   */
  draft: (): TestPrompt =>
    createPrompt({
      title: 'Draft Prompt',
      description: 'A draft prompt for testing',
      content: 'This is a draft prompt that is not yet published.',
      status: 'draft',
      rating: 0,
      usageCount: 0,
    }),

  /**
   * Featured high-rated prompt
   */
  featured: (): TestPrompt =>
    createPrompt({
      title: 'Featured Prompt',
      description: 'A highly rated featured prompt',
      content: 'This is a featured prompt with high ratings.',
      featured: true,
      rating: 4.9,
      usageCount: 500,
      favoriteCount: 150,
    }),

  /**
   * Archived prompt
   */
  archived: (): TestPrompt =>
    createPrompt({
      title: 'Archived Prompt',
      description: 'An archived prompt',
      content: 'This prompt is no longer active.',
      status: 'archived',
    }),
};

/**
 * Prompt with pattern metadata
 */
export function createPromptWithPattern(
  pattern: string,
  overrides: Partial<TestPrompt> = {}
): TestPrompt {
  return createPrompt({
    ...overrides,
    metadata: {
      pattern,
      version: '1.0.0',
      ...overrides.metadata,
    },
  });
}
