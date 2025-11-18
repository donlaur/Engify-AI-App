/**
 * Prompt Service Layer
 *
 * Implements business logic for prompt operations using the Repository Pattern.
 * This service layer:
 * - Depends on IPromptRepository interface (Dependency Inversion)
 * - Contains business logic and validation
 * - Is easily testable with mock repositories
 * - Follows Single Responsibility Principle
 *
 * SOLID Principles:
 * - Single Responsibility: Handles prompt business logic only
 * - Open/Closed: Can extend functionality without modifying existing code
 * - Liskov Substitution: Works with any IPromptRepository implementation
 * - Interface Segregation: Depends only on what it needs
 * - Dependency Inversion: Depends on abstraction (IPromptRepository)
 */

import { IPromptRepository } from '../repositories/interfaces/IRepository';
import { PromptRepository } from '../repositories/mongodb/PromptRepository';
import type { PromptTemplate } from '@/lib/db/schema';

// Use PromptTemplate as the Prompt type for the service
type Prompt = PromptTemplate;

export interface CreatePromptData {
  title: string;
  description: string;
  content: string;
  category: string;
  role?: string;
  pattern?: string;
  slug?: string; // Optional - will be generated if not provided
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  isPublic?: boolean;
  isFeatured?: boolean;
  authorId?: string;
  organizationId?: string;
}

export interface UpdatePromptData {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  role?: string;
  pattern?: string;
  slug?: string; // Allow updating slug
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  isPublic?: boolean;
  isFeatured?: boolean;
}

export interface PromptSearchFilters {
  category?: string;
  role?: string;
  difficulty?: string;
  tags?: string[];
  isPublic?: boolean;
  isFeatured?: boolean;
  authorId?: string;
  organizationId?: string;
}

export class PromptService {
  constructor(private promptRepository: IPromptRepository) {}

  /**
   * Create a new prompt
   *
   * @description Creates a new prompt with validation and duplicate checking.
   * Automatically generates a unique SEO-friendly slug from the title.
   *
   * @param {CreatePromptData} promptData - The prompt data to create
   * @param {string} promptData.title - Prompt title (max 200 chars)
   * @param {string} promptData.description - Prompt description (max 1000 chars)
   * @param {string} promptData.content - Prompt content/template
   * @param {string} promptData.category - Prompt category
   * @param {string} [promptData.role] - Associated role (optional)
   * @param {string} [promptData.pattern] - Associated pattern (optional)
   * @param {string} [promptData.slug] - Custom slug (optional, auto-generated if not provided)
   * @param {string[]} [promptData.tags] - Tags for categorization (optional)
   * @param {string} [promptData.difficulty] - Difficulty level: beginner, intermediate, advanced (default: beginner)
   * @param {number} [promptData.estimatedTime] - Estimated time in minutes (optional)
   * @param {boolean} [promptData.isPublic] - Whether prompt is public (default: true)
   * @param {boolean} [promptData.isFeatured] - Whether prompt is featured (default: false)
   * @param {string} [promptData.authorId] - Author user ID (optional)
   * @param {string} [promptData.organizationId] - Organization ID (optional)
   *
   * @returns {Promise<Prompt>} The created prompt with generated ID and slug
   *
   * @throws {Error} If title or content is missing
   * @throws {Error} If title exceeds 200 characters
   * @throws {Error} If description exceeds 1000 characters
   * @throws {Error} If duplicate prompt is detected (includes duplicateMatches property)
   *
   * @example
   * const prompt = await promptService.createPrompt({
   *   title: 'React Component Generator',
   *   description: 'Generate React functional components with TypeScript',
   *   content: 'Create a React component named {{componentName}}...',
   *   category: 'code-generation',
   *   tags: ['react', 'typescript'],
   *   difficulty: 'intermediate',
   *   isPublic: true
   * });
   */
  async createPrompt(promptData: CreatePromptData): Promise<Prompt> {
    // Business logic validation
    if (!promptData.title || !promptData.content) {
      throw new Error('Title and content are required');
    }

    if (promptData.title.length > 200) {
      throw new Error('Title must be 200 characters or less');
    }

    if (promptData.description && promptData.description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    // Check for duplicates before creating
    const { checkPromptDuplicate } = await import('@/lib/utils/prompt-duplicate-check');
    const duplicateCheck = await checkPromptDuplicate({
      title: promptData.title,
      content: promptData.content,
      category: promptData.category,
      role: promptData.role,
      pattern: promptData.pattern,
    });

    if (duplicateCheck.isDuplicate) {
      const duplicateError = new Error('Duplicate prompt detected') as Error & {
        duplicateMatches?: typeof duplicateCheck.matches;
      };
      duplicateError.duplicateMatches = duplicateCheck.matches;
      throw duplicateError;
    }

    // Generate slug from title if not provided
    // IMPORTANT: Do NOT append ID - slugs should be clean and SEO-friendly
    const { generateUniqueSlug } = await import('@/lib/utils/slug');

    // Check for existing slugs to ensure uniqueness
    const existingPrompts = await this.promptRepository.findAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingSlugs = new Set(existingPrompts.map((p: any) => p.slug).filter(Boolean) as string[]);
    
    const slug = promptData.slug || generateUniqueSlug(promptData.title, existingSlugs);

    // Create prompt with defaults
    const newPromptData = {
      title: promptData.title,
      slug, // Store clean slug (no ID)
      description: promptData.description || '',
      content: promptData.content,
      category: promptData.category,
      role: promptData.role || null,
      pattern: promptData.pattern || null,
      tags: promptData.tags || [],
      difficulty: promptData.difficulty || 'beginner',
      estimatedTime: promptData.estimatedTime || null,
      isPublic: promptData.isPublic ?? true,
      isFeatured: promptData.isFeatured ?? false,
      authorId: promptData.authorId || null,
      organizationId: promptData.organizationId || null,
      stats: {
        views: 0,
        favorites: 0,
        uses: 0,
        averageRating: 0,
        totalRatings: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.promptRepository.create(
      newPromptData as unknown as Omit<PromptTemplate, 'id'>
    );
  }

  /**
   * Get prompt by ID
   *
   * @description Retrieves a single prompt by its unique identifier.
   *
   * @param {string} id - The unique prompt ID
   *
   * @returns {Promise<Prompt | null>} The prompt if found, null otherwise
   *
   * @throws {Error} If ID is empty or invalid
   *
   * @example
   * const prompt = await promptService.getPromptById('prompt_123');
   * if (prompt) {
   *   console.log(prompt.title);
   * }
   */
  async getPromptById(id: string): Promise<Prompt | null> {
    if (!id) {
      throw new Error('Prompt ID is required');
    }

    return await this.promptRepository.findById(id);
  }

  /**
   * Update prompt
   */
  async updatePrompt(
    id: string,
    promptData: UpdatePromptData
  ): Promise<Prompt | null> {
    if (!id) {
      throw new Error('Prompt ID is required');
    }

    // Check if prompt exists
    const existingPrompt = await this.promptRepository.findById(id);
    if (!existingPrompt) {
      throw new Error('Prompt not found');
    }

    // Business logic validation
    if (promptData.title && promptData.title.length > 200) {
      throw new Error('Title must be 200 characters or less');
    }

    if (promptData.description && promptData.description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    // Regenerate slug if title changed (clean slug, no ID)
    const updateData = { ...promptData };
    if (promptData.title && existingPrompt.title !== promptData.title) {
      const { generateUniqueSlug } = await import('@/lib/utils/slug');

      // Check for existing slugs to ensure uniqueness
      const allPrompts = await this.promptRepository.findAll();
      const existingSlugs = new Set(
        allPrompts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((p: any) => p.id !== id) // Exclude current prompt
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.slug)
          .filter(Boolean) as string[]
      );
      
      updateData.slug = generateUniqueSlug(promptData.title, existingSlugs);
    }

    return await this.promptRepository.update(
      id,
      updateData as unknown as Partial<Prompt>
    );
  }

  /**
   * Delete prompt
   */
  async deletePrompt(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Prompt ID is required');
    }

    // Check if prompt exists
    const existingPrompt = await this.promptRepository.findById(id);
    if (!existingPrompt) {
      throw new Error('Prompt not found');
    }

    return await this.promptRepository.delete(id);
  }

  /**
   * Get all prompts
   */
  async getAllPrompts(): Promise<Prompt[]> {
    return await this.promptRepository.findAll();
  }

  /**
   * Get prompts by user
   */
  async getPromptsByUser(userId: string): Promise<Prompt[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.promptRepository.findByUserId(userId);
  }

  /**
   * Get prompts by category
   */
  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    if (!category) {
      throw new Error('Category is required');
    }

    return await this.promptRepository.findByCategory(category);
  }

  /**
   * Get prompts by pattern
   */
  async getPromptsByPattern(pattern: string): Promise<Prompt[]> {
    if (!pattern) {
      throw new Error('Pattern is required');
    }

    return await this.promptRepository.findByPattern(pattern);
  }

  /**
   * Get prompts by tag
   */
  async getPromptsByTag(tag: string): Promise<Prompt[]> {
    if (!tag) {
      throw new Error('Tag is required');
    }

    return await this.promptRepository.findByTag(tag);
  }

  /**
   * Get public prompts
   */
  async getPublicPrompts(): Promise<Prompt[]> {
    return await this.promptRepository.findPublic();
  }

  /**
   * Get featured prompts
   */
  async getFeaturedPrompts(): Promise<Prompt[]> {
    return await this.promptRepository.findFeatured();
  }

  /**
   * Search prompts
   *
   * @description Performs full-text search across prompts using MongoDB text indexes.
   * Searches title, description, content, and tags fields.
   *
   * @param {string} query - Search query (minimum 2 characters)
   *
   * @returns {Promise<Prompt[]>} Array of matching prompts, sorted by relevance
   *
   * @throws {Error} If query is less than 2 characters
   *
   * @example
   * // Search for React-related prompts
   * const prompts = await promptService.searchPrompts('react component');
   * prompts.forEach(prompt => {
   *   console.log(`${prompt.title} - Score: ${prompt.score}`);
   * });
   */
  async searchPrompts(query: string): Promise<Prompt[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    return await this.promptRepository.search(query.trim());
  }

  /**
   * Get prompts with filters
   *
   * @description Retrieves prompts with advanced filtering options.
   * Supports filtering by category, role, difficulty, tags, and more.
   * Multiple filters can be applied simultaneously.
   *
   * @param {PromptSearchFilters} filters - Filter criteria
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.role] - Filter by role
   * @param {string} [filters.difficulty] - Filter by difficulty level
   * @param {string[]} [filters.tags] - Filter by tags (OR logic - matches any tag)
   * @param {boolean} [filters.isPublic] - Filter by public/private status
   * @param {boolean} [filters.isFeatured] - Filter by featured status
   * @param {string} [filters.authorId] - Filter by author ID
   * @param {string} [filters.organizationId] - Filter by organization ID
   *
   * @returns {Promise<Prompt[]>} Array of prompts matching the filters
   *
   * @example
   * // Get all public, featured prompts for beginners
   * const prompts = await promptService.getPromptsWithFilters({
   *   difficulty: 'beginner',
   *   isPublic: true,
   *   isFeatured: true
   * });
   *
   * @example
   * // Get prompts with specific tags
   * const codePrompts = await promptService.getPromptsWithFilters({
   *   tags: ['react', 'typescript', 'frontend']
   * });
   */
  async getPromptsWithFilters(filters: PromptSearchFilters): Promise<Prompt[]> {
    let prompts: Prompt[] = [];

    // Apply filters sequentially
    if (filters.category) {
      prompts = await this.promptRepository.findByCategory(filters.category);
    } else if (filters.role) {
      prompts = await this.promptRepository.findByRole(filters.role);
    } else if (filters.difficulty) {
      prompts = await this.promptRepository.findByDifficulty(
        filters.difficulty
      );
    } else if (filters.tags && filters.tags.length > 0) {
      // Find prompts that contain any of the specified tags
      const tagPrompts = await Promise.all(
        filters.tags.map((tag) => this.promptRepository.findByTag(tag))
      );
      prompts = tagPrompts.flat();
    } else if (filters.isPublic !== undefined) {
      prompts = filters.isPublic
        ? await this.promptRepository.findPublic()
        : await this.promptRepository.findAll();
    } else if (filters.isFeatured) {
      prompts = await this.promptRepository.findFeatured();
    } else {
      prompts = await this.promptRepository.findAll();
    }

    // Apply additional filters
    if (filters.authorId) {
      prompts = prompts.filter(
        (p) => p.authorId?.toString() === filters.authorId
      );
    }

    if (filters.organizationId) {
      prompts = prompts.filter(
        (p) => p.organizationId?.toString() === filters.organizationId
      );
    }

    return prompts;
  }

  /**
   * Increment prompt views
   */
  async incrementViews(id: string): Promise<void> {
    if (!id) {
      throw new Error('Prompt ID is required');
    }

    await this.promptRepository.incrementViews(id);
  }

  /**
   * Update prompt rating
   */
  async updateRating(id: string, rating: number): Promise<void> {
    if (!id) {
      throw new Error('Prompt ID is required');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    await this.promptRepository.updateRating(id, rating);
  }

  /**
   * Get prompt statistics
   *
   * @description Retrieves comprehensive statistics about all prompts in the system.
   * Useful for analytics dashboards and reporting.
   *
   * @returns {Promise<Object>} Statistics object containing:
   *   - totalPrompts: Total number of prompts
   *   - promptsByCategory: Breakdown by category
   *   - promptsByRole: Breakdown by role
   *   - promptsByDifficulty: Breakdown by difficulty level
   *   - featuredPrompts: Count of featured prompts
   *   - publicPrompts: Count of public prompts
   *
   * @example
   * const stats = await promptService.getPromptStats();
   * console.log(`Total Prompts: ${stats.totalPrompts}`);
   * console.log(`Featured: ${stats.featuredPrompts}`);
   * console.log('By Category:', stats.promptsByCategory);
   * // Output:
   * // Total Prompts: 150
   * // Featured: 25
   * // By Category: { 'code-generation': 45, 'writing': 30, 'analysis': 20, ... }
   */
  async getPromptStats(): Promise<{
    totalPrompts: number;
    promptsByCategory: Record<string, number>;
    promptsByRole: Record<string, number>;
    promptsByDifficulty: Record<string, number>;
    featuredPrompts: number;
    publicPrompts: number;
  }> {
    const allPrompts = await this.promptRepository.findAll();
    const totalPrompts = allPrompts.length;

    // Group by category
    const promptsByCategory = allPrompts.reduce(
      (acc, prompt) => {
        acc[prompt.category] = (acc[prompt.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by role
    const promptsByRole = allPrompts.reduce(
      (acc, prompt) => {
        if (prompt.role) {
          acc[prompt.role] = (acc[prompt.role] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by difficulty
    const promptsByDifficulty = allPrompts.reduce(
      (acc, prompt) => {
        acc[prompt.difficulty] = (acc[prompt.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const featuredPrompts = allPrompts.filter((p) => p.isFeatured).length;
    const publicPrompts = allPrompts.filter((p) => p.isPublic).length;

    return {
      totalPrompts,
      promptsByCategory,
      promptsByRole,
      promptsByDifficulty,
      featuredPrompts,
      publicPrompts,
    };
  }

  /**
   * Get prompt count
   */
  async getPromptCount(): Promise<number> {
    return await this.promptRepository.count();
  }
}

// Export singleton instance
export const promptService = new PromptService(new PromptRepository());
