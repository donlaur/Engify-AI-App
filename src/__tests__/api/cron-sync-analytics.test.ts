import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/analytics/redis-tracker', () => ({
  syncStatsToMongoDB: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

const trackerModule = await import('@/lib/analytics/redis-tracker');
const rateLimitModule = await import('@/lib/rate-limit');
const mockedTracker = vi.mocked(trackerModule);
const mockedRateLimit = vi.mocked(rateLimitModule);

describe('GET /api/cron/sync-analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'secret';
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const { GET } = await import('@/app/api/cron/sync-analytics/route');
    const request = new NextRequest('http://localhost/api/cron/sync-analytics');

    const response = await GET(request);
    expect(response.status).toBe(429);
    expect(mockedTracker.syncStatsToMongoDB).not.toHaveBeenCalled();
  });

  it('returns 401 when secret invalid', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });

    const { GET } = await import('@/app/api/cron/sync-analytics/route');
    const request = new NextRequest('http://localhost/api/cron/sync-analytics');

    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(mockedTracker.syncStatsToMongoDB).not.toHaveBeenCalled();
  });

  it('syncs analytics when authorized and allowed', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
    mockedTracker.syncStatsToMongoDB.mockResolvedValue(undefined);

    const { GET } = await import('@/app/api/cron/sync-analytics/route');
    const request = new NextRequest('http://localhost/api/cron/sync-analytics', {
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(mockedTracker.syncStatsToMongoDB).toHaveBeenCalled();
  });

  it('returns 500 when sync fails unexpectedly', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
    mockedTracker.syncStatsToMongoDB.mockRejectedValue(new Error('boom'));

    const { GET } = await import('@/app/api/cron/sync-analytics/route');
    const request = new NextRequest('http://localhost/api/cron/sync-analytics', {
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
