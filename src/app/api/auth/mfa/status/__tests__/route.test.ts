/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Get MFA Status API Route Tests
 * Tests MFA status retrieval
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/services/mfaService', () => ({
  mfaService: {
    getMFAStatus: vi.fn(),
  },
}));

describe('GET /api/auth/mfa/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return MFA status when enabled', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    const mfaStatus = {
      enabled: true,
      method: 'sms' as const,
      phoneNumber: '+1***7890',
    };

    vi.mocked(mfaService.getMFAStatus).mockResolvedValue(mfaStatus);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/status',
      {
        method: 'GET',
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status.enabled).toBe(true);
    expect(data.status.method).toBe('sms');
    expect(mfaService.getMFAStatus).toHaveBeenCalledWith('user123');
  });

  it('should return MFA status when disabled', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.getMFAStatus).mockResolvedValue({
      enabled: false,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/status',
      {
        method: 'GET',
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status.enabled).toBe(false);
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/status',
      {
        method: 'GET',
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
