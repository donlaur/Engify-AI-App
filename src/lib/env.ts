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

import { config } from '@/lib/config';
import type { FlatConfig } from '@/lib/config';

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
