# Engify.ai - Week 1 MVP Implementation Plan

**Goal**: Transform the current prototype into a working MVP with real functionality in 7 days.

---

## Day 1: Project Foundation & Setup

### Morning: Project Restructure (4 hours)

#### 1. Initialize Next.js 14 Project
```bash
# Create new Next.js 14 app with TypeScript
npx create-next-app@latest engify-ai-next --typescript --tailwind --app --src-dir

# Install core dependencies
pnpm add @google/generative-ai @anthropic-ai/sdk openai
pnpm add zustand @tanstack/react-query
pnpm add next-auth mongodb
pnpm add zod
pnpm add lucide-react class-variance-authority clsx tailwind-merge

# Install dev dependencies
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D prettier eslint-config-prettier
pnpm add -D @playwright/test
```

#### 2. Project Structure
```
/engify-ai-next
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── onboarding/
│   │   │   ├── pathways/
│   │   │   ├── learning-hub/
│   │   │   ├── playbooks/
│   │   │   ├── workbench/
│   │   │   └── settings/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── ai/
│   │   │   ├── prompts/
│   │   │   └── analytics/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── features/          # Feature-specific components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── ai/                # AI provider abstractions
│   │   ├── db/                # Database utilities
│   │   ├── auth/              # Auth utilities
│   │   └── utils/             # General utilities
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # Custom React hooks
│   └── config/                # Configuration files
├── python/                    # Python AI services (for local dev)
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── rag_service.py
│   │   └── embeddings.py
│   ├── utils/
│   └── requirements.txt
├── public/
│   └── data/                  # Static data (temporary)
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

#### 3. Environment Setup
```bash
# .env.example
# Database
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=engify_ai

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# AI Providers (User can add their own)
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# AWS (for later)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

### Afternoon: MongoDB Setup (4 hours)

#### 1. Create MongoDB Atlas Cluster
- Sign up for MongoDB Atlas
- Create free tier cluster (M0) on AWS
- Whitelist IP addresses
- Create database user
- Get connection string

#### 2. Database Schema Implementation
```typescript
// src/lib/db/schema.ts
import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  role: 'engineer' | 'manager' | 'director' | 'vp';
  createdAt: Date;
  settings: UserSettings;
  usage: UsageStats;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultProvider: 'gemini' | 'openai' | 'anthropic';
  apiKeys: {
    gemini?: EncryptedKey;
    openai?: EncryptedKey;
    anthropic?: EncryptedKey;
  };
}

export interface EncryptedKey {
  encrypted: string;
  isActive: boolean;
  lastUsed?: Date;
}

export interface UsageStats {
  totalPrompts: number;
  totalTokens: number;
  lastActive: Date;
}

export interface PromptTemplate {
  _id: ObjectId;
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  metadata: {
    author: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
  };
  usage: {
    count: number;
    avgRating: number;
  };
}

export interface Conversation {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  messages: Message[];
  metadata: {
    tool: string;
    templateId?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider: string;
  tokens?: number;
  cost?: number;
}
```

#### 3. Database Connection
```typescript
// src/lib/db/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across hot reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.DATABASE_NAME || 'engify_ai');
}

export default clientPromise;
```

---

## Day 2: Authentication & User Management

**Reference**: See [AUTH_AND_BILLING_STRATEGY.md](../strategy/AUTH_AND_BILLING_STRATEGY.md) for complete auth strategy.

### Morning: NextAuth.js v5 Setup (4 hours)

#### 1. Install and Configure NextAuth.js v5
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';
import { compare } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({
          email: credentials.email
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 2. Create Auth Components
```typescript
// src/components/features/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

### Afternoon: AI Provider Abstraction (4 hours)

#### 1. Create AI Provider Interface
```typescript
// src/lib/ai/types.ts
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  finishReason: string;
}

export interface AIProvider {
  name: string;
  models: string[];
  
  generateResponse(
    messages: AIMessage[],
    options?: AIOptions
  ): Promise<AIResponse>;
  
  generateStream(
    messages: AIMessage[],
    options?: AIOptions
  ): AsyncGenerator<string, void, unknown>;
  
  estimateCost(tokens: number): number;
}
```

#### 2. Implement Gemini Provider
```typescript
// src/lib/ai/providers/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIMessage, AIOptions, AIResponse } from '../types';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  models = ['gemini-2.0-flash-exp', 'gemini-1.5-pro'];
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(
    messages: AIMessage[],
    options: AIOptions = {}
  ): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash-exp',
    });

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
        topP: options.topP || 0.95,
      },
    });

    const response = result.response;
    const text = response.text();

    // Estimate tokens (Gemini doesn't provide exact counts)
    const promptTokens = this.estimateTokens(
      messages.map(m => m.content).join(' ')
    );
    const completionTokens = this.estimateTokens(text);

    return {
      content: text,
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
      cost: this.estimateCost(promptTokens + completionTokens),
      finishReason: 'stop',
    };
  }

  async *generateStream(
    messages: AIMessage[],
    options: AIOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = this.client.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash-exp',
    });

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContentStream({
      contents,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  estimateCost(tokens: number): number {
    // Gemini pricing (approximate)
    // Flash: $0.075 per 1M input tokens, $0.30 per 1M output tokens
    return (tokens / 1000000) * 0.1875; // Average
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}
```

#### 3. Create AI Orchestrator
```typescript
// src/lib/ai/orchestrator.ts
import { AIProvider, AIMessage, AIOptions, AIResponse } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

export class AIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();

  constructor(apiKeys: Record<string, string>) {
    if (apiKeys.gemini) {
      this.providers.set('gemini', new GeminiProvider(apiKeys.gemini));
    }
    if (apiKeys.openai) {
      this.providers.set('openai', new OpenAIProvider(apiKeys.openai));
    }
    if (apiKeys.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider(apiKeys.anthropic));
    }
  }

  async generateResponse(
    messages: AIMessage[],
    preferredProvider?: string,
    options?: AIOptions
  ): Promise<AIResponse> {
    const provider = this.selectProvider(preferredProvider);
    
    if (!provider) {
      throw new Error('No AI provider available');
    }

    return provider.generateResponse(messages, options);
  }

  async *generateStream(
    messages: AIMessage[],
    preferredProvider?: string,
    options?: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    const provider = this.selectProvider(preferredProvider);
    
    if (!provider) {
      throw new Error('No AI provider available');
    }

    yield* provider.generateStream(messages, options);
  }

  private selectProvider(preferredProvider?: string): AIProvider | undefined {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return this.providers.get(preferredProvider);
    }

    // Fallback to first available provider
    return this.providers.values().next().value;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
```

---

## Day 3-4: Core API Routes & Features

### API Routes Implementation

#### 1. Chat/Prompt Execution API
```typescript
// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db/mongodb';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { decryptApiKey } from '@/lib/utils/encryption';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages, provider, options } = await req.json();

    // Get user's API keys from database
    const db = await getDb();
    const user = await db.collection('users').findOne({
      email: session.user.email
    });

    if (!user?.settings?.apiKeys) {
      return NextResponse.json(
        { error: 'No API keys configured' },
        { status: 400 }
      );
    }

    // Decrypt API keys
    const apiKeys: Record<string, string> = {};
    for (const [provider, keyData] of Object.entries(user.settings.apiKeys)) {
      if (keyData.isActive) {
        apiKeys[provider] = await decryptApiKey(keyData.encrypted);
      }
    }

    // Create orchestrator and generate response
    const orchestrator = new AIOrchestrator(apiKeys);
    const response = await orchestrator.generateResponse(
      messages,
      provider,
      options
    );

    // Save conversation to database
    await db.collection('conversations').insertOne({
      userId: user._id,
      title: messages[0].content.substring(0, 50),
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          provider: response.provider,
          tokens: response.tokens.total,
          cost: response.cost,
        }
      ],
      metadata: {
        tool: 'workbench',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update usage stats
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $inc: {
          'usage.totalPrompts': 1,
          'usage.totalTokens': response.tokens.total,
        },
        $set: {
          'usage.lastActive': new Date(),
        },
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Streaming API
```typescript
// src/app/api/ai/stream/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db/mongodb';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { decryptApiKey } from '@/lib/utils/encryption';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, provider, options } = await req.json();

  // Get user's API keys
  const db = await getDb();
  const user = await db.collection('users').findOne({
    email: session.user.email
  });

  if (!user?.settings?.apiKeys) {
    return new Response('No API keys configured', { status: 400 });
  }

  const apiKeys: Record<string, string> = {};
  for (const [provider, keyData] of Object.entries(user.settings.apiKeys)) {
    if (keyData.isActive) {
      apiKeys[provider] = await decryptApiKey(keyData.encrypted);
    }
  }

  const orchestrator = new AIOrchestrator(apiKeys);

  // Create a ReadableStream for Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of orchestrator.generateStream(
          messages,
          provider,
          options
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
          );
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## Day 5-6: Frontend Integration & Polish

### React Query Setup
```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});
```

### Custom Hooks
```typescript
// src/hooks/useAIChat.ts
import { useMutation } from '@tanstack/react-query';
import { AIMessage, AIResponse } from '@/lib/ai/types';

interface ChatRequest {
  messages: AIMessage[];
  provider?: string;
  options?: any;
}

export function useAIChat() {
  return useMutation({
    mutationFn: async (request: ChatRequest): Promise<AIResponse> => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      return response.json();
    },
  });
}

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');

  const streamResponse = async (request: ChatRequest) => {
    setIsStreaming(true);
    setContent('');

    const response = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            setIsStreaming(false);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            setContent(prev => prev + parsed.content);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  };

  return { streamResponse, isStreaming, content };
}
```

---

## Day 7: Testing & Deployment

### Playwright E2E Tests
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/onboarding');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
```

### Deployment to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
```

---

## Migration Checklist

### Data Migration
- [ ] Export existing playbooks from `data/playbooks.ts` to MongoDB
- [ ] Export learning pathways to MongoDB
- [ ] Export articles from `public/data/articles.json` to MongoDB
- [ ] Create vector embeddings for RAG (Phase 2)

### Component Migration
- [ ] Migrate `App.tsx` to Next.js App Router layout
- [ ] Convert all components to use new API routes
- [ ] Update state management to use Zustand + React Query
- [ ] Implement loading and error states
- [ ] Add optimistic updates

### Testing
- [ ] Unit tests for AI providers
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user flows
- [ ] Load testing for AI endpoints

---

## Success Criteria

### Week 1 MVP Must-Haves
✅ User authentication (email/password + Google)  
✅ API key management (encrypted storage)  
✅ Multi-provider AI support (Gemini + OpenAI)  
✅ Prompt execution (chat + streaming)  
✅ Conversation history  
✅ Settings page  
✅ Responsive UI  
✅ Deployed to Vercel  

### Nice-to-Haves (if time permits)
- [ ] RAG implementation
- [ ] Usage analytics dashboard
- [ ] Prompt template search
- [ ] Export conversations
- [ ] Dark mode toggle

---

## Daily Standup Template

**What did I accomplish yesterday?**
- [List completed tasks]

**What will I work on today?**
- [List planned tasks]

**Any blockers?**
- [List any issues]

**Metrics:**
- Lines of code written:
- Tests added:
- Features completed:

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Status**: Ready for Execution
