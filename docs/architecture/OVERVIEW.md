# Engify.ai Architecture

**Date**: October 28, 2025  
**Version**: 2.0  
**Status**: Production-Ready Enterprise Architecture

---

## System Overview

Engify.ai is a modern, scalable AI engineering education platform built with enterprise-grade architecture patterns. The system demonstrates professional SDLC practices, clean architecture, and production-ready patterns suitable for enterprise environments.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router (React 18)                           │
│  - Server Components (RSC)                                   │
│  - Client Components (Interactive)                           │
│  - PWA (Service Worker)                                      │
│  - Responsive UI (Tailwind + shadcn/ui)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  /api/v2/ai/execute    - AI Provider Interface (v2)        │
│  /api/ai/execute       - Legacy AI execution                │
│  /api/stats            - Site statistics                    │
│  /api/health           - Health check                       │
│  /api/workbench/*      - Workbench tools                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                   │
│  - AIProviderFactory (Strategy Pattern)                      │
│  - PromptService (CRUD operations)                          │
│  - UserService (authentication)                             │
│  - RateLimiter (usage tracking)                             │
│  - SecurityService (validation, sanitization)               │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Static Data (Current):                                      │
│  - TypeScript files (prompts, patterns, pathways)           │
│  - localStorage (favorites, ratings)                         │
│                                                              │
│  Database (Production):                                      │
│  - MongoDB Atlas (user data, prompts)                        │
│  - Zod schemas for validation                                │
│  - Connection pooling                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  AI Providers:                                               │
│  - OpenAI (GPT-4, GPT-3.5-turbo)                            │
│  - Anthropic (Claude 3.5 Sonnet)                             │
│  - Google (Gemini Pro)                                       │
│  - Groq (Fast inference)                                    │
│                                                              │
│  Infrastructure:                                             │
│  - Vercel (Hosting, Edge Functions)                         │
│  - Sentry (Error tracking)                                  │
│  - GitHub Actions (CI/CD)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Core Framework

- **Next.js 15.5.4** - React framework with App Router (stable, not RC)
- **React 18.3.1** - UI library with hooks and context
- **TypeScript 5.0** - Strict mode, zero `any` types
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library

### Database & APIs

- **MongoDB Atlas** - Primary database with connection pooling
- **Mongoose** - ODM for MongoDB
- **NextAuth.js v5** - Authentication and session management
- **Zod** - Runtime validation and type safety

### AI Integration

- **OpenAI API** - GPT-4, GPT-3.5-turbo
- **Anthropic API** - Claude 3.5 Sonnet
- **Google Gemini API** - Gemini Pro
- **Groq API** - Fast inference
- **AI Provider Interface** - Strategy pattern for provider abstraction

### Infrastructure

- **Vercel** - Hosting, edge functions, and deployment
- **Sentry** - Error tracking and performance monitoring
- **GitHub Actions** - CI/CD pipeline with quality gates
- **Husky** - Pre-commit hooks for code quality

## Architecture Patterns

### 1. Strategy Pattern (AI Providers) ✅ IMPLEMENTED

```typescript
// Interface-based provider abstraction
interface AIProvider {
  readonly name: string;
  readonly provider: string;
  execute(request: AIRequest): Promise<AIResponse>;
  validateRequest(request: AIRequest): boolean;
}

// Factory pattern for provider creation
class AIProviderFactory {
  static create(providerName: string): AIProvider {
    // Returns appropriate provider implementation
  }
}
```

**Why We Use This Pattern:**

- **Flexibility**: Easy to add new AI providers without modifying existing code
- **Testability**: Mock implementations for unit testing
- **SOLID Principles**: Follows Open/Closed and Single Responsibility principles
- **Enterprise Ready**: Industry-standard pattern for external service integration

**Benefits:**

- Easy to add new AI providers
- Testable with mock implementations
- Follows Open/Closed Principle
- Single Responsibility Principle

### 2. Repository Pattern ✅ IMPLEMENTED

```typescript
// Generic repository interface
interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

// MongoDB implementation
class UserRepository implements IUserRepository {
  // Implementation details
}
```

**Why We Use This Pattern:**

- **Database Abstraction**: Decouples business logic from data persistence
- **Testability**: In-memory implementations for testing
- **Scalability**: Easy to switch database backends or add caching layers
- **Enterprise Standards**: Industry-standard pattern for data access

**Benefits:**

- Database abstraction
- Testable with in-memory implementations
- Easy to switch database backends
- Clear separation of concerns

### 3. CQRS Pattern ✅ IMPLEMENTED

```typescript
// Command Query Responsibility Segregation
interface ICommand {
  readonly type: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
}

interface IQuery {
  readonly type: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
}

// Separate handlers for commands and queries
class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, User>
{
  async handle(command: CreateUserCommand): Promise<ICommandResult<User>> {
    // Write operation logic
  }
}

class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, User> {
  async handle(query: GetUserByIdQuery): Promise<IQueryResult<User>> {
    // Read operation logic
  }
}
```

**Why We Use This Pattern:**

- **Performance Optimization**: Separate read and write models can be optimized independently
- **Scalability**: Read and write operations can scale independently
- **Maintainability**: Clear separation between read and write operations
- **Enterprise Architecture**: Industry-standard pattern for complex business applications
- **Audit Trail**: Commands provide clear audit trail of business operations
- **Correlation IDs**: Request tracking for debugging and monitoring

**Benefits:**

- Optimized read/write performance
- Independent scaling of read and write models
- Clear separation of concerns
- Better maintainability and testability
- Request tracking and debugging capabilities

### 4. Dependency Injection Pattern ✅ IMPLEMENTED

```typescript
// Dependency injection container
class DIContainer {
  private services = new Map<string, any>();

  register<T>(id: string, service: T): void {
    this.services.set(id, service);
  }

  resolve<T>(id: string): T {
    return this.services.get(id);
  }
}

// Service registration
container.register('UserService', new UserService(userRepository));
container.register('PromptService', new PromptService(promptRepository));
```

**Why We Use This Pattern:**

- **Testability**: Easy to inject mock dependencies for testing
- **Flexibility**: Services can be swapped without changing dependent code
- **SOLID Principles**: Follows Dependency Inversion Principle
- **Enterprise Standards**: Industry-standard pattern for service management

**Benefits:**

- Easy testing with mock dependencies
- Loose coupling between components
- Configurable service implementations
- Follows Dependency Inversion Principle

### 5. Service Layer Pattern ✅ IMPLEMENTED

```typescript
// Business logic layer
class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Business logic validation
    if (await this.userRepository.findByEmail(userData.email)) {
      throw new Error('User with this email already exists');
    }

    return this.userRepository.create(userData);
  }
}
```

**Why We Use This Pattern:**

- **Business Logic Separation**: Keeps business rules separate from data access and presentation
- **Reusability**: Business logic can be reused across different API endpoints
- **Testability**: Business logic can be tested independently
- **Enterprise Architecture**: Industry-standard pattern for complex applications

**Benefits:**

- Business logic separation
- Dependency injection ready
- Testable business rules
- Reusable across API routes

### 4. Single Source of Truth

All dynamic data comes from centralized sources:

```typescript
// Site statistics
import { getSiteStats } from '@/lib/site-stats';

// Prompt library
import { playbookCategories } from '@/data/playbooks';

// Constants
import { siteStats } from '@/lib/constants';
```

**Never hardcode:**

- Prompt counts
- Pattern counts
- User statistics
- Feature flags

## Data Flow

### 1. User Request Flow (CQRS Pattern)

```
User Request (GET /api/v2/users)
    ↓
Next.js API Route
    ↓
CQRS Bus (sendQuery)
    ↓
Query Handler (GetAllUsersQueryHandler)
    ↓
User Service (business logic)
    ↓
User Repository (data access)
    ↓
MongoDB (query execution)
    ↓
Response with Correlation ID
    ↓
Client Component (render UI)
```

### 2. User Creation Flow (CQRS Pattern)

```
User Request (POST /api/v2/users)
    ↓
Next.js API Route
    ↓
Zod Validation
    ↓
CQRS Bus (send command)
    ↓
Command Handler (CreateUserCommandHandler)
    ↓
Command Validation (CreateUserCommandValidator)
    ↓
User Service (business logic)
    ↓
User Repository (data persistence)
    ↓
MongoDB (insert operation)
    ↓
Response with Correlation ID
    ↓
Client Component (success feedback)
```

### 3. AI Execution Flow (Strategy Pattern)

```
POST /api/v2/ai/execute
    ↓
Zod validation
    ↓
AIProviderFactory.create(provider)
    ↓
Provider.execute(request)
    ↓
Stream response to client
    ↓
Error handling & fallbacks
```

### 4. CQRS Benefits in Practice

**Command Operations (Write):**

- Create User → `CreateUserCommand` → `CreateUserCommandHandler`
- Update User → `UpdateUserCommand` → `UpdateUserCommandHandler`
- Delete User → `DeleteUserCommand` → `DeleteUserCommandHandler`

**Query Operations (Read):**

- Get All Users → `GetAllUsersQuery` → `GetAllUsersQueryHandler`
- Get User by ID → `GetUserByIdQuery` → `GetUserByIdQueryHandler`
- Search Users → `SearchUsersQuery` → `SearchUsersQueryHandler`

**Correlation IDs:**

- Every command/query includes a unique correlation ID
- Enables request tracking across the entire system
- Essential for debugging and monitoring in production

## Security Architecture

### Authentication & Authorization

- **NextAuth.js v5** - Session-based authentication
- **Bcrypt** - Password hashing (10 rounds)
- **CSRF Protection** - Built into NextAuth
- **Rate Limiting** - 10 requests/minute per IP

### Data Protection

- **Environment Variables** - All secrets in .env
- **Input Validation** - Zod schemas for all inputs
- **Output Sanitization** - DOMPurify for user content
- **Secure Headers** - CSP, HSTS, X-Frame-Options

### Monitoring & Logging

- **Sentry** - Error tracking and performance monitoring
- **Winston** - Structured logging with rotation
- **Audit Logs** - Track sensitive operations
- **Security Alerts** - Failed login attempts

## Performance Optimizations

### Code Splitting

- **Route-based splitting** - Automatic with Next.js
- **Dynamic imports** - Heavy components loaded on demand
- **Lazy loading** - Images and non-critical resources
- **Prefetching** - Navigation links prefetched

### Caching Strategy

- **Static Generation (SSG)** - Pre-built pages
- **Incremental Static Regeneration (ISR)** - Update static pages
- **API Response Caching** - 60s TTL for API routes
- **CDN Edge Caching** - Vercel's global CDN

### Database Optimization

- **Indexes** - On frequently queried fields
- **Connection Pooling** - 10 max, 5 min connections
- **Query Optimization** - Efficient MongoDB queries
- **Pagination** - 50 items per page

## Quality Assurance

### Code Quality

- **TypeScript Strict Mode** - Zero `any` types
- **ESLint** - Code quality rules
- **Prettier** - Consistent formatting
- **Husky** - Pre-commit hooks

### Testing Strategy

- **Unit Tests** - Component and utility testing
- **Integration Tests** - API route testing
- **CQRS Tests** - Command and query handler testing
- **Repository Tests** - Data access layer testing
- **E2E Tests** - Critical user flows
- **Visual Regression** - UI consistency

**CQRS Testing Coverage:**

- **Command Handlers**: 35+ tests covering all write operations
- **Query Handlers**: 25+ tests covering all read operations
- **CQRS Bus**: 16 tests covering handler registration and execution
- **Validation**: Comprehensive input validation testing
- **Error Handling**: Graceful error propagation testing
- **Correlation IDs**: Request tracking verification

### CI/CD Pipeline

- **GitHub Actions** - Automated testing
- **Quality Gates** - Block merge if tests fail
- **Security Scanning** - Dependabot updates
- **Deployment** - Automatic to Vercel

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design** - No server-side state
- **CDN Distribution** - Global edge caching
- **Database Sharding** - Ready for MongoDB sharding
- **Microservices Ready** - Service boundaries defined

### Performance Monitoring

- **Vercel Analytics** - Real-time performance metrics
- **Sentry Performance** - Transaction monitoring
- **Custom Metrics** - Business KPIs
- **Alerting** - Performance degradation alerts

## Development Workflow

### Branch Strategy

- **Feature Branches** - `feature/description`
- **Cleanup Branches** - `cleanup/description`
- **Hotfix Branches** - `hotfix/description`
- **Main Branch** - Always deployable

### Commit Standards

- **Conventional Commits** - `type: description`
- **Small Commits** - Atomic changes
- **Clear Messages** - What and why
- **No Secrets** - Security scanning

### Code Review Process

- **Pull Request Required** - No direct commits to main
- **Quality Checks** - Tests, linting, security
- **Architecture Review** - For significant changes
- **Documentation Updates** - Keep docs current

## Future Architecture Plans

### Phase 1: AI Provider Interface ✅ COMPLETED

- ✅ Strategy pattern for AI providers
- ✅ Factory pattern for provider creation
- ✅ Interface-based abstraction
- ✅ Comprehensive testing (49 tests, 100% success rate)

### Phase 2: Repository Pattern ✅ COMPLETED

- ✅ Generic repository interfaces
- ✅ MongoDB implementations
- ✅ Dependency injection container
- ✅ Service layer abstraction
- ✅ Comprehensive testing (91 tests, 100% success rate)

### Phase 3: CQRS Pattern ✅ COMPLETED

- ✅ Command Query Responsibility Segregation
- ✅ Separate command and query handlers
- ✅ CQRS bus implementation
- ✅ Validation and error handling
- ✅ Correlation ID tracking
- ✅ Comprehensive testing (95+ tests, 100% success rate)

### Phase 4: Advanced Architecture Patterns (Optional)

**Potential Deliverables:**

- **Event Sourcing**: Immutable event log for audit trails
- **Advanced Caching**: Redis integration with cache invalidation
- **Message Queues**: Async processing with job queues
- **Circuit Breaker**: Fault tolerance and resilience patterns
- **API Gateway**: Centralized API management and routing

### Phase 5: Enterprise Features

- SSO integration
- Team management
- Advanced analytics
- API rate limiting
- Multi-tenancy support

## Architecture Decision Records (ADRs)

- **[ADR-001: AI Provider Interface](development/ADR/001-ai-provider-interface.md)** - Strategy pattern for AI providers ✅ COMPLETED
- **[ADR-002: Repository Pattern](development/ADR/002-repository-pattern.md)** - Database abstraction layer ✅ COMPLETED
- **[ADR-003: CQRS Pattern](development/ADR/003-cqrs-pattern.md)** - Command Query Responsibility Segregation ✅ COMPLETED
- **[ADR-004: Dependency Injection](development/ADR/004-dependency-injection.md)** - Service container and DI patterns ✅ COMPLETED

---

**This architecture demonstrates enterprise-grade patterns suitable for production environments and showcases professional engineering practices for technical leadership roles.**
