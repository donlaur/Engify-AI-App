import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    return NextResponse.json({
      session: session,
      userId: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      session: null,
    });
  }
}
