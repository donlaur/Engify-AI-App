/**
 * Cleanup Tasks Job
 *
 * Runs cleanup tasks:
 * - Expired MFA codes
 * - Old audit logs (optional)
 * - Temporary files
 *
 * POST /api/jobs/cleanup
 *
 * Called by QStash scheduled job (daily)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import { mfaService } from '@/lib/services/mfaService';
import { getDb } from '@/lib/mongodb';
import { verifyCronRequest } from '@/lib/auth/verify-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Verify this is a scheduled job
  const authError = await verifyCronRequest(request);
  if (authError) return authError;

  try {
    const cleanupStats = {
      expiredMFACodes: 0,
      oldAuditLogs: 0,
      temporaryFiles: 0,
    };

    // Cleanup expired MFA codes
    const expiredCodes = await mfaService.cleanupExpiredCodes();
    cleanupStats.expiredMFACodes = expiredCodes;

    // Optional: Cleanup old audit logs (keep last 90 days for compliance)
    const db = await getDb();
    const auditLogsCollection = db.collection('audit_logs');
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Only delete logs older than 90 days if explicitly configured
    if (process.env.CLEANUP_AUDIT_LOGS === 'true') {
      const auditResult = await auditLogsCollection.deleteMany({
        timestamp: { $lt: ninetyDaysAgo },
      });
      cleanupStats.oldAuditLogs = auditResult.deletedCount;
    }

    // Cleanup temporary files (if implemented)
    // This would typically interact with S3 or file storage
    // For now, just track the metric
    cleanupStats.temporaryFiles = 0;

    return NextResponse.json({
      success: true,
      message: 'Cleanup tasks completed',
      stats: cleanupStats,
    });
  } catch (error) {
    logger.apiError('/api/jobs/cleanup', error, {
      method: 'POST',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
