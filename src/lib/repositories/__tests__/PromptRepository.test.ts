/**
 * PromptRepository Tests
 *
 * Tests the MongoDB implementation of IPromptRepository.
 * These tests demonstrate:
 * - Repository pattern implementation correctness
 * - Database operation handling
 * - Error handling and edge cases
 * - Type safety with MongoDB operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection, Db, ObjectId } from 'mongodb';
import { PromptRepository } from '../mongodb/PromptRepository';
import { connectDB } from '@/lib/db/mongodb';
import type { PromptTemplate } from '@/lib/db/schema';

// Mock the MongoDB connection
vi.mock('@/lib/db/mongodb', () => ({
  connectDB: vi.fn(),
}));

describe('PromptRepository', () => {
  let promptRepository: PromptRepository;
  let mockCollection: Collection<PromptTemplate>;
  let mockFns: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    insertOne: ReturnType<typeof vi.fn>;
    findOneAndUpdate: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
    countDocuments: ReturnType<typeof vi.fn>;
    updateOne: ReturnType<typeof vi.fn>;
  };
  let mockDb: Db;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock collection fns
    mockFns = {
      findOne: vi.fn(),
      find: vi.fn(),
      insertOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      deleteOne: vi.fn(),
      countDocuments: vi.fn(),
      updateOne: vi.fn(),
    };
    mockCollection = mockFns as unknown as Collection<PromptTemplate>;

    // Create mock database
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    } as unknown as Db;

    // Mock connectDB to return our mock database
    (connectDB as unknown as vi.Mock).mockResolvedValue(mockDb);

    // Create repository instance
    promptRepository = new PromptRepository();
  });

  describe('findById', () => {
    it('should find prompt by ID successfully', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      const expectedPrompt: PromptTemplate = {
        _id: new ObjectId(promptId),
        title: 'Test Prompt',
        description: 'A test prompt',
        content: 'This is a test prompt content',
        category: 'engineering',
        role: 'junior_engineer',
        tags: ['test', 'example'],
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

      mockFns.findOne.mockResolvedValue(expectedPrompt);

      // Act
      const result = await promptRepository.findById(promptId);

      // Assert
      expect(result).toEqual(expectedPrompt);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('should return null when prompt not found', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      mockFns.findOne.mockResolvedValue(null);

      // Act
      const result = await promptRepository.findById(promptId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByCategory', () => {
    it('should find prompts by category successfully', async () => {
      // Arrange
      const category = 'engineering';
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
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

      mockFns.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedPrompts),
      });

      // Act
      const result = await promptRepository.findByCategory(category);

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockCollection.find).toHaveBeenCalledWith({ category });
    });
  });

  describe('findByTag', () => {
    it('should find prompts by tag successfully', async () => {
      // Arrange
      const tag = 'javascript';
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          title: 'JavaScript Prompt',
          description: 'JavaScript related',
          content: 'Write JavaScript code...',
          category: 'engineering',
          role: 'junior_engineer',
          tags: ['javascript', 'code'],
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

      mockFns.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedPrompts),
      });

      // Act
      const result = await promptRepository.findByTag(tag);

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockCollection.find).toHaveBeenCalledWith({
        tags: { $in: [tag] },
      });
    });
  });

  describe('search', () => {
    it('should search prompts by text successfully', async () => {
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

      mockFns.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedPrompts),
      });

      // Act
      const result = await promptRepository.search(query);

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      });
    });
  });

  describe('findPublic', () => {
    it('should find public prompts successfully', async () => {
      // Arrange
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          title: 'Public Prompt',
          description: 'A public prompt',
          content: 'This is a public prompt',
          category: 'general',
          role: 'junior_engineer',
          tags: ['public'],
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

      mockFns.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedPrompts),
      });

      // Act
      const result = await promptRepository.findPublic();

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockCollection.find).toHaveBeenCalledWith({ isPublic: true });
    });
  });

  describe('findFeatured', () => {
    it('should find featured prompts successfully', async () => {
      // Arrange
      const expectedPrompts: PromptTemplate[] = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Featured Prompt',
          description: 'A featured prompt',
          content: 'This is a featured prompt',
          category: 'general',
          role: 'engineer',
          tags: ['featured'],
          difficulty: 'intermediate',
          estimatedTime: 10,
          isPublic: true,
          isFeatured: true,
          authorId: null,
          organizationId: null,
          stats: {
            views: 100,
            favorites: 10,
            uses: 50,
            averageRating: 4.5,
            totalRatings: 20,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(expectedPrompts),
      });

      // Act
      const result = await promptRepository.findFeatured();

      // Assert
      expect(result).toEqual(expectedPrompts);
      expect(mockCollection.find).toHaveBeenCalledWith({ isFeatured: true });
    });
  });

  describe('incrementViews', () => {
    it('should increment views successfully', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      mockFns.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // Act
      await promptRepository.incrementViews(promptId);

      // Assert
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $inc: { 'stats.views': 1 },
          $set: { updatedAt: expect.any(Date) },
        }
      );
    });
  });

  describe('updateRating', () => {
    it('should update rating successfully', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      const rating = 4;
      const existingPrompt: PromptTemplate = {
        _id: new ObjectId(promptId),
        title: 'Test Prompt',
        description: 'A test prompt',
        content: 'Test content',
        category: 'general',
        role: 'junior_engineer',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: null,
        organizationId: null,
        stats: {
          views: 10,
          favorites: 2,
          uses: 5,
          averageRating: 3.0,
          totalRatings: 2,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFns.findOne.mockResolvedValue(existingPrompt);
      mockFns.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // Act
      await promptRepository.updateRating(promptId, rating);

      // Assert
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: {
            'stats.averageRating': expect.any(Number),
            'stats.totalRatings': 3,
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it('should throw error when prompt not found for rating update', async () => {
      // Arrange
      const promptId = '507f1f77bcf86cd799439011';
      const rating = 4;
      mockFns.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        promptRepository.updateRating(promptId, rating)
      ).rejects.toThrow('Failed to update rating');
    });
  });

  describe('create', () => {
    it('should create prompt successfully', async () => {
      // Arrange
      const promptData = {
        title: 'New Prompt',
        description: 'A new prompt',
        content: 'This is new prompt content',
        category: 'code-generation',
        role: 'engineer',
        tags: ['new'],
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

      mockFns.insertOne.mockResolvedValue({
        insertedId: new ObjectId('507f1f77bcf86cd799439011'),
      });

      // Act
      const result = await promptRepository.create(promptData);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          ...promptData,
          _id: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          ...promptData,
          _id: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  describe('count', () => {
    it('should return prompt count successfully', async () => {
      // Arrange
      const expectedCount = 25;
      mockFns.countDocuments.mockResolvedValue(expectedCount);

      // Act
      const result = await promptRepository.count();

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith();
    });
  });
});
