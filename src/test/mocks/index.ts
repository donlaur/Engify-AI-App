/**
 * Test Mocks - Central Export
 *
 * Import all test mocks from a single location
 */

// Database mocks
export * from './database';

// AI provider mocks
export * from './ai-providers';

// HTTP mocks
export * from './http';

// Re-export commonly used items
export {
  InMemoryDatabase,
  createMockDatabase,
  createMockCollection,
} from './database';

export {
  createMockOpenAI,
  createMockAnthropic,
  createMockGoogleAI,
  createMockGroq,
  createMockReplicate,
  createMockAIProviderFactory,
  AIResponseBuilder,
  aiErrors,
} from './ai-providers';

export {
  MockFetch,
  createMockNextRequest,
  createMockNextResponse,
  createMockHeaders,
  RequestBuilder,
  httpStatus,
  requestScenarios,
} from './http';
