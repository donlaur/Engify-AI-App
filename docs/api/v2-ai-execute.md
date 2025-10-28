# API Documentation: /api/v2/ai/execute

**Version**: 2.0  
**Status**: Production  
**Authentication**: Required

---

## Overview

The v2 AI Execute API provides a unified interface for executing prompts across multiple AI providers using SOLID principles and interface-based design.

## Endpoints

### POST /api/v2/ai/execute

Execute a prompt with the specified AI provider.

#### Request

```typescript
{
  "prompt": string,           // Required: The prompt to execute (1-10000 chars)
  "provider": string,         // Optional: Provider name (default: "openai")
  "systemPrompt"?: string,    // Optional: System prompt for context
  "temperature"?: number,     // Optional: 0-2 (default: 0.7)
  "maxTokens"?: number        // Optional: 1-4096 (default: 2000)
}
```

#### Response (Success)

```typescript
{
  "success": true,
  "response": string,         // AI-generated response
  "usage": {
    "promptTokens": number,
    "completionTokens": number,
    "totalTokens": number
  },
  "cost": {
    "input": number,          // Cost in USD
    "output": number,         // Cost in USD
    "total": number           // Total cost in USD
  },
  "latency": number,          // Response time in ms
  "provider": string,         // Provider used
  "model": string             // Model used
}
```

#### Response (Error)

```typescript
{
  "error": string,
  "message": string,
  "details"?: object
}
```

### GET /api/v2/ai/execute

Get available providers and their categories.

#### Response

```typescript
{
  "providers": string[],      // List of available provider names
  "categories": {
    [category: string]: string[]  // Providers grouped by category
  }
}
```

## Available Providers

### OpenAI
- **Name**: `openai`
- **Models**: GPT-3.5-turbo, GPT-4
- **Best For**: General purpose, coding, analysis
- **Speed**: Medium
- **Cost**: Medium

### Anthropic Claude
- **Name**: `anthropic`
- **Models**: Claude 3 Sonnet, Claude 3 Opus
- **Best For**: Long context, analysis, writing
- **Speed**: Medium
- **Cost**: Medium-High

### Google Gemini
- **Name**: `google`
- **Models**: Gemini Pro
- **Best For**: Multimodal, general purpose
- **Speed**: Fast
- **Cost**: Low

### Groq
- **Name**: `groq`
- **Models**: Llama 3, Mixtral
- **Best For**: Fast inference, real-time
- **Speed**: Very Fast
- **Cost**: Low

## Examples

### Basic Request

```bash
curl -X POST https://engify.ai/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Explain SOLID principles in 3 sentences",
    "provider": "openai"
  }'
```

### With System Prompt

```bash
curl -X POST https://engify.ai/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Write a function to reverse a string",
    "provider": "anthropic",
    "systemPrompt": "You are an expert programmer. Provide clean, well-documented code.",
    "temperature": 0.3
  }'
```

### Get Available Providers

```bash
curl https://engify.ai/api/v2/ai/execute \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | Invalid provider | Provider not found or not supported |
| 400 | Validation failed | Request validation error |
| 400 | Invalid request | Provider-specific validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 500 | Internal server error | Unexpected error occurred |

## Rate Limits

- **Free Tier**: 10 requests/day
- **Pro Tier**: 1000 requests/day
- **Enterprise**: Unlimited

## Cost Tracking

All responses include detailed cost information:
- Input tokens cost
- Output tokens cost
- Total cost in USD

Use this for budgeting and cost optimization.

## Performance Metrics

All responses include latency information:
- Total request time in milliseconds
- Use for provider comparison and optimization

## Migration from v1

### v1 API (Deprecated)

```javascript
// Old way
fetch('/api/ai/execute', {
  method: 'POST',
  body: JSON.stringify({ prompt, provider })
});
```

### v2 API (Current)

```javascript
// New way
import { API_ROUTES } from '@/lib/constants';

fetch(API_ROUTES.ai, {
  method: 'POST',
  body: JSON.stringify({ prompt, provider })
});
```

## Best Practices

1. **Provider Selection**
   - Use `openai` for general purpose
   - Use `groq` for speed-critical applications
   - Use `anthropic` for long context analysis
   - Use `google` for multimodal tasks

2. **Temperature Settings**
   - `0.0-0.3`: Deterministic, factual responses
   - `0.4-0.7`: Balanced creativity and accuracy
   - `0.8-1.0`: Creative, varied responses

3. **Error Handling**
   - Always check `response.ok` before parsing
   - Handle provider-specific errors gracefully
   - Implement retry logic for transient failures

4. **Cost Optimization**
   - Use lower-cost providers when possible
   - Optimize prompt length
   - Cache responses when appropriate
   - Monitor usage with cost tracking

## Support

- **Documentation**: https://docs.engify.ai
- **API Status**: https://status.engify.ai
- **Support**: support@engify.ai

---

**Last Updated**: October 28, 2025  
**API Version**: 2.0
