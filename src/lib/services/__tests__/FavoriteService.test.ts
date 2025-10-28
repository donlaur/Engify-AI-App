/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FavoriteService Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FavoriteService } from '../FavoriteService';

describe('FavoriteService', () => {
  let service: FavoriteService;
  const testUserId = 'test-user-123';
  const testItemId = 'test-item-456';

  beforeEach(() => {
    service = new FavoriteService();
  });

  describe('addFavorite', () => {
    it('should add a new favorite', async () => {
      const favorite = await service.addFavorite(
        testUserId,
        'prompt',
        testItemId,
        { title: 'Test Prompt' }
      );

      expect(favorite).toBeDefined();
      expect(favorite.userId).toBe(testUserId);
      expect(favorite.itemType).toBe('prompt');
      expect(favorite.itemId).toBe(testItemId);
    });

    it('should not duplicate favorites', async () => {
      const first = await service.addFavorite(testUserId, 'prompt', testItemId);
      const second = await service.addFavorite(testUserId, 'prompt', testItemId);

      expect(first._id).toEqual(second._id);
    });

    it('should handle different item types', async () => {
      const promptFav = await service.addFavorite(testUserId, 'prompt', 'prompt-1');
      const patternFav = await service.addFavorite(testUserId, 'pattern', 'pattern-1');
      const pathwayFav = await service.addFavorite(testUserId, 'pathway', 'pathway-1');

      expect(promptFav.itemType).toBe('prompt');
      expect(patternFav.itemType).toBe('pattern');
      expect(pathwayFav.itemType).toBe('pathway');
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', async () => {
      await service.addFavorite(testUserId, 'prompt', testItemId);
      const removed = await service.removeFavorite(testUserId, 'prompt', testItemId);

      expect(removed).toBe(true);

      const isFav = await service.isFavorited(testUserId, 'prompt', testItemId);
      expect(isFav).toBe(false);
    });

    it('should return false if favorite does not exist', async () => {
      const removed = await service.removeFavorite(testUserId, 'prompt', 'non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('isFavorited', () => {
    it('should return true for favorited items', async () => {
      await service.addFavorite(testUserId, 'prompt', testItemId);
      const isFav = await service.isFavorited(testUserId, 'prompt', testItemId);

      expect(isFav).toBe(true);
    });

    it('should return false for non-favorited items', async () => {
      const isFav = await service.isFavorited(testUserId, 'prompt', 'non-existent');
      expect(isFav).toBe(false);
    });
  });

  describe('getUserFavorites', () => {
    it('should get all user favorites', async () => {
      await service.addFavorite(testUserId, 'prompt', 'prompt-1');
      await service.addFavorite(testUserId, 'pattern', 'pattern-1');
      await service.addFavorite(testUserId, 'pathway', 'pathway-1');

      const favorites = await service.getUserFavorites(testUserId);
      expect(favorites.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by item type', async () => {
      await service.addFavorite(testUserId, 'prompt', 'prompt-1');
      await service.addFavorite(testUserId, 'pattern', 'pattern-1');

      const prompts = await service.getUserFavorites(testUserId, 'prompt');
      expect(prompts.every(f => f.itemType === 'prompt')).toBe(true);
    });

    it('should return empty array for user with no favorites', async () => {
      const favorites = await service.getUserFavorites('new-user');
      expect(favorites).toEqual([]);
    });
  });

  describe('getFavoriteCount', () => {
    it('should count favorites for an item', async () => {
      await service.addFavorite('user-1', 'prompt', testItemId);
      await service.addFavorite('user-2', 'prompt', testItemId);
      await service.addFavorite('user-3', 'prompt', testItemId);

      const count = await service.getFavoriteCount('prompt', testItemId);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should return 0 for items with no favorites', async () => {
      const count = await service.getFavoriteCount('prompt', 'non-existent');
      expect(count).toBe(0);
    });
  });

  describe('getMostFavorited', () => {
    it('should return most favorited items', async () => {
      // Add multiple favorites
      await service.addFavorite('user-1', 'prompt', 'popular-1');
      await service.addFavorite('user-2', 'prompt', 'popular-1');
      await service.addFavorite('user-3', 'prompt', 'popular-1');
      await service.addFavorite('user-4', 'prompt', 'popular-2');

      const mostFavorited = await service.getMostFavorited('prompt', 5);
      
      expect(mostFavorited.length).toBeGreaterThan(0);
      expect(mostFavorited[0].count).toBeGreaterThanOrEqual(mostFavorited[mostFavorited.length - 1]?.count || 0);
    });

    it('should respect limit parameter', async () => {
      const mostFavorited = await service.getMostFavorited('prompt', 3);
      expect(mostFavorited.length).toBeLessThanOrEqual(3);
    });
  });
});
