# API Documentation

## Overview

Engify.ai provides REST APIs for prompt execution, testing, and analysis.

## Base URL

```
Production: https://engify.ai/api
Development: http://localhost:3000/api
```

## Authentication

Currently using session-based auth. API keys coming in v2.0.

```typescript
// Headers
{
  "Content-Type": "application/json",
  "Cookie": "session_token=..."
}
```

## Endpoints

### Execute Prompt

Test a prompt with specified AI provider.

**POST** `/api/ai/execute`

```typescript
// Request
{
  prompt: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  model?: string;
  temperature?: number; // 0-1, default 0.7
}

// Response
{
  response: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  executionTime: number; // milliseconds
}
```

**Example:**

```bash
curl -X POST https://engify.ai/api/ai/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain SOLID principles",
    "provider": "openai",
    "temperature": 0.7
  }'
```

### Batch Test Prompts

Test multiple prompts across providers.

**POST** `/api/prompts/test-batch`

```typescript
// Request
{
  prompts: Array<{
    id: string;
    text: string;
  }>;
  providers?: string[]; // default: all
}

// Response
{
  results: Array<{
    promptId: string;
    provider: string;
    response: string;
    metrics: {
      executionTime: number;
      tokens: number;
      score: number; // 0-100
    };
  }>;
}
```

### Audit Prompt

Analyze prompt quality using KERNEL framework.

**POST** `/api/prompts/audit`

```typescript
// Request
{
  prompt: string;
}

// Response
{
  overallScore: number; // 0-100
  kernelScores: {
    keepSimple: number;
    easyToVerify: number;
    reproducible: number;
    narrowScope: number;
    explicitConstraints: number;
    logicalStructure: number;
  };
  issues: Array<{
    severity: 'critical' | 'warning' | 'suggestion';
    category: string;
    description: string;
    fix: string;
  }>;
  recommendations: string[];
  improvedVersion: string;
}
```

### Get Prompts

Retrieve prompts from library.

**GET** `/api/prompts`

```typescript
// Query Parameters
{
  category?: string;
  role?: string;
  pattern?: string;
  search?: string;
  limit?: number; // default 50
  offset?: number; // default 0
}

// Response
{
  prompts: Array<{
    id: string;
    title: string;
    description: string;
    prompt: string;
    category: string;
    role: string[];
    pattern: string[];
    tags: string[];
  }>;
  total: number;
  hasMore: boolean;
}
```

### Get Learning Resources

Retrieve learning materials.

**GET** `/api/learning/resources`

```typescript
// Query Parameters
{
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  type?: string;
  featured?: boolean;
}

// Response
{
  resources: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    level: string;
    url?: string;
    content?: string;
    tags: string[];
  }>;
}
```

## Rate Limits

### Free Tier

- 10 executions/day
- 5 audits/day
- 100 API calls/hour

### Pro Tier (Coming Soon)

- Unlimited executions
- Unlimited audits
- 1000 API calls/hour

## Error Handling

```typescript
// Error Response
{
  error: string;
  code: string;
  details?: any;
}
```

### Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (rate limit)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks (Coming Soon)

Subscribe to events:

- `prompt.executed`
- `audit.completed`
- `test.finished`

## SDK (Coming Soon)

```typescript
import { EngifyClient } from '@engify/sdk';

const client = new EngifyClient({
  apiKey: 'your-api-key',
});

// Execute prompt
const result = await client.execute({
  prompt: 'Your prompt',
  provider: 'openai',
});

// Audit prompt
const audit = await client.audit('Your prompt');
```

## Best Practices

1. **Cache Results** - Avoid duplicate requests
2. **Handle Errors** - Implement retry logic
3. **Rate Limiting** - Respect limits
4. **Timeouts** - Set reasonable timeouts (30s)
5. **Validation** - Validate inputs client-side

## Support

- Documentation: https://engify.ai/docs
- Issues: GitHub Issues
- Email: api@engify.ai

---

**Version**: 1.0
**Last Updated**: October 2025
