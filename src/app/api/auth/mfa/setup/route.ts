import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MFAService } from '@/lib/services/MFAService';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mfaService = new MFAService();
  const secret = await mfaService.generateSecret(session.user.id, session.user.email!);

  return NextResponse.json(secret);
}
