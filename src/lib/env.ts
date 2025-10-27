/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup using Zod.
 * Provides type-safe access to env vars throughout the application.
 *
 * Security: Fails fast if critical env vars are missing.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Database (Required for production auth)
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required for authentication'),

  // Authentication (Required)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),

  // OAuth Providers (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI Provider API Keys (Optional for development, required for production)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Python Services (Optional for development)
  PYTHON_API_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed env object
 * @throws {Error} If validation fails with detailed error message
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));

    // Provide helpful error messages
    const errors = parsed.error.errors.map((err) => {
      const path = err.path.join('.');
      return `  - ${path}: ${err.message}`;
    });

    throw new Error(
      `Environment validation failed:\n${errors.join('\n')}\n\n` +
        'Please check your .env.local file and ensure all required variables are set.\n' +
        'See .env.example for reference.'
    );
  }

  return parsed.data;
}

/**
 * Validated and typed environment variables
 * Use this instead of process.env for type safety
 */
export const env = validateEnv();

/**
 * Check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in test environment
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Check if AI providers are configured
 */
export const hasAIProviders = Boolean(
  env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GOOGLE_AI_API_KEY
);

/**
 * Check if OAuth is configured
 */
export const hasGoogleOAuth = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
);

/**
 * Check if Python services are configured
 */
export const hasPythonServices = Boolean(env.PYTHON_API_URL);
