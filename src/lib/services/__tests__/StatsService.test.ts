/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * StatsService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invalidateStatsCache } from '../StatsService';

vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn(async () => ({
    collection: vi.fn(() => ({
      countDocuments: vi.fn(async () => 100),
      aggregate: vi.fn(() => ({
        toArray: vi.fn(async () => []),
      })),
      distinct: vi.fn(async () => []),
    })),
  })),
}));

vi.mock('@/lib/ai/providers', () => ({
  AI_MODELS: {
    'gpt-4': { provider: 'openai', tier: 'premium' },
  },
}));

describe('StatsService', () => {
  beforeEach(() => {
    invalidateStatsCache();
  });

  it('should invalidate stats cache', () => {
    expect(() => invalidateStatsCache()).not.toThrow();
  });
});
