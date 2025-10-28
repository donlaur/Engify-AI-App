# Project Structure

**Organized, scalable folder structure for 1K+ users**

```
engify-ai-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Dashboard group routes
│   │   │   ├── dashboard/
│   │   │   ├── prompts/
│   │   │   ├── pathways/
│   │   │   ├── favorites/
│   │   │   └── layout.tsx
│   │   ├── (marketing)/              # Marketing group routes
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   └── trpc/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── drawer.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── prompts/                  # Prompt-related
│   │   │   ├── PromptCard.tsx
│   │   │   ├── PromptList.tsx
│   │   │   ├── PromptSearch.tsx
│   │   │   └── PromptFilters.tsx
│   │   ├── pathways/                 # Learning pathways
│   │   │   ├── PathwayCard.tsx
│   │   │   └── PathwayProgress.tsx
│   │   ├── user/                     # User components
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   └── shared/                   # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/                          # Core utilities
│   │   ├── api/                      # API utilities
│   │   │   ├── response.ts
│   │   │   ├── validation.ts
│   │   │   └── errors.ts
│   │   ├── db/                       # Database
│   │   │   ├── client.ts
│   │   │   ├── schema.ts
│   │   │   └── indexes.ts
│   │   ├── services/                 # Business logic
│   │   │   ├── BaseService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── PromptService.ts
│   │   │   └── PathwayService.ts
│   │   ├── middleware/               # API middleware
│   │   │   ├── withAuth.ts
│   │   │   ├── withAdmin.ts
│   │   │   ├── withOrganization.ts
│   │   │   └── withFeature.ts
│   │   ├── hooks/                    # React hooks
│   │   │   ├── useUser.ts
│   │   │   ├── usePrompts.ts
│   │   │   └── useDebounce.ts
│   │   ├── utils/                    # Helper functions
│   │   │   ├── array.ts
│   │   │   ├── string.ts
│   │   │   ├── date.ts
│   │   │   └── validation.ts
│   │   ├── trpc/                     # tRPC setup
│   │   │   ├── client.ts
│   │   │   └── Provider.tsx
│   │   ├── features/                 # Feature flags
│   │   │   └── flags.ts
│   │   └── utils.ts                  # General utils
│   │
│   ├── server/                       # tRPC server
│   │   ├── routers/
│   │   │   ├── _app.ts
│   │   │   ├── prompt.ts
│   │   │   ├── user.ts
│   │   │   └── pathway.ts
│   │   └── trpc.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── index.ts
│   │
│   └── config/                       # Configuration
│       ├── constants.ts
│       └── env.ts
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── manifest.json
│
├── docs/                             # Documentation
├── scripts/                          # Build scripts
└── tests/                            # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

## Folder Guidelines

### `/src/app` - Next.js Routes
- Use route groups `(name)` for organization
- Keep route files minimal, delegate to components
- One layout per route group

### `/src/components` - React Components
- **ui/**: Only shadcn/ui primitives
- **layout/**: Header, Footer, Nav
- **[feature]/**: Feature-specific components
- **shared/**: Reusable across features

### `/src/lib` - Core Logic
- **api/**: API utilities (response, validation)
- **db/**: Database client, schemas
- **services/**: Business logic (DRY)
- **middleware/**: API middleware
- **hooks/**: React hooks
- **utils/**: Pure functions

### `/src/server` - tRPC Server
- One router per feature
- Keep routers focused

### `/src/types` - TypeScript
- Shared types only
- Feature-specific types in feature folders

## Naming Conventions

### Files
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`array.ts`)
- **Types**: camelCase (`api.ts`)
- **Constants**: UPPER_CASE (`API_ROUTES.ts`)

### Folders
- **Features**: lowercase (`prompts/`)
- **Route groups**: lowercase with parens `((auth)/)`
- **Components**: lowercase (`ui/`)

## Import Aliases

```typescript
@/*           → src/*
@/components  → src/components
@/lib         → src/lib
@/server      → src/server
@/types       → src/types
```

## Component Organization

```typescript
// ✅ Good - organized by feature
components/
  prompts/
    PromptCard.tsx
    PromptList.tsx
    PromptSearch.tsx
  pathways/
    PathwayCard.tsx
    PathwayProgress.tsx

// ❌ Bad - everything in one folder
components/
  PromptCard.tsx
  PromptList.tsx
  PathwayCard.tsx
  PathwayProgress.tsx
  UserProfile.tsx
  ... (200 files)
```

## Service Layer Organization

```typescript
// ✅ Good - one service per entity
lib/services/
  BaseService.ts      // Abstract base
  UserService.ts      // User operations
  PromptService.ts    // Prompt operations
  PathwayService.ts   // Pathway operations

// Each service extends BaseService
export class PromptService extends BaseService<Prompt> {
  constructor() {
    super('prompts', PromptSchema);
  }
  
  // Feature-specific methods
  async findByCategory(category: string) { ... }
}
```

## Middleware Organization

```typescript
// lib/middleware/
withAuth.ts          // Require authentication
withAdmin.ts         // Require admin role
withOrganization.ts  // Require organization
withFeature.ts       // Check feature flag

// Usage - compose middleware
export const DELETE = withFeature('enable_admin')(
  withAdmin(async (req, { user }) => {
    // Implementation
  })
);
```

## Maximum Files Per Folder

- **components/[feature]/**: Max 10 files
- **lib/services/**: Max 15 files
- **lib/utils/**: Max 10 files
- **server/routers/**: Max 20 files

**If you hit the limit, create subfolders!**
