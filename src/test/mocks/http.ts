/**
 * HTTP Request Mocking Utilities
 *
 * Mock fetch, NextRequest, NextResponse, and HTTP interactions
 */

import { vi } from 'vitest';
import { MockResponse } from '../fixtures/api-responses';

/**
 * Mock fetch with custom responses
 */
export class MockFetch {
  private handlers: Map<
    string,
    (url: string, init?: RequestInit) => Promise<Response>
  > = new Map();
  private defaultHandler: (
    url: string,
    init?: RequestInit
  ) => Promise<Response> = async () => MockResponse.success({});

  /**
   * Set a handler for a specific URL pattern
   */
  on(
    pattern: string | RegExp,
    handler: (url: string, init?: RequestInit) => Promise<Response>
  ): this {
    const key = pattern instanceof RegExp ? pattern.source : pattern;
    this.handlers.set(key, handler);
    return this;
  }

  /**
   * Set a handler that returns JSON data
   */
  onJson(pattern: string | RegExp, data: any, status: number = 200): this {
    return this.on(pattern, async () => MockResponse.json(data, status));
  }

  /**
   * Set a handler that returns an error
   */
  onError(
    pattern: string | RegExp,
    code: string,
    message: string,
    status: number = 400
  ): this {
    return this.on(pattern, async () =>
      MockResponse.error(code, message, status)
    );
  }

  /**
   * Set the default handler for unmatched requests
   */
  default(
    handler: (url: string, init?: RequestInit) => Promise<Response>
  ): this {
    this.defaultHandler = handler;
    return this;
  }

  /**
   * Build the mock fetch function
   */
  build(): typeof fetch {
    return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      // Find matching handler
      for (const [pattern, handler] of this.handlers.entries()) {
        const regex = new RegExp(pattern);
        if (regex.test(url)) {
          return handler(url, init);
        }
      }

      // Use default handler
      return this.defaultHandler(url, init);
    }) as unknown as typeof fetch;
  }

  /**
   * Clear all handlers
   */
  clear(): this {
    this.handlers.clear();
    return this;
  }
}

/**
 * Create a mock NextRequest
 */
export function createMockNextRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}) {
  const {
    url = 'http://localhost:3000/api/test',
    method = 'GET',
    headers = {},
    body,
    searchParams = {},
    cookies = {},
  } = options;

  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const headersObj = new Headers(headers);

  return {
    url: urlObj.toString(),
    method,
    headers: headersObj,
    nextUrl: {
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams,
      search: urlObj.search,
    },
    cookies: {
      get: vi.fn((name: string) => cookies[name]),
      getAll: vi.fn(() =>
        Object.entries(cookies).map(([name, value]) => ({ name, value }))
      ),
      set: vi.fn(),
      delete: vi.fn(),
    },
    json: vi.fn(async () => body),
    text: vi.fn(async () => (typeof body === 'string' ? body : JSON.stringify(body))),
    formData: vi.fn(async () => {
      const fd = new FormData();
      if (body && typeof body === 'object') {
        Object.entries(body).forEach(([key, value]) => {
          fd.append(key, String(value));
        });
      }
      return fd;
    }),
    clone: vi.fn(),
  };
}

/**
 * Create a mock NextResponse
 */
export function createMockNextResponse() {
  return {
    json: vi.fn((data: any, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    ),
    redirect: vi.fn((url: string, status?: number) =>
      new Response(null, {
        status: status || 307,
        headers: { Location: url },
      })
    ),
    rewrite: vi.fn(),
    next: vi.fn(),
  };
}

/**
 * Mock Headers with additional testing utilities
 */
export function createMockHeaders(
  init: Record<string, string> = {}
): Headers {
  const headers = new Headers(init);

  // Add convenience methods for testing
  (headers as any).toObject = function () {
    const obj: Record<string, string> = {};
    this.forEach((value: string, key: string) => {
      obj[key] = value;
    });
    return obj;
  };

  return headers;
}

/**
 * Request builder for testing API routes
 */
export class RequestBuilder {
  private url: string = 'http://localhost:3000/api/test';
  private method: string = 'GET';
  private headers: Record<string, string> = {};
  private body: any = undefined;
  private searchParams: Record<string, string> = {};
  private cookies: Record<string, string> = {};

  withUrl(url: string): this {
    this.url = url;
    return this;
  }

  withMethod(method: string): this {
    this.method = method;
    return this;
  }

  withHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  withBody(body: any): this {
    this.body = body;
    if (typeof body === 'object' && !this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/json';
    }
    return this;
  }

  withSearchParam(key: string, value: string): this {
    this.searchParams[key] = value;
    return this;
  }

  withCookie(key: string, value: string): this {
    this.cookies[key] = value;
    return this;
  }

  withAuth(token: string): this {
    return this.withHeader('Authorization', `Bearer ${token}`);
  }

  asJson(): this {
    return this.withHeader('Content-Type', 'application/json');
  }

  asFormData(): this {
    return this.withHeader('Content-Type', 'application/x-www-form-urlencoded');
  }

  asGet(): this {
    return this.withMethod('GET');
  }

  asPost(): this {
    return this.withMethod('POST');
  }

  asPut(): this {
    return this.withMethod('PUT');
  }

  asPatch(): this {
    return this.withMethod('PATCH');
  }

  asDelete(): this {
    return this.withMethod('DELETE');
  }

  build() {
    return createMockNextRequest({
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      searchParams: this.searchParams,
      cookies: this.cookies,
    });
  }
}

/**
 * HTTP status code helpers
 */
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Common request scenarios
 */
export const requestScenarios = {
  authenticated: (token: string = 'test-token') =>
    new RequestBuilder().withAuth(token),

  unauthenticated: () => new RequestBuilder(),

  withJson: (data: any) =>
    new RequestBuilder().asPost().asJson().withBody(data),

  withQuery: (params: Record<string, string>) => {
    const builder = new RequestBuilder();
    Object.entries(params).forEach(([key, value]) => {
      builder.withSearchParam(key, value);
    });
    return builder;
  },
};
