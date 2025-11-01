/**
 * Access Request API Route Tests
 * 
 * Tests for POST /api/access-request
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/access-request/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn(),
}));

vi.mock('@/lib/services/emailService', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    error: vi.fn(),
    apiError: vi.fn(),
  },
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

describe('POST /api/access-request', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: new Date(Date.now() + 60000),
    });
  });

  it('should successfully create access request with valid data', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');
    const { sendEmail } = await import('@/lib/services/emailService');

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMongoDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);
    
    vi.mocked(sendEmail).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost/api/access-request', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Corp',
        role: 'Engineer',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCollection.insertOne).toHaveBeenCalled();
  });

  it('should reject duplicate email requests', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMongoDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);

    const request = new NextRequest('http://localhost/api/access-request', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('already have');
  });

  it('should enforce rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 60000),
      reason: 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost/api/access-request', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Rate limit');
  });

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost/api/access-request', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid input');
  });

  it('should handle tracking fields', async () => {
    const { getMongoDb } = await import('@/lib/db/mongodb');
    const { sendEmail } = await import('@/lib/services/emailService');

    const mockCollection = {
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'test-id' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMongoDb).mockResolvedValue({
      collection: vi.fn().mockReturnValue(mockCollection),
    } as any);
    
    vi.mocked(sendEmail).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost/api/access-request', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        ref: 'company-123',
        version: 'v2',
        source: 'resume',
        utm_campaign: 'test-campaign',
      }),
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: 'company-123',
        version: 'v2',
        source: 'resume',
        utm_campaign: 'test-campaign',
        ipAddress: '192.168.1.1',
      })
    );
  });
});

