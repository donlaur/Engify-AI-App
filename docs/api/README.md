# Engify AI - API Documentation

Enterprise-grade API documentation for the Engify AI prompt engineering platform.

## Documentation Files

### 📘 [API.md](./API.md)
Comprehensive API reference guide covering:
- All public API endpoints
- Authentication and authorization
- Rate limiting and quotas
- Error handling
- Request/response schemas
- Best practices

**Start here** if you're integrating with the Engify API.

### 📋 [openapi.yaml](./openapi.yaml)
OpenAPI 3.0 specification (Swagger) with:
- Complete endpoint definitions
- Request/response schemas
- Authentication schemes
- Example requests and responses
- Error codes and descriptions

**Use this** for:
- Generating client SDKs
- API testing with Postman/Insomnia
- Auto-generating documentation
- Contract testing

### 💻 [EXAMPLES.md](./EXAMPLES.md)
Practical code examples in multiple languages:
- JavaScript/TypeScript
- Python
- cURL
- React hooks
- Next.js integration
- Error handling patterns
- Rate limiting strategies
- Testing examples

**Use this** for quick implementation and copy-paste ready code.

---

## Quick Start

### 1. Authentication

```typescript
// Browser-based (session cookies)
const response = await fetch('https://engify.ai/api/chat', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

### 2. Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat with RAG |
| `/api/patterns` | GET | Browse prompt patterns |
| `/api/feedback/rating` | POST/GET | Submit/get ratings |
| `/api/v2/ai/execute` | POST | Multi-provider AI execution |
| `/api/auth/signup` | POST | Create account |

### 3. Rate Limits

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Anonymous | 20 | 50 |
| Authenticated | 100 | 500 |
| Pro | 1,000 | 5,000 |

---

## API Features

### 🔐 Secure Authentication
- NextAuth.js v5 session-based auth
- Multiple providers (Email, Google, GitHub, Cognito)
- RBAC with granular permissions
- MFA support for admins

### ⚡ Multi-Provider AI Execution
Execute prompts across multiple providers:
- **OpenAI** - GPT-3.5/4 models
- **Claude** - Anthropic's Claude models
- **Gemini** - Google's latest models
- **Groq** - Ultra-fast inference
- **Replicate** - Specialized models

### 📊 RAG (Retrieval Augmented Generation)
- Automatic context retrieval from 100+ prompts
- MongoDB vector search
- Relevance scoring
- Source attribution

### 🛡️ Enterprise Features
- Rate limiting with tiered access
- Input sanitization
- Audit logging
- Cost tracking
- Usage analytics
- RBAC authorization

---

## Testing the API

### Using cURL

```bash
# Get patterns
curl https://engify.ai/api/patterns?category=COGNITIVE

# Chat (requires authentication)
curl -X POST https://engify.ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### Using Postman

1. Import the OpenAPI spec: `docs/api/openapi.yaml`
2. Configure authentication (session cookies)
3. Start making requests!

### Using JavaScript

```javascript
const response = await fetch('https://engify.ai/api/chat', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is chain of thought?' }]
  })
});

const data = await response.json();
console.log(data.message);
```

---

## Common Use Cases

### 1. Building a Chat Interface
See [EXAMPLES.md - React Integration](./EXAMPLES.md#react-integration)

### 2. Browsing Prompt Library
```typescript
const patterns = await fetch('https://engify.ai/api/patterns?category=COGNITIVE');
const prompts = patterns.json();
```

### 3. Multi-Provider AI Execution
```typescript
const result = await fetch('https://engify.ai/api/v2/ai/execute', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Explain quantum computing',
    provider: 'claude',
    temperature: 0.5
  })
});
```

### 4. Collecting Feedback
```typescript
await fetch('https://engify.ai/api/feedback/rating', {
  method: 'POST',
  body: JSON.stringify({
    promptId: 'prompt_123',
    rating: 5,
    dimensions: { clarity: 5, usefulness: 5 }
  })
});
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again later.",
  "details": { "resetAt": "2025-11-17T15:30:00.000Z" }
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

See [API.md - Error Handling](./API.md#error-handling) for details.

---

## Best Practices

1. **Always Include Credentials**
   ```typescript
   fetch(url, { credentials: 'include' })
   ```

2. **Monitor Rate Limit Headers**
   ```typescript
   const remaining = response.headers.get('X-RateLimit-Remaining');
   if (remaining < 10) console.warn('Low rate limit!');
   ```

3. **Implement Retry Logic**
   ```typescript
   if (response.status === 429) {
     const retryAfter = response.headers.get('Retry-After');
     await sleep(retryAfter * 1000);
     // Retry request
   }
   ```

4. **Cache Responses**
   ```typescript
   const cache = new Map();
   // Cache patterns, prompts, etc.
   ```

5. **Handle Errors Gracefully**
   ```typescript
   try {
     const data = await apiCall();
   } catch (error) {
     if (error.code === 'RATE_LIMIT_EXCEEDED') {
       // Show user-friendly message
     }
   }
   ```

---

## SDKs and Tools

### Official SDK (Coming Soon)
- TypeScript/JavaScript SDK
- Python SDK
- Full type safety
- Built-in retry logic

### Community Tools
- Postman Collection
- OpenAPI Generator clients
- Swagger UI integration

### Development Tools
- [Postman](https://www.postman.com/) - API testing
- [Insomnia](https://insomnia.rest/) - API client
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate clients
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive docs

---

## Support

### Documentation
- **API Reference**: [API.md](./API.md)
- **Code Examples**: [EXAMPLES.md](./EXAMPLES.md)
- **OpenAPI Spec**: [openapi.yaml](./openapi.yaml)

### Resources
- **Website**: [engify.ai](https://engify.ai)
- **GitHub**: [github.com/donlaur/Engify-AI-App](https://github.com/donlaur/Engify-AI-App)
- **Issues**: [github.com/donlaur/Engify-AI-App/issues](https://github.com/donlaur/Engify-AI-App/issues)

### Contact
- **Email**: donlaur@engify.ai
- **Twitter**: [@engifyai](https://twitter.com/engifyai)

---

## Changelog

### Version 2.0.0 (2025-11-17)
- ✨ Added multi-provider AI execution API (v2)
- 🔐 Enhanced RBAC with granular permissions
- 📊 Added workbench integration with cost tracking
- 🎯 Improved rate limiting with tier-based limits
- 📚 Complete OpenAPI specification
- 💻 Comprehensive code examples

### Version 1.0.0 (2024-11-01)
- 🚀 Initial release
- Chat API with RAG
- Patterns API
- Feedback system
- Authentication

---

**Built with ❤️ by the Engify team**

*Last updated: 2025-11-17*
