/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Content Publishing API Route Tests
 * Tests multi-agent content publishing pipeline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/content/content-publishing-pipeline');
vi.mock('@/lib/logging/logger');

const mockAuth = vi.mocked(await import('@/lib/auth')).auth;
const mockContentPublishing = vi.mocked(
  await import('@/lib/content/content-publishing-pipeline')
);
const mockLogger = vi.mocked(await import('@/lib/logging/logger')).logger;

describe('POST /api/content/publish', () => {
  const mockUserId = new ObjectId().toString();
  const mockOrgId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated admin user
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        organizationId: mockOrgId,
      },
    } as any);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 when session has no user', async () => {
    mockAuth.mockResolvedValue({} as any);

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
      },
    } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe(
      'Forbidden - Admin access required for content publishing'
    );
  });

  it('should allow super_admin users', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'superadmin@example.com',
        name: 'Super Admin',
        role: 'super_admin',
        organizationId: mockOrgId,
      },
    } as any);

    const mockService = {
      generateArticle: vi.fn().mockResolvedValue({
        topic: 'Test',
        finalContent: 'Content',
        seoMetadata: {},
        readabilityScore: 80,
        approved: true,
        publishReady: true,
        reviews: [],
      }),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Building Modern Web Apps' }),
      }
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should allow users with admin email', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'admin.user@example.com',
        name: 'Admin Email User',
        role: 'user',
        organizationId: mockOrgId,
      },
    } as any);

    const mockService = {
      generateArticle: vi.fn().mockResolvedValue({
        topic: 'Test',
        finalContent: 'Content',
        seoMetadata: {},
        readabilityScore: 80,
        approved: true,
        publishReady: true,
        reviews: [],
      }),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Building Modern Web Apps' }),
      }
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should return 400 when topic is too short', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Short' }), // Less than 10 chars
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
    expect(data.details).toBeDefined();
  });

  it('should return 400 when topic is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('should generate article successfully with minimal parameters', async () => {
    const mockResult = {
      topic: 'Building Modern Web Apps',
      finalContent: 'This is a comprehensive guide to building modern web apps...',
      seoMetadata: {
        title: 'Building Modern Web Apps - Complete Guide',
        description: 'Learn how to build modern web apps',
        keywords: ['web', 'apps', 'modern'],
      },
      readabilityScore: 85,
      approved: true,
      publishReady: true,
      reviews: [
        {
          agentName: 'SEO Specialist',
          approved: true,
          score: 90,
          feedback: 'Good SEO optimization',
          improvements: [],
        },
      ],
    };

    const mockService = {
      generateArticle: vi.fn().mockResolvedValue(mockResult),
      generateReport: vi.fn().mockReturnValue('Article generation report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Building Modern Web Apps' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.publishReady).toBe(true);
    expect(data.result.topic).toBe('Building Modern Web Apps');
    expect(data.result.finalContent).toBeDefined();
    expect(data.result.seoMetadata).toBeDefined();
    expect(data.result.readabilityScore).toBe(85);
    expect(data.result.approved).toBe(true);
    expect(data.result.reviews).toHaveLength(1);
    expect(data.report).toBe('Article generation report');
  });

  it('should use default values for optional parameters', async () => {
    const mockService = {
      generateArticle: vi.fn().mockResolvedValue({
        topic: 'Test',
        finalContent: 'Content',
        seoMetadata: {},
        readabilityScore: 80,
        approved: true,
        publishReady: true,
        reviews: [],
      }),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Default Parameters Test' }),
      }
    );
    await POST(request);

    expect(mockService.generateArticle).toHaveBeenCalledWith(
      'Default Parameters Test',
      {
        category: 'Tutorial',
        targetKeywords: [],
        tone: 'intermediate',
      }
    );
  });

  it('should accept custom parameters', async () => {
    const mockService = {
      generateArticle: vi.fn().mockResolvedValue({
        topic: 'Test',
        finalContent: 'Content',
        seoMetadata: {},
        readabilityScore: 80,
        approved: true,
        publishReady: true,
        reviews: [],
      }),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Advanced React Patterns',
          category: 'Advanced Tutorial',
          targetKeywords: ['react', 'hooks', 'patterns'],
          tone: 'advanced',
        }),
      }
    );
    await POST(request);

    expect(mockService.generateArticle).toHaveBeenCalledWith(
      'Advanced React Patterns',
      {
        category: 'Advanced Tutorial',
        targetKeywords: ['react', 'hooks', 'patterns'],
        tone: 'advanced',
      }
    );
  });

  it('should validate tone parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid Topic Here',
          tone: 'invalid-tone',
        }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('should use default organization ID when not provided', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
    } as any);

    const mockService = {
      generateArticle: vi.fn().mockResolvedValue({
        topic: 'Test',
        finalContent: 'Content',
        seoMetadata: {},
        readabilityScore: 80,
        approved: true,
        publishReady: true,
        reviews: [],
      }),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    await POST(request);

    expect(
      mockContentPublishing.ContentPublishingService
    ).toHaveBeenCalledWith('default');
  });

  it('should handle service errors gracefully', async () => {
    const mockService = {
      generateArticle: vi.fn().mockRejectedValue(new Error('AI service error')),
      generateReport: vi.fn(),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should log API errors', async () => {
    const mockService = {
      generateArticle: vi
        .fn()
        .mockRejectedValue(new Error('Pipeline failed')),
      generateReport: vi.fn(),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    await POST(request);

    expect(mockLogger.apiError).toHaveBeenCalledWith(
      '/api/content/publish',
      expect.any(Error),
      { method: 'POST' }
    );
  });

  it('should return all review details', async () => {
    const mockResult = {
      topic: 'Test',
      finalContent: 'Content',
      seoMetadata: {},
      readabilityScore: 80,
      approved: true,
      publishReady: true,
      reviews: [
        {
          agentName: 'SEO Specialist',
          approved: true,
          score: 90,
          feedback: 'Good SEO',
          improvements: ['Add more keywords'],
        },
        {
          agentName: 'Tech Accuracy SME',
          approved: true,
          score: 95,
          feedback: 'Technically accurate',
          improvements: [],
        },
      ],
    };

    const mockService = {
      generateArticle: vi.fn().mockResolvedValue(mockResult),
      generateReport: vi.fn().mockReturnValue('Report'),
    };

    mockContentPublishing.ContentPublishingService.mockImplementation(
      () => mockService as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/content/publish',
      {
        method: 'POST',
        body: JSON.stringify({ topic: 'Test Article Topic' }),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(data.result.reviews).toHaveLength(2);
    expect(data.result.reviews[0]).toHaveProperty('agentName');
    expect(data.result.reviews[0]).toHaveProperty('approved');
    expect(data.result.reviews[0]).toHaveProperty('score');
    expect(data.result.reviews[0]).toHaveProperty('feedback');
    expect(data.result.reviews[0]).toHaveProperty('improvements');
  });
});

describe('GET /api/content/publish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return agent list', async () => {
    const mockAgents = [
      {
        role: 'content_generator',
        name: 'Content Generator',
        model: 'gpt-4',
        provider: 'openai',
      },
      {
        role: 'seo_specialist',
        name: 'SEO Specialist',
        model: 'claude-3-sonnet',
        provider: 'anthropic',
      },
    ];

    mockContentPublishing.CONTENT_AGENTS = mockAgents as any;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toHaveLength(2);
    expect(data.agents[0]).toHaveProperty('role');
    expect(data.agents[0]).toHaveProperty('name');
    expect(data.agents[0]).toHaveProperty('model');
    expect(data.agents[0]).toHaveProperty('provider');
  });

  it('should return pipeline information', async () => {
    mockContentPublishing.CONTENT_AGENTS = [] as any;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pipeline).toBeDefined();
    expect(Array.isArray(data.pipeline)).toBe(true);
    expect(data.pipeline.length).toBeGreaterThan(0);
    expect(data.pipeline[0]).toContain('Content Generator');
  });

  it('should handle errors gracefully', async () => {
    // Simulate import error
    vi.doMock('@/lib/content/content-publishing-pipeline', () => {
      throw new Error('Module not found');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
