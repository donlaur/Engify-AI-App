import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, model, prompt: _prompt } = await request.json();

    // Check if API keys are configured
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
    };

    const key = apiKeys[provider as keyof typeof apiKeys];

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: `${provider} API key not configured`,
          message: `Add ${provider.toUpperCase()}_API_KEY to .env.local`,
        },
        { status: 400 }
      );
    }

    // Test connection (mock for now, will add real API calls)
    return NextResponse.json({
      success: true,
      provider,
      model,
      message: 'API key configured! Ready to connect.',
      note: 'Real API integration coming soon',
    });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check which API keys are configured
  const configured = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_API_KEY,
    mongodb: !!process.env.MONGODB_URI,
  };

  return NextResponse.json({
    configured,
    message: 'API configuration status',
    ready: Object.values(configured).some(Boolean),
  });
}
