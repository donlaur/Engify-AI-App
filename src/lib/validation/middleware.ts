/**
 * Validation Middleware
 * 
 * Express/Next.js middleware for request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSchema } from './schemas';
import { auditLog } from '../logging/audit';

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Parse request body
      const body = await req.json().catch(() => ({}));
      
      // Validate
      const validation = validateSchema(schema, body);
      
      if (!validation.success) {
        // Log validation failure
        await auditLog({
          action: 'validation_failed',
          resource: req.nextUrl.pathname,
          details: { error: validation.error },
          severity: 'warning',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        });
        
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
      
      // Call handler with validated data
      return handler(req, validation.data);
    } catch (error) {
      // Log unexpected error
      await auditLog({
        action: 'validation_error',
        resource: req.nextUrl.pathname,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      });
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Parse query params
      const params = Object.fromEntries(req.nextUrl.searchParams);
      
      // Validate
      const validation = validateSchema(schema, params);
      
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
      
      // Call handler with validated data
      return handler(req, validation.data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
