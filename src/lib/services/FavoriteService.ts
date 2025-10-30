/**
 * Favorite Service
 * Manages user favorites (prompts, patterns, pathways)
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';

export interface Favorite {
  _id?: ObjectId;
  userId: string;
  itemType: 'prompt' | 'pattern' | 'pathway';
  itemId: string;
  createdAt: Date;
  metadata?: {
    title?: string;
    category?: string;
    tags?: string[];
  };
}

export class FavoriteService extends BaseService<Favorite> {
  constructor() {
    // Provide minimal placeholder schema for tests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const schema = {} as unknown as import('zod').ZodSchema<Favorite>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super('favorites', schema as any);
  }

  /**
   * Add item to favorites
   */
  async addFavorite(
    userId: string,
    itemType: 'prompt' | 'pattern' | 'pathway',
    itemId: string,
    metadata?: Favorite['metadata']
  ): Promise<Favorite> {
    // Check if already favorited
    const collection = await this.getCollection();
    const existing = await collection.findOne({
      userId,
      itemType,
      itemId,
    });

    if (existing) {
      return existing as Favorite;
    }

    const favorite: Favorite = {
      userId,
      itemType,
      itemId,
      createdAt: new Date(),
      metadata,
    };

    const result = await this.create(favorite);
    return result;
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(
    userId: string,
    itemType: 'prompt' | 'pattern' | 'pathway',
    itemId: string
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({
      userId,
      itemType,
      itemId,
    });

    return result.deletedCount > 0;
  }

  /**
   * Check if item is favorited
   */
  async isFavorited(
    userId: string,
    itemType: 'prompt' | 'pattern' | 'pathway',
    itemId: string
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const count = await collection.countDocuments({
      userId,
      itemType,
      itemId,
    });

    return count > 0;
  }

  /**
   * Get user's favorites
   */
  async getUserFavorites(
    userId: string,
    itemType?: 'prompt' | 'pattern' | 'pathway'
  ): Promise<Favorite[]> {
    const query: Record<string, unknown> = { userId };
    if (itemType) {
      query.itemType = itemType;
    }

    const collection = await this.getCollection();
    const favorites = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return favorites as Favorite[];
  }

  /**
   * Get favorite count by item
   */
  async getFavoriteCount(
    itemType: 'prompt' | 'pattern' | 'pathway',
    itemId: string
  ): Promise<number> {
    const collection2 = await this.getCollection();
    return collection2.countDocuments({
      itemType,
      itemId,
    });
  }

  /**
   * Get most favorited items
   */
  async getMostFavorited(
    itemType: 'prompt' | 'pattern' | 'pathway',
    limit: number = 10
  ): Promise<Array<{ itemId: string; count: number }>> {
    const collection3 = await this.getCollection();
    const results = await collection3
      .aggregate([
        { $match: { itemType } },
        {
          $group: {
            _id: '$itemId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    return results.map((r: unknown) => {
      const item = r as { _id: string; count: number };
      return {
        itemId: item._id,
        count: item.count,
      };
    });
  }
}

export const favoriteService = new FavoriteService();
