import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const trackerMocks = {
  trackPromptEvent: vi.fn(),
  getPromptStats: vi.fn(),
  getTopPrompts: vi.fn(),
};

const rateLimitMocks = {
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
};

vi.mock('@/lib/analytics/redis-tracker', () => trackerMocks);
vi.mock('@/lib/rate-limit', () => rateLimitMocks);

describe('API /api/analytics/track', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trackerMocks.trackPromptEvent.mockReset();
    trackerMocks.getPromptStats.mockReset();
    trackerMocks.getTopPrompts.mockReset();
    rateLimitMocks.checkRateLimit.mockReset();
    rateLimitMocks.getClientIp.mockReset();
    rateLimitMocks.getClientIp.mockReturnValue('127.0.0.1');
    trackerMocks.trackPromptEvent.mockResolvedValue(undefined);
    trackerMocks.getPromptStats.mockResolvedValue({} as any);
    trackerMocks.getTopPrompts.mockResolvedValue([] as any);
  });

  it('returns 429 when rate limit exceeded on POST', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });
    trackerMocks.trackPromptEvent.mockResolvedValue(undefined);

    const { POST } = await import('@/app/api/analytics/track/route');
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ promptId: 'p1', event: 'view' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it('tracks event when allowed', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    const { POST } = await import('@/app/api/analytics/track/route');
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ promptId: 'p1', event: 'view' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(trackerMocks.trackPromptEvent).toHaveBeenCalledWith('p1', 'view');
  });

  it('returns top prompts from Redis on GET', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });
    trackerMocks.getTopPrompts.mockResolvedValue([
      { promptId: 'p1', executeCount: 5 },
    ] as any);

    const { GET } = await import('@/app/api/analytics/track/route');
    const response = await GET(
      new NextRequest('http://localhost/api/analytics/track')
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.topPrompts).toEqual([{ promptId: 'p1', executeCount: 5 }]);
  });

  it('returns stats for specific prompt', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });
    trackerMocks.getPromptStats.mockResolvedValue({ viewCount: 10 } as any);

    const { GET } = await import('@/app/api/analytics/track/route');
    const response = await GET(
      new NextRequest('http://localhost/api/analytics/track?promptId=p1')
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.stats).toEqual({ viewCount: 10 });
  });

  it('returns 400 when body is invalid JSON', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    const { POST } = await import('@/app/api/analytics/track/route');
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: '{bad json',
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when schema validation fails', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });

    const { POST } = await import('@/app/api/analytics/track/route');
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ promptId: 'p1', event: 'invalid' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(trackerMocks.trackPromptEvent).not.toHaveBeenCalled();
  });

  it('returns 500 when redis tracker throws on GET', async () => {
    rateLimitMocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      resetAt: new Date(),
    });
    trackerMocks.getTopPrompts.mockRejectedValue(new Error('redis down'));

    const { GET } = await import('@/app/api/analytics/track/route');
    const response = await GET(
      new NextRequest('http://localhost/api/analytics/track')
    );

    expect(response.status).toBe(500);
  });
});
