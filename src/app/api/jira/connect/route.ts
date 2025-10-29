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
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';

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

    // Audit log: Jira connection established
    await auditLog({
      action: 'jira_connected',
      userId: session.user.id,
      severity: 'info',
      details: {
        domain: validated.domain,
        hasProjectKey: !!validated.projectKey,
      },
    });

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
    // eslint-disable-next-line no-console
    console.error('Jira connect error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    // Try to get userId for audit log
    let userId = 'unknown';
    try {
      const session = await auth();
      userId = session?.user?.id || 'unknown';
    } catch {
      // Session fetch failed
    }

    // Audit log: Jira connection failed
    await auditLog({
      action: 'jira_connect_failed',
      userId,
      severity: 'warning',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
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
    // eslint-disable-next-line no-console
    console.error('Jira status error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
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

    // Audit log: Jira disconnected
    if (disconnected) {
      await auditLog({
        action: 'jira_disconnected',
        userId: session.user.id,
        severity: 'info',
      });
    }

    return NextResponse.json({
      success: disconnected,
      message: disconnected
        ? 'Jira disconnected successfully'
        : 'Jira connection not found',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Jira disconnect error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
