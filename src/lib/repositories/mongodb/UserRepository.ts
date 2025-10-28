/**
 * MongoDB User Repository Implementation
 * 
 * Implements IUserRepository interface using MongoDB/Mongoose.
 * This provides concrete implementation of the Repository Pattern
 * for User entity operations.
 * 
 * Benefits:
 * - Database-agnostic business logic
 * - Easy to test with mock implementations
 * - Clean separation of data access concerns
 * - Follows SOLID principles (Dependency Inversion)
 */

import { ObjectId } from 'mongodb';
import { connectDB } from '@/lib/db/mongodb';
import { IUserRepository } from '../interfaces/IRepository';
import type { User } from '@/lib/db/schema';

export class UserRepository implements IUserRepository {
  private collectionName = 'users';

  /**
   * Get MongoDB collection
   */
  private async getCollection() {
    const db = await connectDB();
    return db.collection<User>(this.collectionName);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user by ID');
    }
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({}).toArray();
      return users;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Failed to find all users');
    }
  }

  /**
   * Create a new user
   */
  async create(userData: Omit<User, '_id'>): Promise<User> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      
      const newUser: User = {
        ...userData,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      };

      await collection.insertOne(newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user by ID
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const collection = await this.getCollection();
      
      const updateData = {
        ...userData,
        updatedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to count users');
    }
  }

  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ email });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user by email');
    }
  }

  /**
   * Find user by OAuth provider and provider ID
   */
  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({
        [`accounts.${provider}.providerId`]: providerId
      });
      return user;
    } catch (error) {
      console.error('Error finding user by provider:', error);
      throw new Error('Failed to find user by provider');
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({ role }).toArray();
      return users;
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw new Error('Failed to find users by role');
    }
  }

  /**
   * Find users by organization
   */
  async findByOrganization(organizationId: string): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({ 
        organizationId: new ObjectId(organizationId) 
      }).toArray();
      return users;
    } catch (error) {
      console.error('Error finding users by organization:', error);
      throw new Error('Failed to find users by organization');
    }
  }

  /**
   * Find users by plan
   */
  async findByPlan(plan: string): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({ plan }).toArray();
      return users;
    } catch (error) {
      console.error('Error finding users by plan:', error);
      throw new Error('Failed to find users by plan');
    }
  }

  /**
   * Find users created within date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).toArray();
      return users;
    } catch (error) {
      console.error('Error finding users by date range:', error);
      throw new Error('Failed to find users by date range');
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }
}
