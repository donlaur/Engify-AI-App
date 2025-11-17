# Quick Reference Guide

A cheat sheet for using the DRY architecture.

## Import Paths

```typescript
// Providers
import { authProvider, dbProvider, cacheProvider, loggingProvider } from '@/lib/providers';

// Middleware
import { withAPI } from '@/lib/middleware/api-route-wrapper';

// Repositories
import { EnhancedUserRepository, APIKeyRepository } from '@/lib/repositories';

// Services
import { EnhancedUserService, UserAPIKeyService } from '@/lib/services';

// Factories
import {
  ServiceFactory,
  RepositoryFactory,
  ValidatorFactory,
  createUserService,
  createAPIKeyService,
  createUserSchemas,
} from '@/lib/factories';
```

---

## Common Patterns

### 1. Simple GET Route (No Auth)

```typescript
export const GET = withAPI({}, async () => {
  return { message: 'Hello, World!' };
});
```

### 2. GET Route with Auth

```typescript
export const GET = withAPI({
  auth: true,
}, async ({ userId }) => {
  const data = await fetchUserData(userId);
  return { success: true, data };
});
```

### 3. GET Route with Auth + Caching

```typescript
export const GET = withAPI({
  auth: true,
  cache: { ttl: 300 }, // 5 minutes
}, async ({ userId }) => {
  const data = await fetchUserData(userId);
  return { success: true, data };
});
```

### 4. POST Route with Validation

```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withAPI({
  auth: true,
  validate: schema,
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});
```

### 5. POST Route with RBAC

```typescript
export const POST = withAPI({
  auth: true,
  rbac: ['admin', 'super_admin'], // Array of roles
  validate: schema,
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});
```

### 6. POST Route with Permission Check

```typescript
export const POST = withAPI({
  auth: true,
  rbac: { permission: 'users:write' }, // Permission-based
  validate: schema,
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});
```

### 7. POST Route with Rate Limiting

```typescript
export const POST = withAPI({
  auth: true,
  rateLimit: 'user-create', // Preset
  validate: schema,
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});

// OR with custom limit

export const POST = withAPI({
  auth: true,
  rateLimit: { max: 10, window: 60 }, // 10 requests per minute
  validate: schema,
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});
```

### 8. POST Route with Audit Logging

```typescript
export const POST = withAPI({
  auth: true,
  validate: schema,
  audit: { action: 'user_created', severity: 'info' },
}, async ({ validated, userId }) => {
  const result = await createResource(validated);
  return { success: true, result };
});
```

### 9. DELETE Route with RBAC + Audit

```typescript
export const DELETE = withAPI({
  auth: true,
  rbac: ['admin'],
  audit: { action: 'resource_deleted', severity: 'warning' },
}, async ({ params, userId }) => {
  await deleteResource(params.id, userId);
  return { success: true };
});
```

### 10. Full-Featured Route

```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withAPI({
  auth: true,                                    // Require auth
  rbac: { permission: 'users:write' },          // RBAC check
  requireMFA: true,                             // Require MFA
  rateLimit: 'user-create',                     // Rate limit
  validate: schema,                             // Validate input
  audit: { action: 'user_created' },            // Audit log
}, async ({ validated, userId, userRole, params, request }) => {
  const service = createUserService();
  const user = await service.createUser(validated, userId);
  return { success: true, user };
});
```

---

## Provider Usage

### AuthProvider

```typescript
import { authProvider } from '@/lib/providers';

// Get session
const session = await authProvider.getSession();

// Get user ID (returns null if not authenticated)
const userId = await authProvider.getUserId();

// Get user ID (throws if not authenticated)
const userId = await authProvider.requireUserId();

// Get user role
const role = await authProvider.getUserRole();

// Check if authenticated
const isAuth = await authProvider.isAuthenticated();

// Check role
const isAdmin = await authProvider.hasRole('admin');
const hasAnyRole = await authProvider.hasAnyRole(['admin', 'super_admin']);

// Get full context
const context = await authProvider.getAuthContext();
// context = { session, userId, userRole, mfaVerified }
```

### DatabaseProvider

```typescript
import { dbProvider } from '@/lib/providers';

// Get database
const db = await dbProvider.getDb();

// Get collection
const users = await dbProvider.getCollection('users');

// Use transactions
await dbProvider.withTransaction(async (session) => {
  await users.insertOne({ name: 'John' }, { session });
  await users.updateOne({ name: 'Jane' }, { $set: { active: true } }, { session });
});

// Check health
const health = await dbProvider.getHealthStatus();
```

### CacheProvider

```typescript
import { cacheProvider } from '@/lib/providers';

// Set cache (TTL in seconds)
await cacheProvider.set('user:123', userData, 300);

// Get cache
const user = await cacheProvider.get<User>('user:123');

// Get or set
const data = await cacheProvider.getOrSet('key', async () => {
  return await expensiveOperation();
}, 300);

// Check if exists
const exists = await cacheProvider.has('key');

// Delete
await cacheProvider.delete('key');

// Delete pattern
await cacheProvider.deletePattern('user:*');

// Clear all
await cacheProvider.clear();

// Increment counter
const count = await cacheProvider.increment('counter', 60);

// Get stats
const stats = cacheProvider.getStats();
```

### LoggingProvider

```typescript
import { loggingProvider } from '@/lib/providers';

// Info
loggingProvider.info('User action', { userId: '123', action: 'login' });

// Warning
loggingProvider.warn('Suspicious activity', { userId: '123' });

// Error
loggingProvider.error('Operation failed', error, { userId: '123' });

// Debug (dev only)
loggingProvider.debug('Debug info', { data: {...} });

// API error
loggingProvider.apiError('/api/users', error, { userId: '123' });

// API success
loggingProvider.apiSuccess('/api/users', 200, 150, { userId: '123' });

// Audit log
await loggingProvider.audit('user_created', {
  userId: '123',
  severity: 'info',
  details: { email: 'user@example.com' },
});

// Child logger
const logger = loggingProvider.child({ service: 'UserService' });
logger.info('Operation complete');

// Time operation
const result = await loggingProvider.time('database-query', async () => {
  return await db.collection('users').find().toArray();
}, { collection: 'users' });
```

---

## Repository Usage

### BaseRepository

```typescript
class MyRepository extends BaseRepository<MyEntity> {
  constructor() {
    super('my_collection', MySchema);
  }
}

const repo = new MyRepository();

// Create
const entity = await repo.create({ name: 'Test' });

// Find by ID
const entity = await repo.findById('id');
const entity = await repo.findByIdOrFail('id'); // Throws if not found

// Find one
const entity = await repo.findOne({ name: 'Test' });

// Find many
const entities = await repo.find({ status: 'active' });
const entities = await repo.find({ status: 'active' }, {
  limit: 10,
  skip: 0,
  sort: { field: 'createdAt', order: 'desc' },
});

// Find paginated
const result = await repo.findPaginated({ status: 'active' }, {
  page: 1,
  limit: 20,
});
// result = { data, total, page, limit, totalPages, hasNext, hasPrev }

// Update
const updated = await repo.updateOne('id', { name: 'New Name' });

// Delete
const deleted = await repo.deleteOne('id');

// Count
const count = await repo.count({ status: 'active' });

// Exists
const exists = await repo.exists({ email: 'user@example.com' });

// Transaction
await repo.withTransaction(async (session) => {
  await repo.create({ name: 'Test' }, session);
  await repo.updateOne('id', { status: 'updated' }, session);
});
```

### EnhancedUserRepository

```typescript
import { EnhancedUserRepository } from '@/lib/repositories';

const userRepo = new EnhancedUserRepository();

// Find by email
const user = await userRepo.findByEmail('user@example.com');

// Find by role
const admins = await userRepo.findByRole('admin');

// Find by organization
const orgUsers = await userRepo.findByOrganization('orgId');

// Update last login
await userRepo.updateLastLogin('userId');

// Check email availability
const taken = await userRepo.isEmailTaken('user@example.com');
const taken = await userRepo.isEmailTaken('user@example.com', 'excludeUserId');

// Get statistics
const stats = await userRepo.getStats();
// stats = { total, byRole, byPlan, recentSignups }

// Search
const users = await userRepo.search('john');
```

### APIKeyRepository

```typescript
import { APIKeyRepository } from '@/lib/repositories';

const apiKeyRepo = new APIKeyRepository();

// Find by hash
const key = await apiKeyRepo.findByHash('hash');

// Find by user
const keys = await apiKeyRepo.findByUserId('userId');
const activeKeys = await apiKeyRepo.findActiveByUserId('userId');

// Revoke
await apiKeyRepo.revoke('keyId', 'revokedBy');

// Record usage
await apiKeyRepo.recordUsage('keyId');

// Count active
const count = await apiKeyRepo.countActiveByUserId('userId');

// Get stats
const stats = await apiKeyRepo.getUserKeyStats('userId');
// stats = { total, active, revoked, expired, totalUsage }

// Maintenance
await apiKeyRepo.deactivateExpired();
await apiKeyRepo.cleanupOldRevokedKeys(90); // 90 days retention
```

---

## Service Usage

### EnhancedUserService

```typescript
import { EnhancedUserService } from '@/lib/services';

const userService = new EnhancedUserService();

// Create user
const user = await userService.createUser({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
}, 'createdBy');

// Get user
const user = await userService.getUserById('userId');
const user = await userService.getUserByEmail('user@example.com');

// Update user
const user = await userService.updateUser('userId', {
  name: 'Jane Doe',
}, 'updatedBy');

// Delete user
await userService.deleteUser('userId', 'deletedBy');

// List users
const result = await userService.listUsers({
  page: 1,
  limit: 20,
  role: 'admin',
  organizationId: 'orgId',
});

// Search users
const users = await userService.searchUsers('john', { limit: 10 });

// Get stats
const stats = await userService.getUserStats();

// Update last login
await userService.updateLastLogin('userId');

// Change role
const user = await userService.changeUserRole('userId', 'admin', 'changedBy');
```

### UserAPIKeyService

```typescript
import { UserAPIKeyService } from '@/lib/services';

const apiKeyService = new UserAPIKeyService();

// Create key
const { plainKey, ...apiKey } = await apiKeyService.createKey('userId', {
  name: 'Production API Key',
  expiresIn: 90, // days
}, 'createdBy');

// List keys
const keys = await apiKeyService.listKeys('userId');
const activeKeys = await apiKeyService.listActiveKeys('userId');

// Get key
const key = await apiKeyService.getKey('userId', 'keyId');

// Revoke key
await apiKeyService.revokeKey('userId', 'keyId', 'revokedBy');

// Rotate key (atomic)
const newKey = await apiKeyService.rotateKey('userId', 'keyId', oldKey, 'rotatedBy');

// Verify key
const apiKey = await apiKeyService.verifyKey(plainKey);

// Get stats
const stats = await apiKeyService.getKeyStats('userId');

// Maintenance
await apiKeyService.deactivateExpiredKeys();
await apiKeyService.cleanupOldRevokedKeys(90);
```

---

## Factory Usage

### ServiceFactory

```typescript
import { ServiceFactory } from '@/lib/factories';

// Create services
const userService = ServiceFactory.createUserService();
const apiKeyService = ServiceFactory.createAPIKeyService();

// Create all user services
const { userService, apiKeyService } = ServiceFactory.createUserServices();

// Configure singleton mode
ServiceFactory.configure({ useSingletons: true });

// Reset singletons (testing)
ServiceFactory.resetSingletons();

// Create with custom config
const service = ServiceFactory.createWithConfig(
  () => ServiceFactory.createUserService(),
  { useSingletons: false }
);
```

### ValidatorFactory

```typescript
import { ValidatorFactory, CommonValidators } from '@/lib/factories';

// Common validators
const email = CommonValidators.email();
const password = CommonValidators.password();
const strongPassword = CommonValidators.strongPassword();
const username = CommonValidators.username();
const url = CommonValidators.url();
const phone = CommonValidators.phone();
const date = CommonValidators.date();
const objectId = CommonValidators.objectId();
const pagination = CommonValidators.pagination();

// Domain schemas
const { createUserSchema, updateUserSchema } = ValidatorFactory.createUserSchemas();
const { createAPIKeySchema, rotateAPIKeySchema } = ValidatorFactory.createAPIKeySchemas();
const { createContentSchema, updateContentSchema } = ValidatorFactory.createContentSchemas();
const { createPromptSchema, updatePromptSchema } = ValidatorFactory.createPromptSchemas();
```

---

## Rate Limit Presets

```typescript
'user-create'     // 5 requests per 5 minutes
'user-update'     // 20 requests per minute
'api-key-create'  // 5 requests per 5 minutes
'api-key-rotate'  // 3 requests per 5 minutes
'api-key-revoke'  // 10 requests per minute
'content-create'  // 10 requests per minute
'prompt-execute'  // 30 requests per minute
'default'         // 100 requests per minute
```

---

## Common Zod Schemas

```typescript
import { z } from 'zod';
import { CommonValidators } from '@/lib/factories';

// Email
const emailSchema = z.object({
  email: CommonValidators.email(),
});

// User creation
const createUserSchema = z.object({
  email: CommonValidators.email(),
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
});

// Pagination
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ID param
const idParamSchema = z.object({
  id: CommonValidators.objectId(),
});
```

---

## Testing Patterns

### Test Providers

```typescript
import { AuthProvider } from '@/lib/providers';

describe('AuthProvider', () => {
  beforeEach(() => {
    AuthProvider.resetInstance();
  });

  it('should get user ID', async () => {
    const provider = AuthProvider.getInstance();
    const userId = await provider.getUserId();
    expect(userId).toBeDefined();
  });
});
```

### Test Services

```typescript
import { EnhancedUserService } from '@/lib/services';

describe('UserService', () => {
  let service: EnhancedUserService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = { create: jest.fn(), findByEmail: jest.fn() };
    service = new EnhancedUserService(mockRepo);
  });

  it('should create user', async () => {
    mockRepo.create.mockResolvedValue({ _id: '123', email: 'test@example.com' });
    const user = await service.createUser({ email: 'test@example.com' });
    expect(user).toBeDefined();
  });
});
```

### Test API Routes

```typescript
import { withAPI } from '@/lib/middleware/api-route-wrapper';

const handler = withAPI({
  auth: true,
  validate: schema,
}, async ({ validated }) => {
  return { success: true, data: validated };
});

describe('API Route', () => {
  it('should require auth', async () => {
    const request = new NextRequest('http://localhost/api/test');
    const response = await handler(request);
    expect(response.status).toBe(401);
  });
});
```

---

## Error Handling

Errors are automatically handled by `withAPI`:

- **Authentication errors** → 401 Unauthorized
- **Authorization errors** → 403 Forbidden
- **Validation errors** → 400 Bad Request (with Zod error details)
- **Rate limit errors** → 429 Too Many Requests
- **Not found errors** → 404 Not Found (if error message includes "not found")
- **All other errors** → 500 Internal Server Error

To throw custom errors:

```typescript
throw new Error('User not found'); // → 404
throw new Error('Unauthorized access'); // → 401
throw new Error('Forbidden action'); // → 403
throw new Error('Any other error'); // → 500
```

---

## Best Practices

1. ✅ Always use providers for shared resources
2. ✅ Always use `withAPI` for API routes
3. ✅ Always use factories for service creation
4. ✅ Always use transactions for multi-step operations
5. ✅ Always use child loggers for context
6. ✅ Always validate input with Zod schemas
7. ✅ Always audit security-sensitive operations
8. ✅ Always use rate limiting for write operations
9. ✅ Always cache expensive read operations
10. ✅ Always inject dependencies via constructors

---

**For full documentation, see [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)**
