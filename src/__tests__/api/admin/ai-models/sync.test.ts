import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/middleware/rbac', () => ({
  withRBAC: vi.fn(() => vi.fn()),
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn(),
}));

vi.mock('@/lib/services/AIModelService', () => ({
  aiModelService: {
    bulkUpsert: vi.fn(),
  },
}));

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    models: {
      list: vi.fn(),
    },
  })),
}));

const authModule = await import('@/lib/auth');
const rbacModule = await import('@/lib/middleware/rbac');
const mockedAuth = vi.mocked(authModule);
const mockedRBAC = vi.mocked(rbacModule);

describe('POST /api/admin/ai-models/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('returns 401 when user is not authenticated', async () => {
    mockedAuth.auth.mockResolvedValue(null);
    mockedRBAC.withRBAC.mockReturnValue(() => Promise.resolve(null));

    const { POST } = await import('@/app/api/admin/ai-models/sync/route');
    const request = new NextRequest('http://localhost/api/admin/ai-models/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('allows admin, super_admin, and org_admin roles', async () => {
    // The test verifies that withRBAC is called with the correct roles
    const { POST } = await import('@/app/api/admin/ai-models/sync/route');

    expect(mockedRBAC.withRBAC).toHaveBeenCalledWith({
      roles: ['admin', 'super_admin', 'org_admin'],
    });
  });

  it('syncs models successfully when authenticated', async () => {
    mockedAuth.auth.mockResolvedValue({
      user: { id: 'test-user-id', role: 'super_admin' },
    } as any);
    mockedRBAC.withRBAC.mockReturnValue(() => Promise.resolve(null));

    const aiModelService = (await import('@/lib/services/AIModelService')).aiModelService;
    vi.mocked(aiModelService.bulkUpsert).mockResolvedValue({
      created: 5,
      updated: 10,
    });

    const OpenAI = (await import('openai')).default;
    vi.mocked(OpenAI).mockReturnValue({
      models: {
        list: vi.fn().mockResolvedValue({
          data: [],
        }),
      },
    } as any);

    const { POST } = await import('@/app/api/admin/ai-models/sync/route');
    const request = new NextRequest('http://localhost/api/admin/ai-models/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.created).toBeGreaterThanOrEqual(0);
    expect(data.updated).toBeGreaterThanOrEqual(0);
  });
});
