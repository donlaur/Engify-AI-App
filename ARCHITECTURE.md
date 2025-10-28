# Engify.ai Architecture

## Overview

Engify.ai is built as a modern, scalable web application using Next.js 15, React 18, and MongoDB. The architecture follows enterprise best practices with a focus on maintainability, type safety, and performance.

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

## Architecture Patterns

### 1. Single Source of Truth

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
