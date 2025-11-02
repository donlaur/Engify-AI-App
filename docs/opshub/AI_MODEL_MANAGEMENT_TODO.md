# OpsHub - AI Model Management (TODO)

**Status:** Planned (connects to existing architecture)  
**Priority:** Medium (needed for content publishing system)  
**Related:** Content publishing pipeline refactoring

---

## Overview

Create an OpsHub admin interface for managing allowed AI models across the platform.

### Current State

- Models are hardcoded in `AIProviderFactory`
- Each provider adapter has specific models baked in
- No dynamic updates when providers release new models
- No central place to see what's available/deprecated

### Planned State

- **OpsHub Admin Panel** with model management
- **Pull from providers** (OpenAI, Anthropic, Google APIs)
- **Track deprecations** via news sources/provider announcements
- **Centralized allowlist** that all services use
- **Version tracking** (know when models are sunset)

---

## Why This Matters Now

### Content Publishing System Needs It

The multi-agent content publishing system currently has:

```typescript
// Hardcoded models (pre-commit hook flags this)
{
  role: 'content_generator',
  model: 'gpt-4-turbo-preview',  // ⚠️ Hardcoded
  provider: 'openai',              // ⚠️ Separate from factory
}
```

**Should be:**

```typescript
{
  role: 'content_generator',
  modelId: 'openai-gpt4-turbo',    // ✅ References allowlist
}
```

### Benefits

1. **Compliance:** Passes pre-commit hooks
2. **Flexibility:** Change models without code changes
3. **Updates:** Know when models are deprecated
4. **Cost tracking:** See which models are most expensive
5. **Performance:** Compare model speeds and quality

---

## Architecture

### Database Schema

```typescript
// Model Registry
interface AIModel {
  id: string; // 'openai-gpt4-turbo'
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  modelName: string; // 'gpt-4-turbo-preview'
  displayName: string; // 'GPT-4 Turbo'
  status: 'active' | 'deprecated' | 'sunset';
  deprecationDate?: Date;
  sunsetDate?: Date;
  capabilities: string[]; // ['text', 'function-calling', 'json-mode']
  contextWindow: number; // 128000
  costPer1kInput: number; // $0.01
  costPer1kOutput: number; // $0.03
  averageLatency: number; // ms
  qualityScore?: number; // 1-10 based on evals
  lastVerified: Date; // When we last checked it works
  isAllowed: boolean; // Admin toggle
  tags: string[]; // ['fast', 'expensive', 'smart']
}

// Model News/Updates
interface ModelUpdate {
  id: string;
  modelId: string;
  type: 'release' | 'deprecation' | 'sunset' | 'price-change';
  title: string;
  description: string;
  sourceUrl: string;
  effectiveDate: Date;
  createdAt: Date;
}
```

### API Sources

1. **OpenAI API** - `/models` endpoint
2. **Anthropic API** - Model list from SDK
3. **Google AI** - Gemini model versions
4. **Provider Blogs** - RSS feeds for announcements
5. **Manual Admin Updates** - Override/additions

### OpsHub UI

```
┌─────────────────────────────────────────────────────┐
│  OpsHub → AI Models                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔄 Sync from Providers    📊 View Analytics       │
│                                                     │
│  ┌─ Active Models (12) ──────────────────────────┐ │
│  │                                                │ │
│  │ ✅ GPT-4 Turbo                                 │ │
│  │    openai-gpt4-turbo                          │ │
│  │    $0.01/1k in, $0.03/1k out                  │ │
│  │    128k context                               │ │
│  │    [Edit] [Deprecate] [Analytics]             │ │
│  │                                                │ │
│  │ ✅ Claude 3.5 Sonnet                          │ │
│  │    claude-sonnet                              │ │
│  │    $0.003/1k in, $0.015/1k out               │ │
│  │    200k context                               │ │
│  │    [Edit] [Deprecate] [Analytics]             │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Deprecated Models (3) ────────────────────────┐ │
│  │                                                │ │
│  │ ⚠️  GPT-3.5 Turbo (1106)                       │ │
│  │    Sunset: Jan 2026                           │ │
│  │    [View Details] [Migrate Guide]             │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Recent Updates (5) ───────────────────────────┐ │
│  │                                                │ │
│  │ 📢 Nov 2: Gemini 2.0 Flash released           │ │
│  │ 📢 Oct 30: Claude 3.5 Sonnet updated          │ │
│  │ ⚠️  Oct 15: GPT-3.5 deprecation announced     │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database & Basic CRUD

- [ ] Create `ai_models` collection in MongoDB
- [ ] Create `model_updates` collection
- [ ] Build API routes: `/api/admin/ai-models`
- [ ] Basic CRUD operations

### Phase 2: Provider Sync

- [ ] Implement OpenAI sync (fetch /models)
- [ ] Implement Anthropic sync (from SDK)
- [ ] Implement Google sync (Gemini versions)
- [ ] Scheduled job: Daily sync
- [ ] Detect new models automatically

### Phase 3: News Monitoring

- [ ] RSS feed monitoring (OpenAI, Anthropic blogs)
- [ ] Webhook handlers for provider notifications
- [ ] Manual update interface for admins
- [ ] Email alerts for deprecations

### Phase 4: OpsHub UI

- [ ] Model list page with filters
- [ ] Model details/edit page
- [ ] Deprecation workflow
- [ ] Analytics dashboard
- [ ] Cost tracking integration

### Phase 5: Integration

- [ ] Update `AIProviderFactory` to use allowlist
- [ ] Update content publishing system
- [ ] Update any hardcoded model references
- [ ] Pre-commit hook: Check against allowlist

---

## Usage After Implementation

### For Content Publishing System

```typescript
// Before (hardcoded)
{
  role: 'content_generator',
  model: 'gpt-4-turbo-preview',
  provider: 'openai',
}

// After (from allowlist)
{
  role: 'content_generator',
  modelId: await getModelId('openai', 'gpt-4-turbo'), // From allowlist
}

// Or even better (role-based selection)
{
  role: 'content_generator',
  modelId: await selectBestModelForRole('content-generation', {
    maxCost: 0.05,      // Budget constraint
    minQuality: 8,      // Quality threshold
    capabilities: ['json-mode'], // Required features
  }),
}
```

### For Admins

```typescript
// Check if model is still supported
const gpt4Turbo = await getModel('openai-gpt4-turbo');
if (gpt4Turbo.status === 'deprecated') {
  console.warn(`Model deprecated on ${gpt4Turbo.deprecationDate}`);
  console.log(`Suggested replacement: ${gpt4Turbo.replacementId}`);
}

// Get all active models for a provider
const openaiModels = await getActiveModels({ provider: 'openai' });

// Track usage costs
const usageStats = await getModelUsageStats('openai-gpt4-turbo', {
  from: '2025-11-01',
  to: '2025-11-30',
});
console.log(`Total cost: $${usageStats.totalCost}`);
console.log(`Total tokens: ${usageStats.totalTokens}`);
```

---

## Connection to Existing Plans

### Related Documents

- Content Publishing System (needs this)
- AIProviderFactory (will be updated)
- Pre-commit hooks (check against allowlist)
- Cost tracking (uses model pricing data)

### Existing Architecture

```
AIProviderFactory (current)
└─> Hardcoded models
    └─> OpenAIAdapter('gpt-4-turbo-preview')
    └─> ClaudeAdapter('claude-3-5-sonnet')

AIProviderFactory (future)
└─> Query allowlist
    └─> ModelRegistry.getModel('openai-gpt4-turbo')
    └─> Returns: provider adapter + model name + config
```

---

## Cost/Benefit Analysis

### Development Cost

- **Phase 1-2:** 8-12 hours (database + basic sync)
- **Phase 3-4:** 12-16 hours (news monitoring + UI)
- **Phase 5:** 4-6 hours (integration + refactoring)
- **Total:** ~30-40 hours

### Benefits

- ✅ **Compliance:** No more hardcoded models
- ✅ **Flexibility:** Change models without code deploy
- ✅ **Cost tracking:** Know exactly what you're spending
- ✅ **Deprecation alerts:** Never caught off guard
- ✅ **Quality comparison:** A/B test different models
- ✅ **Professional:** Systematic model management

### ROI

- Avoid broken deployments when models sunset
- Optimize costs by selecting cheapest model for task
- Faster iteration (no code changes to switch models)
- Better visibility for financial planning

---

## MVP (Minimum Viable Product)

**Goal:** Get content publishing system working

**Scope:**

1. Simple `ai_models` collection in MongoDB
2. Manual admin UI to add/edit models
3. API endpoint: `GET /api/admin/ai-models`
4. Update content publishing to use model IDs
5. Pre-commit hook passes

**Timeline:** 1-2 days

**Future Enhancements:**

- Automated provider sync
- News monitoring
- Analytics dashboard
- Cost optimization recommendations

---

## Next Steps

1. **Immediate:** Create this as a GitHub issue/ticket
2. **Week 1:** Implement MVP (manual model registry)
3. **Week 2:** Refactor content publishing system
4. **Week 3:** Add automated sync
5. **Week 4:** Build full OpsHub UI

---

**Status:** Documented, ready for implementation  
**Owner:** TBD  
**Priority:** Medium (blocks content system deployment)  
**Estimated Effort:** 30-40 hours for full version, 8-12 for MVP

**Related Issues:**

- Content publishing system refactoring
- Pre-commit hook compliance
- Cost tracking improvements
