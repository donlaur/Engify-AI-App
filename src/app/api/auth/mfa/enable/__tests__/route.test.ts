/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enable MFA API Route Tests
 * Tests MFA enablement with phone number validation
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
    enableMFA: vi.fn(),
    sendMFACode: vi.fn(),
  },
}));

describe('POST /api/auth/mfa/enable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enable MFA successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' },
    } as any);

    vi.mocked(mfaService.enableMFA).mockResolvedValue({
      success: true,
    });

    vi.mocked(mfaService.sendMFACode).mockResolvedValue({
      success: true,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/enable',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('MFA enabled');
    expect(mfaService.enableMFA).toHaveBeenCalledWith('user123', '+1234567890');
    expect(mfaService.sendMFACode).toHaveBeenCalledWith(
      'user123',
      '+1234567890'
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/enable',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should reject invalid phone number format', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/enable',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '1234567890', // Missing + prefix
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.details).toBeDefined();
  });

  it('should handle MFA enable failure', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.enableMFA).mockResolvedValue({
      success: false,
      error: 'Failed to enable MFA',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/enable',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Failed to enable MFA');
  });

  it('should handle send code failure gracefully', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.enableMFA).mockResolvedValue({
      success: true,
    });

    vi.mocked(mfaService.sendMFACode).mockResolvedValue({
      success: false,
      error: 'Failed to send code',
      expiresAt: new Date(),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/enable',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain(
      'MFA enabled, but failed to send verification code'
    );
    expect(data.error).toBe('Failed to send code');
  });
});
