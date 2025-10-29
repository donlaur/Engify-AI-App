/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Verify MFA Code API Route Tests
 * Tests MFA code verification
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
    verifyMFACode: vi.fn(),
  },
}));

describe('POST /api/auth/mfa/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify MFA code successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.verifyMFACode).mockResolvedValue({
      success: true,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          code: '123456',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('verified successfully');
    expect(mfaService.verifyMFACode).toHaveBeenCalledWith(
      'user123',
      '+1234567890',
      '123456'
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          code: '123456',
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
      'http://localhost:3000/api/auth/mfa/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: 'invalid',
          code: '123456',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });

  it('should reject invalid code format (not 6 digits)', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          code: '12345', // 5 digits instead of 6
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle verification failure', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.verifyMFACode).mockResolvedValue({
      success: false,
      error: 'Invalid or expired code',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          code: '123456',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired code');
  });
});
