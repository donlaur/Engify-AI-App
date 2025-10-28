# Refactoring Plan: Strangler Fig Pattern

**Purpose**: Incrementally refactor codebase to implement SOLID principles without breaking production.

**Strategy**: Strangler Fig Pattern - Build new architecture alongside old, gradually migrate, then remove old code.

**Why This Matters**: Shows you ship fast (24 hours), then refactor for quality. Demonstrates maturity and understanding of technical debt management.

---

## 🎯 Goals

1. **Implement SOLID principles** (for real this time)
2. **Add design patterns** (Factory, Repository, Strategy)
3. **Improve testability** (dependency injection)
4. **Maintain 100% uptime** (no breaking changes)
5. **Document the journey** (shows growth mindset)

---

## 📋 Refactoring Phases

### Phase 1: AI Provider Abstraction (Week 1)
**Goal**: Create common interface so all providers are interchangeable (currently we use switch statements)

**Branch**: `refactor/ai-provider-interface`

**Steps**:
1. Create `AIProvider` interface
2. Implement adapters for each provider (OpenAI, Claude, Gemini, Groq)
3. Create factory for provider instantiation
4. Update API routes to use interface (not switch statement)
5. Add tests for each adapter
6. Deploy alongside existing code
7. Gradually migrate routes to new system
8. Remove old switch statement code

**Files to Create**:
```
src/lib/ai/v2/
├── interfaces/
│   └── AIProvider.ts          # Common interface
├── adapters/
│   ├── OpenAIAdapter.ts       # Implements AIProvider
│   ├── ClaudeAdapter.ts       # Implements AIProvider
│   ├── GeminiAdapter.ts       # Implements AIProvider
│   └── GroqAdapter.ts         # Implements AIProvider
├── factory/
│   └── AIProviderFactory.ts   # Creates providers
└── __tests__/
    ├── OpenAIAdapter.test.ts
    ├── ClaudeAdapter.test.ts
    └── factory.test.ts
```

**What We Have Now**:
- ❌ No interface - just switch statement
- ❌ Each provider has different function names
- ❌ Can't swap providers without modifying code

**What We'll Have After**:
- ✅ All providers implement same interface
- ✅ Can swap providers without code changes
- ✅ 100% test coverage for adapters
- ✅ No breaking changes to existing API
- ✅ Old code still works during migration

---

### Phase 2: Repository Pattern for Database (Week 2)
**Goal**: Abstract database operations

**Branch**: `refactor/repository-pattern`

**Steps**:
1. Create repository interfaces
2. Implement MongoDB repositories
3. Add dependency injection
4. Update API routes to use repositories
5. Add tests for repositories
6. Migrate routes one by one
7. Remove direct MongoDB calls

**Files to Create**:
```
src/lib/repositories/
├── interfaces/
│   ├── IPromptRepository.ts
│   ├── IUserRepository.ts
│   └── IUsageRepository.ts
├── mongodb/
│   ├── PromptRepository.ts    # Implements IPromptRepository
│   ├── UserRepository.ts      # Implements IUserRepository
│   └── UsageRepository.ts     # Implements IUsageRepository
├── factory/
│   └── RepositoryFactory.ts
└── __tests__/
    ├── PromptRepository.test.ts
    └── UserRepository.test.ts
```

**Success Criteria**:
- ✅ All database operations through repositories
- ✅ Easy to swap MongoDB for another database
- ✅ Testable with mock repositories
- ✅ No direct MongoDB calls in API routes

---

### Phase 3: Dependency Injection (Week 3)
**Goal**: Implement true Dependency Inversion

**Branch**: `refactor/dependency-injection`

**Steps**:
1. Create service layer with DI
2. Update API routes to receive dependencies
3. Create DI container
4. Add tests with mocked dependencies
5. Migrate routes to use DI
6. Remove direct instantiation

**Files to Create**:
```
src/lib/di/
├── container.ts               # DI container
├── types.ts                   # DI types
└── providers.ts               # Service providers

src/lib/services/
├── PromptService.ts           # Business logic
├── AIExecutionService.ts      # AI execution
└── UsageTrackingService.ts    # Usage tracking

src/app/api/v2/                # New API routes with DI
├── prompts/
│   └── route.ts
└── ai/
    └── execute/
        └── route.ts
```

**Success Criteria**:
- ✅ Services receive dependencies via constructor
- ✅ Easy to test with mocked dependencies
- ✅ No direct instantiation in services
- ✅ Clear separation of concerns

---

### Phase 4: Strategy Pattern for Execution (Week 4)
**Goal**: Implement Strategy pattern for different execution modes

**Branch**: `refactor/strategy-pattern`

**Steps**:
1. Create execution strategy interface
2. Implement strategies (streaming, batch, cached)
3. Update services to use strategies
4. Add tests for each strategy
5. Deploy and test

**Files to Create**:
```
src/lib/strategies/
├── interfaces/
│   └── IExecutionStrategy.ts
├── implementations/
│   ├── StreamingStrategy.ts
│   ├── BatchStrategy.ts
│   └── CachedStrategy.ts
└── __tests__/
    ├── StreamingStrategy.test.ts
    └── CachedStrategy.test.ts
```

**Success Criteria**:
- ✅ Easy to add new execution strategies
- ✅ Strategies are interchangeable
- ✅ Clean separation of concerns

---

### Phase 5: Cleanup & Documentation (Week 5)
**Goal**: Remove old code, update docs

**Branch**: `refactor/cleanup`

**Steps**:
1. Delete old code (switch statements, direct DB calls)
2. Delete legacy files (`/data/playbooks.ts`)
3. Update architecture documentation
4. Update interview guide with real examples
5. Create migration guide
6. Add ADR (Architecture Decision Records)

**Files to Update**:
```
docs/development/
├── ARCHITECTURE.md            # Update with real patterns
├── INTERVIEW_GUIDE.md         # Update with honest examples
├── REFACTORING_JOURNEY.md     # Document the journey
└── ADR/
    ├── 001-ai-provider-interface.md
    ├── 002-repository-pattern.md
    ├── 003-dependency-injection.md
    └── 004-strategy-pattern.md
```

**Files to Delete**:
```
src/data/playbooks.ts          # 746 lines of dead code
src/lib/ai/client.ts           # Old switch statement version
```

---

## 🚀 Implementation Strategy

### Strangler Fig Pattern Steps:

1. **Build New Alongside Old**
   - Create new code in `/v2/` folders
   - Old code continues to work
   - No breaking changes

2. **Gradual Migration**
   - Migrate one route at a time
   - Test thoroughly before moving to next
   - Can rollback easily if issues

3. **Remove Old Code**
   - Only after 100% migration
   - Delete old files
   - Update imports

### Example Migration:

```typescript
// OLD (src/app/api/ai/execute/route.ts)
export async function POST(req: NextRequest) {
  // 271 lines of mixed concerns
  // Switch statement for providers
  // Direct MongoDB calls
  // Direct instantiation
}

// NEW (src/app/api/v2/ai/execute/route.ts)
export async function POST(req: NextRequest) {
  // Inject dependencies
  const aiService = container.get<AIExecutionService>('AIExecutionService');
  const usageService = container.get<UsageTrackingService>('UsageTrackingService');
  
  // Clean, single responsibility
  const result = await aiService.execute(request);
  await usageService.track(result);
  
  return NextResponse.json(result);
}
```

---

## 📊 Success Metrics

### Code Quality:
- ✅ All SOLID principles implemented
- ✅ 80%+ test coverage
- ✅ Zero direct instantiation in services
- ✅ Zero switch statements for polymorphism
- ✅ All database operations through repositories

### Production:
- ✅ 100% uptime during migration
- ✅ No performance degradation
- ✅ All existing features work
- ✅ Easy to rollback if needed

### Documentation:
- ✅ Architecture docs updated
- ✅ Interview guide updated with real examples
- ✅ ADRs document decisions
- ✅ Migration guide for team

---

## 🎯 Interview Talking Points

### Before Refactoring:
"I built this in 24 hours to prove rapid execution. The code is functional and well-organized, but I recognize it's not textbook SOLID. There are opportunities to refactor toward formal design patterns."

### During Refactoring:
"I'm currently refactoring using the Strangler Fig pattern. I'm introducing interfaces for AI providers, implementing the repository pattern for database operations, and adding dependency injection. This shows I can ship fast, then improve quality without breaking production."

### After Refactoring:
"I built this in 24 hours, then refactored over 5 weeks to implement SOLID principles. The codebase now has proper interfaces, dependency injection, and design patterns. This demonstrates both rapid execution and commitment to code quality."

---

## 📅 Timeline

### Week 1: AI Provider Interface
- Mon-Tue: Create interfaces and adapters
- Wed-Thu: Add tests and factory
- Fri: Deploy and test in production

### Week 2: Repository Pattern
- Mon-Tue: Create repository interfaces
- Wed-Thu: Implement MongoDB repositories
- Fri: Migrate first API route

### Week 3: Dependency Injection
- Mon-Tue: Create DI container
- Wed-Thu: Create service layer
- Fri: Migrate routes to use DI

### Week 4: Strategy Pattern
- Mon-Tue: Create strategy interfaces
- Wed-Thu: Implement strategies
- Fri: Deploy and test

### Week 5: Cleanup
- Mon-Tue: Delete old code
- Wed-Thu: Update documentation
- Fri: Final review and merge to main

---

## 🔍 Testing Strategy

### Unit Tests:
- Test each adapter in isolation
- Test repositories with mock database
- Test services with mock dependencies
- Test strategies independently

### Integration Tests:
- Test API routes with real dependencies
- Test database operations
- Test AI provider integration

### E2E Tests:
- Test full user flows
- Test all providers
- Test error handling

### Migration Tests:
- Test old and new code side by side
- Verify identical behavior
- Test rollback scenarios

---

## 🎓 Learning Outcomes

### What This Demonstrates:

1. **Rapid Execution**: Built in 24 hours
2. **Quality Focus**: Refactored for SOLID
3. **Risk Management**: Strangler Fig pattern
4. **Testing**: Comprehensive test coverage
5. **Documentation**: ADRs and guides
6. **Maturity**: Recognize and fix technical debt
7. **Production Mindset**: No breaking changes

### Interview Value:

**Before**: "I built this fast"
**After**: "I built this fast, recognized areas for improvement, and systematically refactored to enterprise standards while maintaining 100% uptime"

---

## 🚦 Getting Started

### Step 1: Create Branch
```bash
git checkout -b refactor/ai-provider-interface
```

### Step 2: Create Folder Structure
```bash
mkdir -p src/lib/ai/v2/{interfaces,adapters,factory,__tests__}
```

### Step 3: Start with Interface
Create `src/lib/ai/v2/interfaces/AIProvider.ts`

### Step 4: Implement First Adapter
Create `src/lib/ai/v2/adapters/OpenAIAdapter.ts`

### Step 5: Add Tests
Create `src/lib/ai/v2/__tests__/OpenAIAdapter.test.ts`

### Step 6: Repeat for Other Providers

---

## 📝 Commit Strategy

### Small, Focused Commits:
- "feat: add AIProvider interface"
- "feat: implement OpenAI adapter"
- "test: add OpenAI adapter tests"
- "feat: add provider factory"
- "refactor: migrate /api/ai/execute to use adapter"
- "docs: add ADR for provider interface"
- "chore: remove old switch statement code"

### Benefits:
- Easy to review
- Easy to rollback
- Clear history
- Shows thought process

---

## 🎯 Next Steps

1. **Review this plan** - Make sure it makes sense
2. **Create first branch** - `refactor/ai-provider-interface`
3. **Start with interface** - Define `AIProvider` interface
4. **Implement one adapter** - OpenAI first (simplest)
5. **Add tests** - 100% coverage for adapter
6. **Deploy alongside old** - No breaking changes
7. **Migrate one route** - Test thoroughly
8. **Repeat for other providers**

---

**Ready to start? Let's begin with Phase 1: AI Provider Interface!**
