# Engify AI API Documentation

**Version:** 2.0.0
**Base URL (Production):** `https://engify.ai/api`
**Base URL (Development):** `http://localhost:3000/api`

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Chat API](#chat-api)
   - [Patterns API](#patterns-api)
   - [Feedback API](#feedback-api)
   - [AI Execution API (v2)](#ai-execution-api-v2)
   - [Authentication API](#authentication-api)
6. [Data Models](#data-models)
7. [Best Practices](#best-practices)
8. [Code Examples](#code-examples)
9. [Webhooks](#webhooks)
10. [Changelog](#changelog)

---

## Introduction

The Engify AI API provides programmatic access to the Engify prompt engineering platform. This API enables:

- 🤖 **AI-Powered Chat**: Intelligent chat with RAG (Retrieval Augmented Generation)
- 📚 **Prompt Library**: Access to 100+ expert-crafted prompts
- 🎯 **Pattern Discovery**: Browse 15+ proven prompt patterns
- ⚡ **Multi-Provider Execution**: Execute prompts across OpenAI, Claude, Gemini, Groq, and Replicate
- 📊 **Analytics & Feedback**: Track usage and collect user feedback

### Key Features

- **RESTful Design**: Follows REST principles with clear, predictable endpoints
- **Type Safety**: Full TypeScript support with Zod validation
- **Security First**: Rate limiting, input sanitization, RBAC authorization
- **Developer Experience**: Comprehensive documentation, examples, and error messages

### Getting Started

1. **Create an Account**: Sign up at [engify.ai/signup](https://engify.ai/signup)
2. **Authenticate**: Use NextAuth.js session-based authentication
3. **Make Your First Request**: Try the Chat API
4. **Explore**: Browse prompts, patterns, and execute AI requests

---

## Authentication

Engify uses **NextAuth.js v5** for authentication with session-based cookies.

### Authentication Methods

1. **Email/Password** (Credentials Provider)
2. **Google OAuth**
3. **GitHub OAuth**
4. **AWS Cognito** (Enterprise - when configured)

### Session-Based Authentication

After successful login, NextAuth.js sets a session cookie (`next-auth.session-token`) which is automatically included in subsequent requests.

```javascript
// Login example
const response = await fetch('https://engify.ai/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-password',
  }),
});
```

### Anonymous Access

Some endpoints support anonymous access with reduced rate limits:
- Chat API (limited)
- Patterns API (read-only)
- Public prompt browsing

### RBAC (Role-Based Access Control)

**User Roles:**
- `free`: Free tier users
- `pro`: Pro subscription users
- `manager`: Team managers
- `super_admin`: Platform administrators

**Permissions:**
- Most endpoints: Any authenticated user
- Admin endpoints: `super_admin` role required
- AI Execution: `workbench:ai_execution` permission required

---

## Rate Limiting

Rate limits protect the API from abuse and ensure fair usage.

### Rate Limit Tiers

| Tier | Requests/Hour | Requests/Day | Max Tokens/Day |
|------|---------------|--------------|----------------|
| **Anonymous** | 20 | 50 | 10,000 |
| **Authenticated** | 100 | 500 | 100,000 |
| **Pro** | 1,000 | 5,000 | 1,000,000 |

### Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-11-17T15:30:00.000Z
```

### Rate Limit Exceeded (429)

When rate limit is exceeded, the API returns:

```json
{
  "error": "free_trial_limit_reached",
  "message": "You've reached the limit of your free trial. Sign in to continue or try again after 3:30 PM.",
  "resetAt": "2025-11-17T15:30:00.000Z"
}
```

**Response Headers:**
- `Retry-After: 60` (seconds to wait)
- `X-RateLimit-Reset: 2025-11-17T15:30:00.000Z`

### Best Practices

1. **Check Headers**: Monitor `X-RateLimit-Remaining`
2. **Handle 429**: Implement exponential backoff
3. **Batch Requests**: Combine requests when possible
4. **Cache Responses**: Reduce redundant requests
5. **Upgrade Plan**: Consider Pro tier for higher limits

---

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses.

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource conflict (e.g., duplicate) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |

### Error Response Format

```json
{
  "error": "validation_error",
  "message": "Invalid input provided. Please check your data and try again.",
  "details": [
    {
      "field": "email",
      "issue": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

```javascript
// Authentication Errors
AUTH_REQUIRED: "Please sign in to continue."
AUTH_FAILED: "Authentication failed. Please try again."
SESSION_EXPIRED: "Your session has expired. Please sign in again."
INVALID_CREDENTIALS: "Invalid email or password."

// Authorization Errors
PERMISSION_DENIED: "You do not have permission to perform this action."
ADMIN_ONLY: "This action requires administrator privileges."
SUBSCRIPTION_REQUIRED: "Please upgrade your plan to access this feature."

// Rate Limiting Errors
RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later or upgrade your plan."
DAILY_LIMIT_REACHED: "You have reached your daily limit. Please try again tomorrow."

// Validation Errors
INVALID_INPUT: "Invalid input provided. Please check your data and try again."
CONTENT_TOO_LONG: "Content exceeds maximum length."
PROMPT_TOO_LONG: "Your prompt is too long. Please shorten it and try again."

// Resource Errors
NOT_FOUND: "The requested resource was not found."
PROMPT_NOT_FOUND: "Prompt not found."
PATTERN_NOT_FOUND: "Pattern not found."

// Network Errors
NETWORK_ERROR: "Network error. Please check your connection and try again."
SERVER_ERROR: "Server error. Please try again later."
TIMEOUT: "Request timed out. Please try again."
```

---

## API Endpoints

### Chat API

**Endpoint:** `POST /api/chat`

AI-powered chat with RAG (Retrieval Augmented Generation) support. Automatically retrieves relevant context from the prompt library.

#### Request

```http
POST /api/chat
Content-Type: application/json
```

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is chain of thought prompting?"
    }
  ],
  "useRAG": true
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | Array | Yes | Chat message history |
| `messages[].role` | String | Yes | Message role: `user`, `assistant`, or `system` |
| `messages[].content` | String | Yes | Message content (max 10,000 chars) |
| `useRAG` | Boolean | No | Enable RAG (default: `true`) |

#### Response (200 OK)

```json
{
  "message": "Chain of Thought (CoT) is one of our most powerful patterns! It asks the AI to 'think step by step' before answering...",
  "sources": [
    {
      "title": "Chain of Thought Pattern",
      "score": 0.95
    },
    {
      "title": "Advanced Reasoning Techniques",
      "score": 0.87
    }
  ],
  "usedRAG": true
}
```

#### Rate Limits
- Anonymous: 20/hour
- Authenticated: 100/hour

#### Example

```javascript
const response = await fetch('https://engify.ai/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is few-shot learning?' }
    ],
    useRAG: true
  })
});

const data = await response.json();
console.log(data.message);
```

---

### Patterns API

**Endpoint:** `GET /api/patterns`

Browse the library of proven prompt patterns with optional filtering.

#### Request

```http
GET /api/patterns?category=COGNITIVE&level=intermediate
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | String | No | Filter by category: `FOUNDATIONAL`, `STRUCTURAL`, `COGNITIVE`, `ITERATIVE` |
| `level` | String | No | Filter by level: `beginner`, `intermediate`, `advanced` |

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "cot-pattern",
      "name": "Chain of Thought",
      "category": "COGNITIVE",
      "level": "intermediate",
      "description": "Break down complex reasoning into step-by-step thinking",
      "examples": [
        "Let's solve this step by step:\n1. First, identify...\n2. Then, analyze...\n3. Finally, conclude..."
      ],
      "tags": ["reasoning", "complex-tasks", "accuracy"]
    }
  ],
  "count": 1
}
```

#### Example

```javascript
// Get all cognitive patterns
const response = await fetch('https://engify.ai/api/patterns?category=COGNITIVE');
const { data, count } = await response.json();

console.log(`Found ${count} cognitive patterns`);
data.forEach(pattern => {
  console.log(`- ${pattern.name} (${pattern.level})`);
});
```

---

### Feedback API

#### Submit Rating

**Endpoint:** `POST /api/feedback/rating`

Submit a detailed 1-5 star rating for a prompt. Supports multi-dimensional ratings.

##### Request

```http
POST /api/feedback/rating
Content-Type: application/json
```

```json
{
  "promptId": "prompt_123",
  "rating": 5,
  "dimensions": {
    "clarity": 5,
    "usefulness": 5,
    "completeness": 4,
    "accuracy": 5
  },
  "usageContext": {
    "aiModel": "gpt-4",
    "useCase": "code generation"
  },
  "comment": "Excellent prompt for generating React components",
  "tags": ["react", "frontend"],
  "suggestedImprovements": ["Add TypeScript examples"]
}
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `promptId` | String | Yes | Prompt ID |
| `rating` | Integer | Yes | Overall rating (1-5) |
| `dimensions` | Object | No | Multi-dimensional ratings |
| `dimensions.clarity` | Integer | No | Clarity rating (1-5) |
| `dimensions.usefulness` | Integer | No | Usefulness rating (1-5) |
| `dimensions.completeness` | Integer | No | Completeness rating (1-5) |
| `dimensions.accuracy` | Integer | No | Accuracy rating (1-5) |
| `usageContext` | Object | No | Usage context |
| `usageContext.aiModel` | String | No | AI model used |
| `usageContext.useCase` | String | No | Use case |
| `comment` | String | No | Optional comment (max 1,000 chars) |
| `tags` | Array | No | Tags for categorization |
| `suggestedImprovements` | Array | No | Suggested improvements |

##### Response (200 OK)

```json
{
  "success": true,
  "message": "Thank you for your detailed feedback! This helps us improve our prompts."
}
```

##### Duplicate Prevention

The API prevents duplicate ratings from the same user within 24 hours. If a duplicate is detected, the existing rating is updated instead.

#### Get Ratings

**Endpoint:** `GET /api/feedback/rating?promptId={id}`

Retrieve aggregated ratings and statistics for a prompt.

##### Request

```http
GET /api/feedback/rating?promptId=prompt_123
```

##### Response (200 OK)

```json
{
  "promptId": "prompt_123",
  "quickFeedback": {
    "likes": 45,
    "saves": 23,
    "helpful": 38,
    "notHelpful": 2,
    "shares": 12,
    "totalInteractions": 120
  },
  "detailedRatings": {
    "averageRating": 4.7,
    "ratingCount": 34,
    "ratingDistribution": {
      "stars1": 0,
      "stars2": 1,
      "stars3": 3,
      "stars4": 10,
      "stars5": 20
    },
    "averageClarity": 4.8,
    "averageUsefulness": 4.9,
    "averageCompleteness": 4.5,
    "averageAccuracy": 4.7
  },
  "overallScore": 87.5,
  "confidenceScore": 0.92,
  "qualityFlags": {
    "isHighQuality": true,
    "needsImprovement": false,
    "hasIssues": false,
    "isPopular": true
  },
  "ragReadiness": {
    "isReady": true,
    "score": 0.95,
    "reasons": ["High quality score", "Sufficient ratings", "Positive feedback"]
  }
}
```

---

### AI Execution API (v2)

**Endpoint:** `POST /api/v2/ai/execute`

Execute AI requests across multiple providers using a unified interface. Demonstrates SOLID principles with factory pattern and provider abstraction.

#### Supported Providers

- `openai`: OpenAI GPT models
- `claude`: Anthropic Claude models
- `gemini`: Google Gemini models
- `groq`: Groq (ultra-fast inference)
- `replicate`: Replicate models

#### Request

```http
POST /api/v2/ai/execute
Content-Type: application/json
```

```json
{
  "prompt": "Write a Python function to calculate fibonacci numbers",
  "provider": "openai",
  "systemPrompt": "You are an expert Python developer",
  "temperature": 0.7,
  "maxTokens": 500,
  "toolId": "code-generator",
  "runId": "run_12345"
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | String | Yes | - | User prompt (1-10,000 chars) |
| `provider` | String | No | `openai` | AI provider to use |
| `systemPrompt` | String | No | - | System prompt |
| `temperature` | Number | No | `0.7` | Sampling temperature (0-2) |
| `maxTokens` | Number | No | `2000` | Maximum tokens to generate (1-4096) |
| `toolId` | String | No | - | Workbench tool ID (for cost tracking) |
| `runId` | String | No | - | Workbench run ID (for replay detection) |

#### Response (200 OK)

```json
{
  "success": true,
  "response": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "usage": {
    "promptTokens": 15,
    "completionTokens": 45,
    "totalTokens": 60
  },
  "cost": {
    "prompt": 0.000015,
    "completion": 0.000090,
    "total": 0.000105
  },
  "latency": 823,
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "runId": "run_12345"
}
```

#### Error Responses

**400 Bad Request - Invalid Provider**
```json
{
  "error": "Invalid provider",
  "message": "Provider \"invalid\" not found",
  "availableProviders": ["openai", "claude", "gemini", "groq", "replicate"]
}
```

**403 Forbidden - Budget Exceeded**
```json
{
  "error": "Workbench execution exceeded cost budget",
  "runId": "run_12345",
  "maxCostCents": 10,
  "actualCostCents": 15
}
```

**409 Conflict - Replay Detected**
```json
{
  "error": "Replay detected",
  "runId": "run_12345"
}
```

#### List Providers

**Endpoint:** `GET /api/v2/ai/execute`

Get list of available AI providers.

##### Response (200 OK)

```json
{
  "providers": ["openai", "claude", "gemini", "groq", "replicate"],
  "categories": {
    "fast": ["groq"],
    "general": ["openai", "claude", "gemini"],
    "specialized": ["replicate"]
  }
}
```

#### Example

```javascript
// Execute with OpenAI
const response = await fetch('https://engify.ai/api/v2/ai/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    prompt: 'Explain quantum computing in simple terms',
    provider: 'claude',
    temperature: 0.5,
    maxTokens: 500
  })
});

const result = await response.json();
console.log(result.response);
console.log(`Cost: $${result.cost.total}`);
console.log(`Latency: ${result.latency}ms`);
```

---

### Authentication API

#### Sign Up

**Endpoint:** `POST /api/auth/signup`

Create a new user account.

##### Request

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "email": "developer@example.com",
  "password": "SecurePass123!",
  "name": "John Developer"
}
```

##### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | String | Yes | Valid email address |
| `password` | String | Yes | Password (min 8 characters) |
| `name` | String | Yes | User display name |

##### Response (201 Created)

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "developer@example.com",
    "name": "John Developer"
  }
}
```

##### Error Responses

**400 Bad Request - User Already Exists**
```json
{
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

**400 Bad Request - Invalid Password**
```json
{
  "error": "validation_error",
  "message": "Password must be at least 8 characters long"
}
```

---

## Data Models

### Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### Pattern

```typescript
interface Pattern {
  id: string;
  name: string;
  category: 'FOUNDATIONAL' | 'STRUCTURAL' | 'COGNITIVE' | 'ITERATIVE';
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  examples?: string[];
  tags?: string[];
}
```

### Rating

```typescript
interface Rating {
  promptId: string;
  rating: number; // 1-5
  dimensions?: {
    clarity?: number; // 1-5
    usefulness?: number; // 1-5
    completeness?: number; // 1-5
    accuracy?: number; // 1-5
  };
  usageContext?: {
    aiModel?: string;
    useCase?: string;
  };
  comment?: string;
  tags?: string[];
  suggestedImprovements?: string[];
}
```

### AI Execution Request

```typescript
interface AIExecutionRequest {
  prompt: string;
  provider?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  toolId?: string;
  runId?: string;
}
```

### AI Execution Response

```typescript
interface AIExecutionResponse {
  success: boolean;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
  provider: string;
  model: string;
  runId: string | null;
}
```

---

## Best Practices

### 1. Handle Rate Limits Gracefully

```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;

      console.log(`Rate limited. Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}
```

### 2. Monitor Rate Limit Headers

```javascript
function checkRateLimitHeaders(response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  console.log(`Rate Limit: ${remaining}/${limit} remaining`);

  if (remaining < 10) {
    console.warn('Low rate limit! Consider slowing down requests.');
  }

  return { limit, remaining, reset };
}
```

### 3. Implement Error Handling

```javascript
async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);

    // Handle specific errors
    if (error.message.includes('Rate limit')) {
      // Wait and retry
    } else if (error.message.includes('Authentication')) {
      // Redirect to login
    } else {
      // Show user-friendly error
    }

    throw error;
  }
}
```

### 4. Use Batch Operations

```javascript
// Instead of making multiple requests
const prompts = await Promise.all([
  fetch('/api/patterns?category=COGNITIVE'),
  fetch('/api/patterns?category=FOUNDATIONAL'),
  fetch('/api/patterns?category=STRUCTURAL')
]);

// Better: Use a single request with filtering on client-side
const allPatterns = await fetch('/api/patterns');
const cognitivePatterns = allPatterns.data.filter(p => p.category === 'COGNITIVE');
```

### 5. Cache Responses

```javascript
const cache = new Map();

async function fetchWithCache(url, ttl = 60000) {
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();

  cache.set(url, { data, timestamp: Date.now() });

  return data;
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Chat API Example
async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch('https://engify.ai/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      useRAG: true
    })
  });

  if (!response.ok) {
    throw new Error('Chat request failed');
  }

  const data = await response.json();
  return data.message;
}

// Usage
const reply = await sendChatMessage('What is few-shot learning?');
console.log(reply);
```

### Python

```python
import requests

# Chat API Example
def send_chat_message(message: str) -> str:
    url = 'https://engify.ai/api/chat'

    response = requests.post(url, json={
        'messages': [{'role': 'user', 'content': message}],
        'useRAG': True
    })

    response.raise_for_status()
    data = response.json()

    return data['message']

# Usage
reply = send_chat_message('What is few-shot learning?')
print(reply)
```

### cURL

```bash
# Chat API
curl -X POST https://engify.ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is chain of thought?"}
    ],
    "useRAG": true
  }'

# Patterns API
curl https://engify.ai/api/patterns?category=COGNITIVE

# AI Execution API
curl -X POST https://engify.ai/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "provider": "claude",
    "temperature": 0.5,
    "maxTokens": 500
  }'
```

---

## Webhooks

### SendGrid Email Webhook

**Endpoint:** `POST /api/webhooks/sendgrid`

Receives email events from SendGrid (bounces, opens, clicks, etc.).

**Verification:** Uses SendGrid signature verification for security.

### Twilio SMS Webhook

**Endpoint:** `POST /api/webhooks/twilio`

Receives SMS events from Twilio (delivery status, replies, etc.).

**Verification:** Uses Twilio signature verification for security.

### Content Updated Webhook

**Endpoint:** `POST /api/webhooks/content-updated`

Triggers cache revalidation when content is updated.

**Security:** Requires internal authentication token.

---

## Changelog

### Version 2.0.0 (2025-11-17)

**New Features:**
- ✨ AI Execution API (v2) with multi-provider support
- 🔐 Enhanced RBAC with granular permissions
- 📊 Workbench integration with cost tracking
- 🎯 Improved rate limiting with tier-based limits

**Breaking Changes:**
- Migrated to NextAuth.js v5
- Updated authentication flow
- New rate limit structure

**Improvements:**
- Better error messages
- Enhanced TypeScript types
- Improved documentation
- Added OpenAPI/Swagger spec

### Version 1.0.0 (2024-11-01)

**Initial Release:**
- Chat API with RAG
- Patterns API
- Feedback API
- Authentication
- Rate limiting

---

## Support

### Documentation
- **API Reference:** [engify.ai/docs/api](https://engify.ai/docs/api)
- **OpenAPI Spec:** [engify.ai/docs/api/openapi.yaml](https://engify.ai/docs/api/openapi.yaml)
- **Code Examples:** [github.com/donlaur/Engify-AI-App/examples](https://github.com/donlaur/Engify-AI-App)

### Contact
- **Email:** donlaur@engify.ai
- **GitHub Issues:** [github.com/donlaur/Engify-AI-App/issues](https://github.com/donlaur/Engify-AI-App/issues)
- **Website:** [engify.ai](https://engify.ai)

### Community
- **Discord:** [Coming soon]
- **Twitter:** [@engifyai](https://twitter.com/engifyai)

---

**Built with ❤️ by the Engify team**
