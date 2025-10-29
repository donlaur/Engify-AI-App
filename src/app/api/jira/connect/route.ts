/**
 * Jira Connection API
 *
 * POST /api/jira/connect - Connect Jira account
 * GET /api/jira/connect - Check connection status
 * DELETE /api/jira/connect - Disconnect Jira
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jiraConnectionService } from '@/lib/integrations/jira';
import { z } from 'zod';
import { _protectRoute, RBACPresets } from '@/lib/middleware/rbac';

const connectSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  email: z.string().email('Invalid email address'),
  apiToken: z.string().min(1, 'API token is required'),
  projectKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = connectSchema.parse(body);

    // Save connection
    const connection = await jiraConnectionService.saveConnection(
      session.user.id,
      {
        domain: validated.domain,
        email: validated.email,
        apiToken: validated.apiToken,
        projectKey: validated.projectKey,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Jira connected successfully',
      connection: {
        domain: connection.domain,
        email: connection.email,
        projectKey: connection.projectKey,
      },
    });
  } catch (error) {
    console.error('Jira connect error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isConnected = await jiraConnectionService.isConnected(
      session.user.id
    );

    return NextResponse.json({
      connected: isConnected,
    });
  } catch (error) {
    console.error('Jira status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const rbacCheck = await RBACPresets.requireUserWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const disconnected = await jiraConnectionService.disconnect(
      session.user.id
    );

    return NextResponse.json({
      success: disconnected,
      message: disconnected
        ? 'Jira disconnected successfully'
        : 'Jira connection not found',
    });
  } catch (error) {
    console.error('Jira disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
