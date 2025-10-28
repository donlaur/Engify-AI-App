import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AuditService } from '@/lib/services/AuditService';
import { requirePermission } from '@/lib/auth/middleware';
import { Permission } from '@/types/auth';

export async function GET(req: NextRequest) {
  const authError = await requirePermission(req, Permission.VIEW_ANALYTICS);
  if (authError) return authError;

  const session = await auth();
  const auditService = new AuditService();
  const logs = await auditService.getByUser(session!.user.id);

  return NextResponse.json(logs);
}
