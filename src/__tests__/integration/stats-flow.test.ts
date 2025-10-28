/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * End-to-End Stats Flow Integration Test
 * Tests: Client → API → MongoDB → Cache
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn(),
}));

describe('Stats Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full stats flow: MongoDB → API → Client → Cache', async () => {
    // Step 1: MongoDB returns data
    const { getMongoDb } = await import('@/lib/db/mongodb');
    
    const mockDb = {
      collection: vi.fn().mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(150),
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([
                { _id: '1', title: 'Popular Prompt', views: 500, rating: 4.8 },
              ]),
            }),
          }),
        }),
        aggregate: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([
            { _id: 'engineering', count: 80 },
            { _id: 'design', count: 40 },
            { _id: 'product', count: 30 },
          ]),
        }),
      }),
    };

    (getMongoDb as any).mockResolvedValue(mockDb);

    // Step 2: API route processes MongoDB data
    const { GET } = await import('@/app/api/stats/route');
    const apiResponse = await GET();
    const apiData = await apiResponse.json();

    expect(apiData.stats.prompts).toBe(150);
    expect(apiData.categories).toHaveLength(3);
    expect(apiData.source).toBe('mongodb');

    // Step 3: Client fetches from API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => apiData,
    });

    const clientResponse = await fetch('/api/stats');
    const clientData = await clientResponse.json();

    expect(clientData.stats.prompts).toBe(150);

    // Step 4: Data is cached in localStorage
    const localStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const { getStats } = await import('@/lib/stats-cache');
    
    // Mock fetch for cache test
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => clientData,
    });

    await getStats();

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'engify_stats',
      expect.stringContaining('"prompts":150')
    );
  });

  it('should handle MongoDB timeout and use fallback', async () => {
    // Step 1: MongoDB times out
    const { getMongoDb } = await import('@/lib/db/mongodb');
    
    (getMongoDb as any).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 10000))
    );

    // Step 2: API returns fallback
    const { GET } = await import('@/app/api/stats/route');
    const apiResponse = await GET();
    const apiData = await apiResponse.json();

    expect(apiData.source).toBe('static');
    expect(apiData.stats.prompts).toBeGreaterThan(0);

    // Step 3: Client receives fallback data
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => apiData,
    });

    const clientResponse = await fetch('/api/stats');
    const clientData = await clientResponse.json();

    expect(clientData.source).toBe('static');
  });

  it('should use cached data on subsequent requests', async () => {
    const cachedData = {
      data: {
        stats: { prompts: 150, patterns: 23, pathways: 12, users: 50 },
        categories: [{ name: 'engineering', count: 80 }],
      },
      timestamp: Date.now(),
    };

    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(cachedData)),
      setItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    global.fetch = vi.fn();

    const { getStats } = await import('@/lib/stats-cache');
    const stats = await getStats();

    // Should use cache, not fetch
    expect(global.fetch).not.toHaveBeenCalled();
    expect(stats.stats.prompts).toBe(150);
  });

  it('should refresh cache when expired', async () => {
    const expiredData = {
      data: {
        stats: { prompts: 100, patterns: 23, pathways: 12, users: 30 },
        categories: [],
      },
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    };

    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(expiredData)),
      setItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const newData = {
      stats: { prompts: 150, patterns: 23, pathways: 12, users: 50 },
      categories: [],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => newData,
    });

    const { getStats } = await import('@/lib/stats-cache');
    const stats = await getStats();

    // Should fetch new data
    expect(global.fetch).toHaveBeenCalled();
    expect(stats.stats.prompts).toBe(150);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should handle complete failure gracefully', async () => {
    // MongoDB fails
    const { getMongoDb } = await import('@/lib/db/mongodb');
    (getMongoDb as any).mockRejectedValue(new Error('Connection failed'));

    // API returns fallback
    const { GET } = await import('@/app/api/stats/route');
    const apiResponse = await GET();
    const apiData = await apiResponse.json();

    expect(apiData.source).toBe('static');

    // Client fetch fails
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const { getStats } = await import('@/lib/stats-cache');
    const stats = await getStats();

    // Should still return fallback
    expect(stats.stats.prompts).toBeGreaterThan(0);
  });
});
