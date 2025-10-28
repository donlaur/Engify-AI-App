/**
 * Repository Pattern Integration Tests
 * 
 * Tests the complete Repository Pattern implementation working together.
 * These tests demonstrate:
 * - Full stack integration (API -> Service -> Repository -> Database)
 * - Dependency injection working end-to-end
 * - Business logic validation through all layers
 * - Error handling across the entire stack
 */

import { DIContainer, SERVICE_IDS } from '../../di/Container';
import { UserRepository } from '../mongodb/UserRepository';
import { PromptRepository } from '../mongodb/PromptRepository';
import { UserService } from '../../services/UserService';
import { PromptService } from '../../services/PromptService';
import { connectDB } from '@/lib/db/mongodb';
import type { User, PromptTemplate } from '@/lib/db/schema';

// Mock MongoDB connection
jest.mock('@/lib/db/mongodb', () => ({
  connectDB: jest.fn(),
}));

describe('Repository Pattern Integration', () => {
  let container: DIContainer;
  let mockDb: any;
  let mockUserCollection: any;
  let mockPromptCollection: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock collections
    mockUserCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn(),
      updateOne: jest.fn(),
    };

    mockPromptCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn(),
      updateOne: jest.fn(),
    };

    // Create mock database
    mockDb = {
      collection: jest.fn().mockImplementation((name) => {
        if (name === 'users') return mockUserCollection;
        if (name === 'prompts') return mockPromptCollection;
        return {};
      }),
    };

    // Mock connectDB
    (connectDB as jest.Mock).mockResolvedValue(mockDb);

    // Create fresh container for each test
    container = new DIContainer();

    // Register repositories
    container.registerSingleton(SERVICE_IDS.USER_REPOSITORY, () => {
      return new UserRepository();
    });

    container.registerSingleton(SERVICE_IDS.PROMPT_REPOSITORY, () => {
      return new PromptRepository();
    });

    // Register services
    container.registerSingleton(SERVICE_IDS.USER_SERVICE, () => {
      const userRepository = container.resolve(SERVICE_IDS.USER_REPOSITORY);
      return new UserService(userRepository);
    });

    container.registerSingleton(SERVICE_IDS.PROMPT_SERVICE, () => {
      const promptRepository = container.resolve(SERVICE_IDS.PROMPT_REPOSITORY);
      return new PromptService(promptRepository);
    });
  });

  describe('User Operations Integration', () => {
    it('should create and retrieve user through full stack', async () => {
      // Arrange
      const userData = {
        email: 'integration@example.com',
        name: 'Integration Test User',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdUser: User = {
        ...userData,
        _id: '507f1f77bcf86cd799439011',
      };

      // Mock database operations
      mockUserCollection.insertOne.mockResolvedValue({ insertedId: createdUser._id });
      mockUserCollection.findOne.mockResolvedValue(createdUser);

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);
      const created = await userService.createUser(userData);
      const retrieved = await userService.getUserById(created._id);

      // Assert
      expect(created).toEqual(expect.objectContaining({
        email: 'integration@example.com',
        name: 'Integration Test User',
        role: 'user',
        plan: 'free',
      }));

      expect(retrieved).toEqual(expect.objectContaining({
        email: 'integration@example.com',
        name: 'Integration Test User',
      }));

      // Verify database calls
      expect(mockUserCollection.insertOne).toHaveBeenCalled();
      expect(mockUserCollection.findOne).toHaveBeenCalled();
    });

    it('should handle user creation validation errors', async () => {
      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);

      // Assert
      await expect(userService.createUser({} as any)).rejects.toThrow(
        'Email is required'
      );
    });

    it('should update user through full stack', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const existingUser: User = {
        _id: userId,
        email: 'test@example.com',
        name: 'Original Name',
        role: 'user',
        plan: 'free',
        organizationId: null,
        emailVerified: null,
        image: null,
        password: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser: User = {
        ...existingUser,
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      // Mock database operations
      mockUserCollection.findOne.mockResolvedValueOnce(existingUser); // For existence check
      mockUserCollection.findOneAndUpdate.mockResolvedValue(updatedUser);

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);
      const result = await userService.updateUser(userId, { name: 'Updated Name' });

      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'Updated Name',
      }));

      // Verify database calls
      expect(mockUserCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
      expect(mockUserCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { $set: expect.objectContaining({ name: 'Updated Name' }) },
        { returnDocument: 'after' }
      );
    });
  });

  describe('Prompt Operations Integration', () => {
    it('should create and search prompts through full stack', async () => {
      // Arrange
      const promptData = {
        title: 'Integration Test Prompt',
        description: 'A prompt for integration testing',
        content: 'This is integration test content',
        category: 'code-generation',
        role: 'engineer',
        tags: ['integration', 'test'],
        difficulty: 'beginner',
        estimatedTime: 5,
        isPublic: true,
        isFeatured: false,
        authorId: '507f1f77bcf86cd799439011',
        organizationId: null,
      };

      const createdPrompt: PromptTemplate = {
        ...promptData,
        _id: '507f1f77bcf86cd799439012',
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

      const searchResults: PromptTemplate[] = [createdPrompt];

      // Mock database operations
      mockPromptCollection.insertOne.mockResolvedValue({ insertedId: createdPrompt._id });
      mockPromptCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(searchResults),
      });

      // Act
      const promptService = container.resolve(SERVICE_IDS.PROMPT_SERVICE);
      const created = await promptService.createPrompt(promptData);
      const searchResults_actual = await promptService.searchPrompts('integration');

      // Assert
      expect(created).toEqual(expect.objectContaining({
        title: 'Integration Test Prompt',
        description: 'A prompt for integration testing',
        category: 'code-generation',
      }));

      expect(searchResults_actual).toEqual([createdPrompt]);

      // Verify database calls
      expect(mockPromptCollection.insertOne).toHaveBeenCalled();
      expect(mockPromptCollection.find).toHaveBeenCalledWith({
        $or: expect.arrayContaining([
          { title: { $regex: 'integration', $options: 'i' } },
          { description: { $regex: 'integration', $options: 'i' } },
          { content: { $regex: 'integration', $options: 'i' } },
        ]),
      });
    });

    it('should handle prompt validation errors', async () => {
      // Act
      const promptService = container.resolve(SERVICE_IDS.PROMPT_SERVICE);

      // Assert
      await expect(promptService.createPrompt({} as any)).rejects.toThrow(
        'Title and content are required'
      );
    });
  });

  describe('Service Statistics Integration', () => {
    it('should generate user statistics through full stack', async () => {
      // Arrange
      const users: User[] = [
        {
          _id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'user',
          plan: 'free',
          organizationId: null,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          plan: 'pro',
          organizationId: null,
          emailVerified: null,
          image: null,
          password: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
        },
      ];

      // Mock database operations
      mockUserCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(users),
      });

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);
      const stats = await userService.getUserStats();

      // Assert
      expect(stats).toEqual({
        totalUsers: 2,
        usersByRole: { user: 1, admin: 1 },
        usersByPlan: { free: 1, pro: 1 },
        recentUsers: expect.any(Array),
      });

      // Verify database call
      expect(mockUserCollection.find).toHaveBeenCalledWith({});
    });

    it('should generate prompt statistics through full stack', async () => {
      // Arrange
      const prompts: PromptTemplate[] = [
        {
          _id: '1',
          title: 'Prompt 1',
          description: 'First prompt',
          content: 'Content 1',
          category: 'code-generation',
          role: 'engineer',
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
          _id: '2',
          title: 'Prompt 2',
          description: 'Second prompt',
          content: 'Content 2',
          category: 'testing',
          role: 'qa',
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

      // Mock database operations
      mockPromptCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(prompts),
      });

      // Act
      const promptService = container.resolve(SERVICE_IDS.PROMPT_SERVICE);
      const stats = await promptService.getPromptStats();

      // Assert
      expect(stats).toEqual({
        totalPrompts: 2,
        promptsByCategory: { 'code-generation': 1, testing: 1 },
        promptsByRole: { engineer: 1, qa: 1 },
        promptsByDifficulty: { beginner: 1, intermediate: 1 },
        featuredPrompts: 1,
        publicPrompts: 2,
      });

      // Verify database call
      expect(mockPromptCollection.find).toHaveBeenCalledWith({});
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      (connectDB as jest.Mock).mockRejectedValue(error);

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);

      // Assert
      await expect(userService.getAllUsers()).rejects.toThrow(
        'Failed to find all users'
      );
    });

    it('should handle repository errors and propagate them correctly', async () => {
      // Arrange
      const error = new Error('MongoDB operation failed');
      mockUserCollection.find.mockReturnValue({
        toArray: jest.fn().mockRejectedValue(error),
      });

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);

      // Assert
      await expect(userService.getAllUsers()).rejects.toThrow(
        'Failed to find all users'
      );
    });
  });

  describe('Dependency Injection Integration', () => {
    it('should resolve all services correctly', () => {
      // Act
      const userRepository = container.resolve(SERVICE_IDS.USER_REPOSITORY);
      const promptRepository = container.resolve(SERVICE_IDS.PROMPT_REPOSITORY);
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);
      const promptService = container.resolve(SERVICE_IDS.PROMPT_SERVICE);

      // Assert
      expect(userRepository).toBeInstanceOf(UserRepository);
      expect(promptRepository).toBeInstanceOf(PromptRepository);
      expect(userService).toBeInstanceOf(UserService);
      expect(promptService).toBeInstanceOf(PromptService);
    });

    it('should maintain singleton instances', () => {
      // Act
      const userService1 = container.resolve(SERVICE_IDS.USER_SERVICE);
      const userService2 = container.resolve(SERVICE_IDS.USER_SERVICE);

      // Assert
      expect(userService1).toBe(userService2);
    });
  });
});
