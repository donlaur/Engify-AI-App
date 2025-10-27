/**
 * API Response Utilities
 * 
 * Consistent response format for all API routes
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Success response
 */
export function success<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Error response
 */
export function fail(
  error: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error,
      details,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Paginated response
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Created response (201)
 */
export function created<T>(data: T): NextResponse {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}

/**
 * No content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Unauthorized response (401)
 */
export function unauthorized(message: string = 'Unauthorized'): NextResponse {
  return fail(message, 401);
}

/**
 * Forbidden response (403)
 */
export function forbidden(message: string = 'Forbidden'): NextResponse {
  return fail(message, 403);
}

/**
 * Not found response (404)
 */
export function notFound(message: string = 'Not found'): NextResponse {
  return fail(message, 404);
}

/**
 * Validation error response (422)
 */
export function validationError(details: unknown): NextResponse {
  return fail('Validation failed', 422, details);
}

/**
 * Server error response (500)
 */
export function serverError(
  message: string = 'Internal server error'
): NextResponse {
  return fail(message, 500);
}
