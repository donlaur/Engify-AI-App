# Test Coverage Gaps Analysis

**Current Status**: 523 tests total (506 passing, 17 skipped)
**Target**: ~600 tests
**Gap**: ~77 tests needed

## Current Test Coverage

### ✅ **Well Tested** (Already Has Tests)

- ✅ API Routes: `/api/v2/ai/execute`, `/api/v2/users`, `/api/stats`, `/api/rag`
- ✅ AI Providers: OpenAI, Claude, Gemini, Groq (all adapters + factory)
- ✅ Execution Strategies: Cache, Streaming, Batch, Hybrid
- ✅ Services: Activity, Favorite, Notification, AuditLog
- ✅ Repositories: User, Prompt (CRUD operations)
- ✅ CQRS: Bus, Handlers, Registration
- ✅ Messaging: MessageQueue, MessageBroker, QStash
- ✅ Events: EventSourcing, EventBus
- ✅ Cache: System, Adapters, Strategies
- ✅ Resilience: CircuitBreaker
- ✅ Components: Header, PromptCard, LoadingSpinner, EmptyState
- ✅ Security: Sanitizer

### ❌ **Missing Tests** (~77 needed to reach 600)

#### **1. API Routes (Priority: High) - ~40 tests needed**

**Auth & Access:**

- ❌ `/api/access-request` (POST) - 3 tests
- ❌ `/api/auth/signup` (POST) - 5 tests
- ❌ `/api/auth/mfa/enable` (POST) - 4 tests
- ❌ `/api/auth/mfa/verify` (POST) - 4 tests
- ❌ `/api/auth/mfa/disable` (POST) - 3 tests
- ❌ `/api/auth/mfa/status` (GET) - 2 tests
- ❌ `/api/auth/mfa/send-code` (POST) - 3 tests

**User Management:**

- ❌ `/api/user/stats` (GET) - 5 tests
- ❌ `/api/user/onboarding` (POST) - 4 tests
- ❌ `/api/v2/users/[id]` (GET, PATCH, DELETE) - 9 tests
- ❌ `/api/v2/users/api-keys` (GET, POST) - 6 tests
- ❌ `/api/v2/users/api-keys/[keyId]/rotate` (POST) - 4 tests
- ❌ `/api/v2/users/api-keys/[keyId]/revoke` (POST) - 3 tests
- ❌ `/api/v2/users/api-keys/usage` (GET) - 3 tests

**Content & Learning:**

- ❌ `/api/prompts` (GET, POST) - 6 tests
- ❌ `/api/prompts/[id]` (GET, PATCH) - 6 tests
- ❌ `/api/prompts/favorites` (GET, POST, DELETE) - 5 tests
- ❌ `/api/prompts/history` (GET) - 3 tests
- ❌ `/api/learning` (GET) - 3 tests
- ❌ `/api/learning/[slug]` (GET) - 3 tests
- ❌ `/api/tags` (GET, POST) - 4 tests

**Analytics & Jobs:**

- ❌ `/api/analytics/track` (POST) - 4 tests
- ❌ `/api/jobs/cleanup` (POST) - 2 tests
- ❌ `/api/jobs/daily-usage-report` (POST) - 2 tests
- ❌ `/api/jobs/weekly-digest` (POST) - 2 tests
- ❌ `/api/jobs/monthly-analytics` (POST) - 2 tests
- ❌ `/api/jobs/check-usage-alerts` (POST) - 2 tests

**Integrations:**

- ❌ `/api/github/connect` (GET) - 3 tests
- ❌ `/api/github/callback` (GET) - 4 tests
- ❌ `/api/github/repos` (GET) - 3 tests
- ❌ `/api/github/code-context` (POST) - 4 tests
- ❌ `/api/jira/connect` (POST) - 3 tests
- ❌ `/api/test-connection` (GET, POST) - 4 tests

**Other:**

- ❌ `/api/chat` (POST) - 5 tests
- ❌ `/api/email` (GET, POST) - 6 tests
- ❌ `/api/health` (GET) - 3 tests
- ❌ `/api/v2/execution` (GET, POST) - 8 tests
- ❌ `/api/manager/dashboard` (GET) - 4 tests
- ❌ `/api/manager/team/[teamId]` (GET, PATCH) - 5 tests
- ❌ `/api/messaging/[queueName]/process` (POST) - 4 tests
- ❌ `/api/messaging/[queueName]/callback` (POST) - 4 tests
- ❌ `/api/research/gemini` (POST) - 4 tests
- ❌ `/api/trpc/[trpc]` (GET, POST) - 5 tests
- ❌ `/api/webhooks/sendgrid` (POST) - 3 tests
- ❌ `/api/webhooks/twilio` (POST) - 3 tests

#### **2. Components (Priority: Medium) - ~15 tests needed**

**Workbench Components:**

- ❌ `WorkbenchToolbar` - 3 tests
- ❌ `PromptOptimizer` - 4 tests
- ❌ `OKRWorkbench` - 4 tests
- ❌ `ROICalculator` - 4 tests

**Profile Components:**

- ❌ `CareerContextSelector` - 3 tests
- ❌ `ProfileForm` - 4 tests
- ❌ `ApiKeyManager` - 5 tests

**Dashboard Components:**

- ❌ `UsageDashboard` - 4 tests
- ❌ `ManagerDashboard` - 4 tests
- ❌ `CareerProgressCard` - 3 tests

**Feature Components:**

- ❌ `PromptDetailModal` - 4 tests
- ❌ `ImpersonationBanner` - 3 tests

#### **3. Services (Priority: Medium) - ~12 tests needed**

- ❌ `PromptService` additional edge cases - 4 tests
- ❌ `UsageTrackingService` - 5 tests
- ❌ `EmailService` - 3 tests (if exists)

#### **4. Utilities & Helpers (Priority: Low) - ~10 tests needed**

- ❌ Date/time formatters - 2 tests
- ❌ String sanitization utilities - 2 tests
- ❌ Validation helpers - 3 tests
- ❌ Error formatters - 3 tests

---

## Testing Priority Matrix

### **Phase 1: Critical API Routes** (~25 tests)

Focus on routes that handle user data, auth, and core functionality:

1. `/api/auth/*` - 23 tests
2. `/api/user/*` - 9 tests
3. `/api/v2/users/[id]` and API keys - 25 tests
4. `/api/prompts/*` - 14 tests

### **Phase 2: Business Logic Routes** (~20 tests)

1. `/api/v2/execution` - 8 tests
2. `/api/manager/*` - 9 tests
3. `/api/jobs/*` - 10 tests

### **Phase 3: Integration Routes** (~15 tests)

1. `/api/github/*` - 14 tests
2. `/api/jira/connect` - 3 tests
3. `/api/webhooks/*` - 6 tests

### **Phase 4: Component Tests** (~15 tests)

Focus on interactive components with business logic

### **Phase 5: Utilities** (~10 tests)

Fill in utility function coverage

---

## Quick Wins (Can Add Today)

1. **Health & Simple Routes** (~10 tests)
   - `/api/health` - 3 tests
   - `/api/test-connection` - 4 tests
   - Simple GET endpoints - 3 tests

2. **Component Unit Tests** (~15 tests)
   - Workbench components (already have UI, just need tests)
   - Dashboard components

3. **Service Edge Cases** (~12 tests)
   - Existing services need more edge case coverage

---

## Recommended Order

1. ✅ Start with `/api/auth/*` (23 tests) - Critical security path
2. ✅ Add `/api/v2/users/[id]` and API keys (25 tests) - Core user management
3. ✅ Add `/api/prompts/*` (14 tests) - Core content features
4. ✅ Add `/api/v2/execution` (8 tests) - Execution strategy API
5. ✅ Fill in component tests (15 tests)
6. ✅ Utilities and edge cases (22 tests)

**Total**: ~107 tests (exceeds 77 target, provides buffer)

---

## Notes

- All new tests should follow existing patterns:
  - Mock external dependencies (DB, APIs)
  - Use Zod schemas for validation testing
  - Test RBAC enforcement
  - Test error handling paths
  - Include correlationIds in responses

- Focus on **business-critical** paths first
- Component tests can use React Testing Library
- API route tests should test both success and error paths
