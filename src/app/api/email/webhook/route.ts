/**
 * AI Summary: SendGrid email event webhook with signature verification.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySendGridWebhook } from '@/lib/messaging/sendgrid';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const sig = request.headers.get('x-twilio-email-event-webhook-signature');
  const ts = request.headers.get('x-twilio-email-event-webhook-timestamp');
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY ?? null;
  const ok = await verifySendGridWebhook(ts, sig, raw, publicKey);
  if (!ok)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  return NextResponse.json({ success: true });
}
