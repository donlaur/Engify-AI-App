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
    super('favorites');
  }

  /**
   * Add item to favorites
   */
  async addFavorite(
    userId: string,
    itemType: 'prompt' | 'pattern' | 'pathway',
    itemId: string,
    metadata?: any
  ): Promise<Favorite> {
    // Check if already favorited
    const existing = await this.collection.findOne({
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
    const result = await this.collection.deleteOne({
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
    const count = await this.collection.countDocuments({
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
    const query: any = { userId };
    if (itemType) {
      query.itemType = itemType;
    }

    const favorites = await this.collection
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
    return this.collection.countDocuments({
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
    const results = await this.collection
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

    return results.map((r: any) => ({
      itemId: r._id,
      count: r.count,
    }));
  }
}

export const favoriteService = new FavoriteService();
