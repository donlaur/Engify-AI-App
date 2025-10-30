/**
 * MongoDB Prompt Repository Implementation
 *
 * Implements IPromptRepository interface using MongoDB/Mongoose.
 * This provides concrete implementation of the Repository Pattern
 * for Prompt entity operations.
 *
 * Benefits:
 * - Database-agnostic business logic
 * - Easy to test with mock implementations
 * - Clean separation of data access concerns
 * - Follows SOLID principles (Dependency Inversion)
 */

import { ObjectId } from 'mongodb';
import { connectDB } from '@/lib/db/mongodb';
import { IPromptRepository } from '../interfaces/IRepository';
import type { PromptTemplate } from '@/lib/db/schema';

// Use PromptTemplate as the Prompt type for the repository
type Prompt = PromptTemplate;

export class PromptRepository implements IPromptRepository {
  private collectionName = 'prompts';

  /**
   * Get MongoDB collection
   */
  private async getCollection() {
    const db = await connectDB();
    return db.collection<Prompt>(this.collectionName);
  }

  /**
   * Find prompt by ID
   */
  async findById(id: string): Promise<Prompt | null> {
    try {
      const collection = await this.getCollection();
      const prompt = await collection.findOne({ _id: new ObjectId(id) });
      return prompt;
    } catch (error) {
      console.error('Error finding prompt by ID:', error);
      throw new Error('Failed to find prompt by ID');
    }
  }

  /**
   * Find all prompts
   */
  async findAll(): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection.find({}).toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding all prompts:', error);
      throw new Error('Failed to find all prompts');
    }
  }

  /**
   * Create a new prompt
   */
  async create(promptData: Omit<Prompt, '_id'>): Promise<Prompt> {
    try {
      const collection = await this.getCollection();
      const now = new Date();

      const newPrompt: Prompt = {
        ...promptData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      };

      await collection.insertOne(newPrompt);
      return newPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw new Error('Failed to create prompt');
    }
  }

  /**
   * Update prompt by ID
   */
  async update(
    id: string,
    promptData: Partial<Prompt>
  ): Promise<Prompt | null> {
    try {
      const collection = await this.getCollection();

      const updateData = {
        ...promptData,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result || null;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw new Error('Failed to update prompt');
    }
  }

  /**
   * Delete prompt by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw new Error('Failed to delete prompt');
    }
  }

  /**
   * Count total prompts
   */
  async count(): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting prompts:', error);
      throw new Error('Failed to count prompts');
    }
  }

  /**
   * Find prompts by user ID
   */
  async findByUserId(userId: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          authorId: new ObjectId(userId),
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding prompts by user ID:', error);
      throw new Error('Failed to find prompts by user ID');
    }
  }

  /**
   * Find prompts by pattern type
   */
  async findByPattern(pattern: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          pattern: pattern,
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding prompts by pattern:', error);
      throw new Error('Failed to find prompts by pattern');
    }
  }

  /**
   * Find prompts by tag
   */
  async findByTag(tag: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          tags: { $in: [tag] },
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding prompts by tag:', error);
      throw new Error('Failed to find prompts by tag');
    }
  }

  /**
   * Find prompts by category
   */
  async findByCategory(category: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          category: category,
        } as unknown as Partial<Prompt>)
        .toArray();
      return prompts as Prompt[];
    } catch (error) {
      console.error('Error finding prompts by category:', error);
      throw new Error('Failed to find prompts by category');
    }
  }

  /**
   * Find public prompts
   */
  async findPublic(): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          isPublic: true,
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding public prompts:', error);
      throw new Error('Failed to find public prompts');
    }
  }

  /**
   * Find featured prompts
   */
  async findFeatured(): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          isFeatured: true,
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error finding featured prompts:', error);
      throw new Error('Failed to find featured prompts');
    }
  }

  /**
   * Search prompts by text
   */
  async search(query: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        })
        .toArray();
      return prompts;
    } catch (error) {
      console.error('Error searching prompts:', error);
      throw new Error('Failed to search prompts');
    }
  }

  /**
   * Find prompts by role
   */
  async findByRole(role: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          role: role,
        } as unknown as Partial<Prompt>)
        .toArray();
      return prompts as Prompt[];
    } catch (error) {
      console.error('Error finding prompts by role:', error);
      throw new Error('Failed to find prompts by role');
    }
  }

  /**
   * Find prompts by difficulty level
   */
  async findByDifficulty(difficulty: string): Promise<Prompt[]> {
    try {
      const collection = await this.getCollection();
      const prompts = await collection
        .find({
          difficulty: difficulty,
        } as unknown as Partial<Prompt>)
        .toArray();
      return prompts as Prompt[];
    } catch (error) {
      console.error('Error finding prompts by difficulty:', error);
      throw new Error('Failed to find prompts by difficulty');
    }
  }

  /**
   * Increment prompt view count
   */
  async incrementViews(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { 'stats.views': 1 },
          $set: { updatedAt: new Date() },
        }
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw new Error('Failed to increment views');
    }
  }

  /**
   * Update prompt rating
   */
  async updateRating(id: string, rating: number): Promise<void> {
    try {
      const collection = await this.getCollection();

      // Get current prompt to calculate new average
      const prompt = await this.findById(id);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const currentTotal =
        prompt.stats.averageRating * prompt.stats.totalRatings;
      const newTotal = currentTotal + rating;
      const newCount = prompt.stats.totalRatings + 1;
      const newAverage = newTotal / newCount;

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'stats.averageRating': newAverage,
            'stats.totalRatings': newCount,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      console.error('Error updating rating:', error);
      throw new Error('Failed to update rating');
    }
  }
}
