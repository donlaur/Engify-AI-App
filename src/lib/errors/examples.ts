/**
 * Error Registry - Usage Examples
 *
 * Comprehensive examples of using the error registry system
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ErrorFactory,
  handleApiError,
  withErrorHandler,
  asyncHandler,
  validateSchema,
  assertFound,
  assertAuthorized,
  assertAuthenticated,
  assertValidState,
  AppError,
} from './index';

// ==================== EXAMPLE 1: Basic Error Throwing ====================

export async function example1_BasicErrorThrowing(request: NextRequest) {
  try {
    // Throw a validation error
    throw ErrorFactory.validation('Invalid email format', 'email', 'not-an-email');

    // Throw an authentication error
    throw ErrorFactory.authentication('Please log in to continue');

    // Throw a not found error
    throw ErrorFactory.notFound('User', '123');

    // Throw a conflict error
    throw ErrorFactory.userAlreadyExists('user@example.com');

    // Throw a rate limit error
    throw ErrorFactory.rateLimit(new Date(Date.now() + 60000), 100, 105);
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 2: Using Error Codes ====================

export async function example2_UsingErrorCodes(request: NextRequest) {
  try {
    // Create error from code
    throw ErrorFactory.fromCode('USER_NOT_FOUND', 'User with this ID does not exist', {
      userId: '123',
    });

    // Create custom validation error
    throw ErrorFactory.fromCode('VALIDATION_EMAIL_INVALID', undefined, {
      field: 'email',
      value: 'invalid-email',
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 3: WithErrorHandler HOF ====================

export const example3_WithErrorHandler = withErrorHandler(async (request: NextRequest) => {
  // Any errors thrown here will be automatically caught and handled
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    throw ErrorFactory.requiredField('userId');
  }

  const user = await findUser(userId);
  assertFound(user, 'User', userId);

  return NextResponse.json(user);
});

// ==================== EXAMPLE 4: AsyncHandler Pattern ====================

export async function example4_AsyncHandler(request: NextRequest) {
  return asyncHandler(request, async () => {
    // Your route logic here
    const data = await fetchData();
    return NextResponse.json(data);
  });
}

// ==================== EXAMPLE 5: Schema Validation ====================

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().min(18),
});

export async function example5_SchemaValidation(request: NextRequest) {
  try {
    // Validate request body against schema
    const body = await validateSchema(request, userSchema);

    // Body is now typed and validated
    const user = await createUser(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 6: Assertion Helpers ====================

export async function example6_AssertionHelpers(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Assert user is authenticated
    assertAuthenticated(!!session, 'You must be logged in');

    // Assert resource exists
    const user = await findUser(session.userId);
    assertFound(user, 'User', session.userId);

    // Assert user has permission
    assertAuthorized(user.role === 'admin', 'admin', 'Admin access required');

    // Assert valid business logic
    assertValidState(user.status === 'active', 'User account must be active', 'active-user');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 7: Custom Error with Metadata ====================

export async function example7_CustomErrorMetadata(request: NextRequest) {
  try {
    const result = await performComplexOperation();

    if (!result.success) {
      throw ErrorFactory.businessLogic(
        'Operation failed due to business rule violation',
        'max-concurrent-operations',
        {
          currentOperations: result.currentCount,
          maxOperations: result.maxAllowed,
          userId: result.userId,
          timestamp: new Date(),
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 8: Database Error Handling ====================

export async function example8_DatabaseErrors(request: NextRequest) {
  try {
    const db = await getDatabase();

    try {
      const result = await db.collection('users').insertOne({ email: 'test@example.com' });
      return NextResponse.json(result);
    } catch (dbError) {
      // MongoDB duplicate key error (11000)
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === 11000) {
        throw ErrorFactory.userAlreadyExists('test@example.com');
      }

      // General database error
      throw ErrorFactory.database('Failed to insert user', 'insertOne', 'users', {
        error: dbError,
      });
    }
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 9: External Service Error Handling ====================

export async function example9_ExternalServiceErrors(request: NextRequest) {
  try {
    // Call external AI service
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Note: Hardcoded for example purposes only - use getModelById in production
      body: JSON.stringify({ model: 'gpt-4', messages: [] }),
    });

    if (!response.ok) {
      throw ErrorFactory.aiProvider('OpenAI', 'AI service request failed', {
        statusCode: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw ErrorFactory.externalService('OpenAI', 'Network error connecting to AI service');
    }

    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 10: Retryable vs Non-Retryable Errors ====================

export async function example10_RetryableErrors(request: NextRequest) {
  try {
    const result = await performOperationWithRetry(async () => {
      // This might throw retryable errors (database, network, rate limit)
      return await fetchDataFromDB();
    });

    return NextResponse.json(result);
  } catch (error) {
    const appError = error instanceof AppError ? error : ErrorFactory.fromUnknown(error);

    // Check if error is retryable
    if (appError.retryable) {
      // Could implement retry logic here
      console.log('Error is retryable:', appError.code);
    }

    return handleApiError(error, request);
  }
}

// ==================== EXAMPLE 11: Error Serialization ====================

export function example11_ErrorSerialization() {
  const error = ErrorFactory.validation('Invalid input', 'email', 'bad-email');

  // Serialize for API response (excludes stack trace)
  const jsonError = error.toJSON();
  console.log('API Response:', jsonError);

  // Serialize for logging (includes stack trace)
  const logError = error.toLog();
  console.log('Log Entry:', logError);

  // Sanitized for production (minimal info)
  const sanitized = error.toSanitized();
  console.log('Production Response:', sanitized);
}

// ==================== EXAMPLE 12: Complete API Route ====================

/**
 * Complete example of a well-structured API route with error handling
 */

const createPromptSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Get and validate session
  const session = await getSession(request);
  assertAuthenticated(!!session);

  // Validate request body
  const body = await validateSchema(request, createPromptSchema);

  // Check user permissions
  const user = await findUser(session.userId);
  assertFound(user, 'User', session.userId);
  assertAuthorized(hasPermission(user, 'prompts:create'), 'prompts:create');

  // Check user quota
  const promptCount = await getUserPromptCount(user.id);
  if (promptCount >= user.maxPrompts) {
    throw ErrorFactory.quotaExceeded(user.maxPrompts, promptCount, {
      userId: user.id,
      plan: user.plan,
    });
  }

  // Check for duplicates
  const duplicate = await findDuplicatePrompt(body.title, body.content);
  if (duplicate) {
    throw ErrorFactory.duplicatePrompt({
      duplicateId: duplicate.id,
      title: duplicate.title,
    });
  }

  // Create prompt
  const prompt = await createPrompt({
    ...body,
    userId: user.id,
    createdAt: new Date(),
  });

  // Return success response
  return NextResponse.json(prompt, { status: 201 });
});

// ==================== Helper Functions (Mock) ====================

async function findUser(id: string) {
  return { id, email: 'user@example.com', role: 'user', status: 'active', maxPrompts: 100, plan: 'free' };
}

async function fetchData() {
  return { data: 'example' };
}

async function getSession(_request: NextRequest) {
  return { userId: '123' };
}

async function createUser(data: unknown) {
  return { id: '123', ...(data as Record<string, any>) };
}

async function performComplexOperation() {
  return { success: true, currentCount: 5, maxAllowed: 10, userId: '123' };
}

async function getDatabase() {
  return {
    collection: (_name: string) => ({
      insertOne: async (_doc: any) => ({ insertedId: '123' }),
    }),
  };
}

async function performOperationWithRetry(fn: () => Promise<unknown>) {
  return await fn();
}

async function fetchDataFromDB() {
  return { data: 'example' };
}

function hasPermission(user: { role: string }, _permission: string) {
  return user.role === 'admin';
}

async function getUserPromptCount(_userId: string) {
  return 5;
}

async function findDuplicatePrompt(_title: string, _content: string): Promise<{ id: string; title: string } | null> {
  return null;
}

async function createPrompt(data: unknown) {
  return { id: '123', ...(data as Record<string, any>) };
}
