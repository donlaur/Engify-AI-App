/**
 * Tests for /api/auth/mcp-token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/mcp-token/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
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
    error: vi.fn(),
  },
}));

describe('/api/auth/mcp-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate token for authenticated users', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/mcp-token', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('expiresIn');
    expect(data).toHaveProperty('userId');
    expect(data.userId).toBe('user123');
  });

  it('should reject unauthenticated requests', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/auth/mcp-token', {
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should enforce rate limiting', async () => {
    const { auth } = await import('@/lib/auth');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      reason: 'Too many token requests',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/mcp-token', {
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(checkRateLimit).toHaveBeenCalledWith('user123', 'authenticated');
  });

  it('should handle errors gracefully', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockRejectedValueOnce(new Error('Auth error'));

    const request = new NextRequest('http://localhost:3000/api/auth/mcp-token', {
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
