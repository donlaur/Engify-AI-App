import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/forgot-password/route';
import { userService } from '@/lib/services/UserService';
import { sendPasswordResetEmail } from '@/lib/services/emailService';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/server/middleware/audit';
import { getDb } from '@/lib/mongodb';

// Mock dependencies
vi.mock('@/lib/services/UserService', () => ({
  userService: {
    findByEmail: vi.fn(),
  },
}));

vi.mock('@/lib/services/emailService', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 100,
    resetAt: new Date(Date.now() + 3600000),
  }),
}));

vi.mock('@/server/middleware/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    }),
  }),
}));

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 429 if rate limit exceeded', async () => {
    (checkRateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 60000),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toBe('Rate limit exceeded. Please try again later.');
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'security.rate_limit.exceeded',
        success: false,
      })
    );
  });

  it('should return success for non-existent email (prevent enumeration)', async () => {
    (userService.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null
    );

    const request = new NextRequest(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('If an account exists');
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.password_reset.requested',
        success: true,
      })
    );
  });

  it('should generate reset token and send email for existing user', async () => {
    const mockUser = {
      _id: { toString: () => 'user123' },
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      organizationId: null,
    };

    (userService.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockUser
    );
    (sendPasswordResetEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: true,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    // Verify reset token was stored
    const db = await getDb();
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.collection('users').updateOne).toHaveBeenCalledWith(
      { _id: mockUser._id },
      expect.objectContaining({
        $set: expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        }),
      })
    );

    // Verify email was sent
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      'Test User'
    );

    // Verify audit log
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.password_reset.requested',
        userId: 'user123',
        userEmail: 'test@example.com',
        success: true,
        metadata: expect.objectContaining({
          emailSent: true,
        }),
      })
    );
  });

  it('should return success even if email sending fails', async () => {
    const mockUser = {
      _id: { toString: () => 'user123' },
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      organizationId: null,
    };

    (userService.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockUser
    );
    (sendPasswordResetEmail as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Email service unavailable')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true); // Still returns success to prevent enumeration

    // Verify audit log shows email not sent
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.password_reset.requested',
        success: true,
        metadata: expect.objectContaining({
          emailSent: false,
        }),
      })
    );
  });

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid email address');

    // Verify audit log for failed request
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.password_reset.requested',
        success: false,
      })
    );
  });
});
