import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UsageService } from '@/lib/services/UsageService';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usageService = new UsageService();
  const quota = await usageService.getQuota(session.user.id);

  return NextResponse.json(quota);
}
