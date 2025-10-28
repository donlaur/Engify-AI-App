# OpenAPI 3.0 Specification for Engify.ai v2 APIs

## Overview

This document provides comprehensive API documentation for Engify.ai's v2 API endpoints, demonstrating enterprise-grade API design and documentation practices.

## API Information

- **Title**: Engify.ai API
- **Description**: Enterprise-grade AI execution platform with intelligent strategy selection
- **Version**: 2.0.0
- **Base URL**: `https://engify.ai/api/v2`
- **Contact**: donlaur@gmail.com
- **License**: MIT

## Authentication

The API uses NextAuth.js session-based authentication with the following security features:

- **Session Cookies**: `next-auth.session-token` or `__Secure-next-auth.session-token`
- **CSRF Protection**: Built into NextAuth.js
- **Rate Limiting**: 10 requests/minute per IP
- **Input Validation**: Zod schemas for all inputs
- **Output Sanitization**: DOMPurify for user content

## API Endpoints

### 1. AI Execution API

#### POST /ai/execute

Execute AI prompts with intelligent provider selection and execution strategies.

**Request Body:**

```json
{
  "prompt": "string (required, 1-10000 chars)",
  "provider": "string (optional, default: 'openai')",
  "model": "string (optional)",
  "temperature": "number (optional, 0-2, default: 0.7)",
  "maxTokens": "number (optional, default: 2000)",
  "stream": "boolean (optional, default: false)",
  "systemPrompt": "string (optional)",
  "context": {
    "userId": "string",
    "requestId": "string",
    "priority": "low|normal|high|urgent"
  }
}
```

**Response:**

```json
{
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
    "latency": "number (milliseconds)",
    "provider": "string",
    "model": "string"
  },
  "metadata": {
    "requestId": "string",
    "timestamp": "string (ISO 8601)",
    "executionStrategy": "streaming|batch|cache|hybrid"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "string",
  "code": "string",
  "details": "object (optional)"
}
```

**Status Codes:**

- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid session)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

**Example Request:**

```bash
curl -X POST https://engify.ai/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "prompt": "Explain the SOLID principles in software engineering",
    "provider": "openai",
    "temperature": 0.7,
    "maxTokens": 1000
  }'
```

**Example Response:**

```json
{
  "success": true,
  "response": {
    "content": "The SOLID principles are five design principles that make software designs more understandable, flexible, and maintainable...",
    "usage": {
      "promptTokens": 15,
      "completionTokens": 150,
      "totalTokens": 165
    },
    "cost": {
      "input": 0.000015,
      "output": 0.0003,
      "total": 0.000315
    },
    "latency": 1200,
    "provider": "openai",
    "model": "gpt-3.5-turbo"
  },
  "metadata": {
    "requestId": "req_123456789",
    "timestamp": "2025-10-28T23:30:00Z",
    "executionStrategy": "streaming"
  }
}
```

### 2. Execution Strategy API

#### POST /execution

Execute requests using intelligent strategy selection based on context and requirements.

**Request Body:**

```json
{
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
}
```

**Response:**

```json
{
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
  "strategy": {
    "name": "streaming|batch|cache|hybrid",
    "config": "object",
    "estimatedTime": "number",
    "priority": "number"
  },
  "executionTime": "number (milliseconds)",
  "metadata": {
    "requestId": "string",
    "timestamp": "string",
    "correlationId": "string"
  }
}
```

**Status Codes:**

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `500`: Internal Server Error

### 3. User Management API

#### GET /users

Get all users (admin only).

**Query Parameters:**

- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 20, max: 100)
- `search`: string (optional, search by email or name)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "email": "string",
        "name": "string",
        "role": "user|admin",
        "createdAt": "string (ISO 8601)",
        "lastLoginAt": "string (ISO 8601)",
        "isActive": "boolean"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  },
  "metadata": {
    "requestId": "string",
    "timestamp": "string"
  }
}
```

#### POST /users

Create a new user.

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "name": "string (required, 1-100 chars)",
  "role": "user|admin (optional, default: 'user')"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string",
      "createdAt": "string",
      "isActive": "boolean"
    }
  },
  "metadata": {
    "requestId": "string",
    "timestamp": "string"
  }
}
```

#### GET /users/{id}

Get user by ID.

**Path Parameters:**

- `id`: string (required, user ID)

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string",
      "createdAt": "string",
      "lastLoginAt": "string",
      "isActive": "boolean",
      "stats": {
        "totalPrompts": "number",
        "totalCost": "number",
        "lastActivity": "string"
      }
    }
  },
  "metadata": {
    "requestId": "string",
    "timestamp": "string"
  }
}
```

### 4. Health Check API

#### GET /health

Check API health and status.

**Response:**

```json
{
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
}
```

## Error Handling

All API endpoints follow consistent error handling patterns:

### Error Response Format

```json
{
  "success": false,
  "error": "string (human-readable error message)",
  "code": "string (machine-readable error code)",
  "details": "object (optional, additional error details)",
  "timestamp": "string (ISO 8601)",
  "requestId": "string (correlation ID)"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: Missing or invalid authentication
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `PROVIDER_UNAVAILABLE`: AI provider is not available
- `QUOTA_EXCEEDED`: API quota exceeded
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

- **Limit**: 10 requests per minute per IP address
- **Headers**:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## CORS

The API supports Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Allowed Origins**: `https://engify.ai`, `https://www.engify.ai`
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`, `X-Requested-With`

## SDKs and Client Libraries

### JavaScript/TypeScript

```typescript
import { EngifyClient } from '@engify/client';

const client = new EngifyClient({
  baseUrl: 'https://engify.ai/api/v2',
  apiKey: 'your-api-key',
});

const response = await client.ai.execute({
  prompt: 'Hello, world!',
  provider: 'openai',
});
```

### Python

```python
from engify import EngifyClient

client = EngifyClient(
    base_url='https://engify.ai/api/v2',
    api_key='your-api-key'
)

response = client.ai.execute(
    prompt='Hello, world!',
    provider='openai'
)
```

## Postman Collection

A complete Postman collection is available at:

- **Collection URL**: `https://engify.ai/api-docs/postman/engify-api-collection.json`
- **Environment**: `https://engify.ai/api-docs/postman/engify-api-environment.json`

## Changelog

### Version 2.0.0 (2025-10-28)

- Initial release of v2 API
- Added execution strategy pattern
- Implemented intelligent provider selection
- Added comprehensive error handling
- Added rate limiting and security features

## Support

For API support and questions:

- **Email**: donlaur@gmail.com
- **Documentation**: https://engify.ai/api-docs
- **GitHub**: https://github.com/donlaur/Engify-AI-App
