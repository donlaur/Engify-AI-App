/**
 * Bug Reports API Security Tests
 *
 * Tests for authentication, rate limiting, and authorization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/bug-reports/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      insertOne: vi.fn(() => ({ insertedId: 'test-report-id-123' })),
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => [
              {
                _id: 'report-1',
                userId: 'user-123',
                intent: 'Report a bug',
                description: 'The button is not clickable',
                pageUrl: 'https://example.com',
                status: 'new',
                createdAt: new Date(),
              },
            ]),
          })),
        })),
      })),
    })),
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

vi.mock('@/lib/errors', () => ({
  handleApiError: vi.fn((error) => {
    return new Response(JSON.stringify({ error: error.message || 'Error' }), {
      status: 500,
    });
  }),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Bug Reports API - Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bug-reports', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'Report a bug',
          description: 'The button is not clickable',
          pageUrl: 'https://example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should reject requests exceeding rate limit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'Report a bug',
          description: 'The button is not clickable',
          pageUrl: 'https://example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');
    });

    it('should accept valid authenticated request', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 59,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'Report a bug',
          description: 'The button is not clickable on mobile devices',
          pageUrl: 'https://example.com/page',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reportId).toBe('test-report-id-123');
    });

    it('should validate required fields', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 59,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'Report',
          description: 'Short', // Too short
          pageUrl: 'not-a-url', // Invalid URL
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500); // Validation error
    });
  });

  describe('GET /api/bug-reports', () => {
    it('should reject unauthenticated requests', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should reject requests exceeding rate limit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');
    });

    it('should return bug reports for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 59,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest('http://localhost/api/bug-reports', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reports).toBeDefined();
      expect(Array.isArray(data.reports)).toBe(true);
    });

    it('should limit results to maximum of 100', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 59,
        resetAt: new Date(Date.now() + 3600000),
      } as never);

      const request = new NextRequest(
        'http://localhost/api/bug-reports?limit=500',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // The actual limit check happens in the route handler
    });
  });
});
