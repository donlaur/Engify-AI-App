# API Reference Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [User Management API](#user-management-api)
6. [API Key Management](#api-key-management)
7. [Prompt API](#prompt-api)
8. [AI Execution API](#ai-execution-api)
9. [Analytics API](#analytics-api)
10. [Webhook Endpoints](#webhook-endpoints)

---

## Overview

Engify AI provides RESTful APIs and tRPC endpoints for programmatic access to the platform.

### Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://engify.ai/api` |
| Staging | `https://staging.engify.ai/api` |
| Local | `http://localhost:3000/api` |

### API Versions

| Version | Status | Base Path |
|---------|--------|-----------|
| v1 | Deprecated | `/api/*` |
| v2 | Current | `/api/v2/*` |

### Request Format

```http
POST /api/v2/users/api-keys HTTP/1.1
Host: engify.ai
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "name": "Production Key",
  "expiresIn": 90
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Production Key",
    "createdAt": "2025-01-17T12:00:00.000Z"
  },
  "meta": {
    "duration": 123,
    "timestamp": "2025-01-17T12:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "path": ["name"],
      "message": "String must contain at least 3 character(s)"
    }
  ],
  "meta": {
    "duration": 45,
    "timestamp": "2025-01-17T12:00:00.000Z"
  }
}
```

---

## Authentication

### Session-based Authentication

Engify uses NextAuth.js for session management.

**Login:**
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65a1234567890abcdef12345",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "session": {
      "expires": "2025-02-17T12:00:00.000Z"
    }
  }
}
```

**Logout:**
```http
POST /api/auth/signout
```

### API Key Authentication

For programmatic access, use API keys:

```http
GET /api/v2/prompts
Authorization: Bearer <api-key>
```

**API Key Format:**
```
engify_<prefix>_<random-string>
```

Example:
```
engify_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642435200
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/v2/users/api-keys | 5 requests | 5 minutes |
| POST /api/v2/users/api-keys/*/rotate | 3 requests | 5 minutes |
| POST /api/v2/users/api-keys/*/revoke | 10 requests | 1 minute |
| POST /api/ai/execute | 30 requests | 1 minute |
| GET /api/prompts | 100 requests | 1 minute |
| POST /api/prompts | 10 requests | 1 minute |

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "success": false,
  "error": "Rate limit exceeded - Please try again later",
  "meta": {
    "limit": 100,
    "remaining": 0,
    "resetAt": 1642435200
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary unavailability |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "path": ["field", "name"],
      "message": "Error description",
      "code": "VALIDATION_ERROR"
    }
  ],
  "meta": {
    "duration": 45,
    "timestamp": "2025-01-17T12:00:00.000Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## User Management API

### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "organizationId": "65a9876543210fedcba98765",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLoginAt": "2025-01-17T12:00:00.000Z",
    "emailVerified": true
  }
}
```

### Update User Profile

```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Software Engineer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "email": "user@example.com",
    "name": "Jane Doe",
    "bio": "Software Engineer",
    "updatedAt": "2025-01-17T12:00:00.000Z"
  }
}
```

### Get User Statistics

```http
GET /api/users/me/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "promptsCreated": 25,
    "promptsExecuted": 150,
    "favoritePrompts": 10,
    "apiKeysActive": 2,
    "totalUsage": {
      "requests": 1500,
      "tokens": 450000
    }
  }
}
```

---

## API Key Management

### Create API Key

```http
POST /api/v2/users/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production API Key",
  "expiresIn": 90,
  "scopes": ["prompts:read", "prompts:write"]
}
```

**Request Schema:**
```typescript
{
  name: string;           // 3-100 characters
  expiresIn?: number;     // Days (1-365), default: 90
  scopes?: string[];      // Optional permission scopes
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Production API Key",
    "plainKey": "engify_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "keyPrefix": "engify_prod_a1b2",
    "scopes": ["prompts:read", "prompts:write"],
    "expiresAt": "2025-04-17T12:00:00.000Z",
    "createdAt": "2025-01-17T12:00:00.000Z"
  },
  "warning": "Save this key securely. It will not be shown again."
}
```

### List API Keys

```http
GET /api/v2/users/api-keys
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65a1234567890abcdef12345",
      "name": "Production API Key",
      "keyPrefix": "engify_prod_a1b2",
      "scopes": ["prompts:read", "prompts:write"],
      "active": true,
      "expiresAt": "2025-04-17T12:00:00.000Z",
      "lastUsedAt": "2025-01-17T11:00:00.000Z",
      "usageCount": 1234,
      "createdAt": "2025-01-17T12:00:00.000Z"
    }
  ]
}
```

### Rotate API Key

```http
POST /api/v2/users/api-keys/{keyId}/rotate
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentKey": "engify_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Production API Key",
    "plainKey": "engify_prod_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    "keyPrefix": "engify_prod_x9y8",
    "expiresAt": "2025-04-17T12:00:00.000Z",
    "createdAt": "2025-01-17T12:00:00.000Z"
  },
  "warning": "The old key has been invalidated. Save the new key securely."
}
```

### Revoke API Key

```http
POST /api/v2/users/api-keys/{keyId}/revoke
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "revokedAt": "2025-01-17T12:00:00.000Z",
    "revokedBy": "65a9876543210fedcba98765"
  }
}
```

---

## Prompt API

### List Prompts

```http
GET /api/prompts?category=engineering&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): Filter by category
- `role` (optional): Filter by role
- `search` (optional): Search query
- `featured` (optional): Boolean, show only featured
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "65a1234567890abcdef12345",
        "title": "Code Review Assistant",
        "description": "Comprehensive code review with best practices",
        "content": "Review the following code...",
        "category": "engineering",
        "role": "developer",
        "tags": ["code-review", "best-practices"],
        "views": 1234,
        "rating": 4.8,
        "featured": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Prompt by ID

```http
GET /api/prompts/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "title": "Code Review Assistant",
    "description": "Comprehensive code review with best practices",
    "content": "Review the following code and provide...",
    "category": "engineering",
    "role": "developer",
    "tags": ["code-review", "best-practices", "security"],
    "author": {
      "id": "65a9876543210fedcba98765",
      "name": "John Doe"
    },
    "views": 1234,
    "rating": 4.8,
    "featured": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

### Create Prompt

```http
POST /api/prompts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "API Documentation Generator",
  "description": "Generate comprehensive API docs",
  "content": "Generate API documentation for...",
  "category": "engineering",
  "role": "developer",
  "tags": ["api", "documentation"]
}
```

**Request Schema:**
```typescript
{
  title: string;          // 3-200 characters
  description: string;    // 10-500 characters
  content: string;        // Prompt content
  category: string;       // Valid category
  role: string;           // Valid role
  tags: string[];         // 1-10 tags
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65a1234567890abcdef12345",
    "title": "API Documentation Generator",
    "description": "Generate comprehensive API docs",
    "content": "Generate API documentation for...",
    "category": "engineering",
    "role": "developer",
    "tags": ["api", "documentation"],
    "views": 0,
    "rating": 0,
    "featured": false,
    "createdAt": "2025-01-17T12:00:00.000Z",
    "updatedAt": "2025-01-17T12:00:00.000Z"
  }
}
```

### Update Prompt

```http
PUT /api/prompts/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

### Delete Prompt

```http
DELETE /api/prompts/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "65a1234567890abcdef12345"
  }
}
```

---

## AI Execution API

### Execute Prompt

```http
POST /api/ai/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Explain quantum computing in simple terms",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "options": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

**Request Schema:**
```typescript
{
  prompt: string;                    // Prompt text
  provider: AIProvider;              // openai, anthropic, google, groq
  model?: string;                    // Model ID (optional, uses default)
  options?: {
    temperature?: number;            // 0.0-2.0
    maxTokens?: number;              // Max response tokens
    topP?: number;                   // 0.0-1.0
    frequencyPenalty?: number;       // 0.0-2.0
    presencePenalty?: number;        // 0.0-2.0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Quantum computing is a type of computing...",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "usage": {
      "promptTokens": 12,
      "completionTokens": 150,
      "totalTokens": 162
    },
    "cost": {
      "input": 0.0000018,
      "output": 0.0000900,
      "total": 0.0000918
    },
    "executionTime": 1234
  }
}
```

### List Available Models

```http
GET /api/ai/models
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4o-mini",
        "provider": "openai",
        "displayName": "GPT-4o Mini",
        "contextWindow": 128000,
        "inputCostPer1M": 0.15,
        "outputCostPer1M": 0.60,
        "supportsStreaming": true,
        "supportsJSON": true,
        "tier": "affordable"
      }
    ]
  }
}
```

---

## Analytics API

### Get User Analytics

```http
GET /api/analytics/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExecutions": 1500,
    "totalTokens": 450000,
    "totalCost": 45.50,
    "providers": {
      "openai": { "executions": 800, "cost": 25.00 },
      "anthropic": { "executions": 500, "cost": 15.00 },
      "google": { "executions": 200, "cost": 5.50 }
    },
    "topModels": [
      { "model": "gpt-4o-mini", "executions": 600, "cost": 18.00 },
      { "model": "claude-3-haiku", "executions": 400, "cost": 12.00 }
    ],
    "usageByDate": [
      { "date": "2025-01-17", "executions": 50, "cost": 5.00 },
      { "date": "2025-01-16", "executions": 45, "cost": 4.50 }
    ]
  }
}
```

---

## Webhook Endpoints

### SendGrid Event Webhook

```http
POST /api/webhooks/sendgrid
Content-Type: application/json
X-Twilio-Email-Event-Webhook-Signature: <signature>

[
  {
    "email": "user@example.com",
    "event": "delivered",
    "timestamp": 1642435200,
    "sg_message_id": "abc123"
  }
]
```

### Twilio SMS Webhook

```http
POST /api/webhooks/twilio/sms
Content-Type: application/x-www-form-urlencoded

MessageSid=SM123&From=%2B1234567890&To=%2B0987654321&Body=Hello
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
async function executePrompt(prompt: string) {
  const response = await fetch('https://engify.ai/api/ai/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      provider: 'openai',
      model: 'gpt-4o-mini',
      options: {
        temperature: 0.7,
        maxTokens: 500,
      },
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

// Usage
const result = await executePrompt('Explain AI in simple terms');
console.log(result.response);
```

### Python

```python
import requests

def execute_prompt(prompt, api_key):
    url = 'https://engify.ai/api/ai/execute'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    data = {
        'prompt': prompt,
        'provider': 'openai',
        'model': 'gpt-4o-mini',
        'options': {
            'temperature': 0.7,
            'maxTokens': 500
        }
    }

    response = requests.post(url, json=data, headers=headers)
    result = response.json()

    if not result['success']:
        raise Exception(result['error'])

    return result['data']

# Usage
result = execute_prompt('Explain AI in simple terms', 'your-api-key')
print(result['response'])
```

### cURL

```bash
# Execute AI prompt
curl -X POST https://engify.ai/api/ai/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "Explain AI in simple terms",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "options": {
      "temperature": 0.7,
      "maxTokens": 500
    }
  }'

# Create API key
curl -X POST https://engify.ai/api/v2/users/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Production Key",
    "expiresIn": 90
  }'
```

---

## SDK Support

### Official SDKs

Coming soon:
- `@engify/node-sdk` - Node.js SDK
- `@engify/python-sdk` - Python SDK
- `@engify/go-sdk` - Go SDK

### Community SDKs

Check [GitHub Discussions](https://github.com/donlaur/Engify-AI-App/discussions) for community-maintained SDKs.

---

## Support

### Getting Help

- **Documentation**: https://engify.ai/api-docs
- **GitHub Issues**: https://github.com/donlaur/Engify-AI-App/issues
- **Email**: donlaur@engify.ai

### API Status

Check current API status: https://status.engify.ai

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**API Version**: v2
