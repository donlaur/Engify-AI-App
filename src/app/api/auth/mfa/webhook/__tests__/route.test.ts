/**
 * AI Summary: Tests Twilio webhook route signature handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/messaging/twilio', () => ({
  verifyTwilioSignature: vi.fn(async () => true),
}));

describe('Twilio webhook', () => {
  beforeEach(() => vi.resetModules());

  it('returns 200 when signature verifies', async () => {
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'sms.status', status: 'delivered' }),
      headers: { 'x-twilio-signature': 'sig' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 401 when signature invalid', async () => {
    vi.doMock('@/lib/messaging/twilio', () => ({
      verifyTwilioSignature: vi.fn(async () => false),
    }));
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/auth/mfa/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
