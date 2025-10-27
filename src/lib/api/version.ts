/**
 * API Versioning System
 * Supports multiple API versions with backward compatibility
 */

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  CURRENT: 'v1',
} as const;

export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

export interface ApiVersionConfig {
  version: ApiVersion;
  deprecated?: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
  features: string[];
}

export const VERSION_CONFIG: Record<ApiVersion, ApiVersionConfig> = {
  v1: {
    version: 'v1',
    deprecated: false,
    features: [
      'prompts',
      'patterns',
      'pathways',
      'chat',
      'health',
      'auth',
    ],
  },
  v2: {
    version: 'v2',
    deprecated: false,
    features: [
      'prompts',
      'patterns',
      'pathways',
      'chat',
      'health',
      'auth',
      'workbench',
      'personas',
      'analytics',
    ],
  },
};

/**
 * Get API version from request path
 */
export function getApiVersion(path: string): ApiVersion {
  const match = path.match(/\/api\/(v\d+)\//);
  return (match?.[1] as ApiVersion) || API_VERSIONS.CURRENT;
}

/**
 * Check if API version is supported
 */
export function isVersionSupported(version: ApiVersion): boolean {
  return version in VERSION_CONFIG;
}

/**
 * Check if API version is deprecated
 */
export function isVersionDeprecated(version: ApiVersion): boolean {
  return VERSION_CONFIG[version]?.deprecated || false;
}

/**
 * Get deprecation headers for response
 */
export function getDeprecationHeaders(version: ApiVersion): Record<string, string> {
  const config = VERSION_CONFIG[version];
  
  if (!config?.deprecated) {
    return {};
  }

  return {
    'X-API-Deprecated': 'true',
    'X-API-Deprecation-Date': config.deprecationDate?.toISOString() || '',
    'X-API-Sunset-Date': config.sunsetDate?.toISOString() || '',
    'X-API-Current-Version': API_VERSIONS.CURRENT,
  };
}

/**
 * Validate feature availability for version
 */
export function isFeatureAvailable(version: ApiVersion, feature: string): boolean {
  return VERSION_CONFIG[version]?.features.includes(feature) || false;
}
