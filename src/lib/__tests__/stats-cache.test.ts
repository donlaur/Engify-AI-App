/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stats Cache Tests
 * Tests for client-side stats caching with localStorage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

describe('Stats Cache', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return static fallback during SSR', async () => {
    // Mock SSR environment (no window)
    const originalWindow = global.window;
    // @ts-expect-error - Testing SSR
    delete global.window;

    const { getStats } = await import('../stats-cache');
    const stats = await getStats();

    expect(stats.stats.prompts).toBeGreaterThan(0);
    expect(stats.stats.patterns).toBeGreaterThan(0);

    // Restore window
    global.window = originalWindow;
  });

  it('should fetch from API when cache is empty', async () => {
    const mockData = {
      stats: { prompts: 100, patterns: 23, pathways: 12, users: 50 },
      categories: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { getStats } = await import('../stats-cache');
    const stats = await getStats();

    expect(fetch).toHaveBeenCalledWith('/api/stats');
    expect(stats).toEqual(mockData);
  });

  it('should use cached data when cache is fresh', async () => {
    const cachedData = {
      data: {
        stats: { prompts: 100, patterns: 23, pathways: 12, users: 50 },
        categories: [],
      },
      timestamp: Date.now(), // Fresh cache
    };

    localStorageMock.setItem('engify_stats', JSON.stringify(cachedData));

    const { getStats } = await import('../stats-cache');
    const stats = await getStats();

    expect(fetch).not.toHaveBeenCalled();
    expect(stats).toEqual(cachedData.data);
  });

  it('should fetch new data when cache is expired', async () => {
    const expiredData = {
      data: {
        stats: { prompts: 50, patterns: 23, pathways: 12, users: 25 },
        categories: [],
      },
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago (expired)
    };

    localStorageMock.setItem('engify_stats', JSON.stringify(expiredData));

    const newData = {
      stats: { prompts: 100, patterns: 23, pathways: 12, users: 50 },
      categories: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => newData,
    });

    const { getStats } = await import('../stats-cache');
    const stats = await getStats();

    expect(fetch).toHaveBeenCalledWith('/api/stats');
    expect(stats).toEqual(newData);
  });

  it('should return fallback when API fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { getStats } = await import('../stats-cache');
    const stats = await getStats();

    expect(stats.stats.prompts).toBeGreaterThan(0);
    expect(stats.stats.patterns).toBeGreaterThan(0);
  });

  it('should cache successful API responses', async () => {
    const mockData = {
      stats: { prompts: 100, patterns: 23, pathways: 12, users: 50 },
      categories: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { getStats } = await import('../stats-cache');
    await getStats();

    const cached = localStorageMock.getItem('engify_stats');
    expect(cached).toBeTruthy();

    const parsed = JSON.parse(cached || '{}');
    expect(parsed.data).toEqual(mockData);
    expect(parsed.timestamp).toBeLessThanOrEqual(Date.now());
  });
});
