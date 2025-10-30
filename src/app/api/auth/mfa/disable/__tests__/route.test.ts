/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Disable MFA API Route Tests
 * Tests MFA disablement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/services/mfaService', () => ({
  mfaService: {
    disableMFA: vi.fn(),
  },
}));

describe('POST /api/auth/mfa/disable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should disable MFA successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.disableMFA).mockResolvedValue({
      success: true,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/disable',
      {
        method: 'POST',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('MFA disabled successfully');
    expect(mfaService.disableMFA).toHaveBeenCalledWith('user123');
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/disable',
      {
        method: 'POST',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle disable failure', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.disableMFA).mockResolvedValue({
      success: false,
      error: 'MFA is not enabled',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/disable',
      {
        method: 'POST',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('MFA is not enabled');
  });
});
