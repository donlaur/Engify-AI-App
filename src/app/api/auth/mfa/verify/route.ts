import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MFAService } from '@/lib/services/MFAService';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().length(6),
  secret: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { token, secret } = verifySchema.parse(body);

  const mfaService = new MFAService();
  const isValid = mfaService.verifyToken(secret, token);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
