# Test Fixtures and Mocks Guide

Complete reference for using test fixtures, factories, and mocks in the Engify AI Application.

## Table of Contents

- [Introduction](#introduction)
- [Fixtures Overview](#fixtures-overview)
- [User Fixtures](#user-fixtures)
- [Prompt Fixtures](#prompt-fixtures)
- [API Response Fixtures](#api-response-fixtures)
- [Test Builders](#test-builders)
- [Database Mocking](#database-mocking)
- [AI Provider Mocking](#ai-provider-mocking)
- [HTTP Mocking](#http-mocking)
- [Usage Examples](#usage-examples)

## Introduction

Test fixtures and mocks provide reusable, consistent test data and behavior. They help you:

- Write tests faster with pre-built data
- Maintain consistency across tests
- Reduce boilerplate code
- Make tests more readable
- Easily modify test data in one place

All fixtures and mocks are available from a single import:

```typescript
import { /* any fixture or mock */ } from '@/test/utils';
```

## Fixtures Overview

### What are Fixtures?

Fixtures are pre-defined test data objects that you can use in your tests. We provide:

- **Factory functions** - Create custom test data
- **Pre-defined fixtures** - Common scenarios ready to use
- **Builders** - Fluent API for complex data construction

### Import Path

```typescript
// Import everything from test utils
import {
  createUser,
  userFixtures,
  createPrompt,
  promptFixtures,
  builders,
  createMockDatabase,
  // ... etc
} from '@/test/utils';
```

## User Fixtures

### Factory Function

```typescript
import { createUser, createUsers } from '@/test/utils';

// Create a single user with defaults
const user = createUser();
// Result: { id, _id, email, name, role: 'user', plan: 'free', ... }

// Override specific properties
const admin = createUser({
  role: 'admin',
  plan: 'pro',
  email: 'admin@example.com',
});

// Create multiple users
const users = createUsers(5); // Array of 5 users
const proUsers = createUsers(3, { plan: 'pro' });
```

### Pre-defined Fixtures

```typescript
import { userFixtures } from '@/test/utils';

// Regular free user
const regular = userFixtures.regular();

// Pro plan user
const pro = userFixtures.pro();

// Enterprise user with organization
const enterprise = userFixtures.enterprise();

// Admin user
const admin = userFixtures.admin();

// Super admin
const superAdmin = userFixtures.superAdmin();

// Editor user
const editor = userFixtures.editor();

// Unverified user (pending email verification)
const unverified = userFixtures.unverified();

// Suspended user
const suspended = userFixtures.suspended();
```

### User Builder

```typescript
import { builders } from '@/test/utils';

// Build a custom user with fluent API
const user = builders.user()
  .withEmail('test@example.com')
  .withName('Test User')
  .withRole('admin')
  .withPlan('enterprise')
  .withOrganization('org-123')
  .verified()
  .build();

// Use convenience methods
const admin = builders.user()
  .asAdmin() // Sets role: 'admin', plan: 'pro'
  .withEmail('admin@test.com')
  .build();

const superAdmin = builders.user()
  .asSuperAdmin() // Sets role: 'super_admin', plan: 'enterprise'
  .build();

const regular = builders.user()
  .asRegular() // Sets role: 'user', plan: 'free'
  .build();

const proUser = builders.user()
  .asPro() // Sets role: 'user', plan: 'pro'
  .build();

// Build multiple users
const admins = builders.user()
  .asAdmin()
  .buildMany(5);
```

### Session Fixtures

```typescript
import { createSession, builders } from '@/test/utils';

// Create session for a user
const session = createSession({ role: 'admin', plan: 'pro' });

// Session builder
const adminSession = builders.session()
  .withUser({ role: 'admin', email: 'admin@test.com' })
  .withExpiry(24) // hours
  .build();

const superAdminSession = builders.session()
  .asSuperAdmin()
  .build();

const regularSession = builders.session()
  .asRegular()
  .build();
```

## Prompt Fixtures

### Factory Function

```typescript
import { createPrompt, createPrompts } from '@/test/utils';

// Create a prompt with defaults
const prompt = createPrompt();

// Override properties
const codingPrompt = createPrompt({
  title: 'Code Review Helper',
  category: 'coding',
  tags: ['code', 'review', 'quality'],
  rating: 4.5,
});

// Create multiple prompts
const prompts = createPrompts(10);
const featuredPrompts = createPrompts(5, { featured: true });
```

### Pre-defined Fixtures

```typescript
import { promptFixtures } from '@/test/utils';

// Writing prompt
const writing = promptFixtures.writing();

// Coding prompt
const coding = promptFixtures.coding();

// Analysis prompt
const analysis = promptFixtures.analysis();

// Creative prompt
const creative = promptFixtures.creative();

// Business prompt
const business = promptFixtures.business();

// Draft prompt (unpublished)
const draft = promptFixtures.draft();

// Featured high-rated prompt
const featured = promptFixtures.featured();

// Archived prompt
const archived = promptFixtures.archived();
```

### Prompt Builder

```typescript
import { builders } from '@/test/utils';

// Build custom prompt
const prompt = builders.prompt()
  .withTitle('My Custom Prompt')
  .withDescription('A detailed description')
  .withCategory('coding')
  .withTags('typescript', 'testing', 'vitest')
  .withRating(4.8)
  .withUsageCount(250)
  .featured()
  .build();

// Convenience methods
const publishedPrompt = builders.prompt()
  .published() // Sets status: 'published'
  .build();

const draftPrompt = builders.prompt()
  .draft() // Sets status: 'draft'
  .build();

const popularPrompt = builders.prompt()
  .popular() // Sets rating: 4.5, usage: 100, favorites: 50
  .build();

const promptWithAuthor = builders.prompt()
  .withAuthor('user-123', 'John Doe')
  .build();

const promptWithPattern = builders.prompt()
  .withPattern('chain-of-thought')
  .build();

// Build multiple prompts
const prompts = builders.prompt()
  .withCategory('coding')
  .featured()
  .buildMany(5);
```

## API Response Fixtures

### Success Responses

```typescript
import { createSuccessResponse } from '@/test/utils';

const response = createSuccessResponse(
  { id: '123', name: 'Test' },
  'Operation successful'
);

// Result:
// {
//   success: true,
//   data: { id: '123', name: 'Test' },
//   message: 'Operation successful',
//   metadata: {
//     timestamp: '2024-01-15T10:30:00.000Z',
//     requestId: 'req-abc123'
//   }
// }
```

### Error Responses

```typescript
import { createErrorResponse, errorFixtures } from '@/test/utils';

// Custom error
const error = createErrorResponse(
  'CUSTOM_ERROR',
  'Something went wrong',
  { detail: 'Additional info' }
);

// Pre-defined errors
const unauthorized = errorFixtures.unauthorized();
const forbidden = errorFixtures.forbidden();
const notFound = errorFixtures.notFound();
const validationError = errorFixtures.validationError({
  email: 'Invalid email format',
});
const serverError = errorFixtures.serverError();
const rateLimited = errorFixtures.rateLimitExceeded();
const badRequest = errorFixtures.badRequest('Invalid parameters');
```

### Paginated Responses

```typescript
import { createPaginatedResponse } from '@/test/utils';

const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
const paginated = createPaginatedResponse(data, 1, 10, 50);

// Result:
// {
//   success: true,
//   data: [...],
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 50,
//     totalPages: 5,
//     hasNext: true,
//     hasPrev: false
//   }
// }
```

### Mock HTTP Responses

```typescript
import { MockResponse } from '@/test/utils';

// Success response
const success = MockResponse.success({ data: 'test' });

// JSON response with custom status
const created = MockResponse.json({ id: '123' }, 201);

// Error responses
const unauthorized = MockResponse.unauthorized();
const forbidden = MockResponse.forbidden();
const notFound = MockResponse.notFound();
const serverError = MockResponse.serverError();

// Custom error
const customError = MockResponse.error(
  'CUSTOM_ERROR',
  'Error message',
  422
);
```

### AI Provider Responses

```typescript
import { createAIResponse } from '@/test/utils';

const response = createAIResponse({
  provider: 'openai',
  model: 'gpt-4',
  response: 'This is the AI response',
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30,
  },
});
```

## Test Builders

Builders provide a fluent API for constructing complex test data.

### Why Use Builders?

- Readable, chainable API
- Only specify what you need
- Intelligent defaults
- Type-safe
- Reusable patterns

### User Builder Example

```typescript
import { UserBuilder } from '@/test/utils';

const user = new UserBuilder()
  .withEmail('test@example.com')
  .withRole('admin')
  .verified()
  .build();

// Or use the convenience factory
import { builders } from '@/test/utils';

const user = builders.user()
  .asAdmin()
  .withEmail('admin@example.com')
  .build();
```

### Prompt Builder Example

```typescript
import { builders } from '@/test/utils';

const prompt = builders.prompt()
  .withTitle('Advanced Coding Assistant')
  .withCategory('coding')
  .withTags('typescript', 'react', 'nextjs')
  .withRating(4.9)
  .featured()
  .popular()
  .build();
```

### Custom Builders

You can extend the base Builder class for your own types:

```typescript
import { Builder } from '@/test/builders/TestDataBuilder';

interface MyType {
  id: string;
  name: string;
  value: number;
}

class MyTypeBuilder extends Builder<MyType> {
  constructor() {
    super({});
  }

  withName(name: string): this {
    return this.with('name', name);
  }

  withValue(value: number): this {
    return this.with('value', value);
  }

  build(): MyType {
    return {
      id: this.data.id || 'default-id',
      name: this.data.name || 'Default Name',
      value: this.data.value || 0,
    };
  }
}
```

## Database Mocking

### In-Memory Database

```typescript
import { createMockDatabase, InMemoryDatabase } from '@/test/utils';

describe('UserService', () => {
  const mockDb = createMockDatabase();

  beforeEach(() => {
    // Seed with test data
    mockDb.seed('users', [
      { _id: '1', email: 'test@example.com', role: 'user' },
      { _id: '2', email: 'admin@example.com', role: 'admin' },
    ]);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  it('should find user by email', async () => {
    const collection = mockDb.collection('users');
    const user = await collection.findOne({ email: 'test@example.com' });

    expect(user).toBeDefined();
    expect(user.role).toBe('user');
  });
});
```

### Supported Operations

```typescript
const collection = mockDb.collection('users');

// Insert
await collection.insertOne({ email: 'test@example.com' });
await collection.insertMany([{ email: 'a@test.com' }, { email: 'b@test.com' }]);

// Find
await collection.findOne({ email: 'test@example.com' });
const cursor = collection.find({ role: 'admin' });
const users = await cursor.toArray();

// Update
await collection.updateOne({ _id: '1' }, { $set: { role: 'admin' } });
await collection.updateMany({ role: 'user' }, { $set: { plan: 'pro' } });

// Delete
await collection.deleteOne({ _id: '1' });
await collection.deleteMany({ role: 'user' });

// Count
const count = await collection.countDocuments({ role: 'admin' });

// Aggregate
const results = await collection
  .aggregate([
    { $match: { role: 'admin' } },
    { $sort: { email: 1 } },
    { $limit: 10 },
  ])
  .toArray();
```

## AI Provider Mocking

### Mock OpenAI

```typescript
import { createMockOpenAI } from '@/test/utils';

// Successful response
const openai = createMockOpenAI({
  response: 'This is a test response from OpenAI',
});

const result = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
});

// Streaming response
const streamingOpenAI = createMockOpenAI({
  response: 'Streaming response',
  streaming: true,
});

// Error response
const errorOpenAI = createMockOpenAI({
  error: new Error('API key invalid'),
});
```

### Mock Anthropic

```typescript
import { createMockAnthropic } from '@/test/utils';

const anthropic = createMockAnthropic({
  response: 'This is Claude\'s response',
});

const result = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Mock Other Providers

```typescript
import {
  createMockGoogleAI,
  createMockGroq,
  createMockReplicate,
} from '@/test/utils';

// Google AI
const googleAI = createMockGoogleAI({ response: 'Gemini response' });

// Groq
const groq = createMockGroq({ response: 'Groq response' });

// Replicate
const replicate = createMockReplicate({ response: 'Model output' });
```

### AI Errors

```typescript
import { aiErrors, createMockOpenAI } from '@/test/utils';

const rateLimitedAI = createMockOpenAI({
  error: aiErrors.rateLimited(),
});

const invalidKeyAI = createMockOpenAI({
  error: aiErrors.invalidApiKey(),
});

const timeoutAI = createMockOpenAI({
  error: aiErrors.timeout(),
});
```

## HTTP Mocking

### Mock Fetch

```typescript
import { MockFetch } from '@/test/utils';

const mockFetch = new MockFetch()
  .onJson(/api\/users/, [{ id: 1, name: 'User 1' }])
  .onJson(/api\/prompts/, { prompts: [] }, 200)
  .onError(/api\/error/, 'SERVER_ERROR', 'Internal error', 500)
  .default(async () => new Response('Not found', { status: 404 }))
  .build();

global.fetch = mockFetch;

// Now all fetch calls use the mock
const response = await fetch('/api/users');
const data = await response.json();
```

### Mock Next.js Request

```typescript
import { createMockNextRequest, RequestBuilder } from '@/test/utils';

// Simple mock
const request = createMockNextRequest({
  url: 'http://localhost:3000/api/users',
  method: 'POST',
  body: { name: 'Test User' },
  headers: { 'Authorization': 'Bearer token' },
});

// Using builder
const request = new RequestBuilder()
  .withUrl('/api/users/123')
  .asGet()
  .withAuth('my-token')
  .withSearchParam('filter', 'active')
  .build();
```

### Request Scenarios

```typescript
import { requestScenarios } from '@/test/utils';

// Authenticated request
const authReq = requestScenarios.authenticated('token-123').build();

// Unauthenticated request
const unauthReq = requestScenarios.unauthenticated().build();

// JSON POST request
const jsonReq = requestScenarios.withJson({ data: 'test' }).build();

// Query parameters
const queryReq = requestScenarios.withQuery({
  page: '1',
  limit: '10',
}).build();
```

## Usage Examples

### Example 1: Testing a User Service

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockDatabase,
  userFixtures,
  builders,
} from '@/test/utils';
import { UserService } from '../UserService';

describe('UserService', () => {
  const mockDb = createMockDatabase();
  let service: UserService;

  beforeEach(() => {
    service = new UserService(mockDb.collection('users'));

    // Seed with test data
    mockDb.seed('users', [
      userFixtures.regular(),
      userFixtures.admin(),
      userFixtures.superAdmin(),
    ]);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('regular@example.com');
    expect(user).toBeDefined();
    expect(user?.role).toBe('user');
  });

  it('should create new user', async () => {
    const newUser = builders.user()
      .withEmail('new@example.com')
      .asPro()
      .build();

    const created = await service.create(newUser);
    expect(created.email).toBe('new@example.com');
    expect(created.plan).toBe('pro');
  });
});
```

### Example 2: Testing an API Route

```typescript
import { describe, it, expect } from 'vitest';
import {
  createMockNextRequest,
  MockResponse,
  requestScenarios,
  userFixtures,
} from '@/test/utils';
import { POST } from '../route';

describe('POST /api/users', () => {
  it('should create user when authenticated', async () => {
    const request = requestScenarios
      .authenticated('valid-token')
      .asPost()
      .withBody({
        email: 'new@example.com',
        name: 'New User',
      })
      .build();

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('new@example.com');
  });

  it('should return 401 when not authenticated', async () => {
    const request = requestScenarios
      .unauthenticated()
      .asPost()
      .withBody({ email: 'test@example.com' })
      .build();

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
```

### Example 3: Testing with AI Providers

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createMockOpenAI, aiErrors } from '@/test/utils';
import { AIService } from '../AIService';

describe('AIService', () => {
  it('should generate response', async () => {
    const mockOpenAI = createMockOpenAI({
      response: 'Generated content',
    });

    const service = new AIService(mockOpenAI);
    const result = await service.generate('Test prompt');

    expect(result).toBe('Generated content');
  });

  it('should handle rate limit errors', async () => {
    const mockOpenAI = createMockOpenAI({
      error: aiErrors.rateLimited(),
    });

    const service = new AIService(mockOpenAI);

    await expect(service.generate('Test')).rejects.toThrow(
      'Rate limit exceeded'
    );
  });
});
```

## Summary

Test fixtures and mocks provide:

- **Consistency** - Same data structure across all tests
- **Maintainability** - Change test data in one place
- **Readability** - Clear, expressive test code
- **Speed** - Write tests faster with pre-built utilities
- **Flexibility** - Easy to customize for specific scenarios

Start with simple fixtures, use builders for complex scenarios, and leverage mocks for external dependencies. This combination gives you powerful, maintainable tests.
