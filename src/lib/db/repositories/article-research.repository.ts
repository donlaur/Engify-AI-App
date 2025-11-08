/**
 * Article Research Repository
 * CRUD operations for article research data
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { 
  ArticleResearch, 
  ARTICLE_RESEARCH_COLLECTION 
} from '../schemas/article-research.schema';
import { ObjectId } from 'mongodb';

export class ArticleResearchRepository {
  /**
   * Get all articles by status
   */
  static async findByStatus(status: ArticleResearch['status']): Promise<ArticleResearch[]> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    return collection.find({ status }).toArray();
  }

  /**
   * Get article by working title
   */
  static async findByWorkingTitle(workingTitle: string): Promise<ArticleResearch | null> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    return collection.findOne({ workingTitle });
  }

  /**
   * Get article by ID
   */
  static async findById(id: string): Promise<ArticleResearch | null> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    return collection.findOne({ _id: new ObjectId(id) } as any);
  }

  /**
   * Insert new article research
   */
  static async insert(research: Omit<ArticleResearch, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    const doc: Omit<ArticleResearch, '_id'> = {
      ...research,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(doc as any);
    return result.insertedId.toString();
  }

  /**
   * Update article status
   */
  static async updateStatus(id: string, status: ArticleResearch['status']): Promise<void> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    await collection.updateOne(
      { _id: new ObjectId(id) } as any,
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );
  }

  /**
   * Update generated content
   */
  static async updateGenerated(
    id: string, 
    generated: ArticleResearch['generated']
  ): Promise<void> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    await collection.updateOne(
      { _id: new ObjectId(id) } as any,
      { 
        $set: { 
          generated,
          updatedAt: new Date()
        } 
      }
    );
  }

  /**
   * Delete article research
   */
  static async delete(id: string): Promise<void> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    await collection.deleteOne({ _id: new ObjectId(id) } as any);
  }

  /**
   * Get all articles (with optional limit)
   */
  static async findAll(limit?: number): Promise<ArticleResearch[]> {
    const db = await getMongoDb();
    const collection = db.collection<ArticleResearch>(ARTICLE_RESEARCH_COLLECTION);
    
    const query = collection.find({}).sort({ createdAt: -1 });
    
    if (limit) {
      query.limit(limit);
    }
    
    return query.toArray();
  }
}
