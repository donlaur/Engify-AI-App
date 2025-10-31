/**
 * AI Summary: Tests SendGrid webhook route signature handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@sendgrid/eventwebhook', () => ({
  EventWebhook: vi.fn(() => ({
    convertPublicKeyToECDSA: vi.fn(() => ({})),
    verifySignature: vi.fn(() => true),
  })),
}));

vi.mock('@/lib/messaging/sendgrid', () => ({
  verifySendGridWebhook: vi.fn(async () => true),
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn(async () => undefined),
}));

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    apiError: vi.fn(),
  },
}));

vi.mock('@/lib/services/sendgridHealth', () => ({
  recordSendGridEvent: vi.fn(),
}));

describe('SendGrid webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when verified', async () => {
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      body: JSON.stringify([{ event: 'delivered', email: 'user@test.com' }]),
      headers: {
        'x-twilio-email-event-webhook-signature': 'sig',
        'x-twilio-email-event-webhook-timestamp': 'ts',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.processed).toBe(1);

    const { auditLog } = await import('@/lib/logging/audit');
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'sendgrid_event_received',
      })
    );
  });

  it('returns 401 when signature invalid', async () => {
    const { verifySendGridWebhook } = await import('@/lib/messaging/sendgrid');
    vi.mocked(verifySendGridWebhook).mockResolvedValueOnce(false);
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      body: '[]',
      headers: {
        'x-twilio-email-event-webhook-signature': 'sig',
        'x-twilio-email-event-webhook-timestamp': 'ts',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when payload is invalid JSON', async () => {
    const { verifySendGridWebhook } = await import('@/lib/messaging/sendgrid');
    vi.mocked(verifySendGridWebhook).mockResolvedValueOnce(true);
    const { POST } = await import('../route');
    const req = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      body: 'not-json',
      headers: {
        'x-twilio-email-event-webhook-signature': 'sig',
        'x-twilio-email-event-webhook-timestamp': 'ts',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const { logger } = await import('@/lib/logging/logger');
    expect(logger.apiError).toHaveBeenCalled();
  });
});
