import { describe, it, expect, vi } from 'vitest';

describe('RBAC: /admin page', () => {
  it('redirects non-admin users', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({ user: { id: 'u1', role: 'user' } })),
    }));
    const redirectSpy = vi.fn(() => {
      throw new Error('REDIRECT');
    });
    vi.doMock('next/navigation', () => ({ redirect: redirectSpy }));
    const AdminPage = (await import('../page')).default;
    await expect(AdminPage()).rejects.toThrowError('REDIRECT');
    expect(redirectSpy).toHaveBeenCalledWith('/');
  });

  it('renders for admin', async () => {
    vi.doMock('@/lib/auth', () => ({
      auth: vi.fn(async () => ({
        user: { id: 'a1', role: 'super_admin', name: 'Admin' },
      })),
    }));
    // Provide no-op redirect to avoid throwing
    vi.doMock('next/navigation', () => ({ redirect: vi.fn() }));
    const AdminPage = (await import('../page')).default;
    const jsx = await AdminPage();
    // Basic smoke: the returned JSX should include title text
    expect(JSON.stringify(jsx)).toContain('Admin Dashboard');
  });
});
