import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const REQUIRED_SECRET = '12345678901234567890123456789012';
const ORIGINAL_ENV = { ...process.env };

describe('env secret enforcement', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.MONGODB_URI = 'mongodb://localhost:27017/engify-test';
    process.env.NEXTAUTH_SECRET = REQUIRED_SECRET;
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws when no AI provider keys present in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.IMAGE_GENERATION_ENABLED = 'false';
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;

    await expect(import('../env')).rejects.toThrow(
      /At least one AI provider API key must be configured/
    );
  });

  it('throws when image generation enabled without replicate token', async () => {
    process.env.NODE_ENV = 'production';
    process.env.OPENAI_API_KEY = 'sk-live-1234567890';
    process.env.IMAGE_GENERATION_ENABLED = 'true';
    delete process.env.REPLICATE_API_TOKEN;

    await expect(import('../env')).rejects.toThrow(/REPLICATE_API_TOKEN/);
  });

  it('passes when secrets configured', async () => {
    process.env.NODE_ENV = 'production';
    process.env.OPENAI_API_KEY = 'sk-live-1234567890';
    process.env.REPLICATE_API_TOKEN = 'r8_live_abcdef';
    process.env.IMAGE_GENERATION_ENABLED = 'true';

    const envModule = await import('../env');
    expect(envModule.env.OPENAI_API_KEY).toBe('sk-live-1234567890');
  });
});
