import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';

interface FeatureFlag {
  name: string;
  value: boolean;
  description: string;
}

interface ProviderKey {
  name: string;
  configured: boolean;
  masked: string;
}

function maskKey(key: string | undefined): string {
  if (!key) return 'Not configured';
  if (key.length < 8) return '***';
  const prefix = key.substring(0, 4);
  const suffix = key.substring(key.length - 4);
  const masked = '*'.repeat(Math.max(key.length - 8, 8));
  return `${prefix}${masked}${suffix}`;
}

function getFeatureFlags(): FeatureFlag[] {
  return [
    {
      name: 'RAG_INDEX_ENABLED',
      value:
        process.env.RAG_INDEX_ENABLED === '1' ||
        process.env.RAG_INDEX_ENABLED === 'true' ||
        process.env.RAG_INDEX_ENABLED === 'yes',
      description: 'Enable RAG content indexing for vector search',
    },
    {
      name: 'AGENTS_SANDBOX_ENABLED',
      value:
        process.env.AGENTS_SANDBOX_ENABLED === '1' ||
        process.env.AGENTS_SANDBOX_ENABLED === 'true' ||
        process.env.AGENTS_SANDBOX_ENABLED === 'yes',
      description: 'Enable Agent Sandbox feature in workbench',
    },
    {
      name: 'NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED',
      value:
        process.env.NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED === '1' ||
        process.env.NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED === 'true' ||
        process.env.NEXT_PUBLIC_AGENTS_SANDBOX_ENABLED === 'yes',
      description: 'Enable Agent Sandbox UI in workbench (client-side)',
    },
    {
      name: 'NEXT_PUBLIC_SHOW_ADMIN_LINK',
      value:
        process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === '1' ||
        process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === 'true' ||
        process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === 'yes',
      description: 'Show Admin link in navigation (route still RBAC-protected)',
    },
  ];
}

function getProviderKeys(): ProviderKey[] {
  return [
    {
      name: 'OpenAI API Key',
      configured: !!process.env.OPENAI_API_KEY,
      masked: maskKey(process.env.OPENAI_API_KEY),
    },
    {
      name: 'Anthropic API Key',
      configured: !!process.env.ANTHROPIC_API_KEY,
      masked: maskKey(process.env.ANTHROPIC_API_KEY),
    },
    {
      name: 'Google Gemini API Key',
      configured: !!process.env.GOOGLE_API_KEY,
      masked: maskKey(process.env.GOOGLE_API_KEY),
    },
    {
      name: 'Groq API Key',
      configured: !!process.env.GROQ_API_KEY,
      masked: maskKey(process.env.GROQ_API_KEY),
    },
    {
      name: 'Replicate API Token',
      configured: !!process.env.REPLICATE_API_TOKEN,
      masked: maskKey(process.env.REPLICATE_API_TOKEN),
    },
    {
      name: 'SendGrid API Key',
      configured: !!(process.env.SENDGRID_API_KEY || process.env.SENDGRID_API),
      masked: maskKey(process.env.SENDGRID_API_KEY || process.env.SENDGRID_API),
    },
    {
      name: 'Twilio Auth Token',
      configured: !!process.env.TWILIO_AUTH_TOKEN,
      masked: maskKey(process.env.TWILIO_AUTH_TOKEN),
    },
    {
      name: 'QStash Token',
      configured: !!process.env.QSTASH_TOKEN,
      masked: maskKey(process.env.QSTASH_TOKEN),
    },
  ];
}

export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  try {
    return NextResponse.json({
      success: true,
      data: {
        featureFlags: getFeatureFlags(),
        providerKeys: getProviderKeys(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
