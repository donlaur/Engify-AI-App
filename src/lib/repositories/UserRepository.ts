/**
 * MongoDB User Repository Implementation
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { User } from '@/types/auth';
import { IUserRepository } from './IUserRepository';
import { ObjectId } from 'mongodb';

export class UserRepository implements IUserRepository {
  private collectionName = 'users';

  async findById(id: string): Promise<User | null> {
    const db = await getMongoDb();
    const user = await db.collection<User>(this.collectionName).findOne({ 
      _id: new ObjectId(id) 
    });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = await getMongoDb();
    return db.collection<User>(this.collectionName).findOne({ email });
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await getMongoDb();
    const now = new Date();
    
    const user = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.collectionName).insertOne(user);
    
    return {
      ...user,
      id: result.insertedId.toString(),
    } as User;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const db = await getMongoDb();
    
    const result = await db.collection<User>(this.collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...data, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.collectionName).deleteOne({ 
      _id: new ObjectId(id) 
    });
    return result.deletedCount > 0;
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    const db = await getMongoDb();
    return db.collection<User>(this.collectionName)
      .find({ organizationId })
      .toArray();
  }
}
