/**
 * Feedback API Tests
 * Tests for POST /api/feedback/quick endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/feedback/quick/route';

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

vi.mock('@/lib/db/schemas/user-feedback', () => ({
  QuickFeedbackSchema: {
    parse: vi.fn((data) => data),
  },
  FEEDBACK_COLLECTIONS: {
    QUICK_FEEDBACK: 'prompt_quick_feedback',
    SCORE_AGGREGATES: 'prompt_score_aggregates',
  },
}));

describe('POST /api/feedback/quick', () => {
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

    const request = new NextRequest('http://localhost/api/feedback/quick', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        action: 'like',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('should save quick feedback successfully', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { getDb } = await import('@/lib/mongodb');
    const { auth } = await import('@/lib/auth');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetAt: new Date(),
    });

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', organizationId: 'org-456' },
    } as any);

    const mockCollection = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
      updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/quick', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        action: 'like',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockCollection.insertOne).toHaveBeenCalled();
  });

  it('should handle missing promptId', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { QuickFeedbackSchema } = await import('@/lib/db/schemas/user-feedback');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });

    vi.mocked(QuickFeedbackSchema.parse).mockImplementation(() => {
      throw new Error('promptId is required');
    });

    const request = new NextRequest('http://localhost/api/feedback/quick', {
      method: 'POST',
      body: JSON.stringify({
        action: 'like',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('should capture organizationId from session', async () => {
    const { checkFeedbackRateLimit } = await import('@/lib/security/feedback-rate-limit');
    const { getDb } = await import('@/lib/mongodb');
    const { auth } = await import('@/lib/auth');
    const { QuickFeedbackSchema } = await import('@/lib/db/schemas/user-feedback');

    vi.mocked(checkFeedbackRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', organizationId: 'org-456' },
    } as any);

    const mockCollection = {
      insertOne: vi.fn(),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
      updateOne: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/quick', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'test-prompt-id',
        action: 'like',
      }),
    });

    await POST(request);

    // Verify organizationId was passed to schema
    expect(QuickFeedbackSchema.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-456',
      })
    );
  });
});

