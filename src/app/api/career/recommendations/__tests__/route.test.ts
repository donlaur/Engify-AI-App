/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Career Recommendations API Route Tests
 * Tests personalized career recommendation system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/services/CareerRecommendationService');
vi.mock('@/server/middleware/audit');

const mockAuth = vi.mocked(await import('@/lib/auth')).auth;
const mockCheckRateLimit = vi.mocked(await import('@/lib/rate-limit')).checkRateLimit;
const mockCareerService = vi.mocked(
  await import('@/lib/services/CareerRecommendationService')
).careerRecommendationService;
const mockLogAuditEvent = vi.mocked(
  await import('@/server/middleware/audit')
).logAuditEvent;

describe('GET /api/career/recommendations', () => {
  const mockUserId = new ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockAuth.mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    } as any);

    // Default: rate limit allowed
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 59,
      resetAt: new Date(Date.now() + 3600000),
    });

    // Default: audit logging succeeds
    mockLogAuditEvent.mockResolvedValue(undefined);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'test@example.com', name: 'Test User' },
    } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should enforce rate limiting', async () => {
    const resetDate = new Date(Date.now() + 3600000);
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: resetDate,
      reason: 'Too many requests',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
    expect(data.reason).toBe('Too many requests');
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBe(
      resetDate.toISOString()
    );
  });

  it('should return career recommendations successfully', async () => {
    const mockRecommendations = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        matchScore: 95,
        skills: ['React', 'Node.js', 'TypeScript'],
        description: 'Great opportunity for growth',
      },
      {
        id: '2',
        title: 'Lead Developer',
        company: 'Startup Inc',
        matchScore: 87,
        skills: ['Python', 'Django', 'AWS'],
        description: 'Exciting startup environment',
      },
    ];

    mockCareerService.getRecommendations.mockResolvedValue(mockRecommendations);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recommendations).toEqual(mockRecommendations);
    expect(mockCareerService.getRecommendations).toHaveBeenCalledWith(
      mockUserId
    );
  });

  it('should return empty recommendations array when none found', async () => {
    mockCareerService.getRecommendations.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recommendations).toEqual([]);
  });

  it('should log audit event with correct metadata', async () => {
    const mockRecommendations = [
      {
        id: '1',
        title: 'Senior Engineer',
        matchScore: 95,
      },
      {
        id: '2',
        title: 'Tech Lead',
        matchScore: 88,
      },
    ];

    mockCareerService.getRecommendations.mockResolvedValue(
      mockRecommendations as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations',
      {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
      }
    );
    await GET(request);

    expect(mockLogAuditEvent).toHaveBeenCalledWith({
      eventType: 'admin.settings.changed',
      userId: mockUserId,
      action: 'career_recommendations_fetched',
      metadata: {
        count: 2,
      },
      ipAddress: '192.168.1.100',
      success: true,
    });
  });

  it('should use "unknown" IP when x-forwarded-for header is missing', async () => {
    mockCareerService.getRecommendations.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    await GET(request);

    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: 'unknown',
      })
    );
  });

  it('should handle service errors gracefully', async () => {
    mockCareerService.getRecommendations.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch recommendations');
  });

  it('should handle rate limit check errors', async () => {
    mockCheckRateLimit.mockRejectedValue(new Error('Redis connection failed'));

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch recommendations');
  });

  it('should handle audit logging errors without failing the request', async () => {
    mockCareerService.getRecommendations.mockResolvedValue([]);
    mockLogAuditEvent.mockRejectedValue(new Error('Audit log failed'));

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );

    // Should still succeed even if audit logging fails
    await expect(GET(request)).resolves.toBeTruthy();
  });

  it('should call rate limit check with correct parameters', async () => {
    mockCareerService.getRecommendations.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    await GET(request);

    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      mockUserId,
      'authenticated'
    );
  });

  it('should handle large recommendation lists', async () => {
    const largeRecommendations = Array.from({ length: 100 }, (_, i) => ({
      id: `rec-${i}`,
      title: `Position ${i}`,
      matchScore: 90 - i,
    }));

    mockCareerService.getRecommendations.mockResolvedValue(
      largeRecommendations as any
    );

    const request = new NextRequest(
      'http://localhost:3000/api/career/recommendations'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recommendations).toHaveLength(100);
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { count: 100 },
      })
    );
  });
});
