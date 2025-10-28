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

### 1. Strategy Pattern (AI Providers)

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

**Benefits:**

- Easy to add new AI providers
- Testable with mock implementations
- Follows Open/Closed Principle
- Single Responsibility Principle

### 2. Repository Pattern (Planned)

```typescript
// Repository interface
interface PromptRepository {
  findById(id: string): Promise<Prompt | null>;
  findByCategory(category: string): Promise<Prompt[]>;
  create(prompt: CreatePromptRequest): Promise<Prompt>;
  update(id: string, prompt: UpdatePromptRequest): Promise<Prompt>;
  delete(id: string): Promise<void>;
}

// MongoDB implementation
class MongoPromptRepository implements PromptRepository {
  // Implementation details
}
```

**Benefits:**

- Database abstraction
- Testable with in-memory implementations
- Easy to switch database backends
- Clear separation of concerns

### 3. Service Layer Pattern

```typescript
// Business logic layer
class PromptService {
  constructor(
    private promptRepo: PromptRepository,
    private aiProvider: AIProvider
  ) {}

  async executePrompt(promptId: string, input: string): Promise<string> {
    const prompt = await this.promptRepo.findById(promptId);
    if (!prompt) throw new Error('Prompt not found');

    return this.aiProvider.execute({
      prompt: prompt.content,
      input,
      model: prompt.preferredModel,
    });
  }
}
```

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

### 1. User Request Flow

```
User Request
    ↓
Next.js Middleware (auth check)
    ↓
Server Component (fetch data)
    ↓
MongoDB (query prompts)
    ↓
Client Component (render UI)
    ↓
User Interaction (copy prompt)
    ↓
API Route (execute with AI)
    ↓
AIProviderFactory.create('openai')
    ↓
OpenAI API
    ↓
Stream Response
    ↓
Display Result
```

### 2. AI Execution Flow

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
- **E2E Tests** - Critical user flows
- **Visual Regression** - UI consistency

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

### Phase 2: Repository Pattern

- Abstract database operations
- Implement MongoDB repositories
- Add dependency injection
- Comprehensive testing

### Phase 3: Service Layer

- Business logic separation
- Service interfaces
- Dependency injection container
- Integration testing

### Phase 4: Advanced AI Features

- RAG (Retrieval-Augmented Generation)
- Multi-agent systems
- Vector database integration
- Advanced prompt engineering

### Phase 5: Enterprise Features

- SSO integration
- Team management
- Advanced analytics
- API rate limiting

## Architecture Decision Records (ADRs)

- **[ADR-001: AI Provider Interface](development/ADR/001-ai-provider-interface.md)** - Strategy pattern for AI providers
- **[ADR-002: Repository Pattern](development/ADR/002-repository-pattern.md)** - Database abstraction layer
- **[ADR-003: API Versioning](ADR-003-v2-api-migration.md)** - Backward compatibility strategy

---

**This architecture demonstrates enterprise-grade patterns suitable for production environments and showcases professional engineering practices for technical leadership roles.**
