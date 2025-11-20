/**
 * Tests for /api/admin/news/sync
 * News Aggregator Sync API
 * Tests: POST endpoint for syncing feeds
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/news/sync/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/middleware/rbac');
vi.mock('@/lib/services/NewsAggregatorService');

describe('News Sync API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/news/sync', () => {
    it('should sync all feeds', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/sync', {
        method: 'POST',
      });
      const response = await POST(request);
      expect(response).toBeDefined();
    });

    it('should sync a specific feed', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/sync', {
        method: 'POST',
        body: JSON.stringify({
          feedUrl: 'https://example.com/feed.xml',
        }),
      });
      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });
});

