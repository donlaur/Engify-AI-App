/**
 * User Service
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { User, UserSchema } from '@/lib/db/schema';

export class UserService extends BaseService<User> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super('users', UserSchema as any); // Zod schema type mismatch
  }

  async findByEmail(email: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.findOne({ email } as any); // MongoDB filter type
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ organizationId: new ObjectId(organizationId) } as any); // MongoDB filter type
  }

  async updateLastLogin(userId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.updateOne(userId, { lastLoginAt: new Date() } as any); // Partial type
  }
}

export const userService = new UserService();
