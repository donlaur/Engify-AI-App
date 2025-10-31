/**
 * API Key Usage Reporting API
 *
 * GET /api/v2/users/api-keys/usage
 * - Get usage summary for user's API keys
 * - Support filtering by keyId, provider, period
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';

const usageQuerySchema = z.object({
  keyId: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'groq']).optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  days: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

export async function GET(request: NextRequest) {
  // RBAC: users:read permission (for API key usage data)
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerParam = searchParams.get('provider');
    const periodParam = searchParams.get('period');
    const query = {
      keyId: searchParams.get('keyId') || undefined,
      provider: (providerParam ?? undefined) as
        | 'openai'
        | 'anthropic'
        | 'google'
        | 'groq'
        | undefined,
      period: (periodParam ?? 'monthly') as 'daily' | 'weekly' | 'monthly',
      days: searchParams.get('days') || undefined,
    };

    const validated = usageQuerySchema.parse(query);
    const userId = session.user.id;

    // If days parameter provided, return daily breakdown
    if (validated.days) {
      const dailyUsage = await apiKeyUsageService.getDailyUsage(
        userId,
        validated.days,
        validated.keyId
      );
      return NextResponse.json({ dailyUsage });
    }

    // Otherwise return summary for the period
    const now = new Date();
    let startDate: Date;
    const endDate = now;

    if (validated.period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (validated.period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const summary = await apiKeyUsageService.getUsageSummary(userId, {
      keyId: validated.keyId,
      provider: validated.provider,
      period: validated.period,
      startDate,
      endDate,
    });

    return NextResponse.json({ summary });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/v2/users/api-keys/usage', error, {
      userId: session?.user?.id,
      method: 'GET',
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
