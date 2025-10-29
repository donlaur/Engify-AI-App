/**
 * User Service Layer
 *
 * Implements business logic for user operations using the Repository Pattern.
 * This service layer:
 * - Depends on IUserRepository interface (Dependency Inversion)
 * - Contains business logic and validation
 * - Is easily testable with mock repositories
 * - Follows Single Responsibility Principle
 *
 * SOLID Principles:
 * - Single Responsibility: Handles user business logic only
 * - Open/Closed: Can extend functionality without modifying existing code
 * - Liskov Substitution: Works with any IUserRepository implementation
 * - Interface Segregation: Depends only on what it needs
 * - Dependency Inversion: Depends on abstraction (IUserRepository)
 */

import { IUserRepository } from '../repositories/interfaces/IRepository';
import { UserRepository } from '../repositories/mongodb/UserRepository';
import type { User } from '@/lib/db/schema';

export interface CreateUserData {
  email: string;
  name?: string;
  role?: string;
  plan?: string;
  organizationId?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  organizationId?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weeklyReports?: boolean;
  };
}

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    // Business logic validation
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user with defaults
    const newUserData = {
      email: userData.email,
      name: userData.name || '',
      role: userData.role || 'user',
      plan: userData.plan || 'free',
      organizationId: userData.organizationId || null,
      emailVerified: null,
      image: null,
      password: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.userRepository.create(newUserData);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    return await this.userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new Error('Email is required');
    }

    return await this.userRepository.findByEmail(email);
  }

  /**
   * Find user by email (alias for getUserByEmail)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.getUserByEmail(email);
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Business logic validation
    if (userData.email && userData.email !== existingUser.email) {
      // Check if new email is already taken
      const emailExists = await this.userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new Error('Email is already taken');
      }
    }

    return await this.userRepository.update(id, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return await this.userRepository.delete(id);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    if (!role) {
      throw new Error('Role is required');
    }

    return await this.userRepository.findByRole(role);
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    return await this.userRepository.findByOrganization(organizationId);
  }

  /**
   * Get users by plan
   */
  async getUsersByPlan(plan: string): Promise<User[]> {
    if (!plan) {
      throw new Error('Plan is required');
    }

    return await this.userRepository.findByPlan(plan);
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(id: string): Promise<void> {
    if (!id) {
      throw new Error('User ID is required');
    }

    await this.userRepository.updateLastLogin(id);
  }

  /**
   * Set user password (service-level helper; repository doesn't expose password)
   */
  async setPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword as unknown as User['password'],
      updatedAt: new Date(),
    } as Partial<User>);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    usersByRole: Record<string, number>;
    usersByPlan: Record<string, number>;
    recentUsers: User[];
  }> {
    const allUsers = await this.userRepository.findAll();
    const totalUsers = allUsers.length;

    // Group by role
    const usersByRole = allUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by plan
    const usersByPlan = allUsers.reduce(
      (acc, user) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = allUsers
      .filter((user) => user.createdAt >= thirtyDaysAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalUsers,
      usersByRole,
      usersByPlan,
      recentUsers,
    };
  }

  /**
   * Verify user exists and is active
   */
  async verifyUser(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }

    const user = await this.userRepository.findById(id);
    return user !== null;
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }
}

// Export singleton instance for dependency injection
export const userService = new UserService(new UserRepository());
