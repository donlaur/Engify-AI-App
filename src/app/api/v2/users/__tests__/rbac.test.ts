import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies at top level
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/di/Container', () => ({
  getUserService: vi.fn(() => ({
    getAllUsers: vi.fn().mockResolvedValue([]),
    getUsersByRole: vi.fn().mockResolvedValue([]),
    getUsersByPlan: vi.fn().mockResolvedValue([]),
    getUsersByOrganization: vi.fn().mockResolvedValue([]),
    getUserStats: vi.fn().mockResolvedValue({}),
    createUser: vi.fn().mockResolvedValue({}),
  })),
}));

describe('RBAC: /api/v2/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies GET for basic user (missing users:read)', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 't1', email: 't@example.com', role: 'user' },
    });

    const req = new NextRequest('http://localhost:3000/api/v2/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('denies POST for basic user (missing users:write)', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 't1', email: 't@example.com', role: 'user' },
    });

    const req = new NextRequest('http://localhost:3000/api/v2/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', name: 'X' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('allows GET for org_admin', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'admin@example.com', role: 'org_admin' },
    });

    const req = new NextRequest('http://localhost:3000/api/v2/users');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('allows POST for org_admin', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', email: 'admin@example.com', role: 'org_admin' },
    });

    const req = new NextRequest('http://localhost:3000/api/v2/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', name: 'X' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
