# Dependency Update Plan - Oct 27, 2025

## Current Status

### Major Updates Completed ✅

- **Next.js**: 14.2.33 → 16.0.0 (RC/Canary)
- **React**: 18.3.1 → 19.2.0
- **React DOM**: 18.3.1 → 19.2.0
- **eslint-config-next**: 14.2.33 → 16.0.0

## Peer Dependency Warnings ⚠️

### 1. ESLint Version Mismatch

```
eslint-config-next 16.0.0 requires eslint@>=9.0.0
Currently: eslint@8.57.1
```

**Action**: Upgrade to ESLint 9

```bash
pnpm update eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
```

**Impact**: May require ESLint config updates

### 2. Testing Library (React 19 compatibility)

```
@testing-library/react 14.3.1 expects react@^18.0.0
Currently: react@19.2.0
```

**Action**: Update testing library

```bash
pnpm update @testing-library/react@latest @testing-library/react-dom@latest
```

**Impact**: Should be compatible, just needs version bump

### 3. Lucide React (Icon Library)

```
lucide-react 0.344.0 expects react@^16.5.1 || ^17.0.0 || ^18.0.0
Currently: react@19.2.0
```

**Action**: Update lucide-react

```bash
pnpm update lucide-react@latest
```

**Impact**: None expected (icons should work fine)

### 4. Vaul (Drawer Component)

```
vaul 0.9.9 expects react@^16.8 || ^17.0 || ^18.0
Currently: react@19.2.0
```

**Action**: Update vaul

```bash
pnpm update vaul@latest
```

**Impact**: May need to test drawer functionality

### 5. Vitest Coverage

```
@vitest/coverage-v8 1.6.1 expects vitest@1.6.1
Currently: vitest@4.0.4
```

**Action**: Already correct version of vitest, update coverage

```bash
pnpm update @vitest/coverage-v8@latest
```

**Impact**: None

### 6. tRPC (React Query version)

```
@trpc/react-query 10.45.2 expects @tanstack/react-query@^4.18.0
Currently: @tanstack/react-query@5.90.5
```

**Action**: Update tRPC to v11 (supports React Query v5)

```bash
pnpm update @trpc/client@latest @trpc/server@latest @trpc/react-query@latest @trpc/next@latest
```

**Impact**: May require code changes (breaking changes in tRPC v11)

### 7. NextAuth (Next.js 16 compatibility)

```
next-auth 5.0.0-beta.29 expects next@^14.0.0-0 || ^15.0.0-0
Currently: next@16.0.0
```

**Action**: Wait for NextAuth v5 stable or use compatible beta

```bash
# Check for newer beta
pnpm update next-auth@beta
```

**Impact**: May need to wait for official Next.js 16 support

## Recommended Update Strategy

### Phase 1: Critical Updates (Now)

1. ✅ Next.js 16.0.0 (Done)
2. ✅ React 19.2.0 (Done)
3. ⏳ ESLint 9 (Required for Next.js 16 config)
4. ⏳ Testing libraries (React 19 compat)

### Phase 2: UI Library Updates (This Week)

5. ⏳ lucide-react (icon compatibility)
6. ⏳ vaul (drawer compatibility)
7. ⏳ Radix UI components (React 19 compat)

### Phase 3: API/Backend Updates (Next Week)

8. ⏳ tRPC v11 (React Query v5 support)
9. ⏳ NextAuth beta (Next.js 16 support)
10. ⏳ Other backend dependencies

### Phase 4: Dev Dependencies (Ongoing)

11. ⏳ TypeScript types
12. ⏳ Vitest coverage
13. ⏳ Build tools

## Breaking Changes to Watch

### Next.js 16 (from 14)

- **App Router changes**: May have new conventions
- **Image optimization**: New features/changes
- **Middleware**: Potential API changes
- **Server Actions**: Enhanced capabilities
- **Turbopack**: May be default now

### React 19 (from 18)

- **New hooks**: `use()`, `useOptimistic()`, `useFormStatus()`
- **Server Components**: Enhanced capabilities
- **Actions**: New form action patterns
- **Ref handling**: Simplified ref forwarding
- **Context**: Improved context API

### ESLint 9 (from 8)

- **Flat config**: New configuration format
- **Plugin changes**: Some plugins may need updates
- **Rule changes**: Some rules deprecated/changed

### tRPC v11 (from v10)

- **React Query v5**: Required upgrade
- **API changes**: Some breaking changes
- **TypeScript**: Improved types

## Testing Strategy

### After Each Update

1. Run unit tests: `pnpm test:run`
2. Run build: `pnpm build`
3. Test dev server: `pnpm dev`
4. Manual testing of key features
5. Check for console errors/warnings

### Key Features to Test

- [ ] Homepage loads
- [ ] Library page with prompts
- [ ] Search and filters
- [ ] Navigation (header, sidebar)
- [ ] Authentication (NextAuth)
- [ ] API routes (tRPC)
- [ ] Forms and inputs
- [ ] Icons and UI components

## Rollback Plan

If updates cause issues:

```bash
# Rollback to previous versions
git checkout package.json pnpm-lock.yaml
pnpm install

# Or specific packages
pnpm add next@14.2.33 react@18.3.1 react-dom@18.3.1
```

## Update Commands

### All at once (risky)

```bash
pnpm update --latest
```

### Recommended (incremental)

```bash
# Phase 1
pnpm update eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
pnpm update @testing-library/react@latest @testing-library/user-event@latest

# Phase 2
pnpm update lucide-react@latest vaul@latest
pnpm update @radix-ui/react-avatar@latest @radix-ui/react-dropdown-menu@latest

# Phase 3
pnpm update @trpc/client@latest @trpc/server@latest @trpc/react-query@latest @trpc/next@latest
pnpm update next-auth@beta

# Phase 4
pnpm update @vitest/coverage-v8@latest
pnpm update @types/node@latest @types/react@latest @types/react-dom@latest
```

## Current Outdated Packages (from pnpm outdated)

Major updates needed:

- ✅ next: 14.2.33 → 16.0.0 (DONE)
- ✅ react: 18.3.1 → 19.2.0 (DONE)
- ✅ react-dom: 18.3.1 → 19.2.0 (DONE)
- ⏳ eslint: 8.57.1 → 9.38.0
- ⏳ @typescript-eslint/\*: 7.18.0 → 8.46.2
- ⏳ tailwindcss: 3.4.18 → 4.1.16 (major version!)
- ⏳ zod: 3.25.76 → 4.1.12 (major version!)
- ⏳ zustand: 4.5.7 → 5.0.8 (major version!)
- ⏳ @trpc/\*: 10.45.2 → 11.7.0 (major version!)

## Decision: Next.js 16 or Next.js 15?

### Next.js 16.0.0 (Current)

- **Pros**: Latest features, cutting edge
- **Cons**: RC/Canary, may have bugs, limited ecosystem support

### Next.js 15.x (Stable)

- **Pros**: Stable, better ecosystem support
- **Cons**: Not latest

**Recommendation**:

- **Development**: Stay on 16.0.0 to test new features
- **Production**: Consider downgrading to 15.x stable when deploying
- **Monitor**: Watch for Next.js 16 stable release

## Action Items

### Immediate (Today)

- [x] Update Next.js to 16.0.0
- [x] Update React to 19.2.0
- [ ] Update ESLint to 9.x
- [ ] Test dev server
- [ ] Run unit tests

### This Week

- [ ] Update all UI libraries (lucide, vaul, radix)
- [ ] Update testing libraries
- [ ] Update TypeScript types
- [ ] Test all features

### Next Week

- [ ] Update tRPC to v11
- [ ] Update NextAuth beta
- [ ] Consider Tailwind v4 (major)
- [ ] Consider Zod v4 (major)

### Monitor

- [ ] Next.js 16 stable release
- [ ] NextAuth v5 stable release
- [ ] tRPC v11 stable release
- [ ] Community feedback on React 19

## Notes

- **React 19** is stable and production-ready
- **Next.js 16** may still be in RC/Canary
- **ESLint 9** is required for Next.js 16 config
- **Major version bumps** (Tailwind 4, Zod 4, Zustand 5) need careful testing
- **tRPC v11** is a significant upgrade with breaking changes
