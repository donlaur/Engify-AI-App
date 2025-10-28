# Day 2 Refactoring Plan - AI Provider Interface

**Date**: October 28, 2025  
**Goal**: Implement real SOLID principles - AI Provider Interface  
**Time**: Today (continuing 500 commits/day pace)

---

## 🎯 Today's Mission

**Transform this:**
```typescript
// ❌ Switch statement (not SOLID)
switch (provider) {
  case 'openai': return sendOpenAIRequest();
  case 'claude': return sendAnthropicRequest();
}
```

**Into this:**
```typescript
// ✅ Interface-based (real SOLID)
const provider = factory.create('openai');
return provider.execute(request);
```

---

## 📋 Phase 1: AI Provider Interface (TODAY)

### Task 1: Create Branch ✅
```bash
git checkout -b refactor/ai-provider-interface
```

### Task 2: Create Folder Structure ✅
```bash
mkdir -p src/lib/ai/v2/{interfaces,adapters,factory,__tests__}
```

### Task 3: Write AIProvider Interface ✅
**File**: `src/lib/ai/v2/interfaces/AIProvider.ts`

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

### Task 4: Implement OpenAI Adapter ✅
**File**: `src/lib/ai/v2/adapters/OpenAIAdapter.ts`

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
      input: (usage.promptTokens / 1000000) * 0.50,
      output: (usage.completionTokens / 1000000) * 1.50,
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

### Task 5: Implement Claude Adapter ✅
**File**: `src/lib/ai/v2/adapters/ClaudeAdapter.ts`

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
      messages: [
        { role: 'user', content: request.prompt },
      ],
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

### Task 6: Implement Gemini Adapter ✅
**File**: `src/lib/ai/v2/adapters/GeminiAdapter.ts`

### Task 7: Implement Groq Adapter ✅
**File**: `src/lib/ai/v2/adapters/GroqAdapter.ts`

### Task 8: Create Factory ✅
**File**: `src/lib/ai/v2/factory/AIProviderFactory.ts`

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

### Task 9: Add Tests ✅
**File**: `src/lib/ai/v2/__tests__/OpenAIAdapter.test.ts`

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

### Task 10: Create New API Route (v2) ✅
**File**: `src/app/api/v2/ai/execute/route.ts`

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
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
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

### Task 11: Test Both Routes ✅
- Test old route: `/api/ai/execute` (still works)
- Test new route: `/api/v2/ai/execute` (uses interfaces)
- Compare responses (should be identical)

### Task 12: Update One Frontend Component ✅
**File**: `src/components/workbench/PromptExecutor.tsx`

Change from:
```typescript
const response = await fetch('/api/ai/execute', { ... });
```

To:
```typescript
const response = await fetch('/api/v2/ai/execute', { ... });
```

### Task 13: Deploy & Test ✅
- Deploy to Vercel
- Test in production
- Verify both routes work
- Monitor for errors

### Task 14: Document the Change ✅
**File**: `docs/development/ADR/001-ai-provider-interface.md`

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

## ✅ Success Criteria

- [ ] All adapters implement `AIProvider` interface
- [ ] Can swap providers by changing one string
- [ ] Factory creates providers correctly
- [ ] Tests pass for all adapters
- [ ] New API route works in production
- [ ] Old API route still works (no breaking changes)
- [ ] At least one component migrated to new route
- [ ] ADR documented

---

## 🚀 Commit Strategy

Small commits as we go:

1. `feat: add AIProvider interface`
2. `feat: implement OpenAI adapter`
3. `test: add OpenAI adapter tests`
4. `feat: implement Claude adapter`
5. `test: add Claude adapter tests`
6. `feat: implement Gemini adapter`
7. `feat: implement Groq adapter`
8. `feat: add AIProviderFactory`
9. `test: add factory tests`
10. `feat: add /api/v2/ai/execute route`
11. `refactor: migrate PromptExecutor to v2 API`
12. `docs: add ADR for provider interface`
13. `chore: deploy and test in production`

**Target**: 13 commits today (continuing our pace)

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

## 🎯 Next Steps (Tomorrow)

Once this is done, we can:
- Migrate more components to v2 API
- Remove old switch statement code
- Add more providers (Perplexity, Together, Mistral)
- Implement streaming support
- Add caching layer

**But today: Just get the interface working!**

---

**Ready? Let's start with Task 1: Create the branch!**
