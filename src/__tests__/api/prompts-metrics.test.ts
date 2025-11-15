/**
 * Tests for /api/prompts/metrics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/prompts/metrics/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      aggregate: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    }),
  }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 10,
    resetAt: new Date(),
  }),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: vi.fn(),
  },
}));

describe('/api/prompts/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return metrics for prompts', async () => {
    const request = new NextRequest('http://localhost:3000/api/prompts/metrics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('prompts');
    expect(data).toHaveProperty('metric');
  });

  it('should enforce rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Too many requests',
    });

    const request = new NextRequest('http://localhost:3000/api/prompts/metrics');

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(checkRateLimit).toHaveBeenCalled();
  });

  it('should filter by prompt IDs when provided', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/prompts/metrics?promptIds=prompt1,prompt2'
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should sort by requested metric', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/prompts/metrics?metric=favorites'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(data.metric).toBe('favorites');
  });

  it('should handle errors gracefully', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    vi.mocked(getMongoDb).mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/prompts/metrics');

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
