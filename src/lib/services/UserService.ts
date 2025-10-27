/**
 * User Service
 * Enhanced with career context support
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { User, UserSchema } from '@/lib/db/schema';
import { UserCareerContext, CareerLevel, CompanySize, CareerGoal } from '@/lib/types/user';

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

  /**
   * Update user career context
   */
  async updateCareerContext(
    userId: string,
    careerContext: Partial<UserCareerContext>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.updateOne(userId, { careerContext } as any);
  }

  /**
   * Get users by career level
   */
  async findByCareerLevel(level: CareerLevel): Promise<User[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ 'careerContext.level': level } as any);
  }

  /**
   * Get users by company size
   */
  async findByCompanySize(size: CompanySize): Promise<User[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ 'careerContext.companySize': size } as any);
  }

  /**
   * Get users with specific career goal
   */
  async findByCareerGoal(goal: CareerGoal): Promise<User[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.find({ 'careerContext.careerGoal': goal } as any);
  }

  /**
   * Get career context statistics
   */
  async getCareerStats(): Promise<{
    byLevel: Record<CareerLevel, number>;
    byCompanySize: Record<CompanySize, number>;
    byGoal: Record<CareerGoal, number>;
  }> {
    const db = await this.getDb();
    
    const [byLevel, byCompanySize, byGoal] = await Promise.all([
      db.collection(this.collectionName).aggregate([
        { $group: { _id: '$careerContext.level', count: { $sum: 1 } } },
      ]).toArray(),
      db.collection(this.collectionName).aggregate([
        { $group: { _id: '$careerContext.companySize', count: { $sum: 1 } } },
      ]).toArray(),
      db.collection(this.collectionName).aggregate([
        { $group: { _id: '$careerContext.careerGoal', count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    return {
      byLevel: byLevel.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCompanySize: byCompanySize.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byGoal: byGoal.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }
}

export const userService = new UserService();
