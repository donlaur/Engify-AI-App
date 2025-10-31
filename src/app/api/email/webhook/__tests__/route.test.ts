/**
 * AI Summary: Tests SendGrid webhook route signature handling.
 */
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/messaging/sendgrid', () => ({
  verifySendGridWebhook: vi.fn(async () => true),
}));

describe('SendGrid webhook', () => {
  it('returns 200 when verified', async () => {
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      body: JSON.stringify([{ event: 'delivered' }]),
      headers: {
        'x-twilio-email-event-webhook-signature': 'sig',
        'x-twilio-email-event-webhook-timestamp': 'ts',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
