/**
 * PromptService Tests
 *
 * Tests the business logic layer for prompt operations.
 * These tests demonstrate:
 * - Service layer business logic validation
 * - Repository pattern integration
 * - Error handling and edge cases
 * - Business rule enforcement
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PromptService } from '../../services/PromptService';
import { IPromptRepository } from '../interfaces/IRepository';
import type { PromptTemplate } from '@/lib/db/schema';
import { ObjectId } from 'mongodb';

// Mock repository implementation
const createMockPromptRepository = (): IPromptRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  findByUserId: vi.fn(),
  findByPattern: vi.fn(),
  findByTag: vi.fn(),
  findByCategory: vi.fn(),
  findPublic: vi.fn(),
  findFeatured: vi.fn(),
  findByRole: vi.fn(),
  findByDifficulty: vi.fn(),
  search: vi.fn(),
  incrementViews: vi.fn(),
  updateRating: vi.fn(),
});

describe('PromptService', () => {
  let promptService: PromptService;
  let mockRepository: IPromptRepository;

  beforeEach(() => {
    mockRepository = createMockPromptRepository();
    promptService = new PromptService(mockRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPrompt', () => {
    it('should create a prompt successfully', async () => {
      // Arrange
      const promptData = {
        title: 'Test Prompt',
        description: 'A test prompt',
        content: 'This is test content',
        category: 'engineering',
        role: 'junior_engineer',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: '507f1f77bcf86cd799439011',
        organizationId: null,
      };

      const expectedPrompt: PromptTemplate = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        title: 'Test Prompt',
        description: 'A test prompt',
        content: 'This is test content',
        category: 'engineering',
        role: 'junior_engineer',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: new ObjectId('507f1f77bcf86cd799439011'),
        organizationId: null,
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

      vi.mocked(mockRepository.create).mockResolvedValue(expectedPrompt);

      // Act
      const result = await promptService.createPrompt(promptData);

      // Assert
      expect(result).toEqual(expectedPrompt);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Prompt',
          description: 'A test prompt',
          content: 'This is test content',
          category: 'engineering',
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
        })
      );
    });

    it('should throw error if title is missing', async () => {
      // Arrange
      const promptData: Partial<
        Parameters<typeof promptService.createPrompt>[0]
      > = {
        description: 'A test prompt',
        content: 'This is test content',
        category: 'engineering',
      } as Partial<Parameters<typeof promptService.createPrompt>[0]>;

      // Act & Assert
      await expect(promptService.createPrompt(promptData)).rejects.toThrow(
        'Title and content are required'
      );
    });

    it('should throw error if content is missing', async () => {
      // Arrange
      const promptData: Partial<
        Parameters<typeof promptService.createPrompt>[0]
      > = {
        title: 'Test Prompt',
        description: 'A test prompt',
        category: 'engineering',
      } as Partial<Parameters<typeof promptService.createPrompt>[0]>;

      // Act & Assert
      await expect(promptService.createPrompt(promptData)).rejects.toThrow(
        'Title and content are required'
      );
    });

    it('should throw error if title is too long', async () => {
      // Arrange
      const promptData = {
        title: 'A'.repeat(201), // Too long
        description: 'A test prompt',
        content: 'This is test content',
        category: 'code-generation',
      };

      // Act & Assert
      await expect(promptService.createPrompt(promptData)).rejects.toThrow(
        'Title must be 200 characters or less'
      );
    });

    it('should throw error if description is too long', async () => {
      // Arrange
      const promptData = {
        title: 'Test Prompt',
        description: 'A'.repeat(1001), // Too long
        content: 'This is test content',
        category: 'code-generation',
      };

      // Act & Assert
      await expect(promptService.createPrompt(promptData)).rejects.toThrow(
        'Description must be 1000 characters or less'
      );
    });
  });

  describe('getPromptById', () => {
    it('should return prompt if found', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      const expectedPrompt: PromptTemplate = {
        _id: promptId,
        title: 'Test Prompt',
        description: 'A test prompt',
        content: 'This is test content',
        category: 'engineering',
        role: 'junior_engineer',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: null,
        organizationId: null,
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

      vi.mocked(mockRepository.findById).mockResolvedValue(expectedPrompt);

      // Act
      const result = await promptService.getPromptById(promptId.toString());

      // Assert
      expect(result).toEqual(expectedPrompt);
      expect(mockRepository.findById).toHaveBeenCalledWith(promptId.toString());
    });

    it('should return null if prompt not found', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      // Act
      const result = await promptService.getPromptById(promptId.toString());

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error if ID is missing', async () => {
      // Act & Assert
      await expect(promptService.getPromptById('')).rejects.toThrow(
        'Prompt ID is required'
      );
    });
  });

  describe('updatePrompt', () => {
    it('should update prompt successfully', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      const updateData = {
        title: 'Updated Prompt',
        description: 'Updated description',
      };

      const existingPrompt: PromptTemplate = {
        _id: promptId,
        title: 'Original Prompt',
        description: 'Original description',
        content: 'Original content',
        category: 'engineering',
        role: 'junior_engineer',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: null,
        organizationId: null,
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

      const updatedPrompt: PromptTemplate = {
        ...existingPrompt,
        title: 'Updated Prompt',
        description: 'Updated description',
        updatedAt: new Date(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(existingPrompt);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedPrompt);

      // Act
      const result = await promptService.updatePrompt(
        promptId.toString(),
        updateData
      );

      // Assert
      expect(result).toEqual(updatedPrompt);
      expect(mockRepository.findById).toHaveBeenCalledWith(promptId.toString());
      expect(mockRepository.update).toHaveBeenCalledWith(
        promptId.toString(),
        updateData
      );
    });

    it('should throw error if prompt not found', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      const updateData = { title: 'Updated Prompt' };

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(
        promptService.updatePrompt(promptId.toString(), updateData)
      ).rejects.toThrow('Prompt not found');
    });
  });

  describe('searchPrompts', () => {
    it('should search prompts successfully', async () => {
      // Arrange
      const query = 'javascript';
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          title: 'JavaScript Code Generation',
          description: 'Generate JavaScript code',
          content: 'Write JavaScript functions...',
          category: 'engineering',
          role: 'junior_engineer',
          tags: ['javascript'],
          difficulty: 'beginner',
          estimatedTime: 5,
          isPublic: true,
          isFeatured: false,
          authorId: null,
          organizationId: null,
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockRepository.search).mockResolvedValue(expectedPrompts);

      // Act
      const result = await promptService.searchPrompts(query);

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockRepository.search).toHaveBeenCalledWith(query.trim());
    });

    it('should throw error if query is too short', async () => {
      // Arrange
      const query = 'a'; // Too short

      // Act & Assert
      await expect(promptService.searchPrompts(query)).rejects.toThrow(
        'Search query must be at least 2 characters'
      );
    });

    it('should throw error if query is empty', async () => {
      // Arrange
      const query = '';

      // Act & Assert
      await expect(promptService.searchPrompts(query)).rejects.toThrow(
        'Search query must be at least 2 characters'
      );
    });
  });

  describe('getPromptsWithFilters', () => {
    it('should filter prompts by category', async () => {
      // Arrange
      const filters = { category: 'engineering' };
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Code Generation Prompt',
          description: 'Generates code',
          content: 'Generate code for...',
          category: 'engineering',
          role: 'junior_engineer',
          tags: ['code'],
          difficulty: 'beginner',
          estimatedTime: 5,
          isPublic: true,
          isFeatured: false,
          authorId: null,
          organizationId: null,
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockRepository.findByCategory).mockResolvedValue(
        expectedPrompts
      );

      // Act
      const result = await promptService.getPromptsWithFilters(filters);

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockRepository.findByCategory).toHaveBeenCalledWith('engineering');
    });

    it('should filter prompts by tags', async () => {
      // Arrange
      const filters = { tags: ['javascript', 'react'] };
      const tagPrompts: PromptTemplate[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'JavaScript Prompt',
          description: 'JavaScript related',
          content: 'Write JavaScript code...',
          category: 'engineering',
          role: 'junior_engineer',
          tags: ['javascript'],
          difficulty: 'intermediate',
          estimatedTime: 10,
          isPublic: true,
          isFeatured: false,
          authorId: null,
          organizationId: null,
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockRepository.findByTag)
        .mockResolvedValueOnce(tagPrompts) // First call for 'javascript'
        .mockResolvedValueOnce([]); // Second call for 'react' returns empty

      // Act
      const result = await promptService.getPromptsWithFilters(filters);

      // Assert
      expect(result).toEqual(tagPrompts);
      expect(mockRepository.findByTag).toHaveBeenCalledWith('javascript');
      expect(mockRepository.findByTag).toHaveBeenCalledWith('react');
    });
  });

  describe('incrementViews', () => {
    it('should increment views successfully', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      vi.mocked(mockRepository.incrementViews).mockResolvedValue();

      // Act
      await promptService.incrementViews(promptId.toString());

      // Assert
      expect(mockRepository.incrementViews).toHaveBeenCalledWith(
        promptId.toString()
      );
    });

    it('should throw error if ID is missing', async () => {
      // Act & Assert
      await expect(promptService.incrementViews('')).rejects.toThrow(
        'Prompt ID is required'
      );
    });
  });

  describe('updateRating', () => {
    it('should update rating successfully', async () => {
      // Arrange
      const promptId = new ObjectId('507f1f77bcf86cd799439011');
      const rating = 4;
      vi.mocked(mockRepository.updateRating).mockResolvedValue();

      // Act
      await promptService.updateRating(promptId.toString(), rating);

      // Assert
      expect(mockRepository.updateRating).toHaveBeenCalledWith(
        promptId.toString(),
        rating
      );
    });

    it('should throw error if rating is invalid', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      const rating = 6; // Invalid rating

      // Act & Assert
      await expect(
        promptService.updateRating(promptId, rating)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error if rating is too low', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      const rating = 0; // Invalid rating

      // Act & Assert
      await expect(
        promptService.updateRating(promptId, rating)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('getPromptStats', () => {
    it('should return prompt statistics', async () => {
      // Arrange
      const prompts: PromptTemplate[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439021'),
          title: 'Prompt 1',
          description: 'First prompt',
          content: 'Content 1',
          category: 'engineering',
          role: 'junior_engineer',
          tags: ['test'],
          difficulty: 'beginner',
          estimatedTime: 5,
          isPublic: true,
          isFeatured: false,
          authorId: null,
          organizationId: null,
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439022'),
          title: 'Prompt 2',
          description: 'Second prompt',
          content: 'Content 2',
          category: 'engineering',
          role: 'manager',
          tags: ['test'],
          difficulty: 'intermediate',
          estimatedTime: 10,
          isPublic: true,
          isFeatured: true,
          authorId: null,
          organizationId: null,
          stats: {
            views: 0,
            favorites: 0,
            uses: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue(prompts);

      // Act
      const result = await promptService.getPromptStats();

      // Assert
      expect(result).toEqual({
        totalPrompts: 2,
        promptsByCategory: { engineering: 2 },
        promptsByRole: { junior_engineer: 1, manager: 1 },
        promptsByDifficulty: { beginner: 1, intermediate: 1 },
        featuredPrompts: 1,
        publicPrompts: 2,
      });
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });
});
