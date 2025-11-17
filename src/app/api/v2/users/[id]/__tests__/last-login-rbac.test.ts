import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '../route';

const updateLastLogin = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/di/Container', () => ({
  getUserService: vi.fn(() => ({
    updateLastLogin,
  })),
}));

describe('RBAC PATCH /api/v2/users/[id]/last-login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateLastLogin.mockResolvedValue(undefined);
  });

  it('denies updating another user when role lacks elevation', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/u2/last-login',
      {
        method: 'PATCH',
      }
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: 'u2' }) });
    expect(res.status).toBe(403);
    expect(updateLastLogin).not.toHaveBeenCalled();
  });

  it('allows updating own last login', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/u1/last-login',
      {
        method: 'PATCH',
      }
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: 'u1' }) });
    expect(res.status).toBe(200);
    expect(updateLastLogin).toHaveBeenCalledWith('u1');
  });

  it('allows elevated role to update another user', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    } as any);

    const req = new NextRequest(
      'http://localhost:3000/api/v2/users/u2/last-login',
      {
        method: 'PATCH',
      }
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: 'u2' }) });
    expect(res.status).toBe(200);
    expect(updateLastLogin).toHaveBeenCalledWith('u2');
  });
});
