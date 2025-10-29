/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Send MFA Code API Route Tests
 * Tests sending MFA verification codes
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
    sendMFACode: vi.fn(),
  },
}));

describe('POST /api/auth/mfa/send-code', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send MFA code successfully', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    vi.mocked(mfaService.sendMFACode).mockResolvedValue({
      success: true,
      expiresAt,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/send-code',
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
    expect(data.message).toContain('Verification code sent');
    expect(data.expiresAt).toBeDefined();
    expect(mfaService.sendMFACode).toHaveBeenCalledWith(
      'user123',
      '+1234567890'
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/send-code',
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
      'http://localhost:3000/api/auth/mfa/send-code',
      {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: 'invalid',
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });

  it('should handle send code failure', async () => {
    const { auth } = await import('@/lib/auth');
    const { mfaService } = await import('@/lib/services/mfaService');

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user123' },
    } as any);

    vi.mocked(mfaService.sendMFACode).mockResolvedValue({
      success: false,
      error: 'Rate limit exceeded',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/mfa/send-code',
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
    expect(data.error).toBe('Rate limit exceeded');
  });
});
