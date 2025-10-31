import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('Admin Content Indexer (stub)', () => {
  beforeEach(() => vi.resetModules());

  it('denies non-admin', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'u1', role: 'user' } })),
    }));
    const { GET } = await import('../route');
    const res = await GET(
      new NextRequest('http://localhost:3000/api/admin/content/index')
    );
    expect(res.status).toBe(403);
  });

  it('returns 404 when disabled', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({
        user: { id: 'a1', role: 'super_admin', mfaVerified: true },
      })),
    }));
    // Ensure flag off
    process.env.RAG_INDEX_ENABLED = 'false';
    const { GET } = await import('../route');
    const res = await GET(
      new NextRequest('http://localhost:3000/api/admin/content/index')
    );
    expect(res.status).toBe(404);
  });

  it('enqueues (stub) when enabled', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({
        user: { id: 'a1', role: 'super_admin', mfaVerified: true },
      })),
    }));
    process.env.RAG_INDEX_ENABLED = 'true';
    const { POST } = await import('../route');
    const req = new NextRequest(
      'http://localhost:3000/api/admin/content/index',
      {
        method: 'POST',
        body: JSON.stringify({ hashes: ['a'.repeat(64), 'b'.repeat(64)] }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.enqueued).toBe(2);
  });
});
