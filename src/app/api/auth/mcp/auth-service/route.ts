/**
 * Auth-Service Proxy Endpoint
 *
 * Proxies authentication requests to external auth-service (port 7430)
 * Enables integration with separate MCP Platform auth-service
 *
 * POST /api/auth/mcp/auth-service
 *
 * This endpoint acts as a bridge between the dashboard and the external auth-service:
 * - Validates user session in dashboard
 * - Forwards request to auth-service
 * - Returns RS256 JWT from auth-service
 *
 * Environment variables required:
 * - NEXT_PUBLIC_AUTH_SERVICE_URL (default: http://localhost:7430)
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { success, fail, unauthorized } from '@/lib/api/response';

const authServiceRequestSchema = z.object({
  action: z.enum(['login', 'generate-token', 'refresh', 'revoke']),
  email: z.string().email().optional(),
  password: z.string().optional(),
  refresh_token: z.string().optional(),
  token_id: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  workspaceId: z.string().optional(),
});

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:7430';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request
    const body = await request.json().catch(() => ({}));
    const validationResult = authServiceRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return fail('Invalid request parameters', 400, {
        errors: validationResult.error.flatten(),
      });
    }

    const { action, ...params } = validationResult.data;

    // 2. Check if auth-service is available
    const isAuthServiceAvailable = await checkAuthServiceHealth();
    if (!isAuthServiceAvailable) {
      return fail(
        'Auth-service unavailable. Using local authentication instead.',
        503,
        { fallback_endpoint: '/api/auth/mcp/token' }
      );
    }

    // 3. For non-login actions, require dashboard session
    if (action !== 'login') {
      const session = await auth();
      if (!session?.user?.id) {
        return unauthorized('Authentication required');
      }

      // Inject user info from session
      params.email = session.user.email || undefined;
    }

    // 4. Route to appropriate auth-service endpoint
    let authServiceEndpoint: string;
    let method: string = 'POST';

    switch (action) {
      case 'login':
        authServiceEndpoint = `${AUTH_SERVICE_URL}/auth/login`;
        break;
      case 'generate-token':
        authServiceEndpoint = `${AUTH_SERVICE_URL}/auth/token`;
        break;
      case 'refresh':
        authServiceEndpoint = `${AUTH_SERVICE_URL}/auth/refresh`;
        break;
      case 'revoke':
        authServiceEndpoint = `${AUTH_SERVICE_URL}/auth/revoke`;
        break;
      default:
        return fail('Invalid action', 400);
    }

    // 5. Forward request to auth-service
    logger.info('Proxying request to auth-service', {
      action,
      endpoint: authServiceEndpoint,
    });

    const authServiceResponse = await fetch(authServiceEndpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Engify-Dashboard',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!authServiceResponse.ok) {
      const errorText = await authServiceResponse.text();
      logger.warn('Auth-service returned error', {
        status: authServiceResponse.status,
        error: errorText,
      });

      return fail(
        'Authentication failed',
        authServiceResponse.status,
        { upstream_error: errorText }
      );
    }

    // 6. Return auth-service response
    const authServiceData = await authServiceResponse.json();

    logger.info('Auth-service request successful', {
      action,
      hasAccessToken: !!authServiceData.access_token,
    });

    return success(authServiceData);

  } catch (error) {
    logger.error('Auth-service proxy failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // If auth-service is down, suggest fallback
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return fail(
        'Auth-service unavailable. Use local authentication endpoint.',
        503,
        { fallback_endpoint: '/api/auth/mcp/token' }
      );
    }

    return fail('Failed to communicate with auth-service', 500);
  }
}

/**
 * Check if auth-service is healthy
 */
async function checkAuthServiceHealth(): Promise<boolean> {
  try {
    const healthResponse = await fetch(`${AUTH_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    return healthResponse.ok;
  } catch (error) {
    logger.warn('Auth-service health check failed', {
      url: AUTH_SERVICE_URL,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return false;
  }
}

/**
 * GET endpoint to check auth-service status
 */
export async function GET() {
  const isHealthy = await checkAuthServiceHealth();

  return success({
    service: 'auth-service-proxy',
    auth_service_url: AUTH_SERVICE_URL,
    status: isHealthy ? 'available' : 'unavailable',
    fallback: '/api/auth/mcp/token',
  });
}
