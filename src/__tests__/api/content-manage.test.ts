/**
 * Tests for /api/admin/content/manage
 * Content Management CMS API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/admin/content/manage/route';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';

vi.mock('@/lib/auth');
vi.mock('@/lib/mongodb');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/logging/audit');

describe('/api/admin/content/manage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage');
      const res = await GET(req as never);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 429 when rate limit exceeded', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
      });

      const req = new Request('http://localhost/api/admin/content/manage');
      const res = await GET(req as never);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should fetch content successfully for admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 10,
        resetAt: new Date(),
      });

      const mockContent = [
        {
          _id: { toString: () => '123' },
          type: 'ai_adoption_question',
          title: 'Test Question',
          content: 'Test content',
          tags: ['ai'],
        },
      ];

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockContent),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage');
      const res = await GET(req as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.content).toHaveLength(1);
      expect(data.content[0]._id).toBe('123');
    });
  });

  describe('POST', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage', {
        method: 'POST',
        body: JSON.stringify({
          type: 'learning_story',
          title: 'Test',
          content: 'Content',
        }),
      });

      const res = await POST(req as never);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create content successfully for admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
      });

      const mockCollection = {
        insertOne: vi.fn().mockResolvedValue({
          insertedId: { toString: () => '456' },
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage', {
        method: 'POST',
        body: JSON.stringify({
          type: 'learning_story',
          title: 'New Story',
          content: 'Story content',
          tags: ['engineering', 'leadership'],
        }),
      });

      const res = await POST(req as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.contentId).toBe('456');
    });
  });

  describe('PUT', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '123',
          title: 'Updated',
        }),
      });

      const res = await PUT(req as never);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update content successfully for admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 10,
        resetAt: new Date(),
      });

      const mockCollection = {
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/content/manage', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '123',
          title: 'Updated Title',
          content: 'Updated content',
        }),
      });

      const res = await PUT(req as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.modified).toBe(1);
    });
  });

  describe('DELETE', () => {
    it('should return 403 for non-super_admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      } as never);

      const req = new Request(
        'http://localhost/api/admin/content/manage?id=123',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as never);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized - super_admin only');
    });

    it('should delete content successfully for super_admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'superadmin@example.com', role: 'super_admin' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetAt: new Date(),
      });

      const mockCollection = {
        findOne: vi.fn().mockResolvedValue({
          _id: '123',
          title: 'Test Content',
          type: 'learning_story',
        }),
        deleteOne: vi.fn().mockResolvedValue({
          deletedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/content/manage?id=123',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBe(1);
    });
  });
});

