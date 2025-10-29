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
import { mfaService } from '@/lib/services/mfaService';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
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
    console.error('Cleanup job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
