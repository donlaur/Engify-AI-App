/**
 * Career Recommendations API
 * GET /api/career/recommendations - Get personalized career recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { careerRecommendationService } from '@/lib/services/CareerRecommendationService';
import { AuditEventTypeEnum } from '@/lib/db/schemas/auditLog';
import { logAuditEvent } from '@/server/middleware/audit';

export async function GET(_request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (60 requests/hour)
    const rateLimitResult = await checkRateLimit(
      session.user.id,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reason: rateLimitResult.reason,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Get recommendations from service
    const recommendations =
      await careerRecommendationService.getRecommendations(session.user.id);

    // Audit log
    await logAuditEvent({
      eventType: 'admin.settings.changed' as AuditEventTypeEnum,
      userId: session.user.id,
      action: 'career_recommendations_fetched',
      metadata: {
        count: recommendations.length,
      },
      ipAddress: _request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      success: true,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching career recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
