# Contributing to Engify.ai

Thank you for your interest in contributing to Engify.ai! This document provides guidelines and standards for contributing to the project.

## Code Standards

### Architecture Principles

1. **DRY (Don't Repeat Yourself)**
   - Use shared utilities in `/src/lib/utils/`
   - Create reusable components in `/src/components/`
   - Centralize constants in `/src/lib/constants.ts`

2. **Single Source of Truth**
   - All site statistics come from `/src/lib/site-stats.ts`
   - Prompt data lives in `/src/data/playbooks.ts`
   - No hardcoded numbers or duplicated data

3. **Type Safety**
   - All components and functions must be fully typed
   - Use TypeScript interfaces from `/src/types/`
   - No `any` types without explicit justification

### Code Organization

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and helpers
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── constants.ts    # Global constants
├── data/               # Static data and content
└── types/              # TypeScript type definitions
```

### Prompt Engineering Standards

All prompts must follow the **KERNEL Framework**:

- **K**eep it simple (one clear goal)
- **E**asy to verify (objective success criteria)
- **R**eproducible (no temporal references)
- **N**arrow scope (focused task)
- **E**xplicit constraints (clear boundaries)
- **L**ogical structure (organized sections)

See `/docs/KERNEL_FRAMEWORK.md` for details.

### Component Guidelines

1. **Use Client Components Sparingly**
   - Only add `'use client'` when necessary
   - Prefer server components for static content

2. **Consistent Styling**
   - Use Tailwind CSS utility classes
   - Follow existing color schemes and spacing
   - Maintain responsive design patterns

3. **Accessibility**
   - Include proper ARIA labels
   - Ensure keyboard navigation works
   - Maintain color contrast ratios

### Git Workflow

1. **Branch Naming**
   - `feature/description` for new features
   - `fix/description` for bug fixes
   - `docs/description` for documentation

2. **Commit Messages**
   - Use conventional commits format
   - Examples: `feat:`, `fix:`, `docs:`, `refactor:`
   - Keep messages clear and professional

3. **Pull Requests**
   - Reference related issues
   - Include description of changes
   - Ensure all tests pass

## Development Setup

See `/docs/SETUP.md` for detailed setup instructions.

## Testing

- Run tests: `pnpm test`
- Run linting: `pnpm lint`
- Type check: `pnpm type-check`

## Questions?

Open an issue or reach out to the maintainers.
