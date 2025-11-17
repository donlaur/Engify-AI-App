/**
 * Comprehensive Test Example
 *
 * This file demonstrates how to use all the new test utilities:
 * - Fixtures and factories
 * - Builders
 * - Database mocking
 * - AI provider mocking
 * - HTTP request mocking
 *
 * NOTE: This is an example file for documentation purposes.
 * Copy patterns from here into your actual tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import all test utilities from a single location
import {
  // User fixtures
  createUser,
  createUsers,
  userFixtures,
  createSession,

  // Prompt fixtures
  createPrompt,
  createPrompts,
  promptFixtures,

  // API response fixtures
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  errorFixtures,
  MockResponse,

  // Builders
  builders,

  // Database mocking
  createMockDatabase,
  InMemoryDatabase,

  // AI provider mocking
  createMockOpenAI,
  createMockAnthropic,
  aiErrors,

  // HTTP mocking
  createMockNextRequest,
  RequestBuilder,
  MockFetch,
  requestScenarios,
  httpStatus,
} from '@/test/utils';

// Example 1: Using User Fixtures
describe('User Fixtures Example', () => {
  it('should create users with factory', () => {
    // Simple user creation
    const user = createUser();
    expect(user.email).toBeDefined();
    expect(user.role).toBe('user');

    // Custom properties
    const admin = createUser({ role: 'admin', plan: 'pro' });
    expect(admin.role).toBe('admin');
    expect(admin.plan).toBe('pro');

    // Create multiple users
    const users = createUsers(5, { plan: 'enterprise' });
    expect(users).toHaveLength(5);
    expect(users[0].plan).toBe('enterprise');
  });

  it('should use pre-defined user fixtures', () => {
    const regular = userFixtures.regular();
    const admin = userFixtures.admin();
    const superAdmin = userFixtures.superAdmin();
    const pro = userFixtures.pro();

    expect(regular.role).toBe('user');
    expect(admin.role).toBe('admin');
    expect(superAdmin.role).toBe('super_admin');
    expect(pro.plan).toBe('pro');
  });

  it('should build users with fluent API', () => {
    const customUser = builders
      .user()
      .withEmail('custom@example.com')
      .withName('Custom User')
      .asAdmin()
      .verified()
      .build();

    expect(customUser.email).toBe('custom@example.com');
    expect(customUser.role).toBe('admin');
    expect(customUser.emailVerified).toBeDefined();

    // Build multiple users
    const admins = builders.user().asAdmin().buildMany(3);
    expect(admins).toHaveLength(3);
    expect(admins[0].role).toBe('admin');
  });
});

// Example 2: Using Prompt Fixtures
describe('Prompt Fixtures Example', () => {
  it('should create prompts with factory', () => {
    const prompt = createPrompt({ category: 'coding' });
    expect(prompt.category).toBe('coding');

    const prompts = createPrompts(5, { featured: true });
    expect(prompts).toHaveLength(5);
    expect(prompts[0].featured).toBe(true);
  });

  it('should use pre-defined prompt fixtures', () => {
    const coding = promptFixtures.coding();
    const writing = promptFixtures.writing();
    const featured = promptFixtures.featured();

    expect(coding.category).toBe('coding');
    expect(writing.category).toBe('writing');
    expect(featured.featured).toBe(true);
  });

  it('should build prompts with fluent API', () => {
    const prompt = builders
      .prompt()
      .withTitle('Advanced Code Review')
      .withCategory('coding')
      .withTags('typescript', 'react')
      .withRating(4.8)
      .featured()
      .popular()
      .build();

    expect(prompt.title).toBe('Advanced Code Review');
    expect(prompt.featured).toBe(true);
    expect(prompt.rating).toBe(4.8);
  });
});

// Example 3: Using API Response Fixtures
describe('API Response Fixtures Example', () => {
  it('should create success responses', () => {
    const response = createSuccessResponse(
      { id: '123', name: 'Test' },
      'Success'
    );

    expect(response.success).toBe(true);
    expect(response.data.id).toBe('123');
    expect(response.message).toBe('Success');
    expect(response.metadata?.requestId).toBeDefined();
  });

  it('should create error responses', () => {
    const error = createErrorResponse('NOT_FOUND', 'Resource not found');

    expect(error.success).toBe(false);
    expect(error.error.code).toBe('NOT_FOUND');
    expect(error.error.message).toBe('Resource not found');
  });

  it('should use pre-defined error fixtures', () => {
    const unauthorized = errorFixtures.unauthorized();
    const forbidden = errorFixtures.forbidden();
    const notFound = errorFixtures.notFound();

    expect(unauthorized.error.code).toBe('UNAUTHORIZED');
    expect(forbidden.error.code).toBe('FORBIDDEN');
    expect(notFound.error.code).toBe('NOT_FOUND');
  });

  it('should create paginated responses', () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const paginated = createPaginatedResponse(data, 1, 10, 50);

    expect(paginated.data).toHaveLength(3);
    expect(paginated.pagination.page).toBe(1);
    expect(paginated.pagination.total).toBe(50);
    expect(paginated.pagination.hasNext).toBe(true);
  });

  it('should create mock HTTP responses', () => {
    const success = MockResponse.success({ data: 'test' });
    const notFound = MockResponse.notFound();
    const unauthorized = MockResponse.unauthorized();

    expect(success.status).toBe(200);
    expect(notFound.status).toBe(404);
    expect(unauthorized.status).toBe(401);
  });
});

// Example 4: Database Mocking
describe('Database Mocking Example', () => {
  const mockDb = createMockDatabase();

  beforeEach(() => {
    // Seed database with test data
    mockDb.seed('users', [
      userFixtures.regular(),
      userFixtures.admin(),
      userFixtures.superAdmin(),
    ]);

    mockDb.seed('prompts', [
      promptFixtures.coding(),
      promptFixtures.writing(),
      promptFixtures.featured(),
    ]);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  it('should find documents', async () => {
    const users = mockDb.collection('users');
    const user = await users.findOne({ email: 'regular@example.com' });

    expect(user).toBeDefined();
    expect(user?.role).toBe('user');
  });

  it('should insert documents', async () => {
    const users = mockDb.collection('users');
    const newUser = createUser({ email: 'new@example.com' });

    const result = await users.insertOne(newUser);
    expect(result.insertedId).toBeDefined();

    const found = await users.findOne({ email: 'new@example.com' });
    expect(found).toBeDefined();
  });

  it('should update documents', async () => {
    const users = mockDb.collection('users');

    await users.updateOne(
      { email: 'regular@example.com' },
      { $set: { plan: 'pro' } }
    );

    const updated = await users.findOne({ email: 'regular@example.com' });
    expect(updated?.plan).toBe('pro');
  });

  it('should delete documents', async () => {
    const users = mockDb.collection('users');

    await users.deleteOne({ email: 'regular@example.com' });

    const deleted = await users.findOne({ email: 'regular@example.com' });
    expect(deleted).toBeNull();
  });

  it('should count documents', async () => {
    const users = mockDb.collection('users');
    const count = await users.countDocuments({ role: 'admin' });

    expect(count).toBeGreaterThan(0);
  });

  it('should use aggregation', async () => {
    const prompts = mockDb.collection('prompts');
    const result = await prompts
      .aggregate([
        { $match: { category: 'coding' } },
        { $sort: { rating: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    expect(Array.isArray(result)).toBe(true);
  });
});

// Example 5: AI Provider Mocking
describe('AI Provider Mocking Example', () => {
  it('should mock OpenAI with success response', async () => {
    const mockOpenAI = createMockOpenAI({
      response: 'This is a test response',
    });

    const result = await mockOpenAI.chat.completions.create({
      model: 'gpt-4', // Test example - intentionally hardcoded
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(result.choices[0].message.content).toBe('This is a test response');
  });

  it('should mock OpenAI with error', async () => {
    const mockOpenAI = createMockOpenAI({
      error: aiErrors.rateLimited(),
    });

    await expect(
      mockOpenAI.chat.completions.create({
        model: 'gpt-4', // Test example - intentionally hardcoded
        messages: [{ role: 'user', content: 'Hello' }],
      })
    ).rejects.toThrow('Rate limit exceeded');
  });

  it('should mock Anthropic', async () => {
    const mockAnthropic = createMockAnthropic({
      response: "Claude's response",
    });

    const result = await mockAnthropic.messages.create({
      model: 'claude-3-opus-20240229', // Test example - intentionally hardcoded
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 100,
    });

    expect(result.content[0].text).toBe("Claude's response");
  });
});

// Example 6: HTTP Request Mocking
describe('HTTP Request Mocking Example', () => {
  it('should create mock Next.js request', () => {
    const request = createMockNextRequest({
      url: 'http://localhost:3000/api/users',
      method: 'POST',
      body: { name: 'Test User' },
      headers: { Authorization: 'Bearer token' },
    });

    expect(request.method).toBe('POST');
    expect(request.headers.get('Authorization')).toBe('Bearer token');
  });

  it('should use request builder', () => {
    const request = new RequestBuilder()
      .withUrl('/api/users/123')
      .asGet()
      .withAuth('my-token')
      .withSearchParam('include', 'profile')
      .build();

    expect(request.method).toBe('GET');
    expect(request.nextUrl.searchParams.get('include')).toBe('profile');
  });

  it('should use request scenarios', () => {
    const authenticated = requestScenarios.authenticated('token').build();
    const unauthenticated = requestScenarios.unauthenticated().build();
    const withJson = requestScenarios
      .withJson({ data: 'test' })
      .withUrl('/api/test')
      .build();

    expect(authenticated.headers.get('Authorization')).toContain('Bearer');
    expect(unauthenticated.headers.get('Authorization')).toBeNull();
    expect(withJson.method).toBe('POST');
  });

  it('should mock fetch with custom responses', async () => {
    const mockFetch = new MockFetch()
      .onJson(/api\/users/, [{ id: 1, name: 'User 1' }])
      .onJson(/api\/prompts/, { prompts: [] })
      .onError(/api\/error/, 'SERVER_ERROR', 'Internal error', 500)
      .build();

    // Mock global fetch
    global.fetch = mockFetch;

    // Test API calls
    const usersResp = await fetch('/api/users');
    const users = await usersResp.json();
    expect(users).toHaveLength(1);

    const errorResp = await fetch('/api/error');
    expect(errorResp.status).toBe(500);

    // Restore fetch
    vi.unstubAllGlobals();
  });
});

// Example 7: Complete Test Example
describe('Complete Example - User Service', () => {
  // Mock database
  const mockDb = createMockDatabase();

  // Mock AI provider
  const mockOpenAI = createMockOpenAI({
    response: 'User profile generated',
  });

  beforeEach(() => {
    // Seed test data
    mockDb.seed('users', [
      userFixtures.regular(),
      userFixtures.admin(),
    ]);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  it('should create user and generate profile', async () => {
    // Arrange - Create test data using builders
    const newUser = builders
      .user()
      .withEmail('new@example.com')
      .withName('New User')
      .asPro()
      .verified()
      .build();

    // Mock the service (example)
    const collection = mockDb.collection('users');

    // Act - Perform the operation
    await collection.insertOne(newUser);

    // Assert - Verify results
    const created = await collection.findOne({ email: 'new@example.com' });
    expect(created).toBeDefined();
    expect(created?.plan).toBe('pro');
    expect(created?.emailVerified).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Arrange - Create error scenario
    const errorOpenAI = createMockOpenAI({
      error: aiErrors.rateLimited(),
    });

    // Act & Assert
    await expect(
      errorOpenAI.chat.completions.create({
        model: 'gpt-4', // Test example - intentionally hardcoded
        messages: [{ role: 'user', content: 'Test' }],
      })
    ).rejects.toThrow();
  });

  it('should paginate users correctly', async () => {
    // Arrange - Create multiple users
    const users = builders.user().buildMany(15);
    const collection = mockDb.collection('users');
    await collection.insertMany(users);

    // Act - Get paginated results
    const page1 = await collection
      .find({})
      .limit(10)
      .toArray();

    const page2 = await collection
      .find({})
      .skip(10)
      .limit(10)
      .toArray();

    // Assert
    expect(page1).toHaveLength(10);
    expect(page2.length).toBeGreaterThan(0);
  });
});

// Example 8: Session and Auth Example
describe('Session and Authentication Example', () => {
  it('should create authenticated session', () => {
    const session = createSession({
      role: 'admin',
      email: 'admin@example.com',
    });

    expect(session.user.role).toBe('admin');
    expect(session.user.email).toBe('admin@example.com');
    expect(session.expires).toBeDefined();
  });

  it('should build session with builder', () => {
    const adminSession = builders.session().asAdmin().withExpiry(24).build();

    expect(adminSession.user.role).toBe('admin');
    expect(adminSession.user.plan).toBe('pro');
  });

  it('should validate session permissions', () => {
    const regularSession = builders.session().asRegular().build();
    const adminSession = builders.session().asAdmin().build();
    const superAdminSession = builders.session().asSuperAdmin().build();

    // Example permission checks
    expect(regularSession.user.role).toBe('user');
    expect(adminSession.user.role).toBe('admin');
    expect(superAdminSession.user.role).toBe('super_admin');
  });
});

/**
 * Summary of Best Practices Demonstrated:
 *
 * 1. Use factories (createUser, createPrompt) for simple cases
 * 2. Use fixtures (userFixtures, promptFixtures) for common scenarios
 * 3. Use builders for complex, custom test data
 * 4. Mock databases with InMemoryDatabase for isolation
 * 5. Mock AI providers to avoid external API calls
 * 6. Mock HTTP requests for API route testing
 * 7. Clean up after tests (afterEach)
 * 8. Seed data before tests (beforeEach)
 * 9. Follow AAA pattern (Arrange, Act, Assert)
 * 10. Write descriptive test names
 */
