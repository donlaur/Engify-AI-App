import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/prompts/generate-prompts-json', () => ({
  generatePromptsJson: vi.fn(),
}));

vi.mock('@/lib/patterns/generate-patterns-json', () => ({
  generatePatternsJson: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}));

const promptsModule = await import('@/lib/prompts/generate-prompts-json');
const patternsModule = await import('@/lib/patterns/generate-patterns-json');
const rateLimitModule = await import('@/lib/rate-limit');
const mockedPrompts = vi.mocked(promptsModule);
const mockedPatterns = vi.mocked(patternsModule);
const mockedRateLimit = vi.mocked(rateLimitModule);

describe('POST /api/webhooks/content-updated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRateLimit.getClientIp.mockReturnValue('10.0.0.1');
    process.env.WEBHOOK_SECRET = 'secret';
    delete process.env.CRON_SECRET;
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: 'prompts' }),
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(mockedPrompts.generatePromptsJson).not.toHaveBeenCalled();
  });

  it('rejects invalid type even after sanitization', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: '<script>alert(1)</script>' }),
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(mockedPrompts.generatePromptsJson).not.toHaveBeenCalled();
    expect(mockedPatterns.generatePatternsJson).not.toHaveBeenCalled();
  });

  it('regenerates prompts when authorized and valid', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
    mockedPrompts.generatePromptsJson.mockResolvedValue(undefined);

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: 'prompts' }),
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockedPrompts.generatePromptsJson).toHaveBeenCalled();
  });

  it('regenerates patterns when requested', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
    mockedPatterns.generatePatternsJson.mockResolvedValue(undefined);

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: 'patterns' }),
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockedPatterns.generatePatternsJson).toHaveBeenCalled();
  });

  it('returns 401 when authorization header missing', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: 'prompts' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mockedPrompts.generatePromptsJson).not.toHaveBeenCalled();
    expect(mockedPatterns.generatePatternsJson).not.toHaveBeenCalled();
  });

  it('regenerates prompts and patterns when type is all', async () => {
    mockedRateLimit.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(),
    });
    mockedPrompts.generatePromptsJson.mockResolvedValue(undefined);
    mockedPatterns.generatePatternsJson.mockResolvedValue(undefined);

    const { POST } = await import('@/app/api/webhooks/content-updated/route');
    const request = new NextRequest('http://localhost/api/webhooks/content-updated', {
      method: 'POST',
      body: JSON.stringify({ type: 'all' }),
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockedPrompts.generatePromptsJson).toHaveBeenCalled();
    expect(mockedPatterns.generatePatternsJson).toHaveBeenCalled();
  });
});
