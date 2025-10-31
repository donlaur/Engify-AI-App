/**
 * AI Summary: Twilio webhook endpoint with signature verification and simple rate limiting.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioSignature } from '@/lib/messaging/twilio';
import { rateLimit } from '@/lib/middleware/rateLimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';
  if (!rateLimit(`twilio-webhook:${ip}`, { windowMs: 60_000, max: 60 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Read raw body for signature verification
  const raw = await request.text();
  const signature = request.headers.get('x-twilio-signature');
  const token = process.env.TWILIO_AUTH_TOKEN ?? null;
  const ok = await verifyTwilioSignature(request.url, raw, signature, token);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Minimal acknowledgment; actual event processing can be added later
  return NextResponse.json({ success: true });
}
