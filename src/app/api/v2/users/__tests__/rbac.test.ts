import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../route';

// Helper to mock auth role from '@/lib/auth'
function mockAuthRole(role: string) {
  vi.doMock('@/lib/auth', () => ({
    auth: vi.fn(async () => ({
      user: { id: 't1', email: 't@example.com', role },
    })),
  }));
}

describe('RBAC: /api/v2/users', () => {
  it('denies GET for basic user (missing users:read)', async () => {
    mockAuthRole('user');
    const req = new NextRequest('http://localhost:3000/api/v2/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('denies POST for basic user (missing users:write)', async () => {
    mockAuthRole('user');
    const req = new NextRequest('http://localhost:3000/api/v2/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', name: 'X' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
