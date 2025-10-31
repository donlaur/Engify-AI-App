import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

const ORIGINAL_ENV = { ...process.env };

describe('Admin content review API', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  it('denies GET to non admin roles', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'u1', role: 'user' } })),
    }));
    vi.doMock('@/lib/db/client', () => ({
      getDb: vi.fn(async () => ({ collection: vi.fn() })),
    }));

    const { GET } = await import('../route');
    const res = await GET(
      new NextRequest('http://localhost:3000/api/admin/content/review')
    );
    expect(res.status).toBe(403);
  });

  it('returns pending items for super admin', async () => {
    let recordedQuery: Record<string, unknown> | null = null;
    const toArray = vi
      .fn()
      .mockResolvedValue([{ hash: 'abc', reviewStatus: 'pending' }]);
    const project = vi.fn().mockReturnValue({ toArray });
    const limit = vi.fn().mockReturnValue({ project });
    const sort = vi.fn().mockReturnValue({ limit });
    const find = vi.fn().mockImplementation((query) => {
      recordedQuery = query;
      return { sort };
    });

    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'a1', role: 'super_admin' } })),
    }));
    vi.doMock('@/lib/db/client', () => ({
      getDb: vi.fn(async () => ({
        collection: vi.fn(() => ({ find })),
      })),
    }));

    const { GET } = await import('../route');
    const res = await GET(
      new NextRequest(
        'http://localhost:3000/api/admin/content/review?status=pending'
      )
    );
    expect(res.status).toBe(200);
    expect(recordedQuery).toEqual({ reviewStatus: 'pending' });
    expect(await res.json()).toEqual({
      success: true,
      data: [{ hash: 'abc', reviewStatus: 'pending' }],
    });
  });

  it('scopes PATCH by organization for org_admin', async () => {
    const orgId = '507f1f77bcf86cd799439011';
    const updateOne = vi
      .fn()
      .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({
        user: { id: 'orgAdmin', role: 'org_admin', organizationId: orgId },
      })),
    }));
    vi.doMock('@/lib/db/client', () => ({
      getDb: vi.fn(async () => ({
        collection: vi.fn(() => ({ updateOne })),
      })),
    }));

    const { PATCH } = await import('../route');
    const req = new NextRequest(
      'http://localhost:3000/api/admin/content/review',
      {
        method: 'PATCH',
        body: JSON.stringify({
          hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          action: 'approve',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const filterArg = updateOne.mock.calls[0][0] as Record<string, unknown>;
    expect(filterArg.hash).toBe(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    );
    expect(filterArg.organizationId).toBeInstanceOf(ObjectId);
    expect((filterArg.organizationId as ObjectId).toHexString()).toBe(orgId);
  });
});
