import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/admin/affiliate-links/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';

describe('/api/admin/affiliate-links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (checkRateLimit as any).mockResolvedValue({ allowed: true });
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if not super_admin', async () => {
      (auth as any).mockResolvedValue({
        user: { role: 'admin' },
      });

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 429 if rate limited', async () => {
      (auth as any).mockResolvedValue({
        user: { role: 'super_admin' },
      });
      (checkRateLimit as any).mockResolvedValue({ allowed: false });

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
    });

    it('should return affiliate data for super_admin', async () => {
      (auth as any).mockResolvedValue({
        user: { role: 'super_admin' },
      });

      const mockLinks = [
        {
          _id: '1',
          tool: 'Cursor',
          baseUrl: 'https://cursor.sh',
          status: 'active',
        },
      ];
      const mockOutreach = [
        {
          _id: '2',
          company: 'Cursor',
          priority: 'high',
          contact: 'test@example.com',
        },
      ];

      const mockCollection = {
        find: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockLinks),
      };

      const mockDb = {
        collection: vi.fn().mockImplementation((name) => {
          if (name === 'partnership_outreach') {
            return {
              find: vi.fn().mockReturnThis(),
              toArray: vi.fn().mockResolvedValue(mockOutreach),
            };
          }
          return mockCollection;
        }),
      };

      (getDb as any).mockResolvedValue(mockDb);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.links).toEqual(
        mockLinks.map((link) => ({
          ...link,
          clickCount: 0,
          conversionCount: 0,
        }))
      );
      expect(data.outreach).toEqual(mockOutreach);
    });
  });

  describe('POST', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'link', data: { tool: 'Test' } }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create/update affiliate link', async () => {
      (auth as any).mockResolvedValue({
        user: { role: 'super_admin' },
      });

      const mockResult = {
        upsertedId: '123',
        modifiedCount: 1,
      };

      const mockCollection = {
        updateOne: vi.fn().mockResolvedValue(mockResult),
      };

      const mockDb = {
        collection: vi.fn().mockReturnValue(mockCollection),
      };

      (getDb as any).mockResolvedValue(mockDb);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'link',
            data: {
              tool: 'Cursor',
              baseUrl: 'https://cursor.sh',
              status: 'active',
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as any).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links?id=1&type=link'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete affiliate link', async () => {
      (auth as any).mockResolvedValue({
        user: { role: 'super_admin' },
      });

      const mockResult = {
        deletedCount: 1,
      };

      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue(mockResult),
      };

      const mockDb = {
        collection: vi.fn().mockReturnValue(mockCollection),
      };

      (getDb as any).mockResolvedValue(mockDb);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links?id=1&type=link'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: '1' });
    });
  });
});
