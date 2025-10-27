/**
 * User Onboarding API
 * Save user profile data from onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { onboardingSchema } from '@/lib/schemas/user-profile';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
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
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
