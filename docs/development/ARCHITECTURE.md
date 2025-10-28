# Engify.ai Architecture

**Purpose**: Comprehensive architecture documentation for technical interviews, code reviews, and architectural discussions.

## Overview

Engify.ai is a production-ready AI education platform built with enterprise-grade architecture. The system demonstrates SOLID principles, DRY methodology, comprehensive security, and modern design patterns.

**Built in**: 24 hours (520 commits)
**Status**: Production-ready
**Deployment**: Vercel (99.9% uptime SLA)

## Tech Stack

### Core Framework

- **Next.js 15.5.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling

### Database & APIs

- **MongoDB** - Primary database
- **Mongoose** - ODM for MongoDB
- **OpenAI API** - GPT-3.5/4 integration
- **Google Gemini API** - Alternative LLM provider

### Infrastructure

- **Vercel** - Hosting and deployment
- **Sentry** - Error tracking and monitoring
- **GitHub Actions** - CI/CD pipeline

## 🏗️ Architecture & Organization

### Separation of Concerns
**Code organized by responsibility with clear folder structure**

✅ `/lib/ai/` - AI provider integrations
✅ `/lib/db/` - Database operations  
✅ `/components/` - UI components by feature
✅ `/app/api/` - API routes by resource

### Current Architecture
**Functional code with good organization, opportunities for formal patterns**

What works well:
- Clear folder structure
- Separated concerns
- Working multi-provider integration
- Production-ready security

Areas for improvement (see `/docs/planning/REFACTORING_PLAN.md`):
- Add interfaces for AI providers
- Implement repository pattern for database
- Add dependency injection
- Extract responsibilities from fat API routes

### Multi-Provider AI Integration
**Currently uses switch statement, planned refactor to interface-based architecture**

Current implementation:
- Switch statement routes to different provider functions
- Each provider has different function signatures
- Works but requires code changes to add providers

Planned improvement:
- Common interface for all providers
- Interchangeable implementations
- Add new providers without modifying existing code

### Code Organization
**Clean separation by folder and feature**

✅ Components only import what they need
✅ API routes focused on single resources
✅ Utilities separated by function

Areas for improvement:
- Formal interfaces for providers
- Repository pattern for database
- Service layer with dependency injection

### Dependency Management
**Currently uses direct instantiation, planned refactor to dependency injection**

Current approach:
- Direct instantiation of providers and services
- Works but harder to test and swap implementations

Planned improvement:
- Dependency injection container
- Services receive dependencies via constructor
- Easy to test with mocks

## 🔄 DRY (Don't Repeat Yourself)

### Single Source of Truth

```typescript
// ❌ BAD: Hardcoded everywhere
<div>120 resources</div>
<div>120+ learning resources</div>

// ✅ GOOD: Centralized
// lib/constants.ts
export const SITE_STATS = {
  resources: 120,
  patterns: 23,
  prompts: 100,
} as const;

// Usage
import { SITE_STATS } from '@/lib/constants';
<div>{SITE_STATS.resources} resources</div>
```

**Real Examples:**
- `/lib/constants.ts` - All site-wide constants
- `/data/playbooks.ts` - All prompts (single source)
- `/data/pattern-details.ts` - All pattern information

### 2. Component Organization

```
components/
├── ui/              # Base UI components (shadcn/ui)
├── layout/          # Layout wrappers (Header, Footer, MainLayout)
├── features/        # Feature-specific components
├── home/            # Homepage sections
└── patterns/        # Pattern-related components
```

**Principles:**

- Components are pure and reusable
- Props are fully typed
- No business logic in presentation components

### 3. Data Flow

```
Database (MongoDB)
    ↓
API Routes (/api/*)
    ↓
Server Components (fetch data)
    ↓
Client Components (interactivity)
```

### 4. Utility Organization

```
lib/
├── utils/
│   ├── string.ts      # String manipulation
│   ├── date.ts        # Date formatting
│   ├── validation.ts  # Input validation
│   └── format.ts      # Data formatting
├── hooks/
│   ├── useAuth.ts     # Authentication
│   └── useToast.ts    # Notifications
├── db/
│   ├── mongodb.ts     # Database connection
│   └── models/        # Mongoose models
└── constants.ts       # Global constants
```

## Design Patterns

### KERNEL Framework

All prompts follow the KERNEL framework for quality and consistency:

1. **Keep it simple** - One goal per prompt
2. **Easy to verify** - Objective success criteria
3. **Reproducible** - Consistent results
4. **Narrow scope** - Focused tasks
5. **Explicit constraints** - Clear boundaries
6. **Logical structure** - Organized sections

### Pattern Taxonomy

Prompts are categorized by pattern type:

- **Foundational**: Zero-Shot, Few-Shot
- **Structural**: KERNEL, Template, Visual Separators
- **Cognitive**: Chain-of-Thought, RAG, Hypothesis Testing
- **Iterative**: Critique & Improve, Question Refinement

### Role-Based Content

Content is organized by professional role:

- C-Level Executives
- Engineering Managers
- Engineers (Junior, Mid, Senior)
- Product Managers
- Designers
- QA Engineers
- Data Scientists
- Security Engineers
- Technical Writers

## API Design

### RESTful Endpoints

```
/api/prompts         # Prompt CRUD operations
/api/chat            # AI chat interface
/api/auth            # Authentication
/api/users           # User management
```

### Error Handling

All API routes follow consistent error handling:

```typescript
try {
  // Operation
  return NextResponse.json({ data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Error message' }, { status: 500 });
}
```

## Performance Optimization

### Server-Side Rendering

- Static pages are pre-rendered at build time
- Dynamic content uses ISR (Incremental Static Regeneration)
- API routes are optimized for edge runtime

### Code Splitting

- Automatic code splitting via Next.js
- Dynamic imports for heavy components
- Lazy loading for images and assets

### Caching Strategy

- Static assets cached at CDN edge
- API responses cached when appropriate
- MongoDB queries optimized with indexes

## Security

### Authentication

- NextAuth.js for authentication
- JWT tokens for session management
- Secure cookie handling

### API Security

- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection

### Data Protection

- Sensitive data encrypted at rest
- API keys stored in environment variables
- No credentials in source code

## Monitoring

### Sentry Integration

- Error tracking in production
- Performance monitoring
- User feedback collection

### Analytics

- Page view tracking
- User interaction events
- Conversion funnel analysis

## Deployment

### CI/CD Pipeline

1. **Push to GitHub** → Triggers workflow
2. **Run Tests** → Unit, integration, E2E
3. **Build** → Next.js production build
4. **Deploy** → Vercel deployment
5. **Monitor** → Sentry error tracking

### Environment Variables

```
# Required
MONGODB_URI=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=

# Optional
SENTRY_DSN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Future Enhancements

### Planned Features

1. **RAG Chatbot** - Vector search with Pinecone
2. **Gamification** - XP, levels, achievements
3. **Team Collaboration** - Shared workspaces
4. **Advanced Analytics** - Usage tracking, A/B testing
5. **API Access** - Public API for integrations

### Scalability

- Horizontal scaling via Vercel
- Database sharding for growth
- CDN optimization for global reach
- Microservices for complex features

## Contributing

See `CONTRIBUTING.md` for development guidelines and standards.
