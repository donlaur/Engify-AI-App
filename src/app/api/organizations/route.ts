import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrganizationRepository } from '@/lib/repositories/OrganizationRepository';
import { createOrganizationSchema } from '@/lib/schemas/organization';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const data = createOrganizationSchema.parse(body);

  const orgRepo = new OrganizationRepository();
  const org = await orgRepo.create({
    ...data,
    maxUsers: 5,
    maxAIExecutions: 1000,
  });

  return NextResponse.json(org);
}
