/**
 * Career Recommendations API Tests
 * Tests for GET /api/career/recommendations endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/career/recommendations/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/services/CareerRecommendationService', () => ({
  careerRecommendationService: {
    getRecommendations: vi.fn(),
  },
}));

vi.mock('@/server/middleware/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('GET /api/career/recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new NextRequest(
      'http://localhost/api/career/recommendations'
    );
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(auth).mockResolvedValue({ user: { id: 'test-user' } } as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest(
      'http://localhost/api/career/recommendations'
    );
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it('should fetch recommendations successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { careerRecommendationService } = await import(
      '@/lib/services/CareerRecommendationService'
    );

    vi.mocked(auth).mockResolvedValue({ user: { id: 'test-user' } } as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 59,
      resetAt: new Date(),
    });

    const mockRecommendations = [
      {
        type: 'pattern',
        title: 'Master System Design Patterns',
        description: 'Use Tree of Thoughts',
        reason: 'Required for Staff level',
        priority: 'high',
        skillsAddressed: ['system-design'],
      },
    ];

    vi.mocked(careerRecommendationService.getRecommendations).mockResolvedValue(
      mockRecommendations as any
    );

    const request = new NextRequest(
      'http://localhost/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recommendations).toEqual(mockRecommendations);
  });
});
