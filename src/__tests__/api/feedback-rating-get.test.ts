/**
 * GET /api/feedback/rating Tests
 * Tests retrieving feedback aggregates for a prompt
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/feedback/rating/route';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/db/schemas/user-feedback', () => ({
  FEEDBACK_COLLECTIONS: {
    SCORE_AGGREGATES: 'prompt_score_aggregates',
  },
}));

describe('GET /api/feedback/rating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when promptId is missing', async () => {
    const request = new NextRequest('http://localhost/api/feedback/rating');
    
    const response = await GET(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('promptId required');
  });

  it('returns default values when no aggregates exist', async () => {
    const { getDb } = await import('@/lib/mongodb');

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating?promptId=test-prompt-123');
    
    const response = await GET(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.promptId).toBe('test-prompt-123');
    expect(data.quickFeedback.likes).toBe(0);
    expect(data.quickFeedback.saves).toBe(0);
    expect(data.detailedRatings.averageRating).toBe(0);
    expect(data.detailedRatings.ratingCount).toBe(0);
    expect(data.overallScore).toBe(0);
  });

  it('returns aggregates when they exist', async () => {
    const { getDb } = await import('@/lib/mongodb');

    const mockAggregate = {
      promptId: 'test-prompt-123',
      quickFeedback: {
        likes: 50,
        saves: 30,
        helpful: 45,
        notHelpful: 5,
        shares: 10,
        totalInteractions: 140,
      },
      detailedRatings: {
        averageRating: 4.5,
        ratingCount: 20,
        ratingDistribution: {
          stars1: 0,
          stars2: 1,
          stars3: 3,
          stars4: 8,
          stars5: 8,
        },
      },
      overallScore: 85,
      confidenceScore: 0.9,
    };

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(mockAggregate),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating?promptId=test-prompt-123');
    
    const response = await GET(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.promptId).toBe('test-prompt-123');
    expect(data.quickFeedback.likes).toBe(50);
    expect(data.quickFeedback.saves).toBe(30);
    expect(data.detailedRatings.averageRating).toBe(4.5);
    expect(data.detailedRatings.ratingCount).toBe(20);
    expect(data.overallScore).toBe(85);
  });

  it('handles database errors gracefully', async () => {
    const { getDb } = await import('@/lib/mongodb');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/feedback/rating?promptId=test-prompt-123');
    
    const response = await GET(request);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch feedback');
  });

  it('queries correct collection', async () => {
    const { getDb } = await import('@/lib/mongodb');

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/feedback/rating?promptId=test-prompt-123');
    await GET(request);

    expect(mockCollection.findOne).toHaveBeenCalledWith({
      promptId: 'test-prompt-123',
    });
  });
});

