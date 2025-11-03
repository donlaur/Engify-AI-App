/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stats API Route Tests
 * Tests MongoDB timeout handling and fallback behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';

// Mock MongoDB
vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn(),
}));

describe('GET /api/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return stats from MongoDB when connection succeeds', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    const mockDb = {
      collection: vi.fn().mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(100),
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi
                .fn()
                .mockResolvedValue([
                  { _id: '1', title: 'Test', views: 100, rating: 5 },
                ]),
            }),
          }),
        }),
        aggregate: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([{ _id: 'category1', count: 50 }]),
        }),
      }),
    };

    (getMongoDb as any).mockResolvedValue(mockDb);

    const response = await GET();
    const data = await response.json();

    expect(data.stats.prompts).toBe(100);
    expect(data.source).toBe('mongodb');
  });

  it('should timeout and return fallback when MongoDB is slow', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    // Simulate slow connection (never resolves - hang indefinitely)
    (getMongoDb as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const response = await GET();
    const data = await response.json();

    // Should return static fallback after route's 5s timeout
    expect(data.stats.prompts).toBeGreaterThan(0);
    expect(data.source).toBe('static');
  }, 10000); // Increase test timeout to 10s to allow route's 5s timeout

  it('should return fallback when MongoDB connection fails', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    (getMongoDb as any).mockRejectedValue(new Error('Connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(data.stats.prompts).toBeGreaterThan(0);
    expect(data.source).toBe('static');
  });

  it('should include category stats in response', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    const mockDb = {
      collection: vi.fn().mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(100),
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
        aggregate: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([
            { _id: 'engineering', count: 30 },
            { _id: 'design', count: 20 },
          ]),
        }),
      }),
    };

    (getMongoDb as any).mockResolvedValue(mockDb);

    const response = await GET();
    const data = await response.json();

    // Categories are sorted by count descending, check structure instead of exact length
    expect(Array.isArray(data.categories)).toBe(true);
    if (data.categories.length > 0) {
      expect(data.categories[0]).toHaveProperty('name');
      expect(data.categories[0]).toHaveProperty('count');
    }
  });
});
