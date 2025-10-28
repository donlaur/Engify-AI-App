/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NotificationService Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationService } from '../NotificationService';

describe('NotificationService', () => {
  let service: NotificationService;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const notification = await service.createNotification(
        testUserId,
        'info',
        'Test Title',
        'Test message',
        '/test-link'
      );

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe('info');
      expect(notification.title).toBe('Test Title');
      expect(notification.read).toBe(false);
    });

    it('should support different notification types', async () => {
      const info = await service.createNotification(testUserId, 'info', 'Info', 'Message');
      const success = await service.createNotification(testUserId, 'success', 'Success', 'Message');
      const warning = await service.createNotification(testUserId, 'warning', 'Warning', 'Message');
      const error = await service.createNotification(testUserId, 'error', 'Error', 'Message');

      expect(info.type).toBe('info');
      expect(success.type).toBe('success');
      expect(warning.type).toBe('warning');
      expect(error.type).toBe('error');
    });

    it('should include metadata', async () => {
      const notification = await service.createNotification(
        testUserId,
        'achievement',
        'Achievement',
        'You did it!',
        '/achievements',
        { icon: '🎉', actionLabel: 'View' }
      );

      expect(notification.metadata?.icon).toBe('🎉');
      expect(notification.metadata?.actionLabel).toBe('View');
    });
  });

  describe('getUserNotifications', () => {
    it('should get all user notifications', async () => {
      await service.createNotification(testUserId, 'info', 'Test 1', 'Message 1');
      await service.createNotification(testUserId, 'success', 'Test 2', 'Message 2');

      const notifications = await service.getUserNotifications(testUserId);
      expect(notifications.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter unread notifications', async () => {
      const n1 = await service.createNotification(testUserId, 'info', 'Test 1', 'Message 1');
      await service.createNotification(testUserId, 'info', 'Test 2', 'Message 2');
      
      await service.markAsRead(n1._id!.toString());

      const unread = await service.getUserNotifications(testUserId, true);
      expect(unread.every(n => !n.read)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const notifications = await service.getUserNotifications(testUserId, false, 5);
      expect(notifications.length).toBeLessThanOrEqual(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await service.createNotification(
        testUserId,
        'info',
        'Test',
        'Message'
      );

      const marked = await service.markAsRead(notification._id!.toString());
      expect(marked).toBe(true);

      const updated = await service.getUserNotifications(testUserId);
      const found = updated.find(n => n._id?.toString() === notification._id?.toString());
      expect(found?.read).toBe(true);
      expect(found?.readAt).toBeInstanceOf(Date);
    });

    it('should return false for non-existent notification', async () => {
      const marked = await service.markAsRead('000000000000000000000000');
      expect(marked).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      await service.createNotification(testUserId, 'info', 'Test 1', 'Message 1');
      await service.createNotification(testUserId, 'info', 'Test 2', 'Message 2');

      const count = await service.markAllAsRead(testUserId);
      expect(count).toBeGreaterThanOrEqual(2);

      const unread = await service.getUserNotifications(testUserId, true);
      expect(unread.length).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications', async () => {
      await service.createNotification(testUserId, 'info', 'Test 1', 'Message 1');
      await service.createNotification(testUserId, 'info', 'Test 2', 'Message 2');

      const count = await service.getUnreadCount(testUserId);
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 for user with no notifications', async () => {
      const count = await service.getUnreadCount('new-user');
      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notification = await service.createNotification(
        testUserId,
        'info',
        'Test',
        'Message'
      );

      const deleted = await service.deleteNotification(notification._id!.toString());
      expect(deleted).toBe(true);
    });
  });

  describe('sendAchievement', () => {
    it('should send achievement notification', async () => {
      const notification = await service.sendAchievement(
        testUserId,
        'Level Up!',
        'You reached level 5',
        '🎉'
      );

      expect(notification.type).toBe('achievement');
      expect(notification.title).toBe('Level Up!');
      expect(notification.metadata?.icon).toBe('🎉');
    });
  });

  describe('sendUsageLimitWarning', () => {
    it('should send usage limit warning', async () => {
      const notification = await service.sendUsageLimitWarning(testUserId, 85);

      expect(notification.type).toBe('warning');
      expect(notification.message).toContain('85%');
      expect(notification.link).toBe('/pricing');
    });
  });

  describe('sendPatternUnlock', () => {
    it('should send pattern unlock notification', async () => {
      const notification = await service.sendPatternUnlock(testUserId, 'Chain of Thought');

      expect(notification.type).toBe('success');
      expect(notification.title).toContain('Unlocked');
      expect(notification.message).toContain('Chain of Thought');
    });
  });
});
