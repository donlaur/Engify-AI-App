import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Execution route hits multiple services in the happy path. For RBAC checks we only
// need to ensure the middleware blocks unauthorized roles before deeper logic runs.

describe('RBAC /api/v2/execution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies POST when role lacks workbench:ai_execution', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/execution', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hi' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('denies GET when role lacks workbench:ai_execution', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/execution');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('allows POST for super_admin', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/execution', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Generate summary', provider: 'openai' }),
    });

    const res = await POST(req);
    expect(res.status).not.toBe(403);
  });

  it('allows GET for super_admin', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin', role: 'super_admin' },
    } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/execution');
    const res = await GET(req);
    expect(res.status).not.toBe(403);
  });
});
