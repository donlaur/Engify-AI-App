/**
 * API Response Test Fixtures
 *
 * Factory functions for creating mock API responses
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
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
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
    },
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
    },
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  limit: number = 10,
  total?: number
): PaginatedResponse<T> {
  const totalCount = total ?? data.length;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Pre-defined error responses
 */
export const errorFixtures = {
  unauthorized: () =>
    createErrorResponse('UNAUTHORIZED', 'Authentication required'),

  forbidden: () =>
    createErrorResponse('FORBIDDEN', 'You do not have permission to access this resource'),

  notFound: () =>
    createErrorResponse('NOT_FOUND', 'Resource not found'),

  validationError: (details?: unknown) =>
    createErrorResponse('VALIDATION_ERROR', 'Validation failed', details),

  serverError: () =>
    createErrorResponse('INTERNAL_ERROR', 'An internal server error occurred'),

  rateLimitExceeded: () =>
    createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.'),

  badRequest: (message: string = 'Bad request') =>
    createErrorResponse('BAD_REQUEST', message),
};

/**
 * AI Provider Response Fixtures
 */
export interface AIProviderResponse {
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'replicate';
  model: string;
  response: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Create AI provider response
 */
export function createAIResponse(
  overrides: Partial<AIProviderResponse> = {}
): AIProviderResponse {
  return {
    provider: overrides.provider || 'openai',
    model: overrides.model || 'gpt-4',
    response: overrides.response || 'This is a test AI response',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
      ...overrides.usage,
    },
    ...overrides,
  };
}

/**
 * HTTP Response mock helper
 */
export class MockResponse {
  constructor(
    public body: unknown,
    public init: ResponseInit = {}
  ) {}

  static json<T>(data: T, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static success<T>(data: T): Response {
    return MockResponse.json(createSuccessResponse(data));
  }

  static error(code: string, message: string, status: number = 400): Response {
    return new Response(JSON.stringify(createErrorResponse(code, message)), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static unauthorized(): Response {
    return MockResponse.error('UNAUTHORIZED', 'Authentication required', 401);
  }

  static forbidden(): Response {
    return MockResponse.error('FORBIDDEN', 'Access denied', 403);
  }

  static notFound(): Response {
    return MockResponse.error('NOT_FOUND', 'Resource not found', 404);
  }

  static serverError(): Response {
    return MockResponse.error('INTERNAL_ERROR', 'Internal server error', 500);
  }
}
