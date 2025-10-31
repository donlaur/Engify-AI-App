/**
 * AI Summary: Admin settings API providing configuration status for OpsHub dashboard.
 * Shows feature flags, provider keys, and messaging service status. Part of Day 5 Phase 3.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auditLog } from '@/lib/logging/audit';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Feature flags status
    const featureFlags = [
      {
        name: 'AI Execution',
        value: process.env.NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED === 'true',
        description: 'Enable AI agent sandbox and execution features',
      },
      {
        name: 'Content Ingestion',
        value: process.env.RAG_INDEX_ENABLED === 'true',
        description: 'Enable automatic content ingestion from RSS feeds',
      },
      {
        name: 'Admin MFA',
        value: process.env.ADMIN_MFA_REQUIRED === 'true',
        description: 'Require MFA for super admin access',
      },
      {
        name: 'Image Generation',
        value: process.env.IMAGE_GENERATION_ENABLED === 'true',
        description: 'Enable AI-powered image generation for prompts',
      },
    ];

    // Provider API keys status (masked)
    const providerKeys = [
      {
        name: 'OpenAI',
        configured: Boolean(process.env.OPENAI_API_KEY),
        masked: maskKey(process.env.OPENAI_API_KEY),
      },
      {
        name: 'Anthropic',
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        masked: maskKey(process.env.ANTHROPIC_API_KEY),
      },
      {
        name: 'Google AI',
        configured: Boolean(process.env.GOOGLE_API_KEY),
        masked: maskKey(process.env.GOOGLE_API_KEY),
      },
      {
        name: 'Replicate',
        configured: Boolean(process.env.REPLICATE_API_TOKEN),
        masked: maskKey(process.env.REPLICATE_API_TOKEN),
      },
    ];

    // Messaging services status
    const messagingStatus = {
      twilio: {
        smsConfigured: Boolean(
          process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER
        ),
        phoneNumber: maskPhoneNumber(process.env.TWILIO_PHONE_NUMBER),
        verifyEnabled: Boolean(process.env.TWILIO_VERIFY_SERVICE_SID),
      },
      sendgrid: {
        emailConfigured: Boolean(
          process.env.SENDGRID_API_KEY &&
            process.env.SENDGRID_WEBHOOK_PUBLIC_KEY
        ),
        webhookConfigured: Boolean(process.env.SENDGRID_WEBHOOK_PUBLIC_KEY),
      },
    };

    // System information
    const systemInfo = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      region: process.env.AWS_REGION || 'us-east-1',
      redisConfigured: Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
          process.env.UPSTASH_REDIS_REST_TOKEN
      ),
      databaseConfigured: Boolean(process.env.MONGODB_URI),
    };

    const response = {
      success: true,
      data: {
        featureFlags,
        providerKeys,
        messagingStatus,
        systemInfo,
      },
    } as const;

    await auditLog({
      action: 'admin_settings_viewed',
      userId: session.user.id,
      resource: 'admin_settings',
      details: {
        environment: systemInfo.environment,
        version: systemInfo.version,
        redisConfigured: systemInfo.redisConfigured,
        databaseConfigured: systemInfo.databaseConfigured,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.apiError('/api/admin/settings', error, { method: 'GET' });

    // Audit log the error
    try {
      if (session?.user?.id) {
        await auditLog({
          action: 'admin_settings_access_error',
          userId: session.user.id,
          resource: 'admin_settings',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          severity: 'error',
        });
      }
    } catch (auditError) {
      logger.error('admin-settings.audit.failure', {
        error:
          auditError instanceof Error ? auditError.message : String(auditError),
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Utility functions
function maskKey(key?: string): string {
  if (!key) return 'Not configured';
  if (key.length <= 8) return '****';

  const start = key.substring(0, 4);
  const end = key.substring(key.length - 4);
  return `${start}****${end}`;
}

function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'Not configured';
  if (phone.length <= 4) return '****';

  const last4 = phone.substring(phone.length - 4);
  return `****${last4}`;
}
