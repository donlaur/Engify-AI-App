/**
 * User Onboarding API
 * Save user profile data from onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { onboardingSchema } from '@/lib/schemas/user-profile';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function POST(req: NextRequest) {
  // RBAC: users:write permission (users can update their own onboarding data)
  const rbacCheck = await RBACPresets.requireUserWrite()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    const db = await getMongoDb();

    // Update user with onboarding data
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          role: data.role,
          yearsExperience: data.yearsExperience,
          aiExperienceLevel: data.aiExperienceLevel,
          companySize: data.companySize,
          industry: data.industry,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/user/onboarding', error, {
      method: 'POST',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SAVE_FAILED,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
