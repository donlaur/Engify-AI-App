/**
 * Tests for /api/admin/prompts
 * Prompt Management API CRUD operations
 * Tests: GET, POST, PUT, DELETE endpoints with auth, validation, and rate limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '../route';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/mongodb');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/logging/audit');
vi.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: vi.fn(),
  },
}));
vi.mock('@/lib/security/sanitize', () => ({
  sanitizeText: (text: string) => text,
}));

describe('/api/admin/prompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mocks
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    } as never);

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
  });

  describe('GET', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return prompts for admin users', async () => {
      const mockPrompts = [
        {
          _id: { toString: () => '123' },
          title: 'Test Prompt',
          content: 'Test content',
          category: 'testing',
          active: true,
        },
        {
          _id: { toString: () => '456' },
          title: 'Another Prompt',
          content: 'More content',
          category: 'development',
          active: true,
        },
      ];

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockPrompts),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.prompts).toHaveLength(2);
      expect(data.prompts[0]._id).toBe('123');
      expect(data.prompts[1]._id).toBe('456');
    });

    it('should filter by category correctly', async () => {
      const mockPrompts = [
        {
          _id: { toString: () => '789' },
          title: 'Testing Prompt',
          content: 'Test content',
          category: 'testing',
          active: true,
        },
      ];

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockPrompts),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?category=testing'
      );
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.prompts).toHaveLength(1);
      expect(data.prompts[0].category).toBe('testing');

      // Verify find was called with category filter
      const findCall = mockCollection.find.mock.calls[0][0];
      expect(findCall.category).toBe('testing');
    });

    it('should handle pagination with page and limit parameters', async () => {
      const mockPrompts = [
        {
          _id: { toString: () => 'paginated' },
          title: 'Paginated Prompt',
          content: 'Test content',
          active: true,
        },
      ];

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockPrompts),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?category=all'
      );
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.prompts).toHaveLength(1);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(getDb).mockRejectedValue(new Error('DB connection failed'));

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to fetch prompts');
    });

    it('should return 400 for invalid category parameter', async () => {
      const req = new Request(
        'http://localhost/api/admin/prompts?category=invalid-category'
      );
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Invalid category');
      expect(data.error).toContain('Valid values:');
    });

    it('should return 400 for invalid source parameter', async () => {
      const req = new Request(
        'http://localhost/api/admin/prompts?source=invalid-source'
      );
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Invalid source');
      expect(data.error).toContain('seed, ai-generated, user-submitted, all');
    });

    it('should return 400 for invalid active parameter', async () => {
      const req = new Request(
        'http://localhost/api/admin/prompts?active=maybe'
      );
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Invalid active param');
      expect(data.error).toContain('true, false, or all');
    });

    it('should accept valid category values', async () => {
      const validCategories = [
        'code-generation',
        'debugging',
        'documentation',
        'testing',
        'refactoring',
        'architecture',
        'learning',
        'general',
        'all',
      ];

      for (const category of validCategories) {
        const mockCollection = {
          find: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };

        vi.mocked(getDb).mockResolvedValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        } as never);

        const req = new Request(
          `http://localhost/api/admin/prompts?category=${category}`
        );
        const res = await GET(req as NextRequest);

        expect(res.status).toBe(200);
      }
    });

    it('should accept valid source values', async () => {
      const validSources = ['seed', 'ai-generated', 'user-submitted', 'all'];

      for (const source of validSources) {
        const mockCollection = {
          find: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };

        vi.mocked(getDb).mockResolvedValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        } as never);

        const req = new Request(
          `http://localhost/api/admin/prompts?source=${source}`
        );
        const res = await GET(req as NextRequest);

        expect(res.status).toBe(200);
      }
    });

    it('should accept valid active values', async () => {
      const validValues = ['true', 'false', 'all'];

      for (const value of validValues) {
        const mockCollection = {
          find: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };

        vi.mocked(getDb).mockResolvedValue({
          collection: vi.fn().mockReturnValue(mockCollection),
        } as never);

        const req = new Request(
          `http://localhost/api/admin/prompts?active=${value}`
        );
        const res = await GET(req as NextRequest);

        expect(res.status).toBe(200);
      }
    });
  });

  describe('POST', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Prompt',
          content: 'Content',
          category: 'testing',
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for missing required fields', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Incomplete Prompt',
          // missing content and category
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for missing content field', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Incomplete Prompt',
          category: 'testing',
          // missing content
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for missing category field', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Incomplete Prompt',
          content: 'Some content',
          // missing category
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 429 if rate limit exceeded', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
      });

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Rate Limited Prompt',
          content: 'Content',
          category: 'testing',
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should create prompt successfully with valid data', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(null), // No existing slug
        insertOne: vi.fn().mockResolvedValue({
          insertedId: { toString: () => 'new-id-123' },
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Test Prompt',
          content: 'This is test content',
          category: 'testing',
          description: 'A test prompt',
          role: 'developer',
          experienceLevel: 'intermediate',
          tags: ['test', 'prompt'],
          isPublic: true,
          active: true,
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.prompt).toBeDefined();
      expect(data.prompt.title).toBe('New Test Prompt');
      expect(data.prompt.content).toBe('This is test content');
      expect(data.prompt.category).toBe('testing');
      expect(data.prompt.slug).toBeDefined();
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it('should return 400 for duplicate slug', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue({
          slug: 'new-test-prompt',
        }), // Slug already exists
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Test Prompt',
          content: 'This is test content',
          category: 'testing',
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Slug already exists');
    });

    it('should generate slug from title', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(null),
        insertOne: vi.fn().mockResolvedValue({
          insertedId: { toString: () => 'id-123' },
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'My Awesome Test Prompt!!!',
          content: 'Content',
          category: 'testing',
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.prompt.slug).toBe('my-awesome-test-prompt');
    });

    it('should handle optional fields correctly', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(null),
        insertOne: vi.fn().mockResolvedValue({
          insertedId: { toString: () => 'id-123' },
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Minimal Prompt',
          content: 'Content',
          category: 'testing',
          // Optional fields not provided
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.prompt.tags).toEqual([]);
      expect(data.prompt.isPublic).toBe(true); // Default
      expect(data.prompt.active).toBe(true); // Default
      expect(data.prompt.isPremium).toBe(false); // Default
    });

    it('should return 500 on database error', async () => {
      vi.mocked(getDb).mockRejectedValue(new Error('DB error'));

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Prompt',
          content: 'Content',
          category: 'testing',
        }),
      });

      const res = await POST(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to create prompt');
    });
  });

  describe('PUT', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 429 if rate limit exceeded', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
      });

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated Prompt',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should return 400 if _id is missing', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Missing prompt _id');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: 'invalid-id',
          title: 'Updated',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid prompt ID');
    });

    it('should return 404 for non-existent prompt', async () => {
      const mockCollection = {
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 0,
          modifiedCount: 0,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Prompt not found');
    });

    it('should update prompt successfully', async () => {
      const updatedPrompt = {
        _id: { toString: () => '655f5f8a9772238ea0a5f301' },
        title: 'Updated Prompt',
        content: 'Updated content',
        category: 'testing',
        updatedAt: new Date(),
        currentRevision: 2,
      };

      const mockCollection = {
        findOne: vi.fn()
          .mockResolvedValueOnce({ currentRevision: 1 }) // First call to get existing
          .mockResolvedValueOnce(updatedPrompt), // Second call after update
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated Prompt',
          content: 'Updated content',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.prompt._id).toBe('655f5f8a9772238ea0a5f301');
      expect(data.prompt.title).toBe('Updated Prompt');
      expect(data.prompt.currentRevision).toBe(2);
    });

    it('should increment revision when content changes', async () => {
      const mockCollection = {
        findOne: vi.fn()
          .mockResolvedValueOnce({ currentRevision: 5 })
          .mockResolvedValueOnce({
            _id: { toString: () => 'id-123' },
            currentRevision: 6,
          }),
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          content: 'New content that triggers revision',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      const updateCall = mockCollection.updateOne.mock.calls[0];
      expect(updateCall[1].$set.currentRevision).toBe(6);
    });

    it('should not increment revision without content change', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValueOnce({
          _id: { toString: () => 'id-123' },
          currentRevision: 3,
        }),
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Just title change',
        }),
      });

      const res = await PUT(req as NextRequest);

      const updateCall = mockCollection.updateOne.mock.calls[0];
      expect(updateCall[1].$set.currentRevision).toBeUndefined();
    });

    it('should return 500 on database error', async () => {
      vi.mocked(getDb).mockRejectedValue(new Error('DB error'));

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated',
        }),
      });

      const res = await PUT(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to update prompt');
    });
  });

  describe('DELETE', () => {
    it('should return 403 for non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 429 if rate limit exceeded', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
      });

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should return 400 if _id is missing', async () => {
      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'DELETE',
      });

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Missing prompt _id');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const req = new Request(
        'http://localhost/api/admin/prompts?_id=invalid-id',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid prompt ID');
    });

    it('should return 404 for non-existent prompt', async () => {
      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue({
          deletedCount: 0,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Prompt not found');
    });

    it('should delete prompt successfully', async () => {
      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue({
          deletedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('should return 500 on database error', async () => {
      vi.mocked(getDb).mockRejectedValue(new Error('DB error'));

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      const res = await DELETE(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to delete prompt');
    });
  });

  describe('Role-based access control', () => {
    it('should allow super_admin role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'superadmin@example.com', role: 'super_admin' },
      } as never);

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);

      expect(res.status).toBe(200);
    });

    it('should allow org_admin role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'orgadmin@example.com', role: 'org_admin' },
      } as never);

      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);

      expect(res.status).toBe(200);
    });

    it('should deny viewer role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'viewer@example.com', role: 'viewer' },
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should deny when session has no role', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'norole@example.com' }, // No role field
      } as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should deny when session is null', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const req = new Request('http://localhost/api/admin/prompts');
      const res = await GET(req as NextRequest);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Audit logging', () => {
    it('should call auditLog on successful POST', async () => {
      const { auditLog } = await import('@/lib/logging/audit');

      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(null),
        insertOne: vi.fn().mockResolvedValue({
          insertedId: { toString: () => 'new-id' },
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Audit Test',
          content: 'Content',
          category: 'testing',
        }),
      });

      await POST(req as NextRequest);

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin_action',
          resource: expect.stringContaining('prompt:'),
          details: expect.objectContaining({
            action: 'create',
          }),
        })
      );
    });

    it('should call auditLog on successful PUT', async () => {
      const { auditLog } = await import('@/lib/logging/audit');

      const mockCollection = {
        findOne: vi.fn().mockResolvedValue({
          currentRevision: 1,
          _id: { toString: () => 'id-123' },
        }),
        updateOne: vi.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request('http://localhost/api/admin/prompts', {
        method: 'PUT',
        body: JSON.stringify({
          _id: '655f5f8a9772238ea0a5f301',
          title: 'Updated',
        }),
      });

      await PUT(req as NextRequest);

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin_action',
          resource: expect.stringContaining('prompt:'),
          details: expect.objectContaining({
            action: 'update',
          }),
        })
      );
    });

    it('should call auditLog on successful DELETE', async () => {
      const { auditLog } = await import('@/lib/logging/audit');

      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue({
          deletedCount: 1,
        }),
      };

      vi.mocked(getDb).mockResolvedValue({
        collection: vi.fn().mockReturnValue(mockCollection),
      } as never);

      const req = new Request(
        'http://localhost/api/admin/prompts?_id=655f5f8a9772238ea0a5f301',
        { method: 'DELETE' }
      );

      await DELETE(req as NextRequest);

      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin_action',
          resource: expect.stringContaining('prompt:'),
          details: expect.objectContaining({
            action: 'delete',
          }),
        })
      );
    });
  });
});
