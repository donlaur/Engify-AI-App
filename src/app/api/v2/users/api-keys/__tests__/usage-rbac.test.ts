import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../usage/route';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/services/ApiKeyUsageService', () => ({
  apiKeyUsageService: {
    getDailyUsage: vi
      .fn()
      .mockResolvedValue([{ date: '2025-10-31', tokens: 100 }]),
    getUsageSummary: vi.fn().mockResolvedValue({ total: 0 }),
  },
}));

describe('RBAC /api/v2/users/api-keys/usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies GET when role lacks users:read permission', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } });

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/api-keys/usage'
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('allows GET for super_admin and returns summary', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/api-keys/usage'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toBeDefined();
  });

  it('allows GET with days parameter and returns daily usage', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/api-keys/usage?days=7'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dailyUsage).toBeDefined();
  });
});
