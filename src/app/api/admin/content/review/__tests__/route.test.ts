import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/client', () => ({ getDb: vi.fn() }));

describe('Admin Content Review API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denies non-admin access', async () => {
    const { auth } = await import('@/lib/auth');
    const { GET } = await import('../route');
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'user' } });
    const req = new NextRequest(
      'http://localhost:3000/api/admin/content/review'
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('lists pending items for admin', async () => {
    const { auth } = await import('@/lib/auth');
    const { getDb } = await import('@/lib/db/client');
    const { GET } = await import('../route');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', role: 'super_admin' },
    });
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              project: vi.fn().mockReturnValue({
                toArray: vi
                  .fn()
                  .mockResolvedValue([{ hash: 'h', reviewStatus: 'pending' }]),
              }),
            }),
          }),
        }),
      }),
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/content/review'
    );
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('approves a hash for admin', async () => {
    const { auth } = await import('@/lib/auth');
    const { getDb } = await import('@/lib/db/client');
    const { PATCH } = await import('../route');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', role: 'super_admin' },
    });
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        updateOne: vi
          .fn()
          .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      }),
    });

    const req = new NextRequest(
      'http://localhost:3000/api/admin/content/review',
      {
        method: 'PATCH',
        body: JSON.stringify({ hash: 'a'.repeat(64), action: 'approve' }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.modified).toBe(1);
  });
});
