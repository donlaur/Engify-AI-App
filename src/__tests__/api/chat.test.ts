/**
 * Chat API Route Tests
 *
 * Tests for POST /api/chat
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/security/sanitize', () => ({
  sanitizeText: vi.fn((text: string) => text),
}));

vi.mock('@/lib/config/ai-models', () => ({
  getModelById: vi.fn(() => ({ id: 'gpt-3.5-turbo' })),
}));

vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: class OpenAI {
      constructor() {
        // Constructor for OpenAI class
      }
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 429 when rate limit exceeded', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(auth).mockResolvedValue(null as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
  });

  it('should sanitize user input', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { sanitizeText } = await import('@/lib/security/sanitize');

    vi.mocked(auth).mockResolvedValue(null as any);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: new Date(),
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: '<script>alert("xss")</script>' }],
      }),
    });

    await POST(request);

    expect(sanitizeText).toHaveBeenCalled();
  });
});
