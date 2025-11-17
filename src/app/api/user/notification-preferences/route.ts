/**
 * User Notification Preferences API
 * Manage user preferences for API usage alert notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

/**
 * GET /api/user/notification-preferences
 * Retrieve user's notification preferences
 */
export async function GET(req: NextRequest) {
  // RBAC: users:read permission
  const rbacCheck = await RBACPresets.requireUserRead()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { apiNotificationPreferences: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return preferences or default values
    const preferences = user.apiNotificationPreferences || {
      emailEnabled: true,
      smsEnabled: false,
      thresholds: {
        fifty: false,
        eighty: true,
        ninety: true,
        hundred: true,
      },
      alertTypes: {
        usageLimit: true,
        costThreshold: true,
        rateLimit: true,
        errorRate: true,
      },
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/user/notification-preferences', error, {
      method: 'GET',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.FETCH_FAILED,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 * Update user's notification preferences
 */
export async function PUT(req: NextRequest) {
  // RBAC: users:write permission
  const rbacCheck = await RBACPresets.requireUserWrite()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { error: 'Missing preferences' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (
      typeof preferences.emailEnabled !== 'boolean' ||
      typeof preferences.smsEnabled !== 'boolean' ||
      !preferences.thresholds ||
      !preferences.alertTypes
    ) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    // Update user with notification preferences
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          apiNotificationPreferences: preferences,
          updatedAt: new Date(),
        },
      }
    );

    logger.info('User notification preferences updated', {
      userId: session.user.id,
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/user/notification-preferences', error, {
      method: 'PUT',
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
