/**
 * Feature Flag Middleware
 * 
 * Checks if a feature is enabled before allowing access
 */

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled, FeatureFlag } from '@/lib/features/flags';
import { forbidden } from '@/lib/api/response';

type FeatureHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Middleware to check feature flag
 * 
 * @example
 * export const POST = withFeature('enable_ai_execution')(
 *   withAuth(async (req, { user }) => {
 *     // Feature is guaranteed to be enabled
 *     return success({ data });
 *   })
 * );
 */
export function withFeature(flag: FeatureFlag) {
  return function (handler: FeatureHandler) {
    return async (req: NextRequest): Promise<NextResponse> => {
      if (!isFeatureEnabled(flag)) {
        return forbidden('This feature is not available');
      }

      return handler(req);
    };
  };
}
