# Architecture Decision Records (ADRs)

**Purpose**: Document every major technical and strategic decision with rationale, alternatives considered, and consequences. This ensures consistency across AI models, team members, and future development.

---

## How to Use This Document

**For AI Models**: Read this FIRST before making any architectural changes. Every decision here has been carefully considered with enterprise scale, compliance, and revenue in mind.

**For Developers**: Understand WHY things are built this way, not just HOW. Challenge decisions only with better alternatives.

**For Interviewers**: This demonstrates VP-level strategic thinking and technical depth.

---

## Decision Format

Each decision follows this structure:
- **Decision**: What we decided
- **Context**: Why we needed to make this decision
- **Alternatives Considered**: What else we looked at
- **Decision**: What we chose and why
- **Consequences**: Trade-offs and implications
- **Status**: Active, Deprecated, Superseded

---

## ADR-001: Database Choice - MongoDB Atlas

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need a database that supports:
- Rapid iteration (MVP in 1 week)
- Document-oriented data (prompts, user configs)
- Vector search for RAG
- Multi-tenant architecture
- Enterprise compliance (SOC2, FedRAMP)

### Alternatives Considered

#### PostgreSQL + pgvector
**Pros**:
- Strong ACID guarantees
- Mature ecosystem
- Good for relational data

**Cons**:
- Requires schema migrations (slows iteration)
- JSON support is secondary (JSONB)
- pgvector is extension, not native
- More complex for document-heavy data

#### DynamoDB
**Pros**:
- Native AWS service
- Serverless scaling
- Low latency

**Cons**:
- No vector search
- Limited query flexibility
- Vendor lock-in to AWS
- Higher costs at scale

#### Supabase (PostgreSQL)
**Pros**:
- Easy to use
- Good developer experience
- Built-in auth

**Cons**:
- Same PostgreSQL limitations
- Less enterprise-ready than Atlas
- Smaller company (acquisition risk)

### Decision: MongoDB Atlas

**Why**:
1. **Native JSON**: Our data (prompts, learning pathways, user configs) is naturally document-oriented
2. **Atlas Vector Search**: Built-in RAG without separate vector DB (saves $500+/month)
3. **Flexible Schema**: No migrations needed for rapid MVP iteration
4. **Multi-Tenant Ready**: Easy to add `organizationId` to every collection
5. **Enterprise Features**: SOC2 certified, runs on AWS, supports compliance
6. **Cost-Effective**: Free tier for dev, $57/month for production M10

### Consequences

**Positive**:
- ✅ Faster development (no migrations)
- ✅ Lower costs (no separate vector DB)
- ✅ Better fit for our data model
- ✅ Enterprise-ready from day one

**Negative**:
- ⚠️ Less familiar to some developers (but well-documented)
- ⚠️ Requires discipline with query patterns (always include organizationId)

**Mitigation**:
- Create helper functions that enforce multi-tenant queries
- Use TypeScript types to prevent missing organizationId
- Add pre-commit hooks to validate queries

### References
- [ARCHITECTURE_STRATEGY.md](./strategy/ARCHITECTURE_STRATEGY.md#1-database-architecture-mongodb-atlas-)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/products/platform/atlas-vector-search)

---

## ADR-002: Hosting Platform - AWS (Not Vercel)

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need hosting that supports:
- Full Python runtime (for AI services)
- Serverless scaling
- Enterprise compliance
- Cost-effective at scale
- Resume/portfolio value

### Alternatives Considered

#### Vercel
**Pros**:
- Seamless Next.js integration
- Easy deployment
- Great developer experience

**Cons**:
- Limited Python support (Edge Functions only)
- Expensive at scale ($20/user/month for compute)
- Not ideal for CPU-intensive AI workloads
- Less impressive on resume

#### Railway
**Pros**:
- Full Python support
- Easy deployment
- Good pricing

**Cons**:
- Smaller company (stability risk)
- Less enterprise-ready
- No compliance certifications
- Limited scaling capabilities

#### Render
**Pros**:
- Full stack support
- Good pricing
- Easy to use

**Cons**:
- Similar limitations to Railway
- Less enterprise adoption
- No FedRAMP path

### Decision: AWS (Lambda + API Gateway + CloudFront + S3)

**Why**:
1. **Full Python Support**: Lambda supports Python 3.11+ natively
2. **Enterprise Standard**: Required for SOC2, FedRAMP compliance
3. **Resume Value**: AWS skills are industry standard, not vendor-specific
4. **Cost at Scale**: $134/month for 1K users, $500/month for 10K users
5. **Control**: Full infrastructure control, no vendor lock-in
6. **Serverless**: Pay only for what you use, scales automatically

### Consequences

**Positive**:
- ✅ Full Python support for AI services
- ✅ Enterprise-ready (SOC2, FedRAMP path)
- ✅ Better resume/portfolio value
- ✅ Cost-effective at scale
- ✅ Complete control over infrastructure

**Negative**:
- ⚠️ More complex initial setup (vs Vercel)
- ⚠️ Requires AWS knowledge

**Mitigation**:
- Use SST (Serverless Stack) for easier deployment
- Document everything thoroughly
- Start with Vercel for Week 1 MVP, migrate to AWS Week 2

### References
- [AWS_DEPLOYMENT_GUIDE.md](./implementation/AWS_DEPLOYMENT_GUIDE.md)
- [SST Documentation](https://sst.dev)

---

## ADR-003: Authentication - NextAuth.js v5 (Not Clerk)

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need authentication that:
- Supports email/password + OAuth
- Integrates with Stripe
- Works with MongoDB
- No vendor lock-in
- Enterprise SSO support (future)

### Alternatives Considered

#### Clerk
**Pros**:
- Beautiful UI out of the box
- Easy to set up
- Built-in user management

**Cons**:
- $25/month for 1K MAU (expensive)
- Vendor lock-in (user data in their DB)
- Limited customization
- Opinionated Stripe integration
- User reported dissatisfaction

#### Auth0
**Pros**:
- Enterprise-grade
- Extensive features
- Good documentation

**Cons**:
- Expensive ($240/month for 1K users)
- Overkill for MVP
- Vendor lock-in
- Complex pricing

#### Supabase Auth
**Pros**:
- Free
- Easy to use
- Good developer experience

**Cons**:
- Tied to Supabase ecosystem
- Less control over user data
- Smaller company

### Decision: NextAuth.js v5 (Auth.js)

**Why**:
1. **Free and Open Source**: No per-user costs
2. **Full Control**: User data in our MongoDB
3. **Industry Standard**: Used by Vercel, Linear, and many others
4. **Flexible**: Easy Stripe integration, full customization
5. **No Vendor Lock-in**: Can migrate or self-host anytime
6. **SSO Ready**: Supports SAML/OIDC for enterprise

### Consequences

**Positive**:
- ✅ Zero authentication costs (save $300-3K/month)
- ✅ Full control over user data
- ✅ No vendor lock-in
- ✅ Better resume value (industry standard)
- ✅ Easy Stripe integration

**Negative**:
- ⚠️ Need to build UI components (vs Clerk's pre-built)
- ⚠️ More initial setup

**Mitigation**:
- Use shadcn/ui for beautiful auth components
- Follow NextAuth.js best practices
- Document authentication flow thoroughly

### References
- [AUTH_AND_BILLING_STRATEGY.md](./strategy/AUTH_AND_BILLING_STRATEGY.md)
- [NextAuth.js Documentation](https://next-auth.js.org)

---

## ADR-004: Multi-Provider AI Strategy

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need AI strategy that:
- Supports multiple providers (Gemini, OpenAI, Anthropic)
- Allows users to bring own keys (BYOK)
- Provides keys for Pro tier
- Minimizes vendor lock-in
- Optimizes costs

### Alternatives Considered

#### Single Provider (OpenAI only)
**Pros**:
- Simpler implementation
- One API to learn

**Cons**:
- Vendor lock-in
- No fallback if OpenAI is down
- Can't optimize for cost/quality
- Less impressive technically

#### LangChain for Everything
**Pros**:
- Abstracts providers
- Lots of features

**Cons**:
- Heavy dependency
- Overkill for our needs
- Adds complexity
- Harder to debug

### Decision: Custom Multi-Provider Abstraction

**Why**:
1. **Vendor Risk Mitigation**: Not locked into one provider
2. **Cost Optimization**: Use cheapest provider for each task
3. **Quality Optimization**: Use best provider for each use case
4. **Fallback**: If one provider is down, use another
5. **BYOK Flexibility**: Users can use their preferred provider
6. **Competitive Advantage**: Unique feature vs competitors

**Architecture**:
```typescript
interface AIProvider {
  generateResponse(prompt: string): Promise<AIResponse>;
  generateStream(prompt: string): AsyncGenerator<string>;
  estimateCost(tokens: number): number;
}

class AIOrchestrator {
  selectProvider(request: AIRequest): AIProvider {
    // User preference > Cost > Availability
  }
}
```

### Consequences

**Positive**:
- ✅ No vendor lock-in
- ✅ Cost optimization (save 50-70% on AI costs)
- ✅ Better reliability (fallback)
- ✅ Competitive advantage
- ✅ Demonstrates technical depth

**Negative**:
- ⚠️ More complex implementation
- ⚠️ Need to maintain multiple integrations

**Mitigation**:
- Use Strategy pattern for clean abstraction
- Write comprehensive tests for each provider
- Document provider selection logic

### References
- [ARCHITECTURE_STRATEGY.md](./strategy/ARCHITECTURE_STRATEGY.md#3-ai-provider-strategy-multi-provider-with-abstraction-layer)

---

## ADR-005: RAG Implementation - MongoDB Atlas Vector Search

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need RAG (Retrieval-Augmented Generation) for:
- Context-aware AI responses
- Knowledge base search
- Document Q&A
- Learning content retrieval

### Alternatives Considered

#### Pinecone
**Pros**:
- Purpose-built for vectors
- Fast and scalable
- Good developer experience

**Cons**:
- $70/month minimum
- Separate service to manage
- Another vendor dependency
- Data duplication (MongoDB + Pinecone)

#### Weaviate
**Pros**:
- Open source
- Self-hostable
- Feature-rich

**Cons**:
- Complex to set up
- Need to manage infrastructure
- Overkill for MVP

#### pgvector (PostgreSQL)
**Pros**:
- No separate service
- Open source

**Cons**:
- Already decided against PostgreSQL
- Less mature than purpose-built solutions

### Decision: MongoDB Atlas Vector Search

**Why**:
1. **No Additional Cost**: Included with Atlas
2. **Same Database**: No data duplication or sync issues
3. **Simpler Architecture**: One database for everything
4. **Native Integration**: Query vectors + metadata together
5. **Good Enough**: Handles millions of vectors efficiently

**Technical Details**:
- 384-dimensional vectors (sentence-transformers)
- Cosine similarity search
- Hybrid search (keyword + vector)
- Automatic index management

### Consequences

**Positive**:
- ✅ Save $70-200/month (no Pinecone)
- ✅ Simpler architecture (one database)
- ✅ No data sync issues
- ✅ Easier to query (vectors + metadata)

**Negative**:
- ⚠️ Not as specialized as Pinecone
- ⚠️ May need to migrate if we hit scale limits (millions of documents)

**Mitigation**:
- Monitor query performance
- Optimize indexes
- Plan for migration to dedicated vector DB if needed (Year 3+)

### References
- [ARCHITECTURE_STRATEGY.md](./strategy/ARCHITECTURE_STRATEGY.md#4-rag-implementation-mongodb-atlas-vector-search)

---

## ADR-006: Multi-Tenant Architecture - Organization-Based

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need multi-tenancy for:
- Enterprise customers (companies with teams)
- Data isolation (compliance requirement)
- Admin dashboards (usage per organization)
- Billing (per organization, not per user)

### Alternatives Considered

#### User-Based (No Organizations)
**Pros**:
- Simpler to implement
- Good for B2C

**Cons**:
- Can't support teams
- No enterprise features
- Limits revenue potential

#### Database-Per-Tenant
**Pros**:
- Complete data isolation
- Easier compliance

**Cons**:
- Complex to manage
- Higher costs
- Overkill for most customers

### Decision: Organization-Based with Query-Level Isolation

**Why**:
1. **Enterprise Ready**: Supports teams from day one
2. **Scalable**: Can upgrade to database-per-tenant for Premium
3. **Cost-Effective**: One database for all organizations
4. **Flexible**: Individual users can exist without organization

**Schema Design**:
```javascript
// Every collection has organizationId
{
  _id: ObjectId,
  organizationId: ObjectId,  // null for individual users
  // ... other fields
}

// Every query includes organizationId
db.conversations.find({
  organizationId: user.organizationId,
  userId: user._id
});
```

### Consequences

**Positive**:
- ✅ Enterprise-ready from day one
- ✅ Supports both B2C and B2B
- ✅ Cost-effective
- ✅ Easy to add features (SSO, RBAC, audit logs)

**Negative**:
- ⚠️ Risk of query bugs exposing data (if organizationId missing)
- ⚠️ Need strict query discipline

**Mitigation**:
- Create helper functions that enforce organizationId
- Use TypeScript types to prevent missing organizationId
- Add pre-commit hooks to validate queries
- Write comprehensive tests for data isolation

### References
- [ENTERPRISE_STRATEGY.md](./strategy/ENTERPRISE_STRATEGY.md#multi-tenant-architecture)

---

## ADR-007: Pricing Strategy - Freemium with BYOK

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need pricing that:
- Attracts users (low barrier to entry)
- Generates revenue (clear upgrade path)
- Supports enterprise (team features)
- Differentiates from competitors

### Alternatives Considered

#### Paid-Only (No Free Tier)
**Pros**:
- Immediate revenue
- Higher quality users

**Cons**:
- High barrier to entry
- Slower growth
- Harder to get initial traction

#### Usage-Based Only
**Pros**:
- Fair pricing
- Scales with value

**Cons**:
- Unpredictable revenue
- Complex billing
- User anxiety about costs

### Decision: Freemium with BYOK + Subscription Tiers

**Tiers**:
1. **Free**: BYOK, unlimited usage
2. **Pro** ($20/mo): We provide keys, 500 prompts/mo
3. **Team** ($50/user): Unlimited, team features
4. **Enterprise** ($10K-200K/year): SSO, compliance, support

**Why**:
1. **Low Barrier**: Free tier with BYOK attracts users
2. **Clear Value**: Pro tier removes friction (no API key setup)
3. **Predictable Revenue**: Subscription model
4. **Enterprise Focus**: High-value contracts
5. **Competitive Advantage**: BYOK is unique

### Consequences

**Positive**:
- ✅ Fast user acquisition (free tier)
- ✅ Clear upgrade path (Pro → Team → Enterprise)
- ✅ Predictable revenue (subscriptions)
- ✅ High margins (70-90%)

**Negative**:
- ⚠️ Free users don't generate revenue
- ⚠️ Need good conversion funnel

**Mitigation**:
- Track conversion metrics closely
- Optimize onboarding for upgrades
- Focus on enterprise deals (where real money is)

### References
- [SAAS_MODEL_OVERVIEW.md](./strategy/SAAS_MODEL_OVERVIEW.md)

---

## ADR-008: Compliance Roadmap - SOC2 First, FedRAMP Later

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Enterprise customers require:
- Security certifications (SOC2)
- Government contracts (FedRAMP)
- Data privacy (GDPR, CCPA)
- Audit trails

### Alternatives Considered

#### No Compliance (Move Fast)
**Pros**:
- Faster development
- Lower costs

**Cons**:
- Can't sell to enterprise
- Limits revenue potential
- Harder to add later

#### FedRAMP First
**Pros**:
- Highest security standard
- Government contracts

**Cons**:
- $500K-1M cost
- 12-18 months
- Overkill for most customers

### Decision: Build for SOC2, Plan for FedRAMP

**Timeline**:
- **Year 1**: Build compliance-ready architecture
- **Year 2**: SOC2 Type II certification ($50K-100K)
- **Year 3+**: FedRAMP if we have government customers

**Architecture Decisions**:
- ✅ Audit logging from day one
- ✅ Encryption at rest and in transit
- ✅ RBAC (role-based access control)
- ✅ Data retention policies
- ✅ Multi-tenant data isolation

**Why**:
1. **SOC2 Required**: Most enterprise deals require it
2. **Reasonable Cost**: $50K-100K vs $500K-1M for FedRAMP
3. **Faster**: 6-9 months vs 12-18 months
4. **Foundation**: SOC2 prepares us for FedRAMP

### Consequences

**Positive**:
- ✅ Can sell to enterprise (Year 2)
- ✅ Reasonable cost and timeline
- ✅ Architecture supports future FedRAMP

**Negative**:
- ⚠️ Can't sell to government initially
- ⚠️ Need to maintain compliance

**Mitigation**:
- Build compliance into development process
- Document everything
- Regular security audits

### References
- [ENTERPRISE_STRATEGY.md](./strategy/ENTERPRISE_STRATEGY.md#compliance-roadmap)

---

## ADR-009: Frontend Framework - Next.js 14 (App Router)

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Current: React SPA with Vite
Need: Production-ready framework with SSR, API routes, and better SEO

### Alternatives Considered

#### Keep React SPA
**Pros**:
- Already built
- Simple

**Cons**:
- Poor SEO
- No server-side rendering
- Need separate backend

#### Remix
**Pros**:
- Great developer experience
- Server-side rendering
- Good performance

**Cons**:
- Smaller ecosystem
- Less enterprise adoption
- Fewer developers familiar

### Decision: Next.js 14 (App Router)

**Why**:
1. **Industry Standard**: Used by Vercel, Linear, Notion
2. **Server-Side Rendering**: Better SEO and performance
3. **API Routes**: Backend and frontend in one repo
4. **App Router**: Modern, file-based routing
5. **Enterprise Adoption**: Trusted by Fortune 500
6. **Resume Value**: Most in-demand React framework

### Consequences

**Positive**:
- ✅ Better SEO (server-side rendering)
- ✅ Unified codebase (frontend + API routes)
- ✅ Better performance (automatic optimization)
- ✅ Industry standard (resume value)

**Negative**:
- ⚠️ Need to migrate from current React SPA
- ⚠️ Learning curve for App Router

**Mitigation**:
- Follow official Next.js migration guide
- Migrate incrementally (one page at a time)
- Use TypeScript for type safety

### References
- [IMPLEMENTATION_PLAN.md](./implementation/IMPLEMENTATION_PLAN.md)

---

## ADR-010: Development Workflow - Documentation-First

**Date**: 2025-10-27  
**Status**: Active  
**Decider**: Engineering Leadership

### Context
Need workflow that:
- Keeps AI models aligned
- Enables team collaboration
- Supports rapid iteration
- Maintains quality

### Decision: Documentation-First Development

**Process**:
1. **Document Decision** (this file)
2. **Write Tests** (TDD when possible)
3. **Implement Feature**
4. **Update Documentation**
5. **Code Review**
6. **Deploy**

**Why**:
1. **AI Alignment**: AI models can read docs to stay on track
2. **Team Onboarding**: New developers understand WHY
3. **Interview Prep**: Demonstrates strategic thinking
4. **Future-Proofing**: Decisions are documented and searchable

### Consequences

**Positive**:
- ✅ Better AI model performance
- ✅ Faster onboarding
- ✅ Fewer architectural mistakes
- ✅ Better interview material

**Negative**:
- ⚠️ Slower initial development

**Mitigation**:
- Use templates for common decisions
- Keep docs concise and scannable
- Update docs as part of PR process

---

## Decision Summary Table

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| 001 | MongoDB Atlas | Active | High |
| 002 | AWS Hosting | Active | High |
| 003 | NextAuth.js v5 | Active | High |
| 004 | Multi-Provider AI | Active | High |
| 005 | Atlas Vector Search | Active | Medium |
| 006 | Multi-Tenant Architecture | Active | High |
| 007 | Freemium Pricing | Active | High |
| 008 | SOC2 First | Active | High |
| 009 | Next.js 14 | Active | High |
| 010 | Documentation-First | Active | Medium |

---

## How to Add New Decisions

1. Copy the template below
2. Fill in all sections
3. Consider alternatives thoroughly
4. Document consequences (positive AND negative)
5. Add to summary table
6. Update related documentation

### Template

```markdown
## ADR-XXX: [Decision Title]

**Date**: YYYY-MM-DD  
**Status**: Proposed | Active | Deprecated | Superseded  
**Decider**: [Who made this decision]

### Context
[Why do we need to make this decision?]

### Alternatives Considered

#### Option 1
**Pros**:
- 

**Cons**:
- 

#### Option 2
**Pros**:
- 

**Cons**:
- 

### Decision: [What we chose]

**Why**:
1. 
2. 
3. 

### Consequences

**Positive**:
- ✅ 

**Negative**:
- ⚠️ 

**Mitigation**:
- 

### References
- [Link to related docs]
```

---

**This document is the source of truth for all architectural decisions. Read it. Follow it. Challenge it only with better alternatives.**

**Last Updated**: 2025-10-27  
**Maintainer**: Engineering Leadership
