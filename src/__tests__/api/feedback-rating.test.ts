/**
 * Feedback Rating API Tests
 * Tests for POST /api/feedback/rating endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/feedback/rating/route';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/security/feedback-rate-limit', () => ({
  checkFeedbackRateLimit: vi.fn(),
}));

vi.mock('@/lib/security/sanitize', () => ({
  sanitizeText: vi.fn((text) => text || ''),
}));

vi.mock('@/server/middleware/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/db/schemas/user-feedback', () => ({
  DetailedRatingSchema: {
    parse: vi.fn((data) => data),
  },
  FEEDBACK_COLLECTIONS: {
    DETAILED_RATINGS: 'prompt_detailed_ratings',
    SCORE_AGGREGATES: 'prompt_score_aggregates',
    QUICK_FEEDBACK: 'prompt_quick_feedback',
  },
  calculateOverallScore: vi.fn(() => 85),
  calculateConfidenceScore: vi.fn(() => 0.8),
  calculateRAGReadiness: vi.fn(() => ({ score: 0.9, ready: true })),
}));

describe('POST /api/feedback/rating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost/api/feedback/rating', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        rating: 5,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it('should sanitize user comment before saving', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { sanitizeText } = await import('@/lib/security/sanitize');
    const { getDb } = await import('@/lib/mongodb');
    const { auth } = await import('@/lib/auth');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', organizationId: 'org-456' },
    } as any);

    vi.mocked(sanitizeText).mockReturnValue('sanitized comment');

    const mockCollection = {
      insertOne: vi.fn(),
      findOne: vi.fn().mockResolvedValue(null),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
      updateOne: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        rating: 5,
        comment: '<script>alert("xss")</script>malicious comment',
      }),
    });

    await POST(request);

    // Verify sanitization was called
    expect(sanitizeText).toHaveBeenCalledWith('<script>alert("xss")</script>malicious comment');
  });

  it('should log audit event for detailed rating', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { getDb } = await import('@/lib/mongodb');
    const { auth } = await import('@/lib/auth');
    const { logAuditEvent } = await import('@/server/middleware/audit');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', role: 'user', organizationId: 'org-456' },
    } as any);

    const mockCollection = {
      insertOne: vi.fn(),
      findOne: vi.fn().mockResolvedValue(null),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
      updateOne: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'test-agent',
      },
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        rating: 5,
        comment: 'Great prompt!',
      }),
    });

    await POST(request);

    // Verify audit logging was called
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        organizationId: 'org-456',
        resourceType: 'prompt',
        resourceId: 'test-prompt-id',
        action: expect.stringContaining('Submitted detailed rating'),
        success: true,
      })
    );
  });

  it('should update existing rating if within 24 hours', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { getDb } = await import('@/lib/mongodb');
    const { auth } = await import('@/lib/auth');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123' },
    } as any);

    const existingRating = {
      _id: 'existing-rating-id',
      userId: 'user-123',
      promptId: 'test-prompt-id',
      rating: 3,
      timestamp: new Date(),
    };

    const mockCollection = {
      insertOne: vi.fn(),
      findOne: vi.fn().mockResolvedValue(existingRating),
      updateOne: vi.fn(),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        rating: 5,
      }),
    });

    await POST(request);

    // Should update, not insert
    expect(mockCollection.updateOne).toHaveBeenCalled();
    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });

  it('should require rating between 1 and 5', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { DetailedRatingSchema } = await import('@/lib/db/schemas/user-feedback');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    vi.mocked(DetailedRatingSchema.parse).mockImplementation(() => {
      throw new Error('Rating must be between 1 and 5');
    });

    const request = new NextRequest('http://localhost/api/feedback/rating', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        rating: 6, // Invalid
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

