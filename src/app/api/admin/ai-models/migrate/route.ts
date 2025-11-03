/**
 * Migrate Static Models to Database
 * 
 * One-time migration endpoint to move models from static config to DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { migrateStaticModelsToDb } from '@/lib/services/AIModelRegistry';

export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await migrateStaticModelsToDb();

    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'ai_models',
      details: { action: 'models_migrated', ...result },
    });

    return NextResponse.json({
      success: true,
      message: 'Models migrated successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error migrating models:', error);
    return NextResponse.json(
      { error: 'Failed to migrate models', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

