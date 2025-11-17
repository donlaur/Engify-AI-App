/**
 * Environment Variable Validation (Legacy)
 *
 * This file is maintained for backward compatibility.
 * New code should use the centralized config system from @/lib/config
 *
 * @deprecated Use @/lib/config instead
 * @see {@link @/lib/config}
 *
 * Migration guide:
 * - import { env } from '@/lib/env' -> import { config } from '@/lib/config'
 * - env.MONGODB_URI -> config.database.MONGODB_URI
 * - isProduction -> config.helpers.isProduction()
 */

<<<<<<< HEAD
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
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_MODEL: z.string().optional(),
  REPLICATE_IMAGE_MODEL: z.string().optional(),
  AI_PROVIDER_TIMEOUT_MS: z.string().optional(),
  AI_PROVIDER_MAX_RETRIES: z.string().optional(),
  AI_PROVIDER_RETRY_DELAY_MS: z.string().optional(),
  IMAGE_GENERATION_ENABLED: z.string().optional(),
  ADMIN_SESSION_MAX_AGE_MINUTES: z.string().optional(),
  ADMIN_MFA_REQUIRED: z.string().optional(),

  // Python Services (Optional for development)
  PYTHON_API_URL: z.string().url().optional(),

  // Email (SendGrid)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_API: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),
  SENDGRID_REPLY_TO: z.string().email().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),
  SENDGRID_WELCOME_TEMPLATE_ID: z.string().optional(),
  SENDGRID_PASSWORD_RESET_TEMPLATE_ID: z.string().optional(),
  SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID: z.string().optional(),
  SENDGRID_PROMPT_SHARED_TEMPLATE_ID: z.string().optional(),
  SENDGRID_CONTACT_FORM_TEMPLATE_ID: z.string().optional(),
  SENDGRID_API_KEY_ALERT_TEMPLATE_ID: z.string().optional(),
  SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID: z.string().optional(),
  SENDGRID_AI_CONTENT_READY_TEMPLATE_ID: z.string().optional(),

  // Encryption Keys (Optional - only needed for API key encryption feature)
  API_KEY_ENCRYPTION_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const PLACEHOLDER_PATTERN = /(test|dummy|changeme|sample)/i;

function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  return PLACEHOLDER_PATTERN.test(value);
}

function enforceProductionSecrets(env: Env): void {
  if (env.NODE_ENV !== 'production') return;

  const criticalSecrets: Array<{ key: keyof Env; label: string }> = [
    { key: 'NEXTAUTH_SECRET', label: 'NEXTAUTH_SECRET' },
  ];

  const missingCritical = criticalSecrets.filter(({ key }) =>
    isPlaceholder(env[key])
  );

  if (missingCritical.length > 0) {
    const labels = missingCritical.map((item) => item.label).join(', ');
    throw new Error(
      `Critical secrets misconfigured in production: ${labels}. Ensure they are set to secure values.`
    );
  }

  const providerValues: Array<{ label: string; value: string | undefined }> = [
    { label: 'OpenAI', value: env.OPENAI_API_KEY },
    { label: 'Anthropic', value: env.ANTHROPIC_API_KEY },
    {
      label: 'Google Gemini',
      value: env.GOOGLE_API_KEY ?? env.GOOGLE_AI_API_KEY,
    },
    { label: 'Groq', value: env.GROQ_API_KEY },
  ];

  const hasProviderKey = providerValues.some(
    ({ value }) => !isPlaceholder(value ?? undefined)
  );
  if (!hasProviderKey) {
    throw new Error(
      'At least one AI provider API key must be configured in production (OpenAI, Anthropic, Google, or Groq).'
    );
  }

  const imageGenerationEnabled =
    (env.IMAGE_GENERATION_ENABLED ?? 'true').toLowerCase() !== 'false';
  if (imageGenerationEnabled && isPlaceholder(env.REPLICATE_API_TOKEN)) {
    throw new Error(
      'REPLICATE_API_TOKEN is required when IMAGE_GENERATION_ENABLED is true in production.'
    );
  }
}
=======
import { config } from '@/lib/config';
import type { FlatConfig } from '@/lib/config';
>>>>>>> 80ba9a347cbcc658c039a9f41c4342d730cb6ca1

/**
 * @deprecated Use config.flat from '@/lib/config' instead
 */
export type Env = FlatConfig;

/**
 * Validated and typed environment variables
 * @deprecated Use config from '@/lib/config' instead
 */
export const env = config.flat;

/**
 * Check if we're in production
 * @deprecated Use config.helpers.isProduction() instead
 */
export const isProduction = config.helpers.isProduction();

/**
 * Check if we're in development
 * @deprecated Use config.helpers.isDevelopment() instead
 */
export const isDevelopment = config.helpers.isDevelopment();

/**
 * Check if we're in test environment
 * @deprecated Use config.helpers.isTest() instead
 */
export const isTest = config.helpers.isTest();

/**
 * Check if AI providers are configured
 * @deprecated Use config.helpers.getConfiguredAIProviders() instead
 */
export const hasAIProviders = config.helpers.getConfiguredAIProviders().length > 0;

/**
 * Admin session max age in seconds
 * @deprecated Use config.helpers.getAdminSessionMaxAge() instead
 */
export const adminSessionMaxAgeSeconds = config.helpers.getAdminSessionMaxAge();

/**
 * Check if admin MFA is enforced
 * @deprecated Use config.helpers.isAdminMFARequired() instead
 */
export const isAdminMFAEnforced = config.helpers.isAdminMFARequired();

/**
 * Check if OAuth is configured
 * @deprecated Use config.helpers.hasOAuth() instead
 */
export const hasGoogleOAuth = config.helpers.hasOAuth();

/**
 * Check if Python services are configured
 * @deprecated Use config.rag.RAG_API_URL instead
 */
export const hasPythonServices = Boolean(config.rag.RAG_API_URL);
