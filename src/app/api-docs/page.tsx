'use client';

import { useState, useEffect } from 'react';

/**
 * API Documentation Page
 * Interactive Swagger UI for Engify.ai v2 APIs
 */
export default function APIDocumentationPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Swagger UI dynamically to avoid SSR issues
    const loadSwaggerUI = async () => {
      try {
        // For now, we'll create a custom API documentation interface
        // In a full implementation, we'd load Swagger UI here
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Swagger UI:', error);
      }
    };

    loadSwaggerUI();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Engify.ai API Documentation
            </h1>
            <p className="mt-2 text-gray-600">
              Interactive API documentation for Engify.ai v2 endpoints
            </p>
          </div>
        </div>
      </div>

      {/* API Overview */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* API Information */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                API Information
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Base URL
                  </dt>
                  <dd className="text-sm text-gray-900">
                    https://engify.ai/api/v2
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-sm text-gray-900">2.0.0</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Authentication
                  </dt>
                  <dd className="text-sm text-gray-900">
                    Session-based (NextAuth.js)
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Rate Limit
                  </dt>
                  <dd className="text-sm text-gray-900">10 requests/minute</dd>
                </div>
              </dl>
            </div>

            {/* Quick Start */}
            <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Quick Start
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    1. Authentication
                  </h3>
                  <p className="text-sm text-gray-600">
                    Login to get session cookie
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    2. Make Request
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use session cookie in requests
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    3. Handle Response
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check success field and handle errors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* AI Execution API */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        AI Execution API
                      </h2>
                      <p className="text-sm text-gray-600">
                        Execute AI prompts with intelligent strategy selection
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      POST
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Endpoint
                      </h3>
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                        /api/v2/ai/execute
                      </code>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Request Body
                      </h3>
                      <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                        {`{
  "prompt": "string (required, 1-10000 chars)",
  "provider": "string (optional, default: 'openai')",
  "model": "string (optional)",
  "temperature": "number (optional, 0-2, default: 0.7)",
  "maxTokens": "number (optional, default: 2000)",
  "stream": "boolean (optional, default: false)",
  "systemPrompt": "string (optional)"
}`}
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Response
                      </h3>
                      <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                        {`{
  "success": true,
  "response": {
    "content": "string",
    "usage": {
      "promptTokens": "number",
      "completionTokens": "number",
      "totalTokens": "number"
    },
    "cost": {
      "input": "number",
      "output": "number",
      "total": "number"
    },
    "latency": "number",
    "provider": "string",
    "model": "string"
  },
  "metadata": {
    "requestId": "string",
    "timestamp": "string",
    "executionStrategy": "streaming|batch|cache|hybrid"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Strategy API */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Execution Strategy API
                      </h2>
                      <p className="text-sm text-gray-600">
                        Intelligent strategy selection based on context
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      POST
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Endpoint
                      </h3>
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                        /api/v2/execution
                      </code>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Request Body
                      </h3>
                      <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                        {`{
  "request": {
    "prompt": "string (required)",
    "maxTokens": "number (optional)",
    "temperature": "number (optional)",
    "stream": "boolean (optional)"
  },
  "context": {
    "userId": "string (required)",
    "requestId": "string (required)",
    "priority": "low|normal|high|urgent (required)",
    "metadata": "object (optional)"
  },
  "provider": "string (required)"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Management API */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        User Management API
                      </h2>
                      <p className="text-sm text-gray-600">
                        User CRUD operations and management
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      GET/POST
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Endpoints
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            GET
                          </span>
                          <code className="text-sm">/api/v2/users</code>
                          <span className="text-xs text-gray-500">
                            List all users
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            POST
                          </span>
                          <code className="text-sm">/api/v2/users</code>
                          <span className="text-xs text-gray-500">
                            Create user
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            GET
                          </span>
                          <code className="text-sm">/api/v2/users/{id}</code>
                          <span className="text-xs text-gray-500">
                            Get user by ID
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Check API */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Health Check API
                      </h2>
                      <p className="text-sm text-gray-600">
                        API health and status monitoring
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      GET
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Endpoint
                      </h3>
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                        /api/v2/health
                      </code>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Response
                      </h3>
                      <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                        {`{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "string (ISO 8601)",
  "version": "string",
  "uptime": "number (seconds)",
  "services": {
    "database": "healthy|degraded|unhealthy",
    "aiProviders": "healthy|degraded|unhealthy",
    "cache": "healthy|degraded|unhealthy"
  },
  "metrics": {
    "totalRequests": "number",
    "averageResponseTime": "number",
    "errorRate": "number"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Handling Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Error Handling
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Error Response Format
              </h3>
              <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                {`{
  "success": false,
  "error": "string (human-readable error message)",
  "code": "string (machine-readable error code)",
  "details": "object (optional, additional error details)",
  "timestamp": "string (ISO 8601)",
  "requestId": "string (correlation ID)"
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Common Error Codes
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      VALIDATION_ERROR
                    </code>
                    <span className="text-xs text-gray-600">
                      Request validation failed
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      AUTHENTICATION_REQUIRED
                    </code>
                    <span className="text-xs text-gray-600">
                      Missing or invalid authentication
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      RATE_LIMIT_EXCEEDED
                    </code>
                    <span className="text-xs text-gray-600">
                      Too many requests
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      PROVIDER_UNAVAILABLE
                    </code>
                    <span className="text-xs text-gray-600">
                      AI provider is not available
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      QUOTA_EXCEEDED
                    </code>
                    <span className="text-xs text-gray-600">
                      API quota exceeded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <code className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                      INTERNAL_ERROR
                    </code>
                    <span className="text-xs text-gray-600">
                      Internal server error
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDKs and Tools */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            SDKs and Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900">
                Postman Collection
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Complete API collection for testing and development
              </p>
              <a
                href="/api-docs/postman/engify-api-collection.json"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download Collection
              </a>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900">
                OpenAPI Specification
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                Complete OpenAPI 3.0 specification
              </p>
              <a
                href="/docs/api/OPENAPI_SPECIFICATION.md"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View Specification
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
