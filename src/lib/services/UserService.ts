/**
 * User Service
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { User, UserSchema } from '@/lib/db/schema';

export class UserService extends BaseService<User> {
  constructor() {
    super('users', UserSchema);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as any);
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.find({ organizationId: new ObjectId(organizationId) } as any);
  }

  async updateRole(userId: string, role: string): Promise<User | null> {
    return this.updateOne(userId, { role } as any);
  }
}

export const userService = new UserService();
