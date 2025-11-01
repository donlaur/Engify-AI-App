/**
 * Patterns API Tests
 * Tests for GET /api/patterns endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/patterns/route';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

describe('GET /api/patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost/api/patterns');
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it('should fetch all patterns successfully', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { getDb } = await import('@/lib/mongodb');

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(),
    });

    const mockPatterns = [
      {
        id: 'persona',
        name: 'Persona Pattern',
        category: 'FOUNDATIONAL',
        level: 'beginner',
        description: 'Test description',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockPatterns),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/patterns');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPatterns);
    expect(data.count).toBe(1);
  });

  it('should filter by category', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { getDb } = await import('@/lib/mongodb');

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(),
    });

    const mockPatterns = [
      {
        id: 'persona',
        name: 'Persona Pattern',
        category: 'FOUNDATIONAL',
        level: 'beginner',
        description: 'Test description',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockPatterns),
        }),
      }),
    } as any);

    const request = new NextRequest(
      'http://localhost/api/patterns?category=FOUNDATIONAL'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPatterns);
  });
});
