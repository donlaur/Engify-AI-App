/**
 * MongoDB Organization Repository Implementation
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { Organization } from '@/types/auth';
import { IOrganizationRepository } from './IOrganizationRepository';
import { ObjectId } from 'mongodb';

export class OrganizationRepository implements IOrganizationRepository {
  private collectionName = 'organizations';

  async findById(id: string): Promise<Organization | null> {
    const db = await getMongoDb();
    return db.collection<Organization>(this.collectionName).findOne({ 
      _id: new ObjectId(id) 
    });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const db = await getMongoDb();
    return db.collection<Organization>(this.collectionName).findOne({ slug });
  }

  async create(orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const db = await getMongoDb();
    const now = new Date();
    
    const org = {
      ...orgData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.collectionName).insertOne(org);
    
    return {
      ...org,
      id: result.insertedId.toString(),
    } as Organization;
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization | null> {
    const db = await getMongoDb();
    
    const result = await db.collection<Organization>(this.collectionName).findOneAndUpdate(
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
}
