# Contributing to Engify.ai

Thank you for your interest in contributing to Engify.ai! This document provides comprehensive guidelines and standards for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/Engify-AI-App.git`
3. **Install dependencies**: `pnpm install`
4. **Environment setup**: Copy `.env.example` to `.env.local` and configure
5. **Run development server**: `pnpm dev`

## Development Workflow

### Branch Naming Conventions

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
- `cleanup/description` - Code cleanup and organization

### Commit Message Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic changes)
- `refactor:` - Code refactoring (no new features)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, config changes
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**

```
feat: add AI provider interface with strategy pattern
fix: resolve authentication middleware issue
docs: update architecture documentation
refactor: extract prompt service to separate module
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following code standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run quality checks**: `pnpm lint && pnpm test`
6. **Create pull request** with clear description
7. **Address review feedback**
8. **Merge after approval**

## Code Standards

### Architecture Principles

1. **DRY (Don't Repeat Yourself)**
   - Use shared utilities in `/src/lib/utils/`
   - Create reusable components in `/src/components/`
   - Centralize constants in `/src/lib/constants.ts`

2. **Single Source of Truth**
   - All site statistics come from `/api/stats` endpoint
   - Prompt data lives in MongoDB (not hardcoded)
   - No hardcoded numbers or duplicated data
   - No mock data fallback values (use 0 or omit)

3. **Type Safety**
   - All components and functions must be fully typed
   - Use TypeScript interfaces from `/src/types/`
   - No `any` types without explicit justification

4. **SOLID Principles**
   - Single Responsibility Principle
   - Open/Closed Principle
   - Liskov Substitution Principle
   - Interface Segregation Principle
   - Dependency Inversion Principle

### Code Organization

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── lib/                # Utilities and configurations
│   ├── ai/             # AI provider interfaces
│   ├── auth/           # Authentication logic
│   ├── db/             # Database connections
│   └── utils/          # Shared utilities
├── data/               # Static data and constants
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

### Component Standards

1. **Server Components by Default**
   - Use Server Components for data fetching and static content
   - Only use Client Components when interactivity is required
   - Clear separation between Server and Client Components
   - See ADR-011 for detailed guidelines

2. **Component Size**
   - Target: < 200 lines per component
   - Extract logic to custom hooks
   - Break large components into smaller pieces

3. **Error Boundaries**
   - Wrap Client Components in ErrorBoundary
   - Provide meaningful error messages
   - Log errors to monitoring service

4. **Props Interface**

   ```typescript
   interface ComponentProps {
     title: string;
     description?: string;
     onAction: () => void;
   }
   ```

3. **Error Boundaries**
   - Wrap components that might fail
   - Provide meaningful error messages
   - Log errors to monitoring service

### API Standards

1. **Route Handlers**

   ```typescript
   // src/app/api/example/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { z } from 'zod';

   const schema = z.object({
     input: z.string().min(1),
   });

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json();
       const { input } = schema.parse(body);

       // Process request
       return NextResponse.json({ result: 'success' });
     } catch (error) {
       return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
     }
   }
   ```

2. **Error Handling**
   - Always use try/catch blocks
   - Return appropriate HTTP status codes
   - Log errors with context
   - Never expose internal errors to clients

3. **Validation**
   - Use Zod schemas for all inputs
   - Validate request bodies
   - Sanitize user inputs
   - Check authentication/authorization

## Testing Standards

### Test Structure

```
src/
├── __tests__/          # Test utilities and setup
├── components/
│   └── __tests__/      # Component tests
├── lib/
│   └── __tests__/      # Utility tests
└── app/
    └── api/
        └── __tests__/  # API route tests
```

### Test Types

1. **Unit Tests**
   - Test individual functions/components
   - Mock external dependencies
   - Aim for 80%+ code coverage

2. **Integration Tests**
   - Test API routes end-to-end
   - Test component interactions
   - Use real data when possible

3. **E2E Tests**
   - Test critical user flows
   - Use Playwright for browser testing
   - Test on multiple devices/browsers

### Test Examples

```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { PromptCard } from '@/components/PromptCard';

describe('PromptCard', () => {
  it('renders prompt title and description', () => {
    const prompt = {
      id: '1',
      title: 'Test Prompt',
      description: 'Test Description',
    };

    render(<PromptCard prompt={prompt} />);

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});

// API test
import { POST } from '@/app/api/ai/execute/route';
import { NextRequest } from 'next/server';

describe('/api/ai/execute', () => {
  it('returns AI response for valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/execute', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test prompt',
        provider: 'openai',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('response');
  });
});
```

## Quality Assurance

### Day 7 Patterns & Best Practices

#### Mock Data Removal (ADR-009)
- **Zero tolerance:** No mock data in production code
- **Start at 0:** Initialization values should be `0`, not fake numbers
- **Empty states:** Show professional empty states instead of fake data
- **Single source of truth:** All stats come from `/api/stats` endpoint
- **No fallbacks:** Remove fallback values like `|| 100` for stats (use `0` or omit)
- **Pre-commit checks:** Mock data patterns are automatically flagged

**Examples:**
```typescript
// ❌ BAD: Mock data fallback
const totalPrompts = data.prompts?.total || 100;

// ✅ GOOD: Real data or 0
const totalPrompts = data.prompts?.total || 0;

// ✅ BEST: Proper empty state
{totalPrompts === 0 ? (
  <EmptyState message="No prompts yet" />
) : (
  <StatsDisplay count={totalPrompts} />
)}
```

#### Pattern-Based Bug Fixing (ADR-009)
- **Fix once, apply everywhere:** When fixing a bug, search for the same pattern
- **Systematic audit:** Don't fix one instance, fix all instances
- **Document patterns:** Add findings to `docs/testing/PATTERN_AUDIT_DAY7.md`
- **Prevent recurrence:** Add pre-commit checks or linting rules

#### Frontend Component Architecture (ADR-011)
- **Server Components by default:** Only use Client Components when needed
- **Component size:** Target < 200 lines, extract logic to hooks
- **Error boundaries:** Wrap Client Components in ErrorBoundary
- **Loading states:** Use branded skeletons, not "Loading..." text
- **Optimistic UI:** Use optimistic updates for mutations with rollback

**Server vs Client Component Guidelines:**
```typescript
// ✅ Server Component - Data fetching
export default async function PromptsPage() {
  const prompts = await fetchPrompts();
  return <PromptsClient prompts={prompts} />;
}

// ✅ Client Component - Interactivity
'use client';
export function PromptsClient({ prompts }: Props) {
  const [filter, setFilter] = useState('');
  // Interactive logic
}
```

**When to use Server Components:**
- Fetching data from database
- Accessing backend resources
- Static content
- Heavy dependencies (reduce bundle size)

**When to use Client Components:**
- Interactive elements (buttons, forms, inputs)
- State management (useState, useReducer)
- Browser APIs (localStorage, window)
- React hooks (useEffect, etc.)

### Pre-commit Checks

The following checks run automatically:

1. **Enterprise Compliance** - `scripts/maintenance/check-enterprise-compliance.js`
   - Mock data detection
   - API route requirements (rate limiting, tests, RBAC)
   - Component requirements (error boundaries, tests)
   - Schema requirements (organizationId for multi-tenant)

2. **Schema Validation** - `scripts/maintenance/validate-schema.js`

3. **Security Checks** - `scripts/security/security-check.js`

4. **TypeScript Compilation** - `tsc --noEmit`

5. **ESLint** - Code quality and style

6. **Prettier** - Code formatting

### Manual Checks

Before submitting a PR:

1. **Run full test suite**: `pnpm test`
2. **Check TypeScript**: `pnpm type-check`
3. **Lint code**: `pnpm lint`
4. **Format code**: `pnpm format`
5. **Build verification**: `pnpm build`

### Code Review Checklist

- [ ] Code follows architecture principles
- [ ] TypeScript types are correct
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed
- [ ] Security best practices followed

## Documentation Standards

### Code Documentation

1. **JSDoc Comments**

   ```typescript
   /**
    * Executes a prompt with the specified AI provider
    * @param prompt - The prompt text to execute
    * @param provider - The AI provider to use
    * @returns Promise resolving to AI response
    */
   async function executePrompt(
     prompt: string,
     provider: string
   ): Promise<string> {
     // Implementation
   }
   ```

2. **README Updates**
   - Update relevant README files
   - Include setup instructions
   - Document new features
   - Update API documentation

3. **Architecture Decision Records (ADRs)**
   - Document major architectural decisions
   - Explain alternatives considered
   - Record consequences and trade-offs

### Markdown Standards

- Use clear headings
- Include code examples
- Link to related documentation
- Keep lines under 80 characters
- Use proper markdown syntax

## Security Guidelines

### Data Handling

1. **Never commit secrets**
   - Use environment variables
   - Add to `.gitignore`
   - Use secret scanning tools

2. **Input validation**
   - Validate all user inputs
   - Sanitize data before processing
   - Use parameterized queries

3. **Authentication**
   - Check authentication on protected routes
   - Use secure session management
   - Implement proper authorization

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authentication checks in place
- [ ] Error messages don't leak information
- [ ] Dependencies are up to date
- [ ] Security headers configured

## Performance Guidelines

### Optimization Principles

1. **Code Splitting**
   - Use dynamic imports for heavy components
   - Lazy load non-critical resources
   - Implement route-based splitting

2. **Caching**
   - Use appropriate cache headers
   - Implement client-side caching
   - Cache expensive computations

3. **Database**
   - Use indexes on frequently queried fields
   - Implement connection pooling
   - Optimize query performance

### Performance Checklist

- [ ] Components are optimized
- [ ] Images are properly sized
- [ ] Database queries are efficient
- [ ] Caching is implemented
- [ ] Bundle size is reasonable

## Getting Help

### Resources

- **Documentation**: [docs/README.md](docs/README.md)
- **Architecture**: [docs/architecture/OVERVIEW.md](docs/architecture/OVERVIEW.md)
- **API Docs**: [docs/api/](docs/api/)
- **Development Guide**: [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)

### Communication

- **Issues**: [GitHub Issues](https://github.com/donlaur/Engify-AI-App/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Email**: donlaur@engify.ai

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow professional standards

---

**Thank you for contributing to Engify.ai!**

_This document demonstrates professional development practices and standards suitable for enterprise environments._
