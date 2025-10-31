/**
 * AI Summary: Tests Twilio webhook route with signature verification, rate limiting, and replay protection.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/messaging/twilio', () => ({
  verifyTwilioSignature: vi.fn(async () => true),
}));

vi.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: vi.fn(() => true),
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn(async () => undefined),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: vi.fn(),
  },
}));

vi.mock('@/lib/services/twilioWebhookState', () => ({
  hasProcessedMessage: vi.fn(() => false),
  resetTwilioWebhookState: vi.fn(() => undefined),
}));

describe('Twilio webhook', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { rateLimit } = await import('@/lib/middleware/rateLimit');
    vi.mocked(rateLimit).mockReturnValue(true);
    const { resetTwilioWebhookState } = await import('@/lib/services/twilioWebhookState');
    resetTwilioWebhookState();
  });

  it('returns 200 when signature verifies and processes valid webhook', async () => {
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: 'MessageSid=SM123&From=%2B1234567890&To=%2B0987654321&Body=Test+message',
      headers: {
        'x-twilio-signature': 'valid-sig',
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.messageId).toBe('SM123');
    expect(data.processed).toBe(true);
  });

  it('returns 401 when signature invalid', async () => {
    const { verifyTwilioSignature } = await import('@/lib/messaging/twilio');
    vi.mocked(verifyTwilioSignature).mockResolvedValueOnce(false);
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: 'MessageSid=SM123&Body=test',
      headers: { 'x-twilio-signature': 'invalid-sig' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    const { rateLimit } = await import('@/lib/middleware/rateLimit');
    vi.mocked(rateLimit).mockReturnValueOnce(false);
    const { hasProcessedMessage } = await import('@/lib/services/twilioWebhookState');
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: 'MessageSid=SM123&Body=test',
      headers: { 'x-twilio-signature': 'sig' },
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(hasProcessedMessage).not.toHaveBeenCalled();
  });

  it('prevents replay attacks', async () => {
    const { hasProcessedMessage } = await import('@/lib/services/twilioWebhookState');
    vi.mocked(hasProcessedMessage)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => true);

    const { POST } = await import('../route');

    // First request should succeed
    const req1 = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: 'MessageSid=SM123&From=%2B1234567890&To=%2B0987654321&Body=First+message',
      headers: { 'x-twilio-signature': 'valid-sig' },
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    // Second request with same MessageSid should be rejected as replay
    const req2 = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: 'MessageSid=SM123&From=%2B1234567890&To=%2B0987654321&Body=Replay+message',
      headers: { 'x-twilio-signature': 'valid-sig' },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200); // 200 to prevent retries, but error message

    const data2 = await res2.json();
    expect(data2.error).toBe('Message already processed');
  });
});
