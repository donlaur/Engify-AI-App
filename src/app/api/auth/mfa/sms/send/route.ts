import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TwilioService } from '@/lib/services/TwilioService';
import { z } from 'zod';

const sendSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { phoneNumber } = sendSchema.parse(body);

  const twilioService = new TwilioService();
  await twilioService.sendVerificationCode(phoneNumber);

  return NextResponse.json({ success: true });
}
