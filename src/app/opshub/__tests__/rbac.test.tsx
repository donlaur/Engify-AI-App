import { describe, it, expect, vi } from 'vitest';

// Mock dependencies at top level
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/db/client', () => ({
  getDb: vi.fn(),
}));

describe('RBAC: /opshub page', () => {
  it('redirects non-admin users', async () => {
    const { auth } = await import('@/lib/auth');
    const { redirect } = await import('next/navigation');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', role: 'user' },
    });
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('REDIRECT');
    });

    const OpsHubPage = (await import('../page')).default;
    await expect(OpsHubPage()).rejects.toThrowError('REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('renders for admin', async () => {
    const { auth } = await import('@/lib/auth');
    const { getDb } = await import('@/lib/db/client');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'a1', role: 'super_admin', name: 'Admin' },
    });
    vi.mocked(getDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(0),
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    });

    const OpsHubPage = (await import('../page')).default;
    const jsx = await OpsHubPage();
    // Basic smoke: the returned JSX should include title text
    expect(JSON.stringify(jsx)).toContain('Admin Dashboard');
  });
});
