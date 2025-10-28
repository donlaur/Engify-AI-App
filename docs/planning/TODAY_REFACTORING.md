# Daily Refactoring Plan - AI Provider Interface

**Date**: October 28, 2025  
**Goal**: Implement real SOLID principles - AI Provider Interface  
**Approach**: One phase at a time, complete before moving to next

---

## 📖 How This Plan Works

### Daily Workflow

1. **Focus on Current Phase Only** - Don't jump ahead
2. **Check off tasks as you complete them** - Use ☐ → ☑
3. **Follow the order indicators**:
   - **Sequential** = Must complete before next task
   - **Parallel** = Can work on simultaneously with other parallel tasks
4. **Commit after each task** - Small, focused commits
5. **Check success criteria** - All must be ☑ before moving to next phase

### Task Order Rules

- **Sequential tasks**: Complete in order, one at a time
- **Parallel tasks**: Can work on multiple at once (e.g., all adapters)
- **Never skip ahead**: Finish current phase 100% before starting next

---

## 🎯 Today's Mission

**Transform this:**

```typescript
// ❌ Switch statement (not SOLID)
switch (provider) {
  case 'openai':
    return sendOpenAIRequest();
  case 'claude':
    return sendAnthropicRequest();
}
```

**Into this:**

```typescript
// ✅ Interface-based (real SOLID)
const provider = factory.create('openai');
return provider.execute(request);
```

---

## 📋 Phase 1: AI Provider Interface (CURRENT PHASE)

### ☐ Create Branch

**File/Command**: `git checkout -b refactor/ai-provider-interface`  
**Order**: Sequential (must be first)

### ☐ Create Folder Structure

**Command**: `mkdir -p src/lib/ai/v2/{interfaces,adapters,factory,__tests__}`  
**Order**: Sequential (after branch creation)

### ☐ Write AIProvider Interface

**File**: `src/lib/ai/v2/interfaces/AIProvider.ts`  
**Order**: Sequential (foundation for adapters)

```typescript
export interface AIProvider {
  readonly name: string;
  readonly provider: string;

  execute(request: AIRequest): Promise<AIResponse>;
  validateRequest(request: AIRequest): boolean;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  provider: string;
  model: string;
}
```

### ☐ Implement OpenAI Adapter

**File**: `src/lib/ai/v2/adapters/OpenAIAdapter.ts`  
**Order**: Sequential (after interface)

```typescript
import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

export class OpenAIAdapter implements AIProvider {
  readonly name = 'OpenAI';
  readonly provider = 'openai';

  private client: OpenAI;
  private model: string;

  constructor(model: string = 'gpt-3.5-turbo') {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = model;
  }

  validateRequest(request: AIRequest): boolean {
    if (!request.prompt || request.prompt.length === 0) {
      return false;
    }
    if (request.maxTokens && request.maxTokens > 4096) {
      return false;
    }
    return true;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    });

    const latency = Date.now() - startTime;

    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    // Cost calculation (GPT-3.5-turbo: $0.50/$1.50 per 1M tokens)
    const cost = {
      input: (usage.promptTokens / 1000000) * 0.5,
      output: (usage.completionTokens / 1000000) * 1.5,
      total: 0,
    };
    cost.total = cost.input + cost.output;

    return {
      content: response.choices[0]?.message?.content || '',
      usage,
      cost,
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
```

### ☐ Implement Claude Adapter

**File**: `src/lib/ai/v2/adapters/ClaudeAdapter.ts`  
**Order**: Parallel (can do with other adapters)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

export class ClaudeAdapter implements AIProvider {
  readonly name = 'Claude';
  readonly provider = 'anthropic';

  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = model;
  }

  validateRequest(request: AIRequest): boolean {
    if (!request.prompt || request.prompt.length === 0) {
      return false;
    }
    return true;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens ?? 2000,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const latency = Date.now() - startTime;

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    const usage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    // Cost calculation (Claude Haiku: $0.25/$1.25 per 1M tokens)
    const cost = {
      input: (usage.promptTokens / 1000000) * 0.25,
      output: (usage.completionTokens / 1000000) * 1.25,
      total: 0,
    };
    cost.total = cost.input + cost.output;

    return {
      content: text,
      usage,
      cost,
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
```

### ☐ Implement Gemini Adapter

**File**: `src/lib/ai/v2/adapters/GeminiAdapter.ts`  
**Order**: Parallel (can do with other adapters)

### ☐ Implement Groq Adapter

**File**: `src/lib/ai/v2/adapters/GroqAdapter.ts`  
**Order**: Parallel (can do with other adapters)

### ☐ Create Factory

**File**: `src/lib/ai/v2/factory/AIProviderFactory.ts`  
**Order**: Sequential (after all adapters complete)

```typescript
import { AIProvider } from '../interfaces/AIProvider';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { GroqAdapter } from '../adapters/GroqAdapter';

export class AIProviderFactory {
  private static providers: Map<string, () => AIProvider> = new Map([
    ['openai', () => new OpenAIAdapter()],
    ['openai-gpt4', () => new OpenAIAdapter('gpt-4')],
    ['claude', () => new ClaudeAdapter()],
    ['claude-sonnet', () => new ClaudeAdapter('claude-3-5-sonnet-20241022')],
    ['gemini', () => new GeminiAdapter()],
    ['groq', () => new GroqAdapter()],
  ]);

  static create(providerName: string): AIProvider {
    const factory = this.providers.get(providerName);
    if (!factory) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return factory();
  }

  static register(name: string, factory: () => AIProvider): void {
    this.providers.set(name, factory);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
```

### ☐ Add Tests

**File**: `src/lib/ai/v2/__tests__/OpenAIAdapter.test.ts` (and others)  
**Order**: Parallel (can write tests alongside adapters)

```typescript
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { AIRequest } from '../interfaces/AIProvider';

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;

  beforeEach(() => {
    adapter = new OpenAIAdapter();
  });

  it('should implement AIProvider interface', () => {
    expect(adapter.name).toBe('OpenAI');
    expect(adapter.provider).toBe('openai');
    expect(typeof adapter.execute).toBe('function');
    expect(typeof adapter.validateRequest).toBe('function');
  });

  it('should validate requests correctly', () => {
    const validRequest: AIRequest = {
      prompt: 'Hello',
    };
    expect(adapter.validateRequest(validRequest)).toBe(true);

    const invalidRequest: AIRequest = {
      prompt: '',
    };
    expect(adapter.validateRequest(invalidRequest)).toBe(false);
  });

  // Add more tests for execute() with mocked OpenAI client
});
```

### ☐ Create New API Route (v2)

**File**: `src/app/api/v2/ai/execute/route.ts`  
**Order**: Sequential (after factory is complete)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

const executeSchema = z.object({
  prompt: z.string().min(1).max(10000),
  provider: z.string().default('openai'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4096).default(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request = executeSchema.parse(body);

    // Create provider using factory
    const provider = AIProviderFactory.create(request.provider);

    // Validate request
    if (!provider.validateRequest(request)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Execute
    const response = await provider.execute(request);

    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage,
      cost: response.cost,
      latency: response.latency,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    console.error('AI execution error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### ☐ Test Both Routes

- Test old route: `/api/ai/execute` (still works)
- Test new route: `/api/v2/ai/execute` (uses interfaces)
- Compare responses (should be identical)  
  **Order**: Sequential (after API route is created)

### ☐ Update One Frontend Component

**File**: `src/components/workbench/PromptExecutor.tsx`  
**Order**: Sequential (after routes are tested)

Change from:

```typescript
const response = await fetch('/api/ai/execute', { ... });
```

To:

```typescript
const response = await fetch('/api/v2/ai/execute', { ... });
```

### ☐ Deploy & Test

- Deploy to Vercel
- Test in production
- Verify both routes work
- Monitor for errors  
  **Order**: Sequential (after component update)

### ☐ Document the Change

**File**: `docs/development/ADR/001-ai-provider-interface.md`  
**Order**: Parallel (can document throughout process)

```markdown
# ADR 001: AI Provider Interface

**Status**: Implemented  
**Date**: October 28, 2025  
**Author**: Donnie Laur

## Context

Original implementation used switch statements to route to different AI providers. This violated the Open/Closed Principle and made it hard to add new providers.

## Decision

Implement a common `AIProvider` interface that all providers implement. Use Factory pattern for instantiation.

## Consequences

**Positive:**

- Easy to add new providers (just implement interface)
- Easy to test (can mock interface)
- True polymorphism (Liskov Substitution)
- Clean separation of concerns

**Negative:**

- More files to maintain
- Slightly more complex for simple cases

## Implementation

- Interface: `src/lib/ai/v2/interfaces/AIProvider.ts`
- Adapters: `src/lib/ai/v2/adapters/*.ts`
- Factory: `src/lib/ai/v2/factory/AIProviderFactory.ts`
- New API: `/api/v2/ai/execute`

## Migration

Old route `/api/ai/execute` still works. Gradually migrate components to use `/api/v2/ai/execute`. Once all migrated, remove old route.
```

---

## ✅ Phase 1 Success Criteria

- ☐ All adapters implement `AIProvider` interface
- ☐ Can swap providers by changing one string
- ☐ Factory creates providers correctly
- ☐ Tests pass for all adapters
- ☐ New API route works in production
- ☐ Old API route still works (no breaking changes)
- ☐ At least one component migrated to new route
- ☐ ADR documented

**Phase Complete When**: All checkboxes above are checked ✓

---

## 🚀 Commit Strategy

Small, focused commits as we complete each task:

- ☐ `feat: add AIProvider interface`
- ☐ `feat: implement OpenAI adapter`
- ☐ `test: add OpenAI adapter tests`
- ☐ `feat: implement Claude adapter`
- ☐ `test: add Claude adapter tests`
- ☐ `feat: implement Gemini adapter`
- ☐ `feat: implement Groq adapter`
- ☐ `feat: add AIProviderFactory`
- ☐ `test: add factory tests`
- ☐ `feat: add /api/v2/ai/execute route`
- ☐ `refactor: migrate PromptExecutor to v2 API`
- ☐ `docs: add ADR for provider interface`
- ☐ `chore: deploy and test in production`

**Commit After Each Task**: Check off as you go

---

## 📊 What This Proves

**Before**: "I use switch statements"  
**After**: "I implement the Strategy pattern with interface-based polymorphism"

**Before**: "I can't easily add providers"  
**After**: "Adding a provider is just implementing the interface"

**Before**: "Hard to test"  
**After**: "Easy to test with mocks"

**Interview Impact**: Shows you can refactor toward SOLID principles, not just talk about them.

---

## 🎯 Future Phases (After Phase 1 Complete)

### Phase 2: Repository Pattern for Database

- Abstract database operations
- Implement MongoDB repositories
- Add dependency injection
- **Start only after Phase 1 is 100% complete**

### Phase 3: Dependency Injection

- Create service layer with DI
- Update API routes to receive dependencies
- Create DI container
- **Start only after Phase 2 is 100% complete**

### Phase 4: Strategy Pattern for Execution

- Create execution strategy interface
- Implement strategies (streaming, batch, cached)
- **Start only after Phase 3 is 100% complete**

### Phase 5: Cleanup & Documentation

- Remove old code
- Update architecture docs
- Create migration guides
- **Start only after Phase 4 is 100% complete**

---

## 🚦 Current Focus

**PHASE 1 ONLY** - Complete all Phase 1 tasks before moving to Phase 2.

**Next Task**: Create the branch (`git checkout -b refactor/ai-provider-interface`)

---

## 📋 Quick Reference

### Phase 1 Task Checklist

- ☐ Create Branch (Sequential)
- ☐ Create Folder Structure (Sequential)
- ☐ Write AIProvider Interface (Sequential)
- ☐ Implement OpenAI Adapter (Sequential)
- ☐ Implement Claude Adapter (Parallel)
- ☐ Implement Gemini Adapter (Parallel)
- ☐ Implement Groq Adapter (Parallel)
- ☐ Create Factory (Sequential)
- ☐ Add Tests (Parallel)
- ☐ Create New API Route (Sequential)
- ☐ Test Both Routes (Sequential)
- ☐ Update One Component (Sequential)
- ☐ Deploy & Test (Sequential)
- ☐ Document the Change (Parallel)

### Progress Tracker

**Phase 1**: ☐ Not Started | ⏳ In Progress | ✅ Complete  
**Phase 2**: 🔒 Locked (complete Phase 1 first)  
**Phase 3**: 🔒 Locked (complete Phase 2 first)  
**Phase 4**: 🔒 Locked (complete Phase 3 first)  
**Phase 5**: 🔒 Locked (complete Phase 4 first)
