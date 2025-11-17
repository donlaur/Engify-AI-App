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
      const duplicateError = new Error('Duplicate prompt detected');
      (duplicateError as any).duplicateMatches = duplicateCheck.matches;
      throw duplicateError;
    }

    // Generate slug from title if not provided
    // IMPORTANT: Do NOT append ID - slugs should be clean and SEO-friendly
    const { generateUniqueSlug } = await import('@/lib/utils/slug');

    // Check for existing slugs to ensure uniqueness
    const existingPrompts = await this.promptRepository.findAll();
    const existingSlugs = new Set(existingPrompts.map(p => p.slug).filter(Boolean) as string[]);
    
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
          .filter(p => p.id !== id) // Exclude current prompt
          .map(p => p.slug)
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
   */
  async searchPrompts(query: string): Promise<Prompt[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    return await this.promptRepository.search(query.trim());
  }

  /**
   * Get prompts with filters
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
