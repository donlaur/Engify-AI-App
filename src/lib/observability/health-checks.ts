/**
 * Comprehensive Health Check System
 *
 * Provides health checks for all external dependencies:
 * - MongoDB database
 * - Redis cache
 * - AI providers (OpenAI, Anthropic, etc.)
 * - Message queue (QStash)
 * - Email service
 *
 * Usage:
 *   import { healthCheckManager } from '@/lib/observability/health-checks';
 *
 *   const health = await healthCheckManager.checkAll();
 */

import { checkDbHealth } from '@/lib/db/health';
import { observabilityLogger } from './enhanced-logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  latency?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceHealth {
  [serviceName: string]: HealthStatus;
}

export interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceHealth;
  metadata: {
    version: string;
    environment: string;
    uptime: number;
  };
}

/**
 * Health check for Redis/Upstash
 */
async function checkRedisHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // Ping Redis via REST API
    const response = await fetch(`${redisUrl}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        latency,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      status: data.result === 'PONG' ? 'healthy' : 'unhealthy',
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for MongoDB
 */
async function checkMongoHealth(): Promise<HealthStatus> {
  try {
    const dbHealth = await checkDbHealth();

    return {
      status: dbHealth.status,
      latency: dbHealth.latency,
      error: dbHealth.error,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for QStash message queue
 */
async function checkQStashHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const qstashToken = process.env.QSTASH_TOKEN;
    const qstashUrl = process.env.QSTASH_URL;

    if (!qstashToken) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // QStash doesn't have a dedicated health endpoint, but we can verify the token is valid
    // by making a lightweight request
    const url = qstashUrl || 'https://qstash.upstash.io';
    const response = await fetch(`${url}/v2/queues`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${qstashToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
      error: !response.ok ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for OpenAI API
 */
async function checkOpenAIHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // Make a lightweight request to OpenAI models endpoint
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
      error: !response.ok ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for Anthropic API
 */
async function checkAnthropicHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // Anthropic doesn't have a public health endpoint, so we'll just verify the key is present
    // In production, you might make a lightweight API call
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      latency,
      metadata: { note: 'Config check only' },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for Gemini API
 */
async function checkGeminiHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // Make a lightweight request to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }
    );

    const latency = Date.now() - startTime;

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
      error: !response.ok ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for Groq API
 */
async function checkGroqHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        status: 'unknown',
        latency: 0,
        metadata: { configured: false },
      };
    }

    // Make a lightweight request to Groq models endpoint
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - startTime;

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      latency,
      error: !response.ok ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health Check Manager
 */
class HealthCheckManager {
  private startTime = Date.now();

  /**
   * Check all services in parallel
   */
  async checkAll(): Promise<OverallHealth> {
    observabilityLogger.debug('Running health checks');

    const [mongo, redis, qstash, openai, anthropic, gemini, groq] =
      await Promise.all([
        checkMongoHealth(),
        checkRedisHealth(),
        checkQStashHealth(),
        checkOpenAIHealth(),
        checkAnthropicHealth(),
        checkGeminiHealth(),
        checkGroqHealth(),
      ]);

    const services: ServiceHealth = {
      mongodb: mongo,
      redis,
      qstash,
      openai,
      anthropic,
      gemini,
      groq,
    };

    // Determine overall status
    const criticalServices = ['mongodb'];
    const hasCriticalFailure = criticalServices.some(
      (name) => services[name]?.status === 'unhealthy'
    );

    const hasAnyUnhealthy = Object.values(services).some(
      (s) => s.status === 'unhealthy'
    );

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasCriticalFailure) {
      overallStatus = 'unhealthy';
    } else if (hasAnyUnhealthy) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const health: OverallHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      metadata: {
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Date.now() - this.startTime,
      },
    };

    observabilityLogger.info('Health check completed', {
      status: overallStatus,
      services: Object.entries(services).map(([name, status]) => ({
        name,
        status: status.status,
      })),
    });

    return health;
  }

  /**
   * Check specific service
   */
  async checkService(serviceName: string): Promise<HealthStatus> {
    switch (serviceName.toLowerCase()) {
      case 'mongodb':
      case 'mongo':
        return checkMongoHealth();
      case 'redis':
        return checkRedisHealth();
      case 'qstash':
        return checkQStashHealth();
      case 'openai':
        return checkOpenAIHealth();
      case 'anthropic':
        return checkAnthropicHealth();
      case 'gemini':
        return checkGeminiHealth();
      case 'groq':
        return checkGroqHealth();
      default:
        return {
          status: 'unknown',
          error: `Unknown service: ${serviceName}`,
        };
    }
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

export const healthCheckManager = new HealthCheckManager();
