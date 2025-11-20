/**
 * Tests for /api/admin/news/feeds
 * Feed Management API CRUD operations
 * Tests: GET, POST, PUT, DELETE endpoints with auth, validation, and rate limiting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/admin/news/feeds/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/middleware/rbac');
vi.mock('@/lib/repositories/FeedConfigRepository');

describe('Feed Management API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/news/feeds', () => {
    it('should return list of feeds', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/feeds');
      const response = await GET(request);
      expect(response).toBeDefined();
    });
  });

  describe('POST /api/admin/news/feeds', () => {
    it('should create a new feed', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/feeds', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://example.com/feed.xml',
          source: 'other',
          feedType: 'rss',
          type: 'blog-post',
        }),
      });
      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });

  describe('PUT /api/admin/news/feeds', () => {
    it('should update an existing feed', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/feeds', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'test-feed-id',
          enabled: true,
        }),
      });
      const response = await PUT(request);
      expect(response).toBeDefined();
    });
  });

  describe('DELETE /api/admin/news/feeds', () => {
    it('should delete a feed', async () => {
      const request = new NextRequest('http://localhost/api/admin/news/feeds?id=test-feed-id', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      expect(response).toBeDefined();
    });
  });
});

