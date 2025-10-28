/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ActivityService Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityService } from '../ActivityService';

describe('ActivityService', () => {
  let service: ActivityService;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    service = new ActivityService();
  });

  describe('trackActivity', () => {
    it('should track a view activity', async () => {
      const activity = await service.trackActivity(
        testUserId,
        'view',
        'prompt',
        'prompt-123',
        { duration: 30 }
      );

      expect(activity).toBeDefined();
      expect(activity.userId).toBe(testUserId);
      expect(activity.type).toBe('view');
      expect(activity.itemType).toBe('prompt');
      expect(activity.metadata?.duration).toBe(30);
    });

    it('should track different activity types', async () => {
      const view = await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      const use = await service.trackActivity(testUserId, 'use', 'prompt', 'p1');
      const favorite = await service.trackActivity(testUserId, 'favorite', 'prompt', 'p1');

      expect(view.type).toBe('view');
      expect(use.type).toBe('use');
      expect(favorite.type).toBe('favorite');
    });

    it('should include timestamp', async () => {
      const activity = await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      expect(activity.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getUserActivity', () => {
    it('should get user activity history', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'use', 'pattern', 'pat1');
      await service.trackActivity(testUserId, 'favorite', 'pathway', 'path1');

      const activities = await service.getUserActivity(testUserId, 50, 0);
      expect(activities.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect limit parameter', async () => {
      const activities = await service.getUserActivity(testUserId, 2, 0);
      expect(activities.length).toBeLessThanOrEqual(2);
    });

    it('should support pagination', async () => {
      const page1 = await service.getUserActivity(testUserId, 2, 0);
      const page2 = await service.getUserActivity(testUserId, 2, 2);

      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0]._id).not.toEqual(page2[0]._id);
      }
    });
  });

  describe('getActivityByType', () => {
    it('should filter activities by type', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'view', 'prompt', 'p2');
      await service.trackActivity(testUserId, 'use', 'prompt', 'p3');

      const views = await service.getActivityByType(testUserId, 'view', 50);
      expect(views.every(a => a.type === 'view')).toBe(true);
    });
  });

  describe('getRecentlyViewed', () => {
    it('should get recently viewed items', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'view', 'prompt', 'p2');

      const recent = await service.getRecentlyViewed(testUserId);
      expect(recent.length).toBeGreaterThanOrEqual(2);
      expect(recent.every(a => a.type === 'view')).toBe(true);
    });

    it('should filter by item type', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'view', 'pattern', 'pat1');

      const prompts = await service.getRecentlyViewed(testUserId, 'prompt');
      expect(prompts.every(a => a.itemType === 'prompt')).toBe(true);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'use', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'favorite', 'pattern', 'pat1');

      const stats = await service.getUserStats(testUserId);

      expect(stats.totalActivities).toBeGreaterThanOrEqual(3);
      expect(stats.byType).toBeDefined();
      expect(stats.byItemType).toBeDefined();
      expect(stats.recentActivity).toBeDefined();
    });

    it('should group activities by type', async () => {
      await service.trackActivity(testUserId, 'view', 'prompt', 'p1');
      await service.trackActivity(testUserId, 'view', 'prompt', 'p2');

      const stats = await service.getUserStats(testUserId);
      expect(stats.byType.view).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getPopularItems', () => {
    it('should return popular items', async () => {
      await service.trackActivity('user-1', 'view', 'prompt', 'popular-1');
      await service.trackActivity('user-2', 'view', 'prompt', 'popular-1');
      await service.trackActivity('user-3', 'view', 'prompt', 'popular-1');

      const popular = await service.getPopularItems('prompt', 'view', 10);
      expect(popular.length).toBeGreaterThan(0);
    });

    it('should sort by count descending', async () => {
      const popular = await service.getPopularItems('prompt', 'view', 10);
      
      if (popular.length > 1) {
        expect(popular[0].count).toBeGreaterThanOrEqual(popular[1].count);
      }
    });
  });
});
