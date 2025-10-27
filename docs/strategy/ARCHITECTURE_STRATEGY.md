# Engify.ai - Strategic Architecture & Implementation Plan

**Purpose**: Transform Engify.ai from a prototype into a production-ready, enterprise-grade AI platform that demonstrates VP-level technical leadership and strategic thinking.

**Target Timeline**: 1-week MVP → 4-week Production-Ready

---

## Executive Summary

Engify.ai is an **AI-powered engineering leadership platform** that helps teams transition from "AI Fear to AI Fluency." The platform includes:

- **Onboarding Journey**: Guided introduction to AI tools
- **Learning Pathways**: Curated learning experiences
- **Learning Hub**: Curated articles with AI-powered analysis
- **Prompt Playbooks**: 100+ role-specific prompt templates
- **AI Workbench**: Interactive tools for engineering leaders (OKRs, retrospectives, tech debt analysis, etc.)
- **Settings**: Multi-provider AI configuration (BYOK - Bring Your Own Keys)

### Current State Analysis

**Strengths:**
- ✅ Clear product vision and user experience
- ✅ Comprehensive prompt library (77k+ lines of curated content)
- ✅ Well-structured React components
- ✅ Modern UI with Tailwind CSS

**Critical Gaps:**
- ❌ Python files are corrupted/stub files (all API endpoints non-functional)
- ❌ No real database (using static JSON files)
- ❌ No authentication or user management
- ❌ No RAG implementation
- ❌ Single AI provider (Google Gemini only)
- ❌ No state management or data persistence
- ❌ No testing infrastructure
- ❌ No deployment strategy

---

## Strategic Technology Decisions

### 1. Database Architecture: **MongoDB Atlas** ✅

**Why MongoDB over PostgreSQL:**

| Requirement | MongoDB | PostgreSQL | Winner |
|------------|---------|------------|--------|
| **Flexible Schema** | Native JSON documents | JSONB columns | MongoDB |
| **Prompt Templates** | Natural nested structure | Requires normalization | MongoDB |
| **User Preferences** | Easy to evolve schema | Schema migrations needed | MongoDB |
| **Vector Search** | Native Atlas Vector Search | Requires pgvector extension | Tie |
| **AWS Integration** | Excellent (Atlas on AWS) | Good (RDS/Aurora) | MongoDB |
| **Rapid Iteration** | No migrations needed | Requires careful planning | MongoDB |
| **Developer Experience** | Intuitive for JSON-heavy apps | More boilerplate | MongoDB |

**Decision: MongoDB Atlas**
- **Reason**: Your data is inherently document-oriented (prompts, user configs, learning pathways)
- **Atlas Vector Search**: Built-in RAG capabilities without additional infrastructure
- **Flexible Schema**: Perfect for rapid MVP iteration
- **AWS Deployment**: MongoDB Atlas runs on AWS infrastructure
- **Cost**: Free tier for development, scales with usage

### 2. Hosting Architecture: **AWS (Multi-Service)**

**Recommended AWS Stack:**

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront (CDN)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              S3 + CloudFront (Next.js Static)                │
│                    OR Amplify Hosting                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway + Lambda                        │
│              (Next.js API Routes via SST)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Lambda Functions (Python AI Services)             │
│         - Prompt execution                                   │
│         - RAG retrieval                                      │
│         - Multi-provider AI orchestration                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (AWS)                       │
│         - User data                                          │
│         - Prompt templates                                   │
│         - Vector embeddings (RAG)                            │
└─────────────────────────────────────────────────────────────┘
```

**Why AWS over Vercel:**
- ✅ Full Python support via Lambda
- ✅ Better for portfolio/resume (enterprise standard)
- ✅ More control over infrastructure
- ✅ Cost-effective at scale
- ✅ Demonstrates cloud architecture skills

**Deployment Tool: SST (Serverless Stack)**
- Modern Infrastructure as Code
- Perfect for Next.js + Lambda
- Type-safe infrastructure
- Local development experience

### 3. AI Provider Strategy: **Multi-Provider with Abstraction Layer**

**Supported Providers (BYOK):**
1. **Google Gemini** (Primary - already integrated)
2. **OpenAI** (GPT-4, GPT-4o)
3. **Anthropic Claude** (Claude 3.5 Sonnet)
4. **AWS Bedrock** (Multiple models)
5. **Azure OpenAI** (Enterprise option)

**Architecture Pattern: Strategy Pattern + Adapter**

```typescript
interface AIProvider {
  name: string;
  generateResponse(prompt: string, options: AIOptions): Promise<AIResponse>;
  generateStream(prompt: string, options: AIOptions): AsyncGenerator<string>;
  estimateCost(prompt: string): number;
}

class AIOrchestrator {
  private providers: Map<string, AIProvider>;
  
  async execute(request: AIRequest): Promise<AIResponse> {
    const provider = this.selectProvider(request);
    return provider.generateResponse(request.prompt, request.options);
  }
  
  private selectProvider(request: AIRequest): AIProvider {
    // User preference > Cost optimization > Availability
  }
}
```

### 4. RAG Implementation: **MongoDB Atlas Vector Search**

**Why Atlas Vector Search:**
- ✅ No separate vector database needed
- ✅ Same database for structured + vector data
- ✅ Native integration with MongoDB queries
- ✅ Automatic index management
- ✅ Cost-effective (no Pinecone/Weaviate fees)

**RAG Architecture:**

```python
# Python Lambda Function
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

class RAGService:
    def __init__(self):
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client.engify
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
    
    async def retrieve_context(self, query: str, top_k: int = 5):
        # Generate embedding
        query_embedding = self.embedder.encode(query)
        
        # Vector search in MongoDB
        results = self.db.knowledge_base.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding.tolist(),
                    "numCandidates": 100,
                    "limit": top_k
                }
            }
        ])
        
        return list(results)
    
    async def augment_prompt(self, user_prompt: str, context_docs: list):
        context = "\n\n".join([doc['content'] for doc in context_docs])
        return f"Context:\n{context}\n\nUser Question:\n{user_prompt}"
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1 - MVP)

**Goal**: Working application with core features, mocked where necessary

#### Day 1-2: Project Setup & Architecture
- [ ] Migrate to Next.js 14 App Router structure
- [ ] Set up TypeScript strict mode
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Create environment configuration
- [ ] Set up MongoDB Atlas (free tier)
- [ ] Design database schema

#### Day 3-4: Core Features
- [ ] Implement authentication (NextAuth.js + MongoDB)
- [ ] Build API routes for AI interactions
- [ ] Create AI provider abstraction layer
- [ ] Implement basic prompt execution
- [ ] Add user settings (API key management)

#### Day 5-6: Polish & Integration
- [ ] Connect all UI components to real APIs
- [ ] Add loading states and error handling
- [ ] Implement basic analytics (Vercel Analytics)
- [ ] Create user onboarding flow
- [ ] Add dark mode support

#### Day 7: Testing & Documentation
- [ ] Write basic E2E tests (Playwright)
- [ ] Create deployment documentation
- [ ] Set up local development guide
- [ ] Deploy to Vercel (temporary hosting)

**Deliverable**: Working MVP on Vercel with MongoDB Atlas backend

---

### Phase 2: Production-Ready (Week 2-3)

#### Week 2: AWS Migration & RAG
- [ ] Set up AWS account and SST project
- [ ] Migrate Next.js to AWS (Amplify or S3+CloudFront)
- [ ] Create Python Lambda functions
- [ ] Implement RAG with Atlas Vector Search
- [ ] Add document ingestion pipeline
- [ ] Set up CloudWatch monitoring

#### Week 3: Multi-Provider & Advanced Features
- [ ] Implement OpenAI provider
- [ ] Implement Anthropic Claude provider
- [ ] Add AWS Bedrock integration
- [ ] Create provider selection logic
- [ ] Implement cost tracking
- [ ] Add usage analytics dashboard

---

### Phase 3: Enterprise Features (Week 4)

- [ ] Team management (multi-user support)
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Advanced RAG (hybrid search)
- [ ] Custom prompt templates
- [ ] API rate limiting
- [ ] Comprehensive testing suite
- [ ] Security audit

---

## Database Schema Design

### MongoDB Collections

**Note**: Schema designed for multi-tenant enterprise architecture. See [ENTERPRISE_STRATEGY.md](./ENTERPRISE_STRATEGY.md) for complete details.

#### 1. `organizations` (New - Enterprise)
```javascript
{
  _id: ObjectId,
  name: String,                    // "Acme Corporation"
  slug: String,                    // "acme-corp" (unique)
  domain: String,                  // "acme.com" (for SSO)
  plan: String,                    // 'free', 'pro', 'team', 'enterprise_starter', 'enterprise_pro', 'enterprise_premium'
  status: String,                  // 'active', 'trial', 'suspended'
  
  billing: {
    stripeCustomerId: String,
    contractStart: Date,
    contractEnd: Date,
    seats: Number,
    usedSeats: Number
  },
  
  sso: {
    enabled: Boolean,
    provider: String,              // 'okta', 'azure_ad', 'google_workspace'
    samlMetadataUrl: String
  },
  
  settings: {
    allowedDomains: [String],
    dataRetention: Number,         // Days
    auditLogRetention: Number      // Days
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. `users`
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  
  // Multi-tenant support
  organizationId: ObjectId,        // Primary organization (null for individual users)
  role: String,                    // 'member', 'manager', 'admin', 'owner' (within organization)
  jobRole: String,                 // 'engineer', 'manager', 'director', 'vp' (job function)
  department: String,
  
  createdAt: Date,
  settings: {
    theme: String,
    defaultProvider: String,
    apiKeys: {
      gemini: { encrypted: String, isActive: Boolean },
      openai: { encrypted: String, isActive: Boolean },
      anthropic: { encrypted: String, isActive: Boolean }
    }
  },
  usage: {
    totalPrompts: Number,
    totalTokens: Number,
    lastActive: Date
  }
}
```

#### 2. `prompt_templates`
```javascript
{
  _id: ObjectId,
  id: String, // e.g., 'eng-jun-code-navigator'
  category: String, // e.g., 'eng-junior'
  title: String,
  description: String,
  prompt: String,
  tags: [String],
  metadata: {
    author: String,
    version: String,
    createdAt: Date,
    updatedAt: Date
  },
  usage: {
    count: Number,
    avgRating: Number
  }
}
```

#### 3. `conversations`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  organizationId: ObjectId,        // For data isolation (null for individual users)
  title: String,
  
  // Enterprise: Sharing & visibility
  visibility: String,              // 'private', 'team', 'organization'
  sharedWith: [ObjectId],          // User IDs
  
  messages: [{
    role: String, // 'user' | 'assistant'
    content: String,
    timestamp: Date,
    provider: String,
    tokens: Number,
    cost: Number
  }],
  metadata: {
    tool: String, // 'workbench', 'playbook', etc.
    templateId: String,
    createdAt: Date,
    updatedAt: Date
  }
}
```

#### 4. `knowledge_base` (RAG)
```javascript
{
  _id: ObjectId,
  type: String, // 'article', 'documentation', 'prompt'
  title: String,
  content: String,
  embedding: [Float], // 384-dimensional vector
  metadata: {
    source: String,
    author: String,
    url: String,
    tags: [String],
    createdAt: Date
  },
  // Vector search index on 'embedding' field
}
```

#### 5. `learning_pathways`
```javascript
{
  _id: ObjectId,
  id: String,
  title: String,
  description: String,
  steps: [{
    id: Number,
    title: String,
    description: String,
    type: String,
    targetId: String,
    completed: Boolean
  }],
  metadata: {
    difficulty: String,
    estimatedTime: String,
    createdAt: Date
  }
}
```

#### 6. `analytics`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  organizationId: ObjectId,        // For enterprise analytics
  event: String, // 'prompt_executed', 'article_read', 'pathway_completed'
  data: Object,
  timestamp: Date,
  session: String
}
```

#### 7. `audit_logs` (New - Enterprise)
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,
  userId: ObjectId,
  action: String,                  // 'user.login', 'prompt.executed', 'settings.changed', 'user.invited'
  resource: String,                // 'user', 'conversation', 'settings', 'organization'
  resourceId: ObjectId,
  details: Object,                 // Action-specific details
  ipAddress: String,
  userAgent: String,
  timestamp: Date,
  retainUntil: Date               // Based on org retention policy
}
```

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js
- **Analytics**: Vercel Analytics / AWS CloudWatch

### Backend
- **API**: Next.js API Routes (Node.js)
- **AI Services**: Python Lambda Functions
- **Database**: MongoDB Atlas (AWS region)
- **Vector Search**: Atlas Vector Search
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Billing**: Stripe (subscriptions + usage-based)
- **Caching**: Redis (AWS ElastiCache) - Phase 2
- **Queue**: AWS SQS (for async jobs) - Phase 2

### AI/ML
- **Primary Provider**: Google Gemini
- **Multi-Provider**: OpenAI, Anthropic, AWS Bedrock
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **RAG**: LangChain (optional) or custom implementation

### Infrastructure
- **Hosting**: AWS (Amplify or S3+CloudFront)
- **Compute**: AWS Lambda
- **IaC**: SST (Serverless Stack)
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch + Sentry

### Development
- **Package Manager**: pnpm
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: ESLint + Prettier
- **Git Workflow**: Conventional Commits
- **Documentation**: Markdown + Storybook (Phase 3)

---

## Key Differentiators for Leadership Role

### 1. Strategic Thinking
- **Multi-provider architecture** shows vendor risk mitigation
- **BYOK model** demonstrates understanding of enterprise needs
- **Scalable database choice** shows long-term planning

### 2. Technical Depth
- **RAG implementation** shows ML/AI expertise
- **AWS infrastructure** demonstrates cloud architecture skills
- **Type-safe end-to-end** shows quality focus

### 3. Product Sense
- **User-centric design** (onboarding, pathways, workbench)
- **Freemium model** (BYOK = no API costs for you)
- **Viral potential** (prompt library is shareable)

### 4. Execution Excellence
- **Phased delivery** (MVP → Production → Enterprise)
- **Clear metrics** (usage, cost, performance)
- **Documentation-first** approach

---

## Success Metrics

### Technical Metrics
- **Performance**: < 2s page load, < 5s AI response
- **Reliability**: 99.9% uptime
- **Cost**: < $50/month for 1000 users (BYOK model)
- **Security**: SOC2-ready architecture

### Product Metrics
- **Activation**: 80% complete onboarding
- **Engagement**: 3+ prompts per user per week
- **Retention**: 60% weekly active users
- **NPS**: > 50

### Career Impact Metrics
- **GitHub Stars**: Target 500+ (shows community interest)
- **Blog Posts**: 3-5 technical deep-dives
- **Conference Talks**: Submit to 2-3 conferences
- **Case Studies**: Document 5+ real-world use cases

---

## Next Steps

### Immediate Actions (Today)
1. ✅ Review and approve this architecture document
2. Set up MongoDB Atlas account
3. Create AWS account (if not already)
4. Initialize Next.js 14 project structure
5. Design database schema in detail

### This Week
1. Implement Phase 1 (MVP)
2. Deploy to Vercel for quick validation
3. Get 5-10 beta users for feedback

### Next Month
1. Complete AWS migration
2. Implement RAG
3. Add multi-provider support
4. Launch publicly

---

## Questions for Discussion

1. **Scope**: Should we focus on engineering leaders only, or expand to PMs/designers?
2. **Monetization**: Freemium (BYOK) or SaaS (we provide API keys)?
3. **Open Source**: Should the prompt library be open-sourced for community growth?
4. **Enterprise**: Should Phase 3 include SSO, team management, and audit logs?

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Author**: Engineering Leadership  
**Status**: Pending Approval
