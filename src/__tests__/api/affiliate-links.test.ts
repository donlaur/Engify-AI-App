import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/admin/affiliate-links/route';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: jest.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';

describe('/api/admin/affiliate-links', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (checkRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 if not super_admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
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
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'super_admin' },
      });
      (checkRateLimit as jest.Mock).mockResolvedValue({ allowed: false });

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
    });

    it('should return affiliate data for super_admin', async () => {
      (auth as jest.Mock).mockResolvedValue({
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
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockLinks),
      };

      const mockDb = {
        collection: jest.fn().mockImplementation((name) => {
          if (name === 'partnership_outreach') {
            return {
              find: jest.fn().mockReturnThis(),
              toArray: jest.fn().mockResolvedValue(mockOutreach),
            };
          }
          return mockCollection;
        }),
      };

      (getDb as jest.Mock).mockResolvedValue(mockDb);

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
      (auth as jest.Mock).mockResolvedValue(null);

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
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'super_admin' },
      });

      const mockResult = {
        upsertedId: '123',
        modifiedCount: 1,
      };

      const mockCollection = {
        updateOne: jest.fn().mockResolvedValue(mockResult),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      (getDb as jest.Mock).mockResolvedValue(mockDb);

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
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/admin/affiliate-links?id=1&type=link'
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should delete affiliate link', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { role: 'super_admin' },
      });

      const mockResult = {
        deletedCount: 1,
      };

      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue(mockResult),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      (getDb as jest.Mock).mockResolvedValue(mockDb);

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
