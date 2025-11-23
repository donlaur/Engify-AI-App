/**
 * Patrol Repeat Patterns API Route Tests
 *
 * Tests for GET /api/patrol/repeat-patterns
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/patrol/repeat-patterns/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('GET /api/patrol/repeat-patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.PATROL_GATEWAY_URL;
  });

  it('should require authentication', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return patterns for authenticated user', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
      },
    } as any);

    const mockPatterns = {
      patterns: [
        {
          warningType: 'missing-error-handling',
          count: 5,
          files: ['file1.ts', 'file2.ts'],
          recommendation: 'Add error handling',
          severity: 'high' as const,
        },
      ],
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPatterns,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.patterns).toEqual(mockPatterns.patterns);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/patrol/repeat-patterns?user_id=user123'),
      expect.any(Object)
    );
  });

  it('should use email as fallback if user ID is not available', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: {
        email: 'test@example.com',
      },
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ patterns: [] }),
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('user_id=test%40example.com'),
      expect.any(Object)
    );
  });

  it('should use PATROL_GATEWAY_URL environment variable', async () => {
    process.env.PATROL_GATEWAY_URL = 'https://gateway.example.com';

    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user123',
      },
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ patterns: [] }),
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://gateway.example.com'),
      expect.any(Object)
    );
  });

  it('should return empty patterns if gateway is unavailable', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user123',
      },
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.patterns).toEqual([]);
  });

  it('should return empty patterns on fetch error', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user123',
      },
    } as any);

    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/patrol/repeat-patterns');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.patterns).toEqual([]);
  });
});

