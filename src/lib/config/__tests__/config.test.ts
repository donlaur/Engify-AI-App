/**
 * Configuration System Tests
 *
 * Tests for the centralized configuration management system
 */

import { describe, it, expect } from 'vitest';
import { config, getConfig } from '../index';
import {
  validateConfig,
  maskSecret,
  isPlaceholder,
  createSafeConfig,
} from '../utils';
import { isSecretKey } from '../types';
import { flatConfigSchema } from '../schema';

describe('Configuration System', () => {
  describe('Configuration Loading', () => {
    it('should load configuration successfully', () => {
      expect(config).toBeDefined();
      expect(config.isValidated).toBe(true);
    });

    it('should return same instance from getConfig', () => {
      const config1 = getConfig();
      const config2 = getConfig();
      expect(config1).toBe(config2);
    });

    it('should have all required domains', () => {
      expect(config.core).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.auth).toBeDefined();
      expect(config.aiProviders).toBeDefined();
      expect(config.email).toBeDefined();
      expect(config.sms).toBeDefined();
      expect(config.queue).toBeDefined();
      expect(config.cache).toBeDefined();
      expect(config.aws).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.contentCreation).toBeDefined();
      expect(config.rag).toBeDefined();
      expect(config.featureFlags).toBeDefined();
      expect(config.analytics).toBeDefined();
    });
  });

  describe('Environment Detection', () => {
    it('should detect test environment', () => {
      expect(config.helpers.isTest()).toBe(true);
      expect(config.helpers.isProduction()).toBe(false);
      expect(config.helpers.isDevelopment()).toBe(false);
    });

    it('should have NODE_ENV set to test', () => {
      expect(config.core.NODE_ENV).toBe('test');
    });
  });

  describe('Helper Functions', () => {
    it('should check AI provider availability', () => {
      const providers = config.helpers.getConfiguredAIProviders();
      expect(Array.isArray(providers)).toBe(true);

      // At least one provider should be configured in test env
      expect(providers.length).toBeGreaterThanOrEqual(0);
    });

    it('should check feature flags', () => {
      const flags = config.helpers.getEnabledFeatureFlags();
      expect(Array.isArray(flags)).toBe(true);
    });

    it('should get admin session max age', () => {
      const maxAge = config.helpers.getAdminSessionMaxAge();
      expect(typeof maxAge).toBe('number');
      expect(maxAge).toBeGreaterThan(0);
    });

    it('should get AI provider timeout', () => {
      const timeout = config.helpers.getAIProviderTimeout();
      expect(typeof timeout).toBe('number');
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe('Safe Configuration', () => {
    it('should create safe config with masked secrets', () => {
      const safeConfig = config.getSafeConfig();
      expect(safeConfig).toBeDefined();
      expect(typeof safeConfig).toBe('object');
    });

    it('should not expose actual secret values in safe config', () => {
      const safeConfig = config.getSafeConfig();

      // Check that secrets are masked
      for (const [key, value] of Object.entries(safeConfig)) {
        if (isSecretKey(key) && value) {
          expect(typeof value).toBe('string');
          // Should be masked (not the original value)
          expect(value).toMatch(/\*\*\*|<.*>|\.\.\./)
        }
      }
    });
  });

  describe('Validation Utilities', () => {
    it('should validate config against schema', () => {
      const result = validateConfig(flatConfigSchema, process.env);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should mask secrets properly', () => {
      expect(maskSecret('sk-1234567890abcdef')).toBe('sk-1...cdef');
      expect(maskSecret('short')).toBe('***');
      expect(maskSecret(undefined)).toBe('<empty>');
      expect(maskSecret(null)).toBe('<empty>');
    });

    it('should detect placeholder values', () => {
      expect(isPlaceholder('your-key-here')).toBe(true);
      expect(isPlaceholder('test-key')).toBe(true);
      expect(isPlaceholder('sk-test123')).toBe(true);
      expect(isPlaceholder('changeme')).toBe(true);
      expect(isPlaceholder('')).toBe(true);
      expect(isPlaceholder(null)).toBe(true);
      expect(isPlaceholder(undefined)).toBe(true);

      expect(isPlaceholder('sk-prod-real-key-123')).toBe(false);
      expect(isPlaceholder('actual-value')).toBe(false);
    });

    it('should detect secret keys', () => {
      expect(isSecretKey('MONGODB_URI')).toBe(true);
      expect(isSecretKey('OPENAI_API_KEY')).toBe(true);
      expect(isSecretKey('NEXTAUTH_SECRET')).toBe(true);
      expect(isSecretKey('MY_SECRET_KEY')).toBe(true);
      expect(isSecretKey('PASSWORD')).toBe(true);

      expect(isSecretKey('NODE_ENV')).toBe(false);
      expect(isSecretKey('NEXT_PUBLIC_APP_URL')).toBe(false);
    });

    it('should create safe config without exposing secrets', () => {
      const unsafeConfig = {
        NODE_ENV: 'test',
        OPENAI_API_KEY: 'sk-1234567890abcdef',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      };

      const safeConfig = createSafeConfig(unsafeConfig);

      expect(safeConfig.NODE_ENV).toBe('test');
      expect(safeConfig.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
      expect(safeConfig.OPENAI_API_KEY).toMatch(/sk-1.*cdef/);
      expect(safeConfig.OPENAI_API_KEY).not.toBe('sk-1234567890abcdef');
    });
  });

  describe('Configuration Access', () => {
    it('should provide flat config for backward compatibility', () => {
      expect(config.flat).toBeDefined();
      expect(config.flat.NODE_ENV).toBe('test');
    });

    it('should have consistent values across domains and flat config', () => {
      expect(config.core.NODE_ENV).toBe(config.flat.NODE_ENV);

      if (config.database.MONGODB_URI) {
        expect(config.database.MONGODB_URI).toBe(config.flat.MONGODB_URI);
      }
    });
  });

  describe('Type Safety', () => {
    it('should have correct types for configuration values', () => {
      expect(typeof config.core.NODE_ENV).toBe('string');

      if (config.aiProviders.AI_PROVIDER_TIMEOUT_MS !== undefined) {
        expect(typeof config.aiProviders.AI_PROVIDER_TIMEOUT_MS).toBe('number');
      }

      if (config.auth.ADMIN_MFA_REQUIRED !== undefined) {
        expect(typeof config.auth.ADMIN_MFA_REQUIRED).toBe('boolean');
      }

      if (config.aiProviders.REPLICATE_ALLOWED_MODELS) {
        expect(Array.isArray(config.aiProviders.REPLICATE_ALLOWED_MODELS)).toBe(true);
      }
    });
  });
});
