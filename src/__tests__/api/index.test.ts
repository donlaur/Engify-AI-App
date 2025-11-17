/**
 * Tests for /api/admin/content/index
 * Content Indexing API (stub implementation)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/content/index/route';
import { RBACPresets } from '@/lib/middleware/rbac';
import { checkRateLimit } from '@/lib/rate-limit';

vi.mock('@/lib/middleware/rbac');
vi.mock('@/lib/rate-limit');

describe('/api/admin/content/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock rate limit to allow by default
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(Date.now() + 3600000),
    });
  });

  describe('GET', () => {
    it('should return 401 for non-super-admin users', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(async () => {
        return {
          json: () => Promise.resolve({ error: 'Unauthorized' }),
          status: 401,
        } as never;
      });

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it('should return 404 when indexer is disabled', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(
        async () => null
      );

      // Set indexer to disabled
      process.env.RAG_INDEX_ENABLED = 'false';

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Indexer disabled');
    });

    it('should return 429 when rate limit exceeded', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(
        async () => null
      );

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
        reason: 'Rate limit exceeded',
      });

      process.env.RAG_INDEX_ENABLED = 'true';

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should return success when indexer is enabled', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(
        async () => null
      );

      process.env.RAG_INDEX_ENABLED = 'true';

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe('ok');
      expect(data.mode).toBe('stub');
    });
  });

  describe('POST', () => {
    it('should return 401 for non-super-admin users', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(async () => {
        return {
          json: () => Promise.resolve({ error: 'Unauthorized' }),
          status: 401,
        } as never;
      });

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        method: 'POST',
        headers: { 'x-forwarded-for': '127.0.0.1' },
        body: JSON.stringify({ hashes: [] }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it('should return 404 when indexer is disabled', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(
        async () => null
      );

      process.env.RAG_INDEX_ENABLED = 'false';

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        method: 'POST',
        headers: { 'x-forwarded-for': '127.0.0.1' },
        body: JSON.stringify({ hashes: [] }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Indexer disabled');
    });

    it('should return success with enqueued count', async () => {
      vi.mocked(RBACPresets.requireSuperAdmin).mockReturnValue(
        async () => null
      );

      process.env.RAG_INDEX_ENABLED = 'true';

      const req = new NextRequest('http://localhost/api/admin/content/index', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hashes: ['abc123def456'] }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.enqueued).toBe(1);
    });
  });
});
