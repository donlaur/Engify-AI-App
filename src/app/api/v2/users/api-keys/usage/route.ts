/**
 * API Key Usage Reporting API
 *
 * GET /api/v2/users/api-keys/usage
 * - Get usage summary for user's API keys
 * - Support filtering by keyId, provider, period
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';
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
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      keyId: searchParams.get('keyId') || undefined,
      provider: searchParams.get('provider') as
        | 'openai'
        | 'anthropic'
        | 'google'
        | 'groq'
        | undefined,
      period:
        (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') ||
        'monthly',
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
    console.error('Error fetching usage data:', error);
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
